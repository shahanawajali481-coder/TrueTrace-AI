from app.intelligence.risk_engine import risk_engine

def test_risk_engine_deduplication():
    # If same check passed twice, only count once
    raw_evidence = [
        {
            "check_id": "duplicate_indicator",
            "name": "Check 1",
            "status": "SUSPICIOUS",
            "finding": "Suspicious pattern detected",
            "source": "Source A",
            "reliability": 1.0,
            "risk_contribution": 20,
        },
        {
            "check_id": "duplicate_indicator",
            "name": "Check 1 Repeated",
            "status": "SUSPICIOUS",
            "finding": "Duplicate report",
            "source": "Source B",
            "reliability": 1.0,
            "risk_contribution": 20,
        }
    ]
    result = risk_engine.evaluate("EMAIL", raw_evidence)
    assert len(result.deduplicated_evidence) == 1
    assert result.score == 20

def test_risk_engine_unavailable_checks_not_penalized():
    # Unavailable checks must not raise the risk score
    raw_evidence = [
        {
            "check_id": "core_validity",
            "name": "Core Check",
            "status": "INFO",
            "finding": "Passed",
            "source": "Authoritative DB",
            "reliability": 1.0,
            "risk_contribution": 0,
        },
        {
            "check_id": "optional_intel",
            "name": "Auxiliary Check",
            "status": "UNAVAILABLE",
            "finding": "Service unconfigured",
            "source": "Commercial API",
            "reliability": 0.0,
            "risk_contribution": 0,
            "limitations": "API key was not supplied."
        }
    ]
    result = risk_engine.evaluate("EMAIL", raw_evidence)
    assert result.score == 0
    assert result.level == "LOW"
    assert "API key was not supplied." in result.limitations

def test_risk_engine_all_unavailable_is_inconclusive():
    raw_evidence = [
        {
            "check_id": "remote_service",
            "name": "Remote Check",
            "status": "UNAVAILABLE",
            "finding": "Service offline",
            "source": "Cloud API",
            "reliability": 0.0,
            "risk_contribution": 0,
        }
    ]
    result = risk_engine.evaluate("INSTAGRAM", raw_evidence)
    assert result.level == "INCONCLUSIVE"
