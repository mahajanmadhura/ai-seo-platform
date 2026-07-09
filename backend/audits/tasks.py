from celery import shared_task
from django.db.models import Q
from django.conf import settings
from .models import Audit,CrawledPage,SEOIssues
from .crawler import fetch_url, parse_html, check_technical_files, fetch_core_web_vitals
from .analysers import calculate_on_page_score,calculate_performance_score,generate_ai_recommendations, performance_analysis
import traceback
from django.utils import timezone

def _execute_seo_audit(audit_id):
    audit_website=Audit.objects.get(id=audit_id)
    audit_website.status="RUNNING"
    audit_website.save()
    from process_status.services import update_process_status
    update_process_status(
        process_type="audit",
        object_id=audit_id,
        status="RUNNING",
        current_step="FETCHING_WEBSITE",
        message="Fetching website content",
        progress_percent=15
    )
    print(f"We are going to audit the website with id {audit_id}")

    urls_to_visit=[audit_website.website.url]
    visited_urls=set()

    update_process_status(
        process_type="audit",
        object_id=audit_id,
        status="RUNNING",
        current_step="CHECKING_ROBOTS",
        message="Checking robots.txt and sitemap files",
        progress_percent=25
    )
    robots,sitemap=check_technical_files(audit_website.website.url)
    audit_website.has_robots=robots
    audit_website.has_sitemap=sitemap
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

    update_process_status(
        process_type="audit",
        object_id=audit_id,
        status="RUNNING",
        current_step="CRAWLING_PAGES",
        message="Crawling and analyzing site structure",
        progress_percent=40
    )
    while urls_to_visit and len(visited_urls)<=5:
        current_url=urls_to_visit.pop(0)
        if current_url in visited_urls:
            continue

        print(f"Crawling: {current_url}")
        visited_urls.add(current_url)
        
        try:
            status_code, html_text, load_time, redirect_chainlength, has_valid_SSL, has_strict_transport_security, has_content_security_policy, has_x_frame_options=fetch_url(current_url)
            update_process_status(
                process_type="audit",
                object_id=audit_id,
                status="RUNNING",
                current_step="CHECKING_LINKS",
                message=f"Analyzing links on page {len(visited_urls)}: {current_url}",
                progress_percent=55
            )
            result_of_parse=parse_html(html_text,current_url,audit_website.key_word)
            performance_score = calculate_performance_score(load_time)

            
            
            score = calculate_on_page_score(
                        result_of_parse["title"],
                        result_of_parse["h1"],
                        result_of_parse["h2"],  
                        result_of_parse["h3"],  
                        result_of_parse["img_without_alt_tags"], 
                        result_of_parse["meta_description"],
                        result_of_parse["canonical_tag_check"],
                        result_of_parse["bold_count"],
                        result_of_parse["url_structure_char_count"],
                        current_url,
                        result_of_parse["internal_links"],
                        result_of_parse["keyword_in_title"],
                        result_of_parse["keyword_in_h1"],
                        result_of_parse["keyword_in_meta_description"],
                        result_of_parse["keyword_density"],
                        result_of_parse["keyword_in_h2_h3"],
                    )

            new_page = CrawledPage.objects.create(
                            audit=audit_website,
                            url=current_url,
                            status_code=status_code,
                            title=result_of_parse["title"],
                            h1=result_of_parse["h1"],
                            h2=result_of_parse["h2"],
                            h3=result_of_parse["h3"],
                            meta_description=result_of_parse["meta_description"],
                            word_count=result_of_parse["word_count"],
                            load_time=load_time,
                            on_page_score=score,
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
                            is_safe=result_of_parse["is_safe"],
                            performance_score=performance_score,        
                            redirect_chainlength=redirect_chainlength,
                            is_crawlable=result_of_parse.get("is_crawlable",False),
                            is_schema_json=result_of_parse.get("is_schema_json",False),
                            is_hreflang=result_of_parse.get("is_hreflang",False),
                            external_links_count=result_of_parse["external_links_count"],
                            broken_links_count=result_of_parse["broken_links_count"],
                            has_mobile_viewport_configuration=result_of_parse["has_mobile_viewport_configuration"],
                            has_valid_SSL=has_valid_SSL,
                            has_strict_transport_security=has_strict_transport_security,
                            has_content_security_policy=has_content_security_policy,
                            has_x_frame_options=has_x_frame_options,
                            has_mixed_content=result_of_parse["has_mixed_content"],

                        )

            update_process_status(
                process_type="audit",
                object_id=audit_id,
                status="RUNNING",
                current_step="PAGESPEED",
                message=f"Requesting PageSpeed insights for page {len(visited_urls)}: {current_url}",
                progress_percent=70
            )
            core_web_vitals_analysis.delay(new_page.id)

            if result_of_parse["h1"]=="No h1 tags found":
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Missing h1 tag on {current_url}",
                )
            
            if result_of_parse["h2"]==0:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Missing h2 tag on {current_url}",
                )
            
            if result_of_parse["h3"]==0:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Missing h3 tag on {current_url}",
                )
            
            if result_of_parse["title"]=="No title found":
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Missing title tag on {current_url}",
                )
            
            if result_of_parse["word_count"]==0:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"There are no words on the website: {current_url}",
                )
            
            if result_of_parse["meta_description"]=="No meta description":
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Missing meta description tag on {current_url}",
                )
            
            if result_of_parse["canonical_tag_check"]=="":
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Missing canonical tag on {current_url}",
                )

            if result_of_parse["bold_count"]==0:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"No bold tags found on {current_url}",
                )
            
            if result_of_parse["url_structure_char_count"]>100:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"url is longer than 100 characters on the {current_url}",
                )
            
            if not result_of_parse["is_mobile_friendly"]:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The website isnt mobile responsive as viewport is absent on {current_url}"
                )

            if not result_of_parse["is_safe"]:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Missing SSL certificate: Website isnt secure as it doesnt have https on {current_url}"
                )
            
            if load_time > 2.5:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="WARNING",
                    description=f"Slow page load time ({load_time}s) on {current_url}. Target is < 2.5s."
                )

            if status_code==404:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"Status code 404 on {current_url}",
                )

            if redirect_chainlength>2:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The page redirected {redirect_chainlength} number of times on {current_url}",
                )

            if not result_of_parse["is_crawlable"]:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The website isnt crawlable at as it is missing robots {current_url}",
                )
            
            if not result_of_parse["is_schema_json"]:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"There are no Schema Json tags on the website at {current_url}",
                )
            if not result_of_parse["is_hreflang"]:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The website doesnt have hreflang tags at {current_url}",
                )
            
            if not result_of_parse["has_mobile_viewport_configuration"]:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="WARNING",
                    description=f"The website doesnt have proper mobile viewport configuration at {current_url}",
                )
            
            if not has_valid_SSL:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The website doesnt have a valid SSL certificate at {current_url}",
                )

            if not has_strict_transport_security:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The website doesnt have strict transport security at {current_url}",
                )

            if not has_content_security_policy:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The website doesnt have a content security policy at {current_url}",
                )

            if not has_x_frame_options:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="ERROR",
                    description=f"The website doesnt have a X frame options at {current_url}",
                )

            if result_of_parse["has_mixed_content"]:
                SEOIssues.objects.create(
                    url=new_page,
                    issue_type="WARNING",
                    description=f"The website has mixed content (HTTPS pages loading HTTP resources) at {current_url}",
                )

            for new_link in result_of_parse["internal_links"]:
                if new_link not in urls_to_visit:
                    urls_to_visit.append(new_link)
        except Exception as e:
            print(f"Audit failed, Error: {e}")
            traceback.print_exc()
        
    

    update_process_status(
        process_type="audit",
        object_id=audit_id,
        status="RUNNING",
        current_step="SAVING_ISSUES",
        message="Saving and compiling audit reports",
        progress_percent=85
    )

    if len(visited_urls)>0:
        if getattr(settings, 'RUN_LEGACY_AUDIT_AI', False):
            ai_response=generate_ai_recommendations(audit_website)
            audit_website.ai_recommendation=ai_response
        else:
            audit_website.ai_recommendation="Structured insights can be generated using the AI Recommendations button on the report detail page."
        audit_website.completed_at = timezone.now()
        audit_website.total_pages = len(visited_urls)
        audit_website.total_issues = SEOIssues.objects.filter(Q(audit=audit_website) | Q(url__audit=audit_website)).count()
        
        pages = CrawledPage.objects.filter(audit=audit_website)
        if pages.exists():
            valid_scores = [p.on_page_score for p in pages if p.on_page_score is not None]
            if valid_scores:
                audit_website.overall_Score = int(sum(valid_scores) / len(valid_scores))
            else:
                audit_website.overall_Score = 70
        else:
            audit_website.overall_Score = 0

        audit_website.status="DONE"

    else:
        audit_website.status="FAILED"

    
    audit_website.save()

    return f"Audit Complete! Crawled through {len(visited_urls)} pages"


@shared_task
def run_seo_audit(audit_id):
    try:
        res = _execute_seo_audit(audit_id)
        from process_status.services import update_process_status
        update_process_status(
            process_type="audit",
            object_id=audit_id,
            status="DONE",
            current_step="DONE",
            message="Done",
            progress_percent=100
        )
        return res
    except Exception as e:
        try:
            audit_website = Audit.objects.get(id=audit_id)
            audit_website.status = "FAILED"
            audit_website.save()
            from process_status.services import update_process_status
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