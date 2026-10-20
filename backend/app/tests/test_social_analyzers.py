from app.analyzers.instagram_analyzer import instagram_analyzer
from app.analyzers.facebook_analyzer import facebook_analyzer

def test_instagram_username_extraction():
    assert instagram_analyzer.normalize_username("https://www.instagram.com/security_support/?hl=en") == "security_support"
    assert instagram_analyzer.normalize_username("@official_brand") == "official_brand"

def test_instagram_spoofing_keywords():
    evidence = instagram_analyzer.analyze("@meta_support_agent")
    keyword_ev = next((e for e in evidence if e["check_id"] == "instagram_impersonation_keywords"), None)
    assert keyword_ev is not None
    assert keyword_ev["status"] == "SUSPICIOUS"

def test_facebook_domain_validation():
    # Phishing domain
    fake_ev = facebook_analyzer.analyze("https://facebook-login-verify-account.com/login")
    domain_check = next((e for e in fake_ev if e["check_id"] == "facebook_url_domain"), None)
    assert domain_check is not None
    assert domain_check["status"] == "SUSPICIOUS"

    # Real facebook domain
    real_ev = facebook_analyzer.analyze("https://facebook.com/zuck")
    domain_check_real = next((e for e in real_ev if e["check_id"] == "facebook_url_domain"), None)
    assert domain_check_real is not None
    assert domain_check_real["status"] == "INFO"
