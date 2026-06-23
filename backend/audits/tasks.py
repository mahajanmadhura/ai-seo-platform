from celery import shared_task
from .models import Audit,CrawledPage,SEOIssues
from .crawler import fetch_url, parse_html
from .analysers import calculate_on_page_score,generate_ai_recommendations

@shared_task
def run_seo_audit(audit_id):
    audit_website=Audit.objects.get(id=audit_id)
    audit_website.status="RUNNING"
    audit_website.save()
    print(f"We are going to audit the website with id {audit_id}")

    urls_to_visit=[audit_website.website.url]

    visited_urls=set()
    while urls_to_visit and len(visited_urls)<=5:
        current_url=urls_to_visit.pop(0)
        if current_url in visited_urls:
            continue

        print(f"Crawling: {current_url}")
        visited_urls.add(current_url)

        try:
            status_code,html_text,load_time=fetch_url(current_url)
            result_of_parse=parse_html(html_text,current_url)
            score = calculate_on_page_score(
                        result_of_parse["title"],
                        result_of_parse["h1"],
                        result_of_parse["h2"],  # <--- Passing H2
                        result_of_parse["h3"],  # <--- Passing H3
                        result_of_parse["img_without_alt_tags"], # <--- Passing Images
                        result_of_parse["meta_description"]
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
                            img_without_alt_tags=result_of_parse["img_without_alt_tags"]
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


            
            for new_link in result_of_parse["links"]:
                if new_link not in urls_to_visit:
                    urls_to_visit.append(new_link)
        except Exception as e:
            print(f"Audit failed, Error: {e}")

    if len(visited_urls)>0:
        ai_response=generate_ai_recommendations(audit_website)
        audit_website.ai_recommendation=ai_response
        audit_website.status="DONE"

    else:
        audit_website.status="FAILED"

    
    audit_website.save()

    return f"Audit Complete! Crawled through {len(visited_urls)} pages"

        