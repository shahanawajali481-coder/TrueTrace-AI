"""
Curated list and matching utilities for disposable and temporary email domains.
"""

DISPOSABLE_DOMAINS = {
    "10minutemail.com",
    "10minutemail.net",
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "tempmail.com",
    "temp-mail.org",
    "yopmail.com",
    "yopmail.net",
    "trashmail.com",
    "trashmail.net",
    "throwawaymail.com",
    "sharklasers.com",
    "getairmail.com",
    "maildrop.cc",
    "dispostable.com",
    "fakeinbox.com",
    "tempail.com",
    "fakemailgenerator.com",
    "burnermail.io",
    "inboxkitten.com",
    "generator.email",
    "mytemp.email",
    "mohmal.com",
    "crazymailing.com",
    "emailondeck.com",
    "internxt.com",
    "protonmail.ch", # Note: not disposable, but proton.me/ch often examined
}

FREE_MAIL_PROVIDERS = {
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "aol.com",
    "zoho.com",
    "mail.com",
    "gmx.com",
    "proton.me",
    "protonmail.com",
}

def is_disposable_domain(domain: str) -> bool:
    """Checks if a normalized domain or sub-domain matches known disposable providers."""
    domain_clean = domain.strip().lower()
    if domain_clean in DISPOSABLE_DOMAINS:
        return True
    # Check parent domain (e.g. sub.mailinator.com)
    parts = domain_clean.split(".")
    if len(parts) > 2:
        parent = ".".join(parts[-2:])
        if parent in DISPOSABLE_DOMAINS:
            return True
    return False

def is_free_provider(domain: str) -> bool:
    """Checks if the domain is a standard public free email provider."""
    return domain.strip().lower() in FREE_MAIL_PROVIDERS
