from celery import shared_task
from .models import Audit,CrawledPage
from .crawler import fetch_url, parse_html

@shared_task
def your_test_task(a, b):
    print(f"I am cooking: {a} + {b}")
    return a+b

@shared_task
def run_seo_audit(audit_id):
    audit_website=Audit.objects.get(id=audit_id)
    audit_website.status="RUNNING"
    audit_website.save()
    print(f"We are going to audit the website with id {audit_id}")

    status_code,html_text=fetch_url(audit_website.website.url)
    result_of_parse=parse_html(html_text)

    CrawledPage.objects.create(audit=audit_website,
                               url=audit_website.website.url,
                               status_code=status_code,
                               title=result_of_parse["title"],
                               h1=result_of_parse["h1"],
                               word_count=result_of_parse["word_count"],
                               load_time=0.00)
    audit_website.status="DONE"
    audit_website.save()
    return "Audit Complete!"
