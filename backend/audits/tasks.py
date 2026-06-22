from celery import shared_task
from .models import Audit,CrawledPage
from .crawler import fetch_url, parse_html
from .analysers import calculate_on_page_score

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

            CrawledPage.objects.create(audit=audit_website,
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
                                    img_without_alt_tags=result_of_parse["img_without_alt_tags"])
            
            for new_link in result_of_parse["links"]:
                if new_link not in urls_to_visit:
                    urls_to_visit.append(new_link)
        except Exception as e:
            print(f"Audit failed, Error: {e}")

    audit_website.status="DONE"
    audit_website.save()
    return "Audit Complete!"

        