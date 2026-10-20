from app.analyzers.phone_analyzer import phone_analyzer

def test_phone_masking():
    masked = phone_analyzer.mask_identifier("+14155552671")
    assert masked.startswith("+14")
    assert masked.endswith("2671")
    assert "***" in masked

def test_phone_analyzer_valid_number():
    # US valid format
    evidence = phone_analyzer.analyze("+16502530000") # Google HQ known valid number
    syntax_check = next((e for e in evidence if e["check_id"] == "phone_syntax"), None)
    assert syntax_check is not None
    assert syntax_check["status"] == "INFO"
    assert syntax_check["risk_contribution"] == 0

def test_phone_analyzer_invalid_syntax():
    evidence = phone_analyzer.analyze("99999999999999999999")
    syntax_check = next((e for e in evidence if e["check_id"] == "phone_syntax"), None)
    assert syntax_check is not None
    assert syntax_check["status"] == "SUSPICIOUS"

def test_phone_analyzer_honest_limitation():
    evidence = phone_analyzer.analyze("+16502530000")
    wa_check = next((e for e in evidence if e["check_id"] == "whatsapp_live_presence"), None)
    assert wa_check is not None
    assert wa_check["status"] == "UNAVAILABLE"
    assert wa_check["risk_contribution"] == 0
