from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import os
from django.conf import settings
from django.db.models import Avg


def generate_pdf_report(audit, branding=None):
    from audits.models import CrawledPage, SEOIssues

    pdf_filename = f"report_{audit.id}_{audit.website}.pdf".replace('/', '_').replace(':', '')
    pdf_path = os.path.join(settings.MEDIA_ROOT, 'reports', 'pdfs', pdf_filename)
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)

    primary_hex = branding.primary_color if (branding and branding.primary_color) else '#0A4B43'
    try:
        primary_color = colors.HexColor(primary_hex)
    except Exception:
        primary_hex = '#0A4B43'
        primary_color = colors.HexColor('#0A4B43')

    company_name = branding.company_name.strip() if (branding and branding.company_name and branding.company_name.strip()) else 'Athenura AI SEO Auditor'

    def s(name, size, bold=False, color='#333333', align=0, indent=0, before=0, after=4):
        return ParagraphStyle(name, fontSize=size,
            fontName='Helvetica-Bold' if bold else 'Helvetica',
            textColor=colors.HexColor(color) if isinstance(color, str) else color, alignment=align,
            leftIndent=indent, spaceBefore=before, spaceAfter=after)

    title_s   = s('ti', 20, bold=True, color=primary_hex, align=1, after=4)
    sub_s     = s('su', 9, color='#666666', align=1, after=16)
    section_s = s('se', 12, bold=True, color=primary_hex, before=14, after=6)
    item_s    = s('it', 9, color='#444444', indent=12, after=3)
    label_s   = s('la', 9, bold=True, color=primary_hex, after=2)

    pages = CrawledPage.objects.filter(audit=audit)
    issues = SEOIssues.objects.filter(audit=audit)
    total_pages = pages.count()
    total_issues = issues.count()
    critical_issues = issues.filter(issue_type='ERROR').count()
    warnings = issues.filter(issue_type='WARNING').count()

    performance_score = int(pages.aggregate(avg=Avg('performance_score'))['avg'] or 0)
    mobile_score = int(pages.filter(is_mobile_friendly=True).count() / max(total_pages, 1) * 100)
    security_score = int(pages.filter(has_valid_SSL=True).count() / max(total_pages, 1) * 100)

    story = []

    # ── HEADER ──
    story.append(Paragraph(company_name, title_s))
    story.append(Spacer(1, 8))
    story.append(Paragraph("SEO AUDIT REPORT", s('st', 13, bold=True, color=primary_hex, align=1)))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        f"Website: {audit.website} | Generated: {audit.started_at.strftime('%d %B %Y')}",
        sub_s))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color))
    story.append(Spacer(1, 12))

    # ── EXECUTIVE SUMMARY ──
    story.append(Paragraph("EXECUTIVE SUMMARY", section_s))
    scores_data = [
    ['Overall SEO Score', f"{audit.overall_Score or 'N/A'}/100"],
    ['Performance Score', f"{performance_score or 'N/A'}/100"],
    ['Mobile Score', f"{mobile_score or 'N/A'}/100"],
    ['Security Score', f"{security_score or 'N/A'}/100"],
    ['Total Pages Crawled', str(total_pages)],
    ['Total Issues', str(total_issues)],
    ['Critical Issues', str(critical_issues)],
    ['Warnings', str(warnings)],
]
    t = Table(scores_data, colWidths=[300, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8f9fa')),
        ('TEXTCOLOR', (1,0), (1,-1), primary_color),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('PADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#dddddd')),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # ── TECHNICAL SEO ──
    story.append(Paragraph("TECHNICAL SEO", section_s))
    story.append(Paragraph(f"- Sitemap.xml: {'✅ Found' if audit.has_sitemap else '❌ Missing'}", item_s))
    story.append(Paragraph(f"- Robots.txt: {'✅ Found' if audit.has_robots else '❌ Missing'}", item_s))

    # ── PERFORMANCE ──
    story.append(Paragraph("PERFORMANCE (Core Web Vitals)", section_s))
    first_page = pages.first()
    if first_page:
        story.append(Paragraph(f"- LCP (Largest Contentful Paint): {first_page.largest_contentful_paint}s", item_s))
        story.append(Paragraph(f"- FID (First Input Delay): {first_page.first_input_delay}ms", item_s))
        story.append(Paragraph(f"- CLS (Cumulative Layout Shift): {first_page.cumulative_layout_shift}", item_s))
        story.append(Paragraph(f"- FCP (First Contentful Paint): {first_page.first_contentful_paint}s", item_s))
        story.append(Paragraph(f"- TTFB (Time to First Byte): {first_page.time_to_first_byte}s", item_s))

    # ── MOBILE SEO ──
    story.append(Paragraph("MOBILE SEO", section_s))
    if first_page:
        story.append(Paragraph(f"- Mobile Friendly: {'✅ Yes' if first_page.is_mobile_friendly else '❌ No'}", item_s))
        story.append(Paragraph(f"- Viewport Configured: {'✅ Yes' if first_page.has_mobile_viewport_configuration else '❌ No'}", item_s))
        story.append(Paragraph(f"- Font Readability: {'✅ Yes' if first_page.mobile_font_readability else '❌ No'}", item_s))
        story.append(Paragraph(f"- Tap Targets: {'✅ Yes' if first_page.mobile_tap_targets else '❌ No'}", item_s))

    # ── SECURITY ──
    story.append(Paragraph("SECURITY", section_s))
    if first_page:
        story.append(Paragraph(f"- SSL Certificate: {'✅ Valid' if first_page.has_valid_SSL else '❌ Invalid'}", item_s))
        story.append(Paragraph(f"- HTTPS (HSTS): {'✅ Yes' if first_page.has_strict_transport_security else '❌ No'}", item_s))
        story.append(Paragraph(f"- Content Security Policy: {'✅ Yes' if first_page.has_content_security_policy else '❌ No'}", item_s))
        story.append(Paragraph(f"- X-Frame-Options: {'✅ Yes' if first_page.has_x_frame_options else '❌ No'}", item_s))
        story.append(Paragraph(f"- Mixed Content: {'❌ Found' if first_page.has_mixed_content else '✅ None'}", item_s))

    # ── LINK ANALYSIS ──
    story.append(Paragraph("LINK ANALYSIS", section_s))
    total_broken = sum(p.broken_links_count for p in pages)
    total_external = sum(p.external_links_count for p in pages)
    story.append(Paragraph(f"- Broken Links: {total_broken}", item_s))
    story.append(Paragraph(f"- External Links: {total_external}", item_s))

    # ── AI RECOMMENDATIONS ──
    story.append(Paragraph("AI RECOMMENDATIONS", section_s))
    
    ai_rec_obj = None
    try:
        from ai_recommendations.models import AIRecommendation
        ai_rec_obj = AIRecommendation.objects.filter(audit=audit).first()
    except Exception:
        ai_rec_obj = None

    if ai_rec_obj:
        if ai_rec_obj.summary:
            story.append(Paragraph(f"<b>Summary:</b> {ai_rec_obj.summary}", item_s))
        if ai_rec_obj.client_friendly_explanation:
            story.append(Paragraph(f"<b>Overview:</b> {ai_rec_obj.client_friendly_explanation}", item_s))
        if ai_rec_obj.quick_wins and isinstance(ai_rec_obj.quick_wins, list):
            story.append(Paragraph("<b>Quick Wins:</b>", item_s))
            for win in ai_rec_obj.quick_wins[:5]:
                story.append(Paragraph(f"• {win}", item_s))
        elif ai_rec_obj.recommended_fix and isinstance(ai_rec_obj.recommended_fix, list):
            story.append(Paragraph("<b>Recommended Fixes:</b>", item_s))
            for fix in ai_rec_obj.recommended_fix[:5]:
                fix_text = fix.get('action') if isinstance(fix, dict) else str(fix)
                story.append(Paragraph(f"• {fix_text}", item_s))
    elif audit.ai_recommendation:
        story.append(Paragraph(str(audit.ai_recommendation)[:1000], item_s))
    else:
        story.append(Paragraph("AI recommendations were not generated during this audit. Generate AI recommendations from the Audit page to include personalized optimization suggestions.", item_s))

    # ── CRITICAL ISSUES ──
    story.append(Paragraph("CRITICAL ISSUES", section_s))
    error_issues = issues.filter(issue_type='ERROR')[:10]
    warning_issues = issues.filter(issue_type='WARNING')[:10]

    if error_issues:
      for issue in error_issues:
        story.append(Paragraph(f"❌ {issue.description}", item_s))
    elif warning_issues:
        for issue in warning_issues:
           story.append(Paragraph(f"⚠️ {issue.description}", item_s))
    else:
        story.append(Paragraph("✅ No critical issues found!", item_s))

    # ── PAGE BY PAGE ──
    story.append(Paragraph("PAGE-BY-PAGE BREAKDOWN", section_s))
    page_data = [['URL', 'Status', 'On-Page', 'Technical', 'Performance']]
    for p in pages[:20]:
        url = str(p.url)[:50] + '...' if len(str(p.url)) > 50 else str(p.url)
        page_data.append([
            url,
            str(p.status_code),
            str(p.on_page_score or 0),
            str(p.technical_score or 0),
            str(p.performance_score or 0),
        ])
    pt = Table(page_data, colWidths=[220, 50, 60, 60, 60])
    pt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#dddddd')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8f9fa')]),
    ]))
    story.append(pt)

    # ── FOOTER ──
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc')))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f"Generated by {company_name} | {audit.website}",
        s('ft', 8, color='#999999', align=1)
    ))

    doc.build(story)
    return pdf_path, pdf_filename