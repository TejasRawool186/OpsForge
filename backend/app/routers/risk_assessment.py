"""Risk Assessment API Router — Risk classification for remediation actions."""

import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.incident_crud import IncidentCRUDService
from app.services.investigation_db import InvestigationDBService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/incidents", tags=["Risk Assessment"])


class RiskAssessmentRequest(BaseModel):
    action_type: str = Field(..., description="Type of action: ROLLBACK, SCALE_UP, DB_INDEX_ADD, SERVICE_RESTART")
    target_service: Optional[str] = None
    description: Optional[str] = None


class RiskAssessmentResponse(BaseModel):
    incident_id: str
    action_type: str
    risk_level: str  # SAFE, LOW, MEDIUM, HIGH, DESTRUCTIVE
    risk_score: float  # 0.0 to 1.0
    confidence: float
    requires_approval: bool
    assessment_details: List[str]
    recommended_safeguards: List[str]


# Risk matrix mapping
RISK_MATRIX = {
    "ROLLBACK": {"level": "HIGH", "score": 0.75, "requires_approval": True},
    "SCALE_UP": {"level": "LOW", "score": 0.2, "requires_approval": False},
    "DB_INDEX_ADD": {"level": "MEDIUM", "score": 0.5, "requires_approval": True},
    "SERVICE_RESTART": {"level": "MEDIUM", "score": 0.55, "requires_approval": True},
}


@router.post("/{incident_id}/risk-assessment", response_model=RiskAssessmentResponse)
async def assess_risk(incident_id: str, payload: RiskAssessmentRequest, db: AsyncSession = Depends(get_db)):
    """Perform risk assessment for a proposed remediation action."""
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"})

    action_upper = payload.action_type.upper()
    risk_info = RISK_MATRIX.get(action_upper, {"level": "HIGH", "score": 0.8, "requires_approval": True})

    # Adjust risk based on incident severity
    severity_multiplier = {"LOW": 0.5, "MEDIUM": 0.75, "HIGH": 1.0, "CRITICAL": 1.25}.get(incident.severity, 1.0)
    adjusted_score = min(risk_info["score"] * severity_multiplier, 1.0)

    # Determine final risk level
    if adjusted_score <= 0.2:
        final_level = "SAFE"
    elif adjusted_score <= 0.4:
        final_level = "LOW"
    elif adjusted_score <= 0.6:
        final_level = "MEDIUM"
    elif adjusted_score <= 0.8:
        final_level = "HIGH"
    else:
        final_level = "DESTRUCTIVE"

    # Get investigation confidence
    inv_svc = InvestigationDBService(db)
    investigation = await inv_svc.get_investigation_by_incident(incident_id)
    confidence = investigation.confidence if investigation else 0.5

    details = [
        f"Action type: {action_upper}",
        f"Incident severity: {incident.severity}",
        f"Base risk score: {risk_info['score']:.2f}",
        f"Severity-adjusted score: {adjusted_score:.2f}",
        f"Final risk level: {final_level}",
    ]

    safeguards = []
    if final_level in ("HIGH", "DESTRUCTIVE"):
        safeguards.extend(["Human approval required before execution", "Rollback plan must be verified", "Monitor metrics for 10 minutes post-action"])
    elif final_level == "MEDIUM":
        safeguards.extend(["Human approval recommended", "Automated rollback trigger if metrics degrade"])
    else:
        safeguards.append("Action can be auto-executed with monitoring")

    return RiskAssessmentResponse(
        incident_id=incident_id, action_type=action_upper, risk_level=final_level,
        risk_score=round(adjusted_score, 3), confidence=confidence or 0.5,
        requires_approval=final_level in ("MEDIUM", "HIGH", "DESTRUCTIVE"),
        assessment_details=details, recommended_safeguards=safeguards,
    )
