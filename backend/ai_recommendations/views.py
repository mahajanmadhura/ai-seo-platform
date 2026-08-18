import os
import re
import json
import logging
from groq import Groq
from django.conf import settings
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from audits.models import Audit, SEOIssues
from .models import AIRecommendation
from .serializers import AIRecommendationSerializer
from ai_engine.models import LLMRequestLog

logger = logging.getLogger(__name__)


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

        # Check existing recommendations (bypass cache if it was a previously failed record)
        existing_rec = AIRecommendation.objects.filter(audit=audit).first()
        is_failure_record = existing_rec and existing_rec.summary.startswith("Failed to generate")
        if existing_rec and not is_failure_record:
            if request.query_params.get("regenerate") != "true":
                serializer = AIRecommendationSerializer(existing_rec)
                return Response(serializer.data)

        issues = SEOIssues.objects.filter(Q(audit=audit) | Q(url__audit=audit))
        list_of_issues = []
        for issue in issues:
            base_issue = issue.description.split(" on http")[0]
            list_of_issues.append(f"{issue.issue_type}: {base_issue}")

        if not list_of_issues:
            summary_txt = "Good Job, No critical technical issues were found on the audited website."
            data = {
                "summary": summary_txt,
                "critical_issues": [],
                "impact": "The website demonstrates strong foundational SEO architecture with no critical blockers.",
                "recommended_fix": ["Continue monitoring website pages periodically for crawl changes."],
                "priority": "Low",
                "quick_wins": ["Review content optimization for target keywords."],
                "client_friendly_explanation": "Your digital storefront is operating cleanly with open doors for search engines.",
                "seo_score": 100
            }
        else:
            api_key = getattr(settings, "GROQ_API_KEY", None) or os.environ.get("GROQ_API_KEY")
            groq_model = getattr(settings, "GROQ_MODEL", None) or os.environ.get("GROQ_MODEL", "openai/gpt-oss-20b")
            if not api_key:
                return Response({"error": "Groq API key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            prompt_system = "You are an elite Technical SEO consultant and API endpoint. You MUST respond with ONLY a single, valid JSON object without markdown formatting, reasoning tokens, or conversational text."

            prompt_user = f"""Analyze these technical SEO audit findings and provide actionable recommendations:
{list_of_issues}

You MUST return a raw, valid JSON object with the following structure:
{{
    "summary": "Provide a comprehensive, easy-to-read overview of the website's technical SEO health (3-4 sentences).",
    "critical_issues": [
        "1. Missing Meta Descriptions: Google cannot show rich snippets, hurting Click-Through Rates."
    ],
    "impact": "Explain the business and ranking impact of these issues on organic search visibility.",
    "recommended_fix": [
        "1. Implement schema JSON tags to help search engines understand content.",
        "2. Add meta description tags to each page to improve Click-Through Rates."
    ],
    "priority": "High",
    "quick_wins": [
        "Configure a viewport meta tag for mobile responsiveness",
        "Compress heavy homepage images to WebP format to save bandwidth"
    ],
    "client_friendly_explanation": "Simple, jargon-free analogy explaining why these technical fixes matter to business owners.",
    "seo_score": 75
}}

Requirements:
- priority must be one of: "High", "Medium", "Low".
- seo_score must be an integer between 10 and 100 based on severity.
"""

            client = Groq(api_key=api_key)
            chat_completion = None

            # Attempt 1: Try with system instruction & json_object format
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": prompt_system},
                        {"role": "user", "content": prompt_user}
                    ],
                    model=groq_model,
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
            except Exception as format_err:
                logger.warning(f"Groq json_object format failed ({format_err}), retrying with standard prompt format...")
                try:
                    # Attempt 2: Retry without response_format constraint (allows model to generate JSON directly)
                    chat_completion = client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": prompt_system},
                            {"role": "user", "content": prompt_user}
                        ],
                        model=groq_model,
                        temperature=0.2
                    )
                except Exception as retry_err:
                    logger.error(f"Groq recommendation API call failed: {retry_err}", exc_info=True)

            data = None
            if chat_completion and chat_completion.choices:
                try:
                    response_text = chat_completion.choices[0].message.content or ""
                    raw_text = response_text.strip()

                    # Strip <think>...</think> reasoning tags if emitted by OSS models
                    raw_text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL).strip()

                    # Strip markdown ```json ... ``` code blocks
                    if "```" in raw_text:
                        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw_text, re.DOTALL)
                        if match:
                            raw_text = match.group(1).strip()
                        else:
                            raw_text = re.sub(r'^```(?:json)?|```$', '', raw_text, flags=re.MULTILINE).strip()

                    # Locate the first valid JSON object boundaries
                    if not raw_text.startswith('{'):
                        start_idx = raw_text.find('{')
                        end_idx = raw_text.rfind('}')
                        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                            raw_text = raw_text[start_idx:end_idx + 1].strip()

                    data = json.loads(raw_text)

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
                except Exception as parse_err:
                    logger.error(f"JSON Parsing failed on Groq response: {parse_err}. Raw text was: {response_text[:300]}", exc_info=True)
                    data = None

            if not data:
                # Calculate dynamic fallback score based on real error and warning counts
                error_count = sum(1 for i in list_of_issues if "ERROR" in i)
                warning_count = sum(1 for i in list_of_issues if "WARNING" in i)
                calc_score = max(10, 100 - (error_count * 8) - (warning_count * 4))

                data = {
                    "summary": f"Audit identified {len(list_of_issues)} technical items requiring attention. Key areas of focus include metadata consistency, link structures, and mobile readability.",
                    "critical_issues": list_of_issues[:5],
                    "impact": "Addressing these technical SEO issues will improve crawler indexing and user experience.",
                    "recommended_fix": [
                        "1. Fix critical HTTP status codes and broken redirect chains.",
                        "2. Add unique meta title and description tags to all crawled pages.",
                        "3. Ensure image alt tags and mobile viewport tags are present across all pages."
                    ],
                    "priority": "High" if error_count > 3 else "Medium",
                    "quick_wins": [
                        "Add missing meta description tags",
                        "Ensure all images include descriptive alt attributes"
                    ],
                    "client_friendly_explanation": "Think of your website as a physical store: clear signage and fast doors help visitors and search engines find what they need.",
                    "seo_score": calc_score
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
        if not rec or rec.summary.startswith("Failed to generate"):
            return Response({"error": "Structured recommendation not generated yet"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AIRecommendationSerializer(rec)
        return Response(serializer.data)
