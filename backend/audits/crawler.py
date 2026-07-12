import requests, time, os
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlparse
import traceback
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import re

def fetch_url(url):
    start_time=time.perf_counter()
    response=requests.get(url,verify=False)
    end_time=time.perf_counter()

    load_time=end_time-start_time
    redirect_chainlength=len(response.history)

    has_valid_SSL=True
    try:
        SSL_response=requests.head(url,timeout=10)
    except requests.exceptions.RequestException:
        has_valid_SSL=False

    has_strict_transport_security=False                   #HSTS
    if "Strict-Transport-Security" in response.headers:
        has_strict_transport_security=True
    
    has_content_security_policy=False                    #CSP
    if "Content-Security-Policy" in response.headers:
        has_content_security_policy=True

    has_x_frame_options=False                            #X-Frame_Options
    if "X-Frame-Options" in response.headers:
        has_x_frame_options=True



    return response.status_code, response.text, load_time, redirect_chainlength, has_valid_SSL, has_strict_transport_security, has_content_security_policy, has_x_frame_options

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

    has_mixed_content=False

    if len(image_tags)!=0:
        for image_tag in image_tags:
            raw_src=image_tag.get("src") if image_tag.get("src") else ""
            full_src=urljoin(base_url,raw_src)

            if not has_mixed_content:
                parsed_src=urlparse(full_src).scheme

                if parsed_src!="https":
                    has_mixed_content=True
            
            if image_tag.get("alt"):
                continue
            else:
                
                img_without_alt_tags.append({"src":full_src,
                                             "alt":image_tag.get("alt")})
                
    if not has_mixed_content:
        all_scripts = soup.find_all("script")
        url_pattern = r"http://[^\s'\"]+"

        for script in all_scripts:
            # 1. Check the inline text of the script
            script_text = script.text
            if script_text and re.search(url_pattern, script_text):
                has_mixed_content = True
                break  # Exit loop early since we found what we were looking for

            # 2. Check the 'src' attribute of the script
            script_src = script.get("src")
            if script_src: # This cleanly handles None or empty strings ("")
                if re.match(url_pattern, script_src):
                    has_mixed_content = True
                    break  # Exit loop early

    

    anchor_tags=soup.find_all("a")
    internal_links=[]
    external_links=[]
    broken_links=[]
    all_links=[]

    if len(anchor_tags)!=0:
        for anchor_tag in anchor_tags:
            href=anchor_tag.get("href")
            if not href:
                continue

            full_link=urljoin(base_url,href)
            is_internal = urlparse(base_url).netloc==urlparse(full_link).netloc
            anchor_text = anchor_tag.text.strip() if anchor_tag.text else ""
            rel = " ".join(anchor_tag.get("rel", [])) if anchor_tag.get("rel") else ""

            if is_internal:
                internal_links.append(full_link)
            else:
                external_links.append(full_link)

            status_code = None
            is_broken = False
            redirects = False
            redirect_target = None

            if len(broken_links)<10:
                try:
                    resp = requests.head(full_link, timeout=2, verify=False, allow_redirects=False)
                    status_code = resp.status_code
                    if status_code>=400:
                        is_broken = True
                        broken_links.append(full_link)
                    if 300<=status_code<400:
                        redirects = True
                        redirect_target = resp.headers.get("Location")
                except:
                    is_broken = True
                    broken_links.append(full_link)

            all_links.append({
                "target_url": full_link,
                "anchor_text": anchor_text,
                "rel": rel,
                "is_internal": is_internal,
                "status_code": status_code,
                "is_broken": is_broken,
                "redirects": redirects,
                "redirect_target": redirect_target,
            })

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
    has_mobile_viewport_configuration=False
    viewport_tag=soup.find("meta", attrs=({"name":"viewport"}))
    if viewport_tag and viewport_tag.get("content"):
        is_mobile_friendly=True
        
        current_string=viewport_tag.get("content").lower()
        if "width=device-width" in current_string and "initial-scale=1" in current_string:
            has_mobile_viewport_configuration=True


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
    hreflang=soup.find_all("link",attrs={"rel":"alternate", "hreflang":True})
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
            "has_mobile_viewport_configuration":has_mobile_viewport_configuration,
            "has_mixed_content":has_mixed_content,
            "all_links": all_links,

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
        ttfb_raw = audits.get("server-response-time",{}).get("numericValue",0)
        fid_raw = audits.get("total-blocking-time",{}).get("numericValue",0)

        #Mobile SEO analysis
        font_score = audits.get("font-size",{}).get("numericValue",0)
        tap_score = audits.get("tap-targets",{}).get("numericValue",0)
        viewport_audit = audits.get("viewport", {})

        return {
            "lcp": round(lcp_raw / 1000, 2), # Convert ms to s, and round to 2 decimals
            "cls": round(cls_raw, 3),        # CLS doesn't need conversion, just rounding
            "fcp": round(fcp_raw / 1000, 2),
            "ttfb": round(ttfb_raw,3),
            "fid":round(fid_raw,3),
            "mobile_font_readability":font_score>=0.9,
            "mobile_tap_targets":tap_score>=0.9,

        }

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