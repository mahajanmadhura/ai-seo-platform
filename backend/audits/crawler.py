import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlparse
import time


def fetch_url(url):
    start_time=time.perf_counter()
    response=requests.get(url,verify=False)
    end_time=time.perf_counter()

    load_time=end_time-start_time
    redirect_chainlength=len(response.history)

    return response.status_code, response.text, load_time, redirect_chainlength

def parse_html(html_txt,base_url,key_word):
    soup=BeautifulSoup(html_txt,'html.parser')

    if soup.find("title")==None:
        title= "No title found"
    else:
        title=soup.title.text
    
    h1=soup.find("h1").text if soup.find('h1') else "No h1 tags found"
    h2=len(soup.find_all("h2")) if soup.find("h2") else 0
    h3=len(soup.find_all("h3")) if soup.find("h3") else 0
 
    word_count=len(soup.get_text().split(" ")) if soup.get_text() else 0

    meta_tag=soup.find("meta",attrs={"name":"description"})
    if meta_tag and meta_tag.get("content"):
        meta_content=meta_tag.get("content") 
    else:
        meta_content="No meta description"


    image_tags=soup.find_all("img")
    img_without_alt_tags=[]

    if len(image_tags)!=0:
        for image_tag in image_tags:
            if image_tag.get("alt"):
                continue
            else:
                raw_src=image_tag.get("src")
                full_src=urljoin(base_url,raw_src)
                img_without_alt_tags.append({"src":full_src,
                                             "alt":image_tag.get("alt")})
    
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

    canonical_tag_check=""
    canonical_tag = soup.find("link", rel="canonical")
    if canonical_tag and canonical_tag.get("href"):
        canonical_tag_check=canonical_tag.get("href")

    bold_count=len(soup.find_all(["b","strong"]))
    
    url_structure_char_count=len(base_url)

    keyword_density=0
    keyword_in_title=False
    keyword_in_h1=False
    keyword_in_meta_description=False
    keyword_in_h2_h3 = False
    
    if key_word:

        key_word_lower=key_word.lower()

        if key_word_lower in title.lower():
            keyword_in_title=True

        words_in_page=soup.get_text().lower()

        keyword_count=words_in_page.count(key_word_lower)
        if word_count>0:
            keyword_density=round((keyword_count/word_count)*100,2)

        if key_word_lower in h1.lower():
            keyword_in_h1=True

        if key_word_lower in meta_content.lower():
            keyword_in_meta_description=True
        
        # 1. Find all H2 and H3 tags
        h2_h3_tags = soup.find_all(['h2', 'h3'])
        if len(h2_h3_tags)!=0:
            # 2. Combine all their text into one massive lowercase string
            h2_h3_text = " ".join([tag.text for tag in h2_h3_tags]).lower()
            
            # 3. Check if the keyword is in that massive string!
            if key_word_lower in h2_h3_text:
                keyword_in_h2_h3 = True
        
    is_mobile_friendly=False
    viewport_tag=soup.find("meta", attrs=({"name":"viewport"}))
    if viewport_tag and viewport_tag.get("content"):
        is_mobile_friendly=True

    is_safe=False
    if base_url.startswith("https"):
        is_safe=True

    is_crawlable=True
    meta_robot_content=soup.find("meta", attrs={"name": "robots"})
    if meta_robot_content and "noindex" in meta_robot_content.get("content", "").lower():
        is_crawlable = False
    
    is_schema_json=False
    schema_json=soup.find_all("script",type="application/ld+json")
    if len(schema_json)>0:
        is_schema_json=True

    is_hreflang=False
    hreflang=soup.find_all("link",attrs={"rel":"alternate","hreflang":True})
    if len(hreflang)>0:
        is_hreflang=True



    return {"title": title,
            "h1":h1,
            "h2":h2,
            "h3":h3,
            "word_count":word_count,
            "links":links,
            "meta_description":meta_content,
            "img_without_alt_tags":img_without_alt_tags,
            "canonical_tag_check":canonical_tag_check,
            "bold_count":bold_count,
            "url_structure_char_count":url_structure_char_count,
            "keyword_in_title":keyword_in_title,
            "keyword_in_h1":keyword_in_h1,
            "keyword_in_meta_description":keyword_in_meta_description,
            "keyword_density":keyword_density,
            "keyword_in_h2_h3":keyword_in_h2_h3,
            "is_mobile_friendly":is_mobile_friendly,
            "is_safe":is_safe,
            "is_crawlable":is_crawlable,
            "is_schema_json":is_schema_json,
            "is_hreflang":is_hreflang,

            }


def check_technical_files(base_url):

    parsed=urlparse(base_url)
    base_url=f"{parsed.scheme}://{parsed.netloc}"
    if base_url.endswith("/"):
        base_url=base_url[:-1]
    
    has_robots=False
    has_sitemaps=False

    try:
        robots_url=f"{base_url}/robots.txt"
        response=requests.get(robots_url,timeout=5)
        if response.status_code==200:
            has_robots=True

    except:
        pass

    try:
        sitemaps_url=f"{base_url}/sitemap.xml"
        response=requests.get(sitemaps_url,timeout=5)

        if response.status_code==200:
            has_sitemaps=True
    except:
        pass

    return has_robots,has_sitemaps


