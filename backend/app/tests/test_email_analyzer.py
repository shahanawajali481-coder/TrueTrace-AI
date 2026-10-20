from app.analyzers.email_analyzer import email_analyzer

def test_email_masking():
    assert email_analyzer.mask_identifier("john.doe@example.com") == "j***e@example.com"
    assert email_analyzer.mask_identifier("ab@domain.com") == "a***@domain.com"

def test_email_analyzer_invalid_syntax():
    evidence = email_analyzer.analyze("invalid-not-an-email")
    syntax_check = next((e for e in evidence if e["check_id"] == "email_syntax"), None)
    assert syntax_check is not None
    assert syntax_check["status"] == "SUSPICIOUS"
    assert syntax_check["risk_contribution"] > 0

def test_email_analyzer_disposable_domain():
    evidence = email_analyzer.analyze("scammer@10minutemail.com")
    disp_check = next((e for e in evidence if e["check_id"] == "email_disposable_domain"), None)
    assert disp_check is not None
    assert disp_check["status"] == "SUSPICIOUS"
    assert disp_check["details"]["is_disposable"] is True
    assert disp_check["risk_contribution"] >= 40

def test_email_analyzer_legit_domain():
    # Valid syntax, not disposable
    evidence = email_analyzer.analyze("user@gmail.com")
    disp_check = next((e for e in evidence if e["check_id"] == "email_disposable_domain"), None)
    assert disp_check is not None
    assert disp_check["details"]["is_disposable"] is False
    assert disp_check["risk_contribution"] == 0
