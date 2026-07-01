from groq import Groq
import os
from dotenv import load_dotenv
from .models import Audit,CrawledPage,SEOIssues
load_dotenv()



def calculate_on_page_score(title,h1,h2,h3,img_without_alt_tags,meta_description,canonical_tag_check,bold_count,url_structure_char_count,current_url,links,keyword_in_title,keyword_in_h1,keyword_in_meta_description,keyword_density,keyword_in_h2_h3):
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
    internal_link_count=0
    for link in links:
        if current_url in link:
            internal_link_count += 1
    
    if internal_link_count > 0:
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
    issues=SEOIssues.objects.filter(url__audit=audit)

    list_of_issues=[]
    if not issues:
        return "Good Job, No issues were found on the website"
    
    for issue in issues:
        list_of_issues.append(f"{issue.issue_type:issue.description}\n")
    
    print(list_of_issues)

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




