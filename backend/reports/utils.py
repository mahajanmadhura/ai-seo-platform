from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, KeepTogether, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
import os
from django.conf import settings
from django.db.models import Avg


def generate_pdf_report(audit, branding=None):
    from audits.models import CrawledPage, SEOIssues

    pdf_filename = f"report_{audit.id}_{audit.website}.pdf".replace('/', '_').replace(':', '')
    pdf_path = os.path.join(settings.MEDIA_ROOT, 'reports', 'pdfs', pdf_filename)
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

    # Margins: 36pt (0.5 inch) for modern expanded look
    doc = SimpleDocTemplate(
        pdf_path, 
        pagesize=A4,
        rightMargin=28, 
        leftMargin=28, 
        topMargin=28, 
        bottomMargin=24
    )

    # Color Palette Definitions
    primary_color = colors.HexColor(branding.primary_color if branding else '#1E293B')  # Slate Blue / Dark Navy
    accent_color = colors.HexColor('#2563EB')   # Vibrant Royal Blue
    bg_light = colors.HexColor('#F8FAFC')       # Slate Light Grey
    card_border = colors.HexColor('#E2E8F0')    # Subtle Border
    text_dark = colors.HexColor('#0F172A')      # Dark Charcoal Text
    text_muted = colors.HexColor('#64748B')     # Muted Text
    
    company_name = branding.company_name if branding and branding.is_white_label else 'AI SEO Audit Platform'

    # Typography / Paragraph Styles Helper
    def create_style(name, size, bold=False, color='#0F172A', align=0, indent=0, before=0, after=4, leading=None):
        return ParagraphStyle(
            name,
            fontSize=size,
            leading=leading if leading else size + 4,
            fontName='Helvetica-Bold' if bold else 'Helvetica',
            textColor=colors.HexColor(color) if isinstance(color, str) else color,
            alignment=align,
            leftIndent=indent,
            spaceBefore=before,
            spaceAfter=after
        )

    title_s   = create_style('ti', 22, bold=True, color=primary_color, align=0, after=2)
    sub_s     = create_style('su', 9, color='#64748B', align=0, after=8)
    section_s = create_style('se', 11, bold=True, color='#0F172A', before=12, after=6)
    body_s    = create_style('bo', 9, color='#334155', leading=13, after=4)
    item_s    = create_style('it', 9, color='#334155', indent=4, after=3, leading=13)
    label_s   = create_style('la', 9, bold=True, color=primary_color, after=3)
    card_val  = create_style('cv', 18, bold=True, color=accent_color, align=1, after=2)
    card_lbl  = create_style('cl', 8, bold=True, color='#64748B', align=1, after=0)

    # Fetch Data
    pages = CrawledPage.objects.filter(audit=audit)
    issues = SEOIssues.objects.filter(audit=audit)
    total_pages = pages.count()
    total_issues = issues.count()
    critical_issues = issues.filter(issue_type='ERROR').count()
    warnings = issues.filter(issue_type='WARNING').count()

    overall_score = getattr(audit, 'overall_Score', getattr(audit, 'overall_score', 0)) or 0
    performance_score = int(pages.aggregate(avg=Avg('performance_score'))['avg'] or 0)
    mobile_score = int(pages.filter(is_mobile_friendly=True).count() / max(total_pages, 1) * 100)
    security_score = int(pages.filter(has_valid_SSL=True).count() / max(total_pages, 1) * 100)

    story = []

    # ── 1. BRAND HEADER ──
    header_table_data = [
        [
            Paragraph(f"<b>{company_name}</b>", title_s),
            Paragraph("<b>SEO AUDIT REPORT</b>", create_style('hdr_r', 12, bold=True, color=accent_color, align=2))
        ],
        [
            Paragraph(f"Website: <b>{audit.website}</b> | Date: {audit.started_at.strftime('%d %b %Y')}", sub_s),
            Paragraph(f"Audit ID: #{audit.id}", create_style('hdr_sub_r', 9, color='#64748B', align=2))
        ]
    ]
    header_table = Table(header_table_data, colWidths=[340, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceBefore=0, spaceAfter=12))

    # ── 2. EXECUTIVE SUMMARY (METRIC CARDS GRID) ──
    story.append(Paragraph("EXECUTIVE SUMMARY", section_s))
    
    # Grid Row 1: High Level KPIs
    cards_data_1 = [
        [
            [Paragraph(f"{overall_score}/100", card_val), Paragraph("OVERALL SEO SCORE", card_lbl)],
            [Paragraph(f"{total_pages}", card_val), Paragraph("PAGES CRAWLED", card_lbl)],
            [Paragraph(f"{total_issues}", card_val), Paragraph("TOTAL ISSUES", card_lbl)],
            [Paragraph(f"{critical_issues}", create_style('cv_red', 18, bold=True, color='#DC2626', align=1)), Paragraph("CRITICAL ERRORS", card_lbl)],
        ]
    ]
    
    t_cards_1 = Table(cards_data_1, colWidths=[127, 127, 127, 127])
    t_cards_1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (0,0), 1, card_border),
        ('BOX', (1,0), (1,0), 1, card_border),
        ('BOX', (2,0), (2,0), 1, card_border),
        ('BOX', (3,0), (3,0), 1, card_border),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_cards_1)
    story.append(Spacer(1, 8))

    # Grid Row 2: Secondary Category Scores
    cards_data_2 = [
        [
            [Paragraph(f"{performance_score}/100", create_style('cv_sub', 13, bold=True, color=primary_color, align=1)), Paragraph("Performance", card_lbl)],
            [Paragraph(f"{mobile_score}%", create_style('cv_sub', 13, bold=True, color=primary_color, align=1)), Paragraph("Mobile Friendly", card_lbl)],
            [Paragraph(f"{security_score}%", create_style('cv_sub', 13, bold=True, color=primary_color, align=1)), Paragraph("Security Score", card_lbl)],
            [Paragraph(f"{warnings}", create_style('cv_sub', 13, bold=True, color='#D97706', align=1)), Paragraph("Warnings", card_lbl)],
        ]
    ]
    t_cards_2 = Table(cards_data_2, colWidths=[127, 127, 127, 127])
    t_cards_2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFFFF')),
        ('BOX', (0,0), (0,0), 0.5, card_border),
        ('BOX', (1,0), (1,0), 0.5, card_border),
        ('BOX', (2,0), (2,0), 0.5, card_border),
        ('BOX', (3,0), (3,0), 0.5, card_border),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_cards_2)
    story.append(Spacer(1, 12))

    # Helper for Section Titles with Left Accent
    def add_section_header(title_text):
        hdr_data = [[
            Paragraph(f"<b>{title_text}</b>", create_style('sh', 10, bold=True, color='#FFFFFF'))
        ]]
        hdr_table = Table(hdr_data, colWidths=[520])
        hdr_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), primary_color),
            ('PADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        return hdr_table

    first_page = pages.first()

    # ── 3. TECHNICAL SEO & PERFORMANCE ──
    story.append(add_section_header("TECHNICAL SEO & CORE WEB VITALS"))
    story.append(Spacer(1, 4))
    
    sitemap_status = "Found" if getattr(audit, 'has_sitemap', False) else "Missing"
    robots_status = "Found" if getattr(audit, 'has_robots', False) else "Missing"
    
    tech_info = f"<b>Sitemap:</b> {sitemap_status} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Robots.txt:</b> {robots_status}"
    story.append(Paragraph(tech_info, item_s))

    if first_page:
        cwv_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["LCP (Largest Contentful Paint)", f"{getattr(first_page, 'largest_contentful_paint', 'N/A')}s", "FID (First Input Delay)", f"{getattr(first_page, 'first_input_delay', 'N/A')}ms"],
            ["CLS (Cumulative Layout Shift)", f"{getattr(first_page, 'cumulative_layout_shift', 'N/A')}", "FCP (First Contentful Paint)", f"{getattr(first_page, 'first_contentful_paint', 'N/A')}s"],
            ["TTFB (Time to First Byte)", f"{getattr(first_page, 'time_to_first_byte', 'N/A')}s", "Word Count (Avg)", f"{getattr(first_page, 'word_count', 'N/A')} words"]
        ]
        cwv_table = Table(cwv_data, colWidths=[170, 90, 170, 90], repeatRows=1)
        cwv_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), bg_light),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('TEXTCOLOR', (0,0), (-1,-1), text_dark),
            ('PADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, card_border),
        ]))
        story.append(cwv_table)
    story.append(Spacer(1, 10))

    # ── 4. MOBILE & SECURITY ──
    story.append(add_section_header("MOBILE FRIENDLINESS & SECURITY"))
    story.append(Spacer(1, 4))
    if first_page:
        sec_data = [
            ["Check Item", "Status", "Check Item", "Status"],
            ["Mobile Responsive", "Yes" if getattr(first_page, 'is_mobile_friendly', False) else "No", "SSL Certificate", "Valid" if getattr(first_page, 'has_valid_SSL', False) else "Invalid"],
            ["Viewport Tag", "Configured" if getattr(first_page, 'has_mobile_viewport_configuration', False) else "Missing", "HTTPS / HSTS", "Yes" if getattr(first_page, 'has_strict_transport_security', False) else "No"],
            ["Font Readability", "Good" if getattr(first_page, 'mobile_font_readability', False) else "Low", "Content Security Policy", "Enabled" if getattr(first_page, 'has_content_security_policy', False) else "Missing"]
        ]
        sec_table = Table(sec_data, colWidths=[170, 90, 170, 90], repeatRows=1)
        sec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), bg_light),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('TEXTCOLOR', (0,0), (-1,-1), text_dark),
            ('PADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, card_border),
        ]))
        story.append(sec_table)
    story.append(Spacer(1, 10))

    # ── 5. AI RECOMMENDATIONS ──
    story.append(add_section_header("AI RECOMMENDATIONS"))
    story.append(Spacer(1, 4))

    ai_rec_obj = None
    try:
        from ai_recommendations.models import AIRecommendation
        ai_rec_obj = AIRecommendation.objects.filter(audit=audit).first()
    except Exception:
        ai_rec_obj = None

    if ai_rec_obj and (ai_rec_obj.summary or ai_rec_obj.client_friendly_explanation or ai_rec_obj.quick_wins):
        if ai_rec_obj.summary:
            story.append(Paragraph(f"<b>Executive Summary:</b> {ai_rec_obj.summary}", body_s))
            story.append(Spacer(1, 3))
        if ai_rec_obj.client_friendly_explanation:
            story.append(Paragraph(f"<b>Overview:</b> {ai_rec_obj.client_friendly_explanation}", body_s))
            story.append(Spacer(1, 3))
        if ai_rec_obj.quick_wins and isinstance(ai_rec_obj.quick_wins, list):
            story.append(Paragraph("<b>Quick Win Action Items:</b>", label_s))
            for win in ai_rec_obj.quick_wins[:5]:
                story.append(Paragraph(f"- {win}", item_s))
        elif ai_rec_obj.recommended_fix and isinstance(ai_rec_obj.recommended_fix, list):
            story.append(Paragraph("<b>Recommended Fixes:</b>", label_s))
            for fix in ai_rec_obj.recommended_fix[:5]:
                fix_text = fix.get('action') if isinstance(fix, dict) else str(fix)
                story.append(Paragraph(f"- {fix_text}", item_s))
    elif getattr(audit, 'ai_recommendation', None) and str(audit.ai_recommendation).strip():
        story.append(Paragraph(str(audit.ai_recommendation).strip()[:1200], body_s))
    else:
        story.append(Paragraph("AI recommendation not generated for this audit.", body_s))

    story.append(Spacer(1, 10))

    # ── 6. CRITICAL ISSUES & WARNINGS ──
    story.append(add_section_header("CRITICAL ISSUES & WARNINGS"))
    story.append(Spacer(1, 4))
    error_issues = issues.filter(issue_type='ERROR')[:8]
    warning_issues = issues.filter(issue_type='WARNING')[:8]

    if error_issues:
        for issue in error_issues:
            desc = getattr(issue, 'description', getattr(issue, 'issue_description', ''))
            story.append(Paragraph(f"<font color='#DC2626'><b>[CRITICAL]</b></font> {desc}", item_s))
    if warning_issues:
        for issue in warning_issues:
            desc = getattr(issue, 'description', getattr(issue, 'issue_description', ''))
            story.append(Paragraph(f"<font color='#D97706'><b>[WARNING]</b></font> {desc}", item_s))
    if not error_issues and not warning_issues:
        story.append(Paragraph("[PASSED] No critical errors or warnings were identified for this site.", item_s))
    
    story.append(Spacer(1, 10))

    # ── 7. PAGE-BY-PAGE BREAKDOWN TABLE ──
    page_data = [['Page URL', 'Status', 'On-Page', 'Technical', 'Performance']]
    for p in pages[:25]:
        p_url = str(getattr(p, 'url', ''))
        short_url = p_url[:45] + '...' if len(p_url) > 45 else p_url
        page_data.append([
            short_url,
            str(getattr(p, 'status_code', '-')),
            f"{getattr(p, 'on_page_score', 0)}/100",
            f"{getattr(p, 'technical_score', 0)}/100",
            f"{getattr(p, 'performance_score', 0)}/100",
        ])

    pt = Table(page_data, colWidths=[240, 50, 76, 76, 78], repeatRows=1)
    pt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), bg_light),
        ('TEXTCOLOR', (0,0), (-1,0), primary_color),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, card_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#FFFFFF'), bg_light]),
    ]))

    story.append(add_section_header("PAGE-BY-PAGE BREAKDOWN"))
    story.append(Spacer(1, 4))
    story.append(pt)

    # ── 8. FOOTER ──
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.5, color=card_border, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph(
        f"Automated SEO Report Generated by <b>{company_name}</b> &nbsp;|&nbsp; Target: {audit.website}",
        create_style('ft', 8, color='#94A3B8', align=1)
    ))

    doc.build(story)
    return pdf_path, pdf_filename