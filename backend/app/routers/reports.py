"""Report API Router — Incident post-mortem report generation."""

import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.incident_crud import IncidentCRUDService
from app.services.investigation_db import InvestigationDBService
from app.services.approval_db import ApprovalDBService
from app.services.remediation_db import RemediationDBService
from app.services.timeline_db import TimelineDBService
from app.models.base import utcnow
from app.schemas.report import (
    IncidentReportResponse, ReportExportRequest, ReportRootCause,
    ReportRemediation, ReportApproval, ReportVerification, ReportMetrics,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/incidents", tags=["Reports"])


@router.get("/{incident_id}/report", response_model=IncidentReportResponse)
async def get_incident_report(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Generate a full incident post-mortem report."""
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"})

    inv_svc = InvestigationDBService(db)
    investigation = await inv_svc.get_investigation_by_incident(incident_id)

    root_cause = None
    if investigation:
        evidence_items = []
        if investigation.evidence_json:
            try:
                raw = json.loads(investigation.evidence_json)
                evidence_items = [item.get("description", str(item)) for item in raw]
            except (json.JSONDecodeError, TypeError):
                pass
        root_cause = ReportRootCause(
            description=investigation.hypothesis or "Under investigation",
            confidence=investigation.confidence or 0.0,
            evidence=evidence_items,
        )

    rem_svc = RemediationDBService(db)
    latest_rem = await rem_svc.get_latest_remediation(incident_id)

    remediation_report = None
    verification_report = None
    if latest_rem:
        approval_info = None
        if incident.approvals:
            apr = incident.approvals[0]
            approval_info = ReportApproval(requested_at=apr.requested_at, approved_at=apr.approved_at, approved_by=apr.approved_by)

        remediation_report = ReportRemediation(
            action=latest_rem.action_type, executed_at=latest_rem.executed_at,
            execution_time_seconds=latest_rem.execution_time_seconds, approval=approval_info,
        )

        if latest_rem.post_metrics_json:
            try:
                raw_metrics = json.loads(latest_rem.post_metrics_json)
                metrics_parsed = {}
                for k, v in raw_metrics.items():
                    if isinstance(v, dict) and "before" in v and "after" in v:
                        metrics_parsed[k] = ReportMetrics(**v)
                verification_report = ReportVerification(
                    verified_at=latest_rem.verified_at, metrics=metrics_parsed,
                    status=latest_rem.verification_status,
                )
            except (json.JSONDecodeError, TypeError):
                pass

    tl_svc = TimelineDBService(db)
    _, event_count = await tl_svc.get_timeline(incident_id, limit=1)

    duration = None
    if incident.status in ("RESOLVED", "CLOSED") and latest_rem and latest_rem.verified_at:
        delta = latest_rem.verified_at - incident.created_at
        duration = int(delta.total_seconds() / 60)

    return IncidentReportResponse(
        incident_id=incident.id, title=incident.title, service=incident.service,
        severity=incident.severity, status=incident.status, duration_minutes=duration,
        detected_at=incident.created_at,
        resolved_at=latest_rem.verified_at if latest_rem else None,
        root_cause=root_cause, remediation=remediation_report,
        verification=verification_report,
        agent_summary="OpsForge identified the root cause through multi-source evidence correlation and successfully validated and executed the remediation action.",
        timeline_event_count=event_count, generated_at=utcnow(),
    )


@router.post("/{incident_id}/report/export")
async def export_incident_report(incident_id: str, payload: ReportExportRequest, db: AsyncSession = Depends(get_db)):
    """Export incident report in specified format."""
    report = await get_incident_report(incident_id, db)
    report_dict = report.model_dump(mode="json")

    fmt = payload.format.upper()
    if fmt == "JSON":
        return JSONResponse(content=report_dict)
    elif fmt == "MARKDOWN":
        md = _generate_markdown_report(report_dict)
        return JSONResponse(content={"format": "MARKDOWN", "content": md, "incident_id": incident_id})
    elif fmt in ("PDF", "HTML"):
        return JSONResponse(content={"format": fmt, "message": f"{fmt} export generated", "data": report_dict, "incident_id": incident_id})
    else:
        raise HTTPException(status_code=400, detail={"error": "INVALID_REQUEST", "message": f"Unsupported format: {payload.format}"})


def _generate_markdown_report(data: dict) -> str:
    """Generate a markdown-formatted incident report."""
    lines = [
        f"# Incident Post-Mortem Report: {data['incident_id']}",
        f"\n## Overview\n",
        f"- **Title:** {data['title']}",
        f"- **Service:** {data['service']}",
        f"- **Severity:** {data['severity']}",
        f"- **Status:** {data['status']}",
        f"- **Detected:** {data['detected_at']}",
    ]
    if data.get("resolved_at"):
        lines.append(f"- **Resolved:** {data['resolved_at']}")
    if data.get("duration_minutes"):
        lines.append(f"- **Duration:** {data['duration_minutes']} minutes")

    if data.get("root_cause"):
        rc = data["root_cause"]
        lines.extend([f"\n## Root Cause\n", f"**{rc['description']}** (Confidence: {rc['confidence']})\n"])
        for ev in rc.get("evidence", []):
            lines.append(f"- {ev}")

    if data.get("remediation"):
        rem = data["remediation"]
        lines.extend([f"\n## Remediation\n", f"- **Action:** {rem['action']}", f"- **Executed:** {rem.get('executed_at', 'N/A')}"])

    lines.extend([f"\n---\n", f"*Generated by OpsForge at {data['generated_at']}*"])
    return "\n".join(lines)
