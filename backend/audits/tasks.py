from celery import shared_task
from .models import Audit,CrawledPage,SEOIssues
from .crawler import fetch_url, parse_html, check_technical_files
from .analysers import calculate_on_page_score,calculate_performance_score,generate_ai_recommendations
import traceback

@shared_task
def run_seo_audit(audit_id):
    audit_website=Audit.objects.get(id=audit_id)
    audit_website.status="RUNNING"
    audit_website.save()
    print(f"We are going to audit the website with id {audit_id}")

    urls_to_visit=[audit_website.website.url]
    visited_urls=set()

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


    while urls_to_visit and len(visited_urls)<=5:
        current_url=urls_to_visit.pop(0)
        if current_url in visited_urls:
            continue

        print(f"Crawling: {current_url}")
        visited_urls.add(current_url)

        try:
            status_code,html_text,load_time,redirect_chainlength=fetch_url(current_url)
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
                        result_of_parse["links"],
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


                        )

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


            
            for new_link in result_of_parse["links"]:
                if new_link not in urls_to_visit:
                    urls_to_visit.append(new_link)
        except Exception as e:
            print(f"Audit failed, Error: {e}")
            traceback.print_exc()
        
    

    if len(visited_urls)>0:
        ai_response=generate_ai_recommendations(audit_website)
        audit_website.ai_recommendation=ai_response
        audit_website.status="DONE"

    else:
        audit_website.status="FAILED"

    
    audit_website.save()

    return f"Audit Complete! Crawled through {len(visited_urls)} pages"

        