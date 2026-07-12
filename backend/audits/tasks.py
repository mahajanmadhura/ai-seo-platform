from celery import shared_task
from .models import Audit,CrawledPage,SEOIssues, Link
from .crawler import fetch_url, parse_html, check_technical_files, fetch_core_web_vitals, is_disallowed, get_robots_parser, HEADERS, parse_sitemap, is_allowed_extension
from .analysers import calculate_on_page_score,calculate_performance_score,generate_ai_recommendations, performance_analysis, analyze_link_profile
import traceback
from django.utils import timezone
from django.db import models
from concurrent.futures import ThreadPoolExecutor
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



@shared_task
def run_seo_audit(audit_id):
    audit_website=Audit.objects.get(id=audit_id)
    audit_website.status="RUNNING"
    audit_website.save()
    print(f"We are going to audit the website with id {audit_id}")

    urls_to_visit=[(audit_website.website.url, 0)]  # (url, depth) — homepage is depth 0
    visited_urls=set()
    queued_urls = {audit_website.website.url}

    robots,sitemap=check_technical_files(audit_website.website.url)
    audit_website.has_robots=robots
    audit_website.has_sitemap=sitemap
    audit_website.save()
    robots_parser = get_robots_parser(audit_website.website.url)

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
            if (sitemap_url not in queued_urls
                and not is_disallowed(sitemap_url)
                and is_allowed_extension(sitemap_url)
                and robots_parser.can_fetch(HEADERS["User-Agent"], sitemap_url)):
                urls_to_visit.append((sitemap_url, 0))
                queued_urls.add(sitemap_url)


    CONCURRENT_REQUESTS = 10  # matches your spec's crawler config

    MAX_DEPTH = 5  # matches your spec

    while urls_to_visit and len(visited_urls) <= 500:
        batch = []
        while urls_to_visit and len(batch) < CONCURRENT_REQUESTS:
            url, depth = urls_to_visit.pop(0)
            if url not in visited_urls:
                batch.append((url, depth))
                visited_urls.add(url)

        if not batch:
            break

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

        send_progress(audit_id, {"pages_crawled": len(visited_urls)})  # from step 2 below
        
    

    if len(visited_urls)>0:
        analyze_link_profile(audit_website)
        ai_response=generate_ai_recommendations(audit_website)
        audit_website.ai_recommendation=ai_response
        audit_website.completed_at = timezone.now()
        audit_website.total_pages = len(visited_urls)
        audit_website.total_issues = SEOIssues.objects.filter(models.Q(audit=audit_website) | models.Q(url__audit=audit_website)).count()
        audit_website.status="DONE"

    else:
        audit_website.status="FAILED"

    
    audit_website.save()

    return f"Audit Complete! Crawled through {len(visited_urls)} pages"

        
@shared_task
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
    print(f"Crawling: {current_url}")
    status_code, html_text, load_time, redirect_chainlength, has_valid_SSL, has_strict_transport_security, has_content_security_policy, has_x_frame_options = fetch_url(current_url)
    result_of_parse = parse_html(html_text, current_url, audit_website.key_word)
    performance_score = calculate_performance_score(load_time)

    score = calculate_on_page_score(
        result_of_parse["title"], result_of_parse["h1"], result_of_parse["h2"],
        result_of_parse["h3"], result_of_parse["img_without_alt_tags"],
        result_of_parse["meta_description"], result_of_parse["canonical_tag_check"],
        result_of_parse["bold_count"], result_of_parse["url_structure_char_count"],
        current_url, result_of_parse["internal_links"], result_of_parse["keyword_in_title"],
        result_of_parse["keyword_in_h1"], result_of_parse["keyword_in_meta_description"],
        result_of_parse["keyword_density"], result_of_parse["keyword_in_h2_h3"],
    )

    new_page = CrawledPage.objects.create(
        audit=audit_website, url=current_url, status_code=status_code,
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
    )

    for link_data in result_of_parse["all_links"]:
        Link.objects.create(page=new_page, **link_data)

    core_web_vitals_analysis.delay(new_page.id)
    create_seo_issues(new_page, result_of_parse, status_code, redirect_chainlength,
                       has_valid_SSL, has_strict_transport_security,
                       has_content_security_policy, has_x_frame_options, load_time)

    return result_of_parse["internal_links"]

def send_progress(audit_id, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'audit_{audit_id}', {"type": "audit_progress", "data": data}
    )


def create_seo_issues(new_page, result_of_parse, status_code, redirect_chainlength,
                       has_valid_SSL, has_strict_transport_security,
                       has_content_security_policy, has_x_frame_options, load_time):
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

        if result_of_parse["meta_description"]=="No meta description":
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing meta description tag on {new_page.url}")

        if result_of_parse["canonical_tag_check"]=="":
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"Missing canonical tag on {new_page.url}")

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

        if not result_of_parse["is_hreflang"]:
            SEOIssues.objects.create(url=new_page, issue_type="ERROR", description=f"The website doesnt have hreflang tags at {new_page.url}")

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

    except Exception as e:
        print(f"Issue creation failed for {new_page.url}, Error: {e}")
        traceback.print_exc()