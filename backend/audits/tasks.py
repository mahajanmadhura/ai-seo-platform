from celery import shared_task, chord
from celery.exceptions import Retry
from .models import Audit,CrawledPage,SEOIssues, Link
from .crawler import fetch_url, parse_html, check_technical_files, fetch_core_web_vitals, is_disallowed, get_robots_parser, HEADERS, parse_sitemap, is_allowed_extension, is_soft_404, normalize_crawl_url
from .analysers import calculate_on_page_score,calculate_performance_score,generate_ai_recommendations, performance_analysis, analyze_link_profile, calculate_technical_score, calculate_overall_score, analyze_content_uniqueness, analyze_hreflang_reciprocity
import traceback
from django.utils import timezone
from django.db import models
from concurrent.futures import ThreadPoolExecutor
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from urllib.parse import urlparse


@shared_task
def finalize_audit(cwv_results, audit_id):
    """
    Runs only after ALL core_web_vitals_analysis tasks for this audit
    have finished. cwv_results is just a list of their return values —
    we don't need it, it's passed automatically by the chord.
    """
    audit_website = Audit.objects.get(id=audit_id)
    visited_count = audit_website.total_pages  # we'll set this before the chord starts

    try:
        analyze_link_profile(audit_website)
        analyze_external_link_quality(audit_website)
        analyze_content_uniqueness(audit_website)
        analyze_hreflang_reciprocity(audit_website)
    except Exception as e:
        print(f"Post-crawl analysis failed for audit {audit_id}: {e}")
        traceback.print_exc()

    # TODO(teammate): implement AI recommendation generation here.
    # This used to call generate_ai_recommendations(audit_website) from analysers.py —
    # that function is still there if you want a starting point, otherwise feel free
    # to replace it entirely. Just make sure this sets audit_website.ai_recommendation
    # to something (a string) before the audit is marked DONE below.
    audit_website.ai_recommendation = "AI recommendations coming soon."

    audit_website.overall_Score = calculate_overall_score(audit_website)
    audit_website.completed_at = timezone.now()
    audit_website.total_issues = SEOIssues.objects.filter(
        models.Q(audit=audit_website) | models.Q(url__audit=audit_website)
    ).count()
    audit_website.status = "DONE"
    audit_website.crawl_state = {}
    audit_website.save()

    from process_status.services import update_process_status
    update_process_status(
        process_type="audit",
        object_id=audit_id,
        status="DONE",
        current_step="DONE",
        message="Audit complete",
        progress_percent=100
    )

    return f"Audit Complete! Crawled through {visited_count} pages"

    
def _execute_seo_audit(self, audit_id):
    audit_website = Audit.objects.get(id=audit_id)

    resuming = bool(audit_website.crawl_state)

    if resuming:
        state = audit_website.crawl_state
        urls_to_visit = [tuple(item) for item in state.get("urls_to_visit", [])]
        visited_urls = set(state.get("visited_urls", []))
        queued_urls = set(state.get("queued_urls", []))
        print(f"Resuming audit {audit_id}: {len(visited_urls)} pages already claimed")
        print(f"The number of pages already visited is {visited_urls} and the urls that are to be visited is {queued_urls}")
    else:
        audit_website.status = "RUNNING"
        audit_website.save()
        start_url = normalize_crawl_url(audit_website.website.url)
        urls_to_visit = [(start_url, 0)]  # (url, depth) — homepage is depth 0
        visited_urls = set()
        queued_urls = {start_url}

    print(f"We are going to audit the website with id {audit_id}")

    robots_parser = get_robots_parser(audit_website.website.url)

    if not resuming:
        from .crawler import is_likely_client_rendered, is_dns_blocked
        from bs4 import BeautifulSoup

        precheck_status, precheck_html, *_ = fetch_url(audit_website.website.url)

        if precheck_status == 0:
            print(f"⚠️  Audit {audit_id}: {audit_website.website.url} could not be reached at all (connection failed). Skipping audit.")
            SEOIssues.objects.create(
                audit=audit_website, issue_type="ERROR",
                description="The website could not be reached — it may be down, blocking automated requests, or the URL may be incorrect."
            )
            audit_website.status = "FAILED"
            audit_website.save()
            return f"Audit {audit_id} skipped — website unreachable"

        if is_dns_blocked(precheck_html):
            print(f"⚠️  Audit {audit_id}: {audit_website.website.url} appears to be blocked by a DNS/network-level filter (e.g. Fortinet, OpenDNS). Skipping audit.")
            SEOIssues.objects.create(
                audit=audit_website, issue_type="ERROR",
                description="This website appears to be blocked by a DNS or network-level content filter on the crawler's network, not an issue with the website itself. Try running the audit from a different network."
            )
            audit_website.status = "FAILED"
            audit_website.save()
            return f"Audit {audit_id} skipped — blocked by DNS/network filter"

        precheck_soup = BeautifulSoup(precheck_html, 'html.parser') if precheck_html else None
        precheck_word_count = len(precheck_soup.get_text().split()) if precheck_soup and precheck_soup.get_text() else 0

        if precheck_soup and is_likely_client_rendered(precheck_soup, precheck_html, precheck_word_count):
            print(f"⚠️  Audit {audit_id}: {audit_website.website.url} appears to be a JavaScript-rendered (client-side) site. Skipping audit — Playwright-based rendering support coming soon.")
            SEOIssues.objects.create(
                audit=audit_website, issue_type="ERROR",
                description="This website appears to be client-side rendered (JavaScript-heavy) and could not be meaningfully audited using static HTML fetching. Support for JS-rendered sites is coming soon."
            )
            audit_website.status = "FAILED"
            audit_website.save()
            return f"Audit {audit_id} skipped — site appears to be client-side rendered"

        robots, sitemap = check_technical_files(audit_website.website.url)
        audit_website.has_robots = robots
        audit_website.has_sitemap = sitemap
        audit_website.save()

        if not robots:
            SEOIssues.objects.create(
                audit=audit_website,
                issue_type="ERROR",
                description="'robots.txt' couldnt be found"
            )
        if not sitemap:
            SEOIssues.objects.create(
                audit=audit_website,
                issue_type="WARNING",
                description="'sitemap.txt' couldnt be found"
            )

        if sitemap:
            sitemap_urls = parse_sitemap(audit_website.website.url)
            for sitemap_url in sitemap_urls:
                sitemap_url = normalize_crawl_url(sitemap_url)
                if (sitemap_url and sitemap_url not in queued_urls
                    and not is_disallowed(sitemap_url)
                    and is_allowed_extension(sitemap_url)
                    and robots_parser.can_fetch(HEADERS["User-Agent"], sitemap_url)):
                    urls_to_visit.append((sitemap_url, 0))
                    queued_urls.add(sitemap_url)

    MAX_DEPTH = 5  
    try:
        MAX_PAGES = 500
        CONCURRENT_REQUESTS = min(15, MAX_PAGES)
        while urls_to_visit and len(visited_urls) < MAX_PAGES:
            batch = []
            while urls_to_visit and len(batch) < CONCURRENT_REQUESTS and len(visited_urls) < MAX_PAGES:
                url, depth = urls_to_visit.pop(0)
                if url not in visited_urls:
                    batch.append((url, depth))
                    visited_urls.add(url)

            if not batch:
                break

            audit_website.crawl_state = {
                "urls_to_visit": urls_to_visit,
                "visited_urls": list(visited_urls),
                "queued_urls": list(queued_urls),
            }
            audit_website.save(update_fields=["crawl_state"])

            with ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
                results = executor.map(lambda item: process_page(item[0], audit_website), batch)

            for (url, depth), new_links in zip(batch, results):
                if depth < MAX_DEPTH:
                    for link in new_links:
                        if (link not in queued_urls
                            and not is_disallowed(link)
                            and is_allowed_extension(link)
                            and robots_parser.can_fetch(HEADERS["User-Agent"], link)):
                            urls_to_visit.append((link, depth + 1))
                            queued_urls.add(link)

            queued_count = min(MAX_PAGES, len(visited_urls) + len(urls_to_visit)) - len(visited_urls)
            send_progress(audit_id, {
                "pages_crawled": len(visited_urls),
                "pages_queued": queued_count,
                "total_pages": len(visited_urls) + queued_count,
                "current_url": batch[-1][0]
            })

            from process_status.services import update_process_status
            current_pages = len(visited_urls)
            crawl_progress = 15 + int((current_pages / MAX_PAGES) * 54)  # Scales from 15% to 69%
            elapsed_seconds = max(1, (timezone.now() - audit_website.started_at).total_seconds())
            estimated_remaining = round((queued_count * elapsed_seconds) / current_pages)
            update_process_status(
                process_type="audit",
                object_id=audit_id,
                status="RUNNING",
                current_step="CRAWLING",
                message=f"Crawling pages ({current_pages}/{MAX_PAGES})",
                progress_percent=crawl_progress,
                metadata={
                    "pages_crawled": current_pages,
                    "pages_queued": queued_count,
                    "total_pages": current_pages + queued_count,
                    "current_url": batch[-1][0],
                    "estimated_remaining_seconds": estimated_remaining
                }
            )

    except Exception as e:
        print(f"Audit {audit_id} crashed: {e}")
        traceback.print_exc()
        audit_website.crawl_state = {
            "urls_to_visit": urls_to_visit,
            "visited_urls": list(visited_urls),
            "queued_urls": list(queued_urls),
        }
        audit_website.save(update_fields=["crawl_state"])
        try:
            raise self.retry(exc=e, countdown=30)
        except self.MaxRetriesExceededError:
            audit_website.status = "FAILED"
            audit_website.crawl_state = {}
            audit_website.save()
            raise e

    if len(visited_urls) > 0:
        audit_website.total_pages = len(visited_urls)
        audit_website.save(update_fields=["total_pages"])

        page_ids = list(
            CrawledPage.objects.filter(audit=audit_website).values_list("id", flat=True)
        )

        # Run a CWV check for every page in parallel, then call finalize_audit
        # once ALL of them are done — not before.
        chord(
            [core_web_vitals_analysis.s(pid) for pid in page_ids]
        )(finalize_audit.s(audit_id))

        # NOTE: don't set status = "DONE" here anymore — finalize_audit does that.
        audit_website.crawl_state = {}
        audit_website.save(update_fields=["crawl_state"])

        return f"Crawl complete for audit {audit_id}, waiting on {len(page_ids)} CWV checks"
    else:
        audit_website.status = "FAILED"
        audit_website.crawl_state = {}
        audit_website.save()
        return f"Audit {audit_id} failed — no pages could be crawled"


@shared_task(bind=True, acks_late=True, max_retries=3)
def run_seo_audit(self, audit_id):
    from process_status.services import update_process_status
    update_process_status(
        process_type="audit",
        object_id=audit_id,
        status="RUNNING",
        current_step="CRAWLING",
        message="Crawling and analyzing pages",
        progress_percent=15
    )
    try:
        res = _execute_seo_audit(self, audit_id)
        update_process_status(
            process_type="audit",
            object_id=audit_id,
            status="RUNNING",
            current_step="ANALYZING",
            message="Analyzing page performance & Core Web Vitals",
            progress_percent=70
        )
        return res
    except Retry as retry_exc:
        raise retry_exc
    except Exception as e:
        try:
            audit_website = Audit.objects.get(id=audit_id)
            audit_website.status = "FAILED"
            audit_website.crawl_state = {}
            audit_website.save()
            update_process_status(
                process_type="audit",
                object_id=audit_id,
                status="FAILED",
                current_step="FAILED",
                message=f"Audit failed: {str(e)}",
                progress_percent=100
            )
        except:
            pass
        raise e

        
@shared_task(rate_limit="1/s")
def core_web_vitals_analysis(page_id):
    page=CrawledPage.objects.get(id=page_id)
    current_url=page.url
    core_web_vitals=fetch_core_web_vitals(current_url)
    core_web_vitals_performance_score=performance_analysis(
        core_web_vitals["lcp"],
        core_web_vitals["fid"],
        core_web_vitals["cls"],
        core_web_vitals["ttfb"],
        core_web_vitals["fcp"]
    )

    page.largest_contentful_paint=core_web_vitals["lcp"]
    page.first_input_delay=core_web_vitals["fid"]
    page.cumulative_layout_shift=core_web_vitals["cls"]
    page.time_to_first_byte=core_web_vitals["ttfb"]
    page.first_contentful_paint=core_web_vitals["fcp"]
    page.core_web_vitals_performance_score=core_web_vitals_performance_score
    page.mobile_font_readability = core_web_vitals["mobile_font_readability"]
    page.mobile_tap_targets = core_web_vitals["mobile_tap_targets"]
    
    
    page.save()
    
    

    if core_web_vitals["lcp"]>2.5:
        SEOIssues.objects.create(
            url=page,
            issue_type="WARNING",
            description=f'Largest Contentful Paint took {core_web_vitals["lcp"]}s to load on {current_url}'
        )
    if core_web_vitals["fid"]>100:
        SEOIssues.objects.create(
            url=page,
            issue_type="WARNING",
            description=f'First Input Dealy took {core_web_vitals["fid"]}ms to load on {current_url}'
        )
    if core_web_vitals["cls"]>0.1:
        SEOIssues.objects.create(
            url=page,
            issue_type="WARNING",
            description=f'Cumulative layout shift is {core_web_vitals["cls"]} on {current_url}'
        )
    if core_web_vitals["ttfb"]>200:
        SEOIssues.objects.create(
            url=page,
            issue_type="WARNING",
            description=f'Time to First Byte took {core_web_vitals["ttfb"]}ms to load on {current_url}'
        )
    if core_web_vitals["fcp"]>1.8:
        SEOIssues.objects.create(
            url=page,
            issue_type="WARNING",
            description=f'First Contentful Paint took {core_web_vitals["fcp"]}s to load on {current_url}'
        )

    if not core_web_vitals["mobile_font_readability"]:
        SEOIssues.objects.create(
            url=page,
            issue_type="WARNING",
            description=f"Text is too small to read on mobile devices on {current_url}"
        )
    
    if not core_web_vitals["mobile_tap_targets"]:
        SEOIssues.objects.create(
            url=page,
            issue_type="WARNING",
            description=f"Buttons/Links are too close together for mobile tapping on {current_url}"
        )


def process_page(current_url, audit_website):
    try:
        print(f"Crawling: {current_url}")
        (status_code, html_text, load_time, redirect_chainlength, has_valid_SSL,
         has_strict_transport_security, has_content_security_policy, has_x_frame_options,
         is_redirect_loop, x_robots_noindex) = fetch_url(current_url)

        result_of_parse = parse_html(html_text, current_url, audit_website.key_word)
        performance_score = calculate_performance_score(load_time)

        # Combine header-level noindex with the meta-tag-based crawlability check
        is_crawlable = result_of_parse.get("is_crawlable", False) and not x_robots_noindex
        result_of_parse["is_crawlable"] = is_crawlable

        score = calculate_on_page_score(
            result_of_parse["title"], result_of_parse["h1"], result_of_parse["h2"],
            result_of_parse["h3"], result_of_parse["img_without_alt_tags"],
            result_of_parse["meta_description"], result_of_parse["canonical_tag_check"],
            result_of_parse["bold_count"], result_of_parse["url_structure_char_count"],
            current_url, result_of_parse["internal_links"], result_of_parse["keyword_in_title"],
            result_of_parse["keyword_in_h1"], result_of_parse["keyword_in_meta_description"],
            result_of_parse["keyword_density"], result_of_parse["keyword_in_h2_h3"],
        )

        technical_score = calculate_technical_score(
            result_of_parse.get("is_crawlable", False),
            result_of_parse.get("is_schema_json", False),
            result_of_parse.get("is_hreflang", False),
            result_of_parse["canonical_tag_check"],
            redirect_chainlength,
            status_code,
        )

        new_page = CrawledPage.objects.create(
            audit=audit_website, url=current_url, status_code=status_code,
            status_code404=(status_code == 404),
            technical_score=technical_score,
            title=result_of_parse["title"], h1=result_of_parse["h1"], h2=result_of_parse["h2"],
            h3=result_of_parse["h3"], meta_description=result_of_parse["meta_description"],
            word_count=result_of_parse["word_count"], load_time=load_time, on_page_score=score,
            img_without_alt_tags=result_of_parse["img_without_alt_tags"],
            canonical_tag_check=result_of_parse["canonical_tag_check"],
            bold_count=result_of_parse["bold_count"],
            url_structure_char_count=result_of_parse["url_structure_char_count"],
            keyword_in_title=result_of_parse["keyword_in_title"],
            keyword_density=result_of_parse["keyword_density"],
            keyword_in_h1=result_of_parse["keyword_in_h1"],
            keyword_in_meta_description=result_of_parse["keyword_in_meta_description"],
            keyword_in_h2_h3=result_of_parse["keyword_in_h2_h3"],
            is_mobile_friendly=result_of_parse["is_mobile_friendly"],
            is_safe=result_of_parse["is_safe"], performance_score=performance_score,
            redirect_chainlength=redirect_chainlength,
            is_crawlable=result_of_parse.get("is_crawlable", False),
            is_schema_json=result_of_parse.get("is_schema_json", False),
            is_hreflang=result_of_parse.get("is_hreflang", False),
            external_links_count=result_of_parse["external_links_count"],
            broken_links_count=result_of_parse["broken_links_count"],
            has_mobile_viewport_configuration=result_of_parse["has_mobile_viewport_configuration"],
            has_valid_SSL=has_valid_SSL, has_strict_transport_security=has_strict_transport_security,
            has_content_security_policy=has_content_security_policy, has_x_frame_options=has_x_frame_options,
            has_mixed_content=result_of_parse["has_mixed_content"],
            hreflang_data=result_of_parse.get("hreflang_entries", []),
        )

        for link_data in result_of_parse["all_links"]:
            Link.objects.create(page=new_page, **link_data)

        create_seo_issues(new_page, result_of_parse, status_code, redirect_chainlength,
                           has_valid_SSL, has_strict_transport_security,
                           has_content_security_policy, has_x_frame_options, load_time, is_redirect_loop, x_robots_noindex)

        return result_of_parse["internal_links"]

    except Exception as e:
        print(f"Failed to process {current_url}: {e}")
        traceback.print_exc()
        return []  # no internal links discovered from a page we couldn't process

def send_progress(audit_id, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'audit_{audit_id}', {"type": "audit_progress", "data": data}
    )


def create_seo_issues(new_page, result_of_parse, status_code, redirect_chainlength,
                       has_valid_SSL, has_strict_transport_security,
                       has_content_security_policy, has_x_frame_options, load_time, is_redirect_loop, x_robots_noindex):
    try:
        if result_of_parse["h1"]=="No h1 tags found":
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing h1 tag on {new_page.url}")

        if result_of_parse["h2"]==0:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing h2 tag on {new_page.url}")

        if result_of_parse["h3"]==0:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing h3 tag on {new_page.url}")

        if result_of_parse["title"]=="No title found":
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing title tag on {new_page.url}")

        if result_of_parse["word_count"]==0:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"There are no words on the website: {new_page.url}")

        if result_of_parse["meta_description"] != "No meta description" and not result_of_parse["meta_description_has_cta"]:
            SEOIssues.objects.create(
                url=new_page, issue_type="NOTICE",
                description=f"Meta description has no clear call-to-action on {new_page.url}"
            )
        if result_of_parse["canonical_tag_check"]=="":
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing canonical tag on {new_page.url}")

        if len(result_of_parse["poor_quality_alt_tags"]) > 0:
            SEOIssues.objects.create(
                url=new_page, issue_type="WARNING",
                description=f"{len(result_of_parse['poor_quality_alt_tags'])} image(s) have non-descriptive alt text (e.g. 'image1.jpg', 'photo') on {new_page.url}"
            )
        if result_of_parse["canonical_tag_check"] and not result_of_parse["is_canonical_self_referencing"]:
            SEOIssues.objects.create(
                url=new_page, issue_type="WARNING",
                description=f"Canonical tag points to a different URL ({result_of_parse['canonical_tag_check']}) than the page itself on {new_page.url}"
            )
        
        if result_of_parse["url_structure_issues"]:
            issues_text = ", ".join(result_of_parse["url_structure_issues"])
            SEOIssues.objects.create(
                url=new_page, issue_type="WARNING",
                description=f"URL structure issues ({issues_text}) on {new_page.url}"
            )

        if result_of_parse["bold_count"]==0:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"No bold tags found on {new_page.url}")

        if result_of_parse["url_structure_char_count"]>100:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"url is longer than 100 characters on the {new_page.url}")

        if not result_of_parse["is_mobile_friendly"]:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The website isnt mobile responsive as viewport is absent on {new_page.url}")

        if not result_of_parse["is_safe"]:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing SSL certificate: Website isnt secure as it doesnt have https on {new_page.url}")

        if load_time > 2.5:
            SEOIssues.objects.create(url=new_page, issue_type="WARNING", description=f"Slow page load time ({load_time}s) on {new_page.url}. Target is < 2.5s.")

        if status_code==404:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Status code 404 on {new_page.url}")

        if redirect_chainlength>2:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The page redirected {redirect_chainlength} number of times on {new_page.url}")

        if not result_of_parse["is_crawlable"]:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The website isnt crawlable at as it is missing robots {new_page.url}")

        if not result_of_parse["is_schema_json"]:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"There are no Schema Json tags on the website at {new_page.url}")

        if result_of_parse["is_schema_json"] and not result_of_parse["is_schema_valid"]:
            errors_text = "; ".join(result_of_parse["schema_errors"][:3])
            SEOIssues.objects.create(url=new_page, issue_type="WARNING", description=f"Structured data has validation issues ({errors_text}) on {new_page.url}")
            
        if result_of_parse["is_hreflang"] and result_of_parse["invalid_hreflang_codes"]:
            codes_text = ", ".join(result_of_parse["invalid_hreflang_codes"])
            SEOIssues.objects.create(url=new_page, issue_type="WARNING", description=f"Invalid hreflang language code(s) ({codes_text}) on {new_page.url}")
            
        if not result_of_parse["has_mobile_viewport_configuration"]:
            SEOIssues.objects.create(url=new_page, issue_type="WARNING", description=f"The website doesnt have proper mobile viewport configuration at {new_page.url}")

        if not has_valid_SSL:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The website doesnt have a valid SSL certificate at {new_page.url}")

        if not has_strict_transport_security:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The website doesnt have strict transport security at {new_page.url}")

        if not has_content_security_policy:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The website doesnt have a content security policy at {new_page.url}")

        if not has_x_frame_options:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The website doesnt have a X frame options at {new_page.url}")

        if result_of_parse["has_mixed_content"]:
            SEOIssues.objects.create(url=new_page, issue_type="WARNING", description=f"The website has mixed content (HTTPS pages loading HTTP resources) at {new_page.url}")
        
        if result_of_parse["h1"] != "No h1 tags found":
            h1_len = len(result_of_parse["h1"])
            if h1_len < 20 or h1_len > 70:
                SEOIssues.objects.create(
                    url=new_page, issue_type="WARNING",
                    description=f"H1 tag length ({h1_len} chars) is outside the recommended 20-70 character range on {new_page.url}"
                )
        if is_redirect_loop:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Redirect loop detected on {new_page.url}")

        if x_robots_noindex:
            SEOIssues.objects.create(url=new_page, issue_type="WARNING", description=f"X-Robots-Tag header contains 'noindex' directive on {new_page.url}")
        
        if is_soft_404(status_code, result_of_parse["title"], result_of_parse["h1"], result_of_parse["word_count"]):
            SEOIssues.objects.create(url=new_page, issue_type="WARNING", description=f"Possible soft 404 detected — page returns 200 but content suggests 'not found' on {new_page.url}")

    except Exception as e:
        print(f"Issue creation failed for {new_page.url}, Error: {e}")
        traceback.print_exc()


def analyze_external_link_quality(audit):
    from .models import Link, SEOIssues

    external_links = Link.objects.filter(page__audit=audit, is_internal=False)
    total_external = external_links.count()
    if total_external == 0:
        return

    domain_counts = {}
    insecure_count = 0
    for link in external_links:
        if not link.target_url:
            continue
        domain = urlparse(link.target_url).netloc
        domain_counts[domain] = domain_counts.get(domain, 0) + 1
        if link.target_url.startswith("http://"):
            insecure_count += 1

    if domain_counts:
        top_domain, top_count = max(domain_counts.items(), key=lambda x: x[1])
        top_pct = round((top_count / total_external) * 100, 1)
        if top_pct > 40 and len(domain_counts) > 1:
            SEOIssues.objects.create(
                audit=audit, issue_type="WARNING",
                description=f"{top_pct}% of external links point to a single domain ({top_domain}), which can look like an unnatural linking pattern"
            )

    if insecure_count > 0:
        pct = round((insecure_count / total_external) * 100, 1)
        SEOIssues.objects.create(
            audit=audit, issue_type="NOTICE",
            description=f"{insecure_count} external link(s) ({pct}%) point to non-HTTPS URLs"
        )

