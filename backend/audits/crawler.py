import requests
from bs4 import BeautifulSoup
def fetch_url(url):
    response=requests.get(url)
    return response.status_code, response.text

def parse_html(html_txt):
    soup=BeautifulSoup(html_txt,'html.parser')

    if soup.find("title")==None:
        title= "No title found"
    else:
        title=soup.title.text
    
    h1=soup.find("h1").text if soup.find('h1') else "No h1 tags found"

    word_count=len(soup.get_text().split(" ")) if soup.get_text() else 0
    

    return {"title": title,
            "h1":h1,
            "word_count":word_count}