import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time


def fetch_url(url):
    start_time=time.perf_counter()
    response=requests.get(url)
    end_time=time.perf_counter()

    load_time=end_time-start_time

    return response.status_code, response.text, load_time

def parse_html(html_txt,base_url):
    soup=BeautifulSoup(html_txt,'html.parser')

    if soup.find("title")==None:
        title= "No title found"
    else:
        title=soup.title.text
    
    h1=soup.find("h1").text if soup.find('h1') else "No h1 tags found"

    word_count=len(soup.get_text().split(" ")) if soup.get_text() else 0

    meta_tag=soup.find("meta",attrs={"name":"description"})
    meta_content=meta_tag.get("content") if meta_tag else "No meta description"
    
    anchor_tags=soup.find_all("a")
    links=[]
    if len(anchor_tags)!=0:
        for anchor_tag in anchor_tags:
            href=anchor_tag.get("href")
            if href:
                full_link=urljoin(base_url,href)
                links.append(full_link)
            else:
                continue

    


    return {"title": title,
            "h1":h1,
            "word_count":word_count,
            "links":links,
            "meta_description":meta_content,
            }