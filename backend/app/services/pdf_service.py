"""
PDF Report Generator for TrueTrace AI
Builds professional audit reports with ReportLab using clean typography,
risk score visual badges, and auditable evidence lists.
"""
import io
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models.scan import Scan

def generate_scan_pdf(scan: Scan) -> io.BytesIO:
    """Generates a downloadable PDF report for a given Scan record."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a"),
    )
    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )
    bold_label = ParagraphStyle(
        "BoldLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("TRUETRACE AI — RISK ASSESSMENT REPORT", title_style))
    story.append(Paragraph("Verify Signals. Detect Risks. Stay Safe.", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#3b82f6"), spaceAfter=15))

    # 2. Summary Box & Risk Score
    risk_color = "#22c55e" # Low
    if scan.risk_level == "MEDIUM":
        risk_color = "#f59e0b"
    elif scan.risk_level == "HIGH":
        risk_color = "#ef4444"
    elif scan.risk_level == "INCONCLUSIVE":
        risk_color = "#64748b"

    meta_data = [
        [
            Paragraph("<b>Scan Reference ID:</b>", body_style),
            Paragraph(f"<code>{scan.id}</code>", body_style),
            Paragraph("<b>Target Type:</b>", body_style),
            Paragraph(scan.scan_type, body_style),
        ],
        [
            Paragraph("<b>Created Timestamp:</b>", body_style),
            Paragraph(scan.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"), body_style),
            Paragraph("<b>Target Identifier:</b>", body_style),
            Paragraph(f"<b>{scan.masked_identifier}</b>", body_style),
        ],
        [
            Paragraph("<b>Overall Risk Level:</b>", body_style),
            Paragraph(f"<font color='{risk_color}'><b>{scan.risk_level}</b> (Score: {scan.risk_score}/100)</font>", bold_label),
            Paragraph("<b>Assessment Status:</b>", body_style),
            Paragraph("Completed & Grounded", body_style),
        ]
    ]

    t_meta = Table(meta_data, colWidths=[120, 160, 110, 140])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 15))

    # 3. Assessment Summary & Confidence
    story.append(Paragraph("Executive Summary", section_heading))
    story.append(Paragraph(scan.summary, body_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Confidence:</b> {scan.confidence_explanation}", body_style))
    story.append(Spacer(1, 15))

    # 4. Evidence Table
    story.append(Paragraph("Auditable Evidence & Check Details", section_heading))
    evidence_rows = [
        [
            Paragraph("<b>Verification Check</b>", bold_label),
            Paragraph("<b>Status</b>", bold_label),
            Paragraph("<b>Finding & Source</b>", bold_label),
            Paragraph("<b>Impact</b>", bold_label),
        ]
    ]

    for ev in scan.evidence:
        st_color = "#3b82f6"
        if ev.status == "SUSPICIOUS":
            st_color = "#d97706"
        elif ev.status == "CONFIRMED":
            st_color = "#dc2626"
        elif ev.status in ("UNAVAILABLE", "FAILED"):
            st_color = "#64748b"
        elif ev.status == "INFO":
            st_color = "#16a34a"

        row = [
            Paragraph(f"<b>{ev.name}</b><br/><font color='#64748b' size='7'>{ev.check_id}</font>", body_style),
            Paragraph(f"<font color='{st_color}'><b>{ev.status}</b></font>", body_style),
            Paragraph(f"{ev.finding}<br/><font color='#64748b' size='7'>Source: {ev.source}</font>", body_style),
            Paragraph(f"+{ev.risk_contribution} pts", body_style),
        ]
        evidence_rows.append(row)

    t_evidence = Table(evidence_rows, colWidths=[130, 80, 260, 60])
    t_evidence.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("PADDING", (0, 1), (-1, -1), 5),
    ]))
    story.append(t_evidence)
    story.append(Spacer(1, 15))

    # 5. Recommendations
    story.append(Paragraph("Recommended Security Actions", section_heading))
    try:
        recommendations = json.loads(scan.recommendations_json or "[]")
    except Exception:
        recommendations = []
    if recommendations:
        for rec in recommendations:
            story.append(Paragraph(f"• {rec}", body_style))
    else:
        story.append(Paragraph("• Maintain standard digital vigilance.", body_style))
    story.append(Spacer(1, 12))

    # 6. Limitations & Disclaimer
    story.append(Paragraph("Methodology Limitations & Privacy Notice", section_heading))
    try:
        limitations = json.loads(scan.limitations_json or "[]")
    except Exception:
        limitations = []
    for lim in limitations:
        story.append(Paragraph(f"• {lim}", subtitle_style))
    story.append(Spacer(1, 8))
    disclaimer_text = (
        "CONFIDENTIAL & PRIVILEGE NOTICE: This document is generated for the authenticated account owner "
        "by TrueTrace AI. TrueTrace AI does not access private accounts, scrape unauthorized databases, "
        "or guarantee the absence of all risks. Use this assessment as advisory intelligence only."
    )
    story.append(Paragraph(disclaimer_text, subtitle_style))

    doc.build(story)
    buffer.seek(0)
    return buffer
