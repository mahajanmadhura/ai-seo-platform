import requests, time, os
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlparse
import traceback
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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
    internal_links=[]
    external_links=[]
    broken_links=[]
    if len(anchor_tags)!=0:
        for anchor_tag in anchor_tags:
            href=anchor_tag.get("href")
            if href:
                full_link=urljoin(base_url,href)
                
                if urlparse(base_url).netloc in full_link:
                    internal_links.append(full_link)
                else:
                    external_links.append(full_link)
                
                if len(broken_links)<10:
                    try:
                        status_code=requests.head(full_link,timeout=2,verify=False).status_code
                        if status_code>=400:
                            broken_links.append(full_link)
                    except:
                        broken_links.append(full_link)
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
            "internal_links":internal_links,
            "external_links_count":len(external_links),
            "broken_links_count":len(broken_links),
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


def fetch_core_web_vitals(url):
    api_url=f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy=mobile"
    api_key=os.environ.get("PAGESPEED_API_KEY")
    if api_key:
        api_url+=f"&key={api_key}"

    try:
        response = requests.get(api_url, timeout=30)
        data = response.json()
        
        # 1. Safely drill down to the "audits" folder. If anything is missing, return an empty dict {}
        audits = data.get("lighthouseResult", {}).get("audits", {})
        
        # 2. Safely grab the LCP numericValue. If it's missing, default to 0!
        lcp_raw = audits.get("largest-contentful-paint", {}).get("numericValue", 0)
        cls_raw = audits.get("cumulative-layout-shift", {}).get("numericValue", 0)
        fcp_raw = audits.get("first-contentful-paint", {}).get("numericValue", 0)
        ttfb_raw = audits.get("server_response_time",{}).get("numericValue",0)
        fid_raw = audits.get("total-blocking-time",{}).get("numericValue",0)

        font_score = audits.get("font_size",{}).get("numericValue",0)
        tap_score = audits.get("tap_targets",{}).get("numericValue",0)

        return {
            "lcp": round(lcp_raw / 1000, 2), # Convert ms to s, and round to 2 decimals
            "cls": round(cls_raw, 3),        # CLS doesn't need conversion, just rounding
            "fcp": round(fcp_raw / 1000, 2),
            "ttfb": round(ttfb_raw,3),
            "fid":round(fid_raw,3),
            "mobile_font_readability":font_score>=0.9,
            "mobile_tap_targets":tap_score>=0.9,

        }
    # try:
    #     response=requests.get(api_url,timeout=30)
    #     data=response.json()
    #     lcp=data["lighthouseResult"]["audits"]["largest-contentful-paint"]["numericValue"]/1000 if data["lighthouseResult"]["audits"]["largest-contentful-paint"]["numericValue"] else 0
    #     cls=data["lighthouseResult"]["audits"]["cumulative-layout-shift"]["numericValue"]
    #     fcp=data["lighthouseResult"]["audits"]["first-contentful-paint"]["numericValue"]/1000 if data["lighthouseResult"]["audits"]["first-contentful-paint"]["numericValue"] else 0
        
    #     return {
    #         "lcp":lcp,
    #        "cls":cls,
    #         "fcp":fcp,
    #     }

    except Exception as e:
        print("Couldnt fetch core vitals with error",e)
        traceback.print_exc()
        return {
            "lcp":0.00,
            "cls":0.000,
            "fcp":0.00,
            "ttfb":0.00,
            "fid":0.00,
            "mobile_font_readability":False,
            "mobile_tap_targets":False,
        }