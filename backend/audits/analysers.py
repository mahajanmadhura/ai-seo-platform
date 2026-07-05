from groq import Groq
import os
from dotenv import load_dotenv
from .models import Audit,CrawledPage,SEOIssues
from django.db.models import Q
load_dotenv()



def calculate_on_page_score(title,h1,h2,h3,img_without_alt_tags,meta_description,canonical_tag_check,bold_count,url_structure_char_count,current_url,internal_links,keyword_in_title,keyword_in_h1,keyword_in_meta_description,keyword_density,keyword_in_h2_h3):
    score=0

    #title 7+8=15 or 3+8=11
    if title!="No title found":
        if 30<len(title)<65:
            score+=7
        else:
            score+=3
        
        if keyword_in_title:
            score+=8
       
    #meta_description 5+5=10 or 2+5=7  
    if meta_description!="No meta description":
        if 120<len(meta_description)<160:
            score+=5
        else:
            score+=2
        
        if keyword_in_meta_description:
            score+=5


    if h1!="No h1 tags found":
        score+=5

        if keyword_in_h1:
            score+=5


    if h2!=0:
        score+=1.5
    if h3!=0:
        score+=1.5
    if keyword_in_h2_h3:
        score+=2    


    if len(img_without_alt_tags)==0:
        score+=8
    
    if canonical_tag_check!="":
        score+=7
    
    if bold_count!=0:
        score+=3

    if url_structure_char_count<100:
        score+=8
    else:
        score+=4
    
    if len(internal_links)> 0:
        score += 12
    
    if 1.0<keyword_density<3.0:
        score+=12
    elif keyword_density>3.0:
        score-=5
    
    

    
        
    print(score)
    return score


def calculate_performance_score(load_time):
    score=100
    if load_time < 1.0:
        score = 100 # Lightning fast
    elif 1.0 <= load_time <= 2.5:
        score = 80  # Good, but could be better
    elif 2.5 < load_time <= 4.0:
        score = 50  # Needs Work
    else:
        score = 20  # Dangerously slow
        
    return score

def generate_ai_recommendations(audit):
    issues=SEOIssues.objects.filter(Q(audit=audit) | Q(url__audit=audit))

    list_of_issues=[]
    if not issues:
        return "Good Job, No issues were found on the website"
    
    unique_issues = set()
    for issue in issues:
        # We strip the specific URL out so the AI just sees the core issue
        # e.g., "ERROR: Missing h1 tag"
        base_issue = issue.description.split(" on http")[0] 
        unique_issues.add(f"{issue.issue_type}: {base_issue}")
    
    list_of_issues = list(unique_issues)
    
    for issue in list_of_issues:
        print(issue)

    client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content":f"""
                    You are an expert Technical SEO Analyst. 
                    I just audited a website and found these issues:
                    {list_of_issues}
                    Go through them and prepare an effective way of solving all the seo issues present on the users website
                    Keep it professional and easy to understand.
                    Answer in short 2 sentences is sufficient.
                """,
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    print(chat_completion.choices[0].message.content)
    return chat_completion.choices[0].message.content


def performance_analysis(lcp,fid,cls,ttfb,fcp):
    score=0
    if lcp<2.5:
        score+=25
    if fid<100:
        score+=25
    if cls<0.1:
        score+=20
    if ttfb<200:
        score+=15
    if fcp<1.8:
        score+=15

    return score

