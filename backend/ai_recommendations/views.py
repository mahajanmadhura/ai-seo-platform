import os
import json
from groq import Groq
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from audits.models import Audit, SEOIssues
from .models import AIRecommendation
from .serializers import AIRecommendationSerializer
from ai_engine.models import LLMRequestLog

class GenerateAIRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            audit = Audit.objects.get(id=id)
        except Audit.DoesNotExist:
            return Response({"error": "Audit not found"}, status=status.HTTP_404_NOT_FOUND)

        if audit.website.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if audit.status != "DONE":
            return Response({
                "error": f"AI Recommendations can only be generated for completed audits. Current status: {audit.status}"
            }, status=status.HTTP_400_BAD_REQUEST)

        existing_rec = AIRecommendation.objects.filter(audit=audit).first()
        if existing_rec:
            if request.query_params.get("regenerate") != "true":
                serializer = AIRecommendationSerializer(existing_rec)
                return Response(serializer.data)

        issues = SEOIssues.objects.filter(Q(audit=audit) | Q(url__audit=audit))
        list_of_issues = []
        for issue in issues:
            base_issue = issue.description.split(" on http")[0]
            list_of_issues.append(f"{issue.issue_type}: {base_issue}")

        if not list_of_issues:
            summary_txt = "Good Job, No issues were found on the website."
            data = {
                "summary": summary_txt,
                "critical_issues": [],
                "impact": "None",
                "recommended_fix": "None",
                "priority": "Low",
                "quick_wins": [],
                "client_friendly_explanation": "The website meets all checked SEO standards."
            }
        else:
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                return Response({"error": "Groq API key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                client = Groq(api_key=api_key)
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": f"""
                                You are an elite, senior Technical SEO Director and SEO Consultant.
                                I conducted a technical SEO audit on a website and compiled this list of findings:
                                {list_of_issues}
                                
                                Please analyze these findings and provide expert, highly detailed, actionable recommendations. 
                                Make sure the tone is professional, encouraging, and clear, using analogies where appropriate to translate complex jargon into simple business terms.
                                
                                You MUST return a raw, valid JSON object in the following structure:
                                {{
                                    "summary": "Provide a comprehensive, easy-to-read overview of the website's technical SEO health. Call out the main areas of concern (e.g., performance bottlenecks, indexation blocks, metadata gaps) in a paragraph of 3-4 sentences.",
                                    "critical_issues": [
                                        "Detailed list of the top 3-5 critical issues. For each issue, include a short prefix explaining why it is a blocker (e.g., '1. Missing Meta Descriptions: Google cannot show rich snippets, hurting Click-Through Rates.')"
                                    ],
                                    "impact": "Explain the business and ranking impact of these issues in real-world terms (e.g., loss of organic search visibility, high bounce rates due to slow mobile loading, or indexation failure where Google ignores pages completely).",
                                    "recommended_fix": [
                                        "Detailed step-by-step roadmap action item 1 (e.g., '1. Implement schema JSON tags to help search engines understand content.')",
                                        "Detailed step-by-step roadmap action item 2 (e.g., '2. Add meta description tags to each page to improve Click-Through Rates.')"
                                    ],
                                    "priority": "High/Medium/Low based on the overall severity of the blockers.",
                                    "quick_wins": [
                                        "List of 3-5 high-impact fixes that take under 15 minutes each to resolve (e.g., 'Configure a viewport meta tag for mobile responsiveness', 'Compress heavy homepage images to WebP format to save bandwidth')."
                                    ],
                                    "client_friendly_explanation": "Translate these technical issues into a simple, jargon-free analogy (e.g., 'Think of your website like a digital storefront: if your pages load slowly and lack meta tags, it is like having a locked front door with no sign outside. Customers will walk away, and Google will not list your store in its directory.') to help non-technical clients understand why this matters.",
                                    "seo_score": 
                                }}
                                
                                Note on "seo_score": Do not return a static data. You must dynamically calculate this integer score based on the severity of the findings: start with 100, and deduct 8 points for each critical ERROR, and 4 points for each WARNING found in the list above (minimum score is 10).
                            """
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    response_format={"type": "json_object"}
                )

                response_text = chat_completion.choices[0].message.content
                data = json.loads(response_text)

                # Track Groq LLM Token Usage in LLMRequestLog
                usage = getattr(chat_completion, 'usage', None)
                p_tokens = getattr(usage, 'prompt_tokens', 850) if usage else 850
                c_tokens = getattr(usage, 'completion_tokens', 450) if usage else 450
                t_tokens = getattr(usage, 'total_tokens', p_tokens + c_tokens) if usage else (p_tokens + c_tokens)

                LLMRequestLog.objects.create(
                    audit=audit,
                    prompt_tokens=p_tokens,
                    completion_tokens=c_tokens,
                    total_tokens=t_tokens,
                    latency_ms=450,
                    is_successful=True
                )

            except Exception:
                data = {
                    "summary": f"Failed to generate structured recommendation. Found {len(list_of_issues)} issues.",
                    "critical_issues": list_of_issues[:5],
                    "impact": "Undetermined due to system timeout.",
                    "recommended_fix": ["Review issues manually."],
                    "priority": "Medium",
                    "quick_wins": [],
                    "client_friendly_explanation": "Review the full audit report details.",
                    "seo_score": 70
                }

        rec, created = AIRecommendation.objects.update_or_create(
            audit=audit,
            defaults={
                "summary": data.get("summary", ""),
                "critical_issues": data.get("critical_issues", []),
                "impact": data.get("impact", ""),
                "recommended_fix": data.get("recommended_fix", []),
                "priority": data.get("priority", "Medium"),
                "quick_wins": data.get("quick_wins", []),
                "client_friendly_explanation": data.get("client_friendly_explanation", ""),
                "seo_score": int(data.get("seo_score", 70))
            }
        )

        serializer = AIRecommendationSerializer(rec)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class RetrieveAIRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            audit = Audit.objects.get(id=id)
        except Audit.DoesNotExist:
            return Response({"error": "Audit not found"}, status=status.HTTP_404_NOT_FOUND)

        if audit.website.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        rec = AIRecommendation.objects.filter(audit=audit).first()
        if not rec:
            return Response({"error": "Structured recommendation not generated yet"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AIRecommendationSerializer(rec)
        return Response(serializer.data)
