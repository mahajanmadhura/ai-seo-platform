import requests, time, os, json
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlparse
import traceback
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import re
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

DISALLOWED_PATHS = ['/admin', '/login', '/cart', '/checkout']
HEADERS = {"User-Agent": "AI-SEO-Audit-Bot/1.0"}
ALLOWED_EXTENSIONS = ['.html', '.htm', '.php', '.asp', '.aspx', '.jsp', '/']
MAX_REDIRECTS = 5
REQUEST_TIMEOUT = 30
CTA_PHRASES = ["learn more", "shop now", "get started", "buy now", "sign up", "read more",
               "discover", "explore", "contact us", "try", "download", "subscribe",
               "book now", "order now", "join", "call now"]
MAX_BROKEN_LINK_CHECKS_PER_PAGE = 30  
HREFLANG_PATTERN = re.compile(r'^[a-z]{2}(-[A-Z]{2})?$|^x-default$')

def validate_hreflang(soup, base_url):
    hreflang_tags = soup.find_all("link", attrs={"rel": "alternate", "hreflang": True})
    if not hreflang_tags:
        return {"is_hreflang": False, "invalid_hreflang_codes": [], "hreflang_entries": []}

    invalid_codes = []
    entries = []
    for tag in hreflang_tags:
        code = tag.get("hreflang", "")
        href = tag.get("href")
        if not HREFLANG_PATTERN.match(code):
            invalid_codes.append(code)
        if href:
            entries.append({"lang": code, "href": urljoin(base_url, href)})

    return {"is_hreflang": True, "invalid_hreflang_codes": invalid_codes, "hreflang_entries": entries}

def validate_structured_data(soup):
    schema_scripts = soup.find_all("script", type="application/ld+json")
    if not schema_scripts:
        return {"is_schema_json": False, "is_schema_valid": False, "schema_errors": []}

    valid_count = 0
    errors = []
    for script in schema_scripts:
        try:
            data = json.loads(script.string or "")
            entries = data if isinstance(data, list) else [data]
            for entry in entries:
                if "@context" not in entry:
                    errors.append("Missing @context field")
                elif "schema.org" not in str(entry.get("@context", "")):
                    errors.append("@context doesn't reference schema.org")
                if "@type" not in entry:
                    errors.append("Missing @type field")
                else:
                    valid_count += 1
        except (json.JSONDecodeError, TypeError, AttributeError) as e:
            errors.append(f"Invalid JSON syntax: {str(e)}")

    return {
        "is_schema_json": True,
        "is_schema_valid": valid_count > 0 and len(errors) == 0,
        "schema_errors": errors,
    }

    
def check_url_structure(url):
    parsed = urlparse(url)
    path = parsed.path
    issues = []
    if path != path.lower():
        issues.append("uppercase characters")
    if "_" in path:
        issues.append("underscores instead of hyphens")
    if " " in url or "%20" in url:
        issues.append("spaces")
    return issues

def has_call_to_action(text):
    text_lower = text.lower()
    return any(phrase in text_lower for phrase in CTA_PHRASES)

def parse_sitemap(base_url):
    parsed = urlparse(base_url)
    root_url = f"{parsed.scheme}://{parsed.netloc}"
    sitemap_url = f"{root_url}/sitemap.xml"
    urls = []
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

    try:
        response = requests.get(sitemap_url, timeout=10, headers=HEADERS, verify=False)
        if response.status_code != 200:
            return urls

        root = ET.fromstring(response.content)

        # Handle sitemap index files (a sitemap that just lists other sitemaps)
        sitemap_entries = root.findall('.//ns:sitemap/ns:loc', namespace)
        if sitemap_entries:
            for entry in sitemap_entries[:10]:  # cap to avoid pulling in hundreds of sub-sitemaps
                try:
                    sub_response = requests.get(entry.text, timeout=10, headers=HEADERS, verify=False)
                    if sub_response.status_code == 200:
                        sub_root = ET.fromstring(sub_response.content)
                        for loc in sub_root.findall('.//ns:url/ns:loc', namespace):
                            urls.append(loc.text.strip())
                except Exception:
                    continue
        else:
            for loc in root.findall('.//ns:url/ns:loc', namespace):
                urls.append(loc.text.strip())

    except Exception as e:
        print(f"Couldn't parse sitemap: {e}")
        traceback.print_exc()

    return urls



def is_disallowed(url):
    path = urlparse(url).path.lower()
    return any(path == blocked or path.startswith(blocked + "/") for blocked in DISALLOWED_PATHS)

def is_allowed_extension(url):
    path = urlparse(url).path.lower()
    if path == "" or path.endswith("/"):
        return True
    ext = os.path.splitext(path)[1]
    if ext == "":
        return True  # extensionless routes like /about are fine
    return ext in ALLOWED_EXTENSIONS

def detect_redirect_loop(response):
    seen = set()
    chain = [r.url for r in response.history] + [response.url]
    for url in chain:
        if url in seen:
            return True
        seen.add(url)
    return False


def fetch_url(url):
    time.sleep(0.5)
    start_time = time.perf_counter()

    try:
        session = requests.Session()
        session.max_redirects = MAX_REDIRECTS
        response = session.get(url, verify=False, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    except requests.exceptions.TooManyRedirects:
        end_time = time.perf_counter()
        print(f"Redirect loop detected on {url}")
        return 0, "", end_time - start_time, MAX_REDIRECTS + 1, False, False, False, False, True, False
    except requests.exceptions.RequestException as e:
        end_time = time.perf_counter()
        print(f"Failed to fetch {url}: {e}")
        return 0, "", end_time - start_time, 0, False, False, False, False, False, False

    end_time = time.perf_counter()
    load_time = end_time - start_time
    redirect_chainlength = len(response.history)
    is_redirect_loop = detect_redirect_loop(response)

    has_valid_SSL = False
    if urlparse(url).scheme == "https":
        try:
            requests.head(url, timeout=10, headers=HEADERS)  # verify=True by default — raises on bad cert
            has_valid_SSL = True
        except requests.exceptions.SSLError:
            has_valid_SSL = False
        except requests.exceptions.RequestException:
            # Non-SSL failure (timeout, connection refused, etc.) — not a cert problem, but not confirmed valid either
            has_valid_SSL = False

    has_strict_transport_security = "Strict-Transport-Security" in response.headers
    has_content_security_policy = "Content-Security-Policy" in response.headers
    has_x_frame_options = "X-Frame-Options" in response.headers
    x_robots_noindex = "noindex" in response.headers.get("X-Robots-Tag", "").lower()

    return response.status_code, response.text, load_time, redirect_chainlength, has_valid_SSL, has_strict_transport_security, has_content_security_policy, has_x_frame_options, is_redirect_loop, x_robots_noindex

def parse_html(html_txt,base_url,key_word):
    soup=BeautifulSoup(html_txt,'html.parser')

    for tag in soup(["script", "style"]):
        tag.decompose()

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

    meta_description_has_cta = has_call_to_action(meta_content) if meta_content != "No meta description" else False


    image_tags=soup.find_all("img")


    img_without_alt_tags=[]
    poor_quality_alt_tags=[]

    has_mixed_content=False

    GENERIC_ALT_TEXTS = {"image", "photo", "picture", "img", "graphic", "icon", "logo"}
    FILENAME_ALT_PATTERN = re.compile(r'^(img|image|photo|dsc|pic)[\-_]?\d*$', re.IGNORECASE)

    if len(image_tags)!=0:
        for image_tag in image_tags:
            raw_src=image_tag.get("src") if image_tag.get("src") else ""
            full_src=urljoin(base_url,raw_src)

            if not has_mixed_content:
                parsed_src=urlparse(full_src).scheme

                if parsed_src!="https":
                    has_mixed_content=True
            
            if image_tag.get("alt"):
                alt_text = image_tag.get("alt").strip()
                is_poor = (
                    len(alt_text) < 5
                    or alt_text.lower() in GENERIC_ALT_TEXTS
                    or bool(FILENAME_ALT_PATTERN.match(alt_text))
                )
                if is_poor:
                    poor_quality_alt_tags.append({"src": full_src, "alt": alt_text})
                continue
            else:
                img_without_alt_tags.append({"src": full_src, "alt": image_tag.get("alt")})
                
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
                
            # 3. Check <img>, <link>, and <iframe> src/href attributes too
            if not has_mixed_content:
                resource_tags = soup.find_all(["img", "link", "iframe"])
                for tag in resource_tags:
                    resource_url = tag.get("src") or tag.get("href")
                    if resource_url and resource_url.startswith("http://"):
                        has_mixed_content = True
                        break

    

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

            if len(broken_links) < MAX_BROKEN_LINK_CHECKS_PER_PAGE:
                try:
                    resp = requests.head(full_link, timeout=2, verify=False, allow_redirects=False, headers=HEADERS)
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

    canonical_tag_check = ""
    is_canonical_self_referencing = True
    canonical_tag = soup.find("link", rel="canonical")
    if canonical_tag and canonical_tag.get("href"):
        canonical_href = urljoin(base_url, canonical_tag.get("href"))
        canonical_tag_check = canonical_href
        if canonical_href.rstrip('/') != base_url.rstrip('/'):
            is_canonical_self_referencing = False

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
    
    schema_result = validate_structured_data(soup)

    hreflang_result = validate_hreflang(soup, base_url)


    return {"title": title,
            "h1":h1,
            "h2":h2,
            "h3":h3,
            "word_count":word_count,
            "internal_links":internal_links,
            "external_links_count":len(external_links),
            "broken_links_count":len(broken_links),
            "meta_description":meta_content,
            "meta_description_has_cta": meta_description_has_cta,
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
            "is_schema_json": schema_result["is_schema_json"],
            "is_schema_valid": schema_result["is_schema_valid"],
            "schema_errors": schema_result["schema_errors"],
            "is_hreflang": hreflang_result["is_hreflang"],
            "invalid_hreflang_codes": hreflang_result["invalid_hreflang_codes"],
            "hreflang_entries": hreflang_result["hreflang_entries"],
            "has_mobile_viewport_configuration":has_mobile_viewport_configuration,
            "has_mixed_content":has_mixed_content,
            "all_links": all_links,
            "poor_quality_alt_tags": poor_quality_alt_tags,
            "is_canonical_self_referencing": is_canonical_self_referencing,
            "url_structure_issues": check_url_structure(base_url),
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
        response=requests.get(robots_url,timeout=5, headers=HEADERS)
        if response.status_code==200:
            has_robots=True

    except:
        pass

    try:
        sitemaps_url=f"{base_url}/sitemap.xml"
        response=requests.get(sitemaps_url,timeout=5, headers=HEADERS)

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
        font_score = audits.get("font-size",{}).get("score",0)
        tap_score = audits.get("tap-targets",{}).get("score",0)
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
    

def get_robots_parser(base_url):
    parsed = urlparse(base_url)
    root_url = f"{parsed.scheme}://{parsed.netloc}"
    robots_url = f"{root_url}/robots.txt"

    rp = RobotFileParser()
    rp.set_url(robots_url)
    try:
        rp.read()
    except Exception:
        pass  # if robots.txt can't be read, rp.can_fetch will just allow everything by default
    return rp

SOFT_404_INDICATORS = [
    "page not found", "404 not found", "404 error", "page doesn't exist",
    "we couldn't find", "cannot be found", "does not exist", "no longer available"
]

def is_soft_404(status_code, title, h1, word_count):
    if status_code != 200:
        return False
    text_to_check = f"{title} {h1}".lower()
    if any(indicator in text_to_check for indicator in SOFT_404_INDICATORS):
        return True
    if word_count < 50 and ("not found" in text_to_check or "404" in text_to_check):
        return True
    return False