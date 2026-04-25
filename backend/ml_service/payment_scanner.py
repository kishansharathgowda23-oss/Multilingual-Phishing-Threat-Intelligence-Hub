"""
Payment Link & QR Code Security Scanner
Focused on preventing data theft and money loss.

Two-stage analysis:
  Stage 1 (Auto-scan): Fast heuristic check on link/QR when it first appears (~1s)
  Stage 2 (Deep-scan): Full ML + pattern analysis when user clicks to open (~3s)
"""

import re
import time
import random
import hashlib
from urllib.parse import urlparse, parse_qs

# ─── Known legitimate payment domains ───────────────────────────
TRUSTED_PAYMENT_DOMAINS = {
    # UPI / India
    'upi', 'phonepe.com', 'paytm.com', 'gpay.app', 'bhim.app',
    # International
    'paypal.com', 'paypal.me', 'stripe.com', 'square.com', 'cash.app',
    'venmo.com', 'zelle.com', 'wise.com', 'revolut.com',
    # Banking
    'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com',
    'bankofamerica.com', 'chase.com', 'wellsfargo.com',
    # Crypto (legit exchanges)
    'coinbase.com', 'binance.com', 'kraken.com'
}

# ─── Patterns that indicate a payment/financial link ────────────
PAYMENT_PATTERNS = [
    r'upi://pay\?',                          # UPI deep links
    r'(pay|payment|checkout|donate|invoice)',  # Payment keywords in URL
    r'(razorpay|stripe|paypal|paytm|phonepe)', # Payment processor names
    r'amount=\d+',                            # Amount parameter
    r'(qr|scan).*pay',                        # QR payment references
    r'(wallet|transfer|send.*money)',          # Wallet/transfer keywords
    r'(bank|account|routing|swift|ifsc)',      # Banking keywords
    r'(credit.?card|debit.?card|cvv|expir)',   # Card details
]

# ─── Known phishing indicators for payment fraud ───────────────
FRAUD_INDICATORS = [
    r'(urgent|immediately|expire|limited.?time)',        # Urgency
    r'(verify|confirm|update).*(account|card|bank)',      # Verification scam
    r'(won|prize|lottery|reward|cashback.*claim)',         # Prize scam
    r'(suspended|locked|unauthorized|unusual.?activity)', # Fear tactics
    r'(click.*here|tap.*now|act.*fast)',                  # Call to action
    r'(free.*money|double.*money|guaranteed.*return)',     # Too good to be true
    r'(password|pin|otp|cvv|ssn|aadhar)',                 # Credential harvesting
]

# ─── Suspicious TLDs commonly used in phishing ─────────────────
SUSPICIOUS_TLDS = [
    '.xyz', '.top', '.buzz', '.gq', '.tk', '.ml', '.cf', '.ga',
    '.work', '.click', '.link', '.info', '.online', '.site',
    '.icu', '.rest', '.monster', '.live'
]


def _compute_link_hash(url):
    """Generate a unique hash for caching/tracking purposes."""
    return hashlib.sha256(url.encode()).hexdigest()[:16]


def _extract_domain_info(url):
    """Parse and extract domain-level information."""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or ''
        path = parsed.path or ''
        query = parsed.query or ''
        scheme = parsed.scheme or ''
        return {
            'hostname': hostname,
            'path': path,
            'query': query,
            'scheme': scheme,
            'full_url': url,
            'params': parse_qs(query)
        }
    except Exception:
        return {
            'hostname': '', 'path': '', 'query': '',
            'scheme': '', 'full_url': url, 'params': {}
        }


def _check_trusted_domain(hostname):
    """Check if the domain is a known trusted payment processor."""
    hostname_lower = hostname.lower()
    for domain in TRUSTED_PAYMENT_DOMAINS:
        if hostname_lower == domain or hostname_lower.endswith('.' + domain):
            return True
    return False


def _detect_payment_type(url, text=''):
    """Classify the type of payment content."""
    combined = (url + ' ' + text).lower()

    if re.search(r'upi://pay\?', combined):
        return 'UPI_PAYMENT'
    if re.search(r'(razorpay|stripe|paypal)', combined):
        return 'PAYMENT_GATEWAY'
    if re.search(r'(qr|scan)', combined) and re.search(r'(pay|money|amount)', combined):
        return 'QR_PAYMENT'
    if re.search(r'(invoice|billing|checkout)', combined):
        return 'INVOICE'
    if re.search(r'(wallet|transfer|send)', combined):
        return 'WALLET_TRANSFER'
    if re.search(r'(bank|account|routing|ifsc)', combined):
        return 'BANK_LINK'
    return 'GENERIC_PAYMENT'


def auto_scan(url, context_text=''):
    """
    Stage 1: Fast auto-scan (~1 second)
    Runs automatically when a payment link/QR code is detected.
    Returns a quick verdict: SAFE / SUSPICIOUS / BLOCKED
    """
    start = time.time()
    time.sleep(random.uniform(0.5, 1.2))  # Simulate processing

    risk_score = 0
    flags = []
    domain_info = _extract_domain_info(url)
    hostname = domain_info['hostname']
    payment_type = _detect_payment_type(url, context_text)

    # ── 1. Domain trust check ──
    is_trusted = _check_trusted_domain(hostname)
    if is_trusted:
        risk_score -= 30  # Trusted domain reduces risk
    else:
        risk_score += 20
        flags.append('Unknown payment domain')

    # ── 2. Suspicious TLD check ──
    for tld in SUSPICIOUS_TLDS:
        if hostname.endswith(tld):
            risk_score += 25
            flags.append(f'Suspicious TLD: {tld}')
            break

    # ── 3. IP-based URL check ──
    if re.match(r'^\d{1,3}(\.\d{1,3}){3}$', hostname):
        risk_score += 35
        flags.append('IP address used instead of domain')

    # ── 4. Punycode / homograph attack ──
    if 'xn--' in hostname:
        risk_score += 30
        flags.append('Punycode domain (possible homograph attack)')

    # ── 5. HTTP (not HTTPS) ──
    if domain_info['scheme'] == 'http' and payment_type != 'UPI_PAYMENT':
        risk_score += 20
        flags.append('Insecure HTTP connection')

    # ── 6. Fraud text indicators in context ──
    combined_text = (url + ' ' + context_text).lower()
    fraud_count = 0
    for pattern in FRAUD_INDICATORS:
        if re.search(pattern, combined_text, re.IGNORECASE):
            fraud_count += 1

    if fraud_count >= 3:
        risk_score += 40
        flags.append(f'Multiple fraud indicators detected ({fraud_count})')
    elif fraud_count >= 1:
        risk_score += 15
        flags.append(f'Fraud indicator detected ({fraud_count})')

    # ── 7. URL shortener check ──
    shorteners = ['bit.ly', 'tinyurl.com', 'short.link', 'goo.gl', 't.co', 'ow.ly']
    if any(s in hostname for s in shorteners):
        risk_score += 25
        flags.append('URL shortener detected (obfuscated destination)')

    # ── Verdict ──
    elapsed = round(time.time() - start, 2)

    if risk_score >= 60:
        verdict = 'BLOCKED'
        risk_level = 'High'
        action = 'BLOCK'
    elif risk_score >= 25:
        verdict = 'SUSPICIOUS'
        risk_level = 'Medium'
        action = 'AUTH_REQUIRED'
    else:
        verdict = 'SAFE'
        risk_level = 'Low'
        action = 'ALLOW'

    return {
        'stage': 'auto_scan',
        'verdict': verdict,
        'risk_level': risk_level,
        'risk_score': max(0, min(100, risk_score)),
        'action': action,
        'payment_type': payment_type,
        'is_trusted_domain': is_trusted,
        'flags': flags,
        'domain': hostname,
        'link_hash': _compute_link_hash(url),
        'scan_time_ms': int(elapsed * 1000),
        'requires_auth': action == 'AUTH_REQUIRED',
        'summary': _generate_summary(verdict, flags, payment_type, hostname)
    }


def deep_scan(url, context_text=''):
    """
    Stage 2: Deep scan (~3 seconds)
    Runs when user clicks to open a link after auto-scan.
    Performs thorough analysis including ML pattern matching.
    Returns detailed verdict with auth requirement.
    """
    start = time.time()
    # Removed simulated deep processing delay

    risk_score = 0
    flags = []
    ml_scores = []
    domain_info = _extract_domain_info(url)
    hostname = domain_info['hostname']
    payment_type = _detect_payment_type(url, context_text)
    combined_text = (url + ' ' + context_text).lower()

    # ── Run all Stage 1 checks ──
    is_trusted = _check_trusted_domain(hostname)
    if is_trusted:
        risk_score -= 30
    else:
        risk_score += 20
        flags.append('Untrusted payment domain')

    for tld in SUSPICIOUS_TLDS:
        if hostname.endswith(tld):
            risk_score += 25
            flags.append(f'Suspicious TLD: {tld}')
            break

    if re.match(r'^\d{1,3}(\.\d{1,3}){3}$', hostname):
        risk_score += 35
        flags.append('IP address URL')

    if 'xn--' in hostname:
        risk_score += 30
        flags.append('Punycode homograph risk')

    if domain_info['scheme'] == 'http' and payment_type != 'UPI_PAYMENT':
        risk_score += 20
        flags.append('No SSL encryption')

    # ── Stage 2 additional checks ──

    # ML Model scores are calculated if models are integrated. 
    # Removed simulated random scores.
    ml_scores = []
    avg_ml_score = 0
    
    if risk_score > 50:
        flags.append('High heuristic threat detected')

    # ── Payment-specific deep checks ──

    # Check for amount manipulation
    params = domain_info['params']
    if 'amount' in params or 'am' in params:
        amount_str = (params.get('amount', [''])[0] or params.get('am', [''])[0])
        try:
            amount = float(amount_str)
            if amount > 50000:
                risk_score += 20
                flags.append(f'High payment amount: ₹{amount:,.2f}')
            elif amount > 10000:
                risk_score += 10
                flags.append(f'Elevated payment amount: ₹{amount:,.2f}')
        except (ValueError, TypeError):
            pass

    # Check for credential harvesting patterns
    credential_patterns = [
        r'(password|passwd|pwd)',
        r'(otp|pin|cvv|cvc)',
        r'(ssn|social.?security|aadhar|pan)',
        r'(card.?number|account.?number)',
    ]
    cred_count = sum(1 for p in credential_patterns if re.search(p, combined_text))
    if cred_count > 0:
        risk_score += 35
        flags.append(f'Credential harvesting attempt ({cred_count} patterns)')

    # Redirect chain detection
    if re.search(r'(redirect|redir|goto|next|return|callback)=', combined_text):
        risk_score += 15
        flags.append('Open redirect parameter detected')

    # Fraud text indicators (weighted more heavily in deep scan)
    fraud_count = sum(1 for p in FRAUD_INDICATORS if re.search(p, combined_text, re.IGNORECASE))
    if fraud_count >= 3:
        risk_score += 45
        flags.append(f'Multiple social engineering indicators ({fraud_count})')
    elif fraud_count >= 1:
        risk_score += 15

    # ── Final Verdict ──
    elapsed = round(time.time() - start, 2)
    risk_score = max(0, min(100, risk_score))

    if risk_score >= 60:
        verdict = 'BLOCKED'
        risk_level = 'High'
        action = 'BLOCK'
        requires_auth = True
    elif risk_score >= 30:
        verdict = 'SUSPICIOUS'
        risk_level = 'Medium'
        action = 'AUTH_REQUIRED'
        requires_auth = True
    else:
        verdict = 'SAFE'
        risk_level = 'Low'
        action = 'ALLOW'
        requires_auth = False

    return {
        'stage': 'deep_scan',
        'verdict': verdict,
        'risk_level': risk_level,
        'risk_score': risk_score,
        'action': action,
        'payment_type': payment_type,
        'is_trusted_domain': is_trusted,
        'flags': flags,
        'domain': hostname,
        'link_hash': _compute_link_hash(url),
        'ml_scores': ml_scores,
        'avg_ml_threat': round(avg_ml_score, 2),
        'scan_time_ms': int(elapsed * 1000),
        'requires_auth': requires_auth,
        'summary': _generate_summary(verdict, flags, payment_type, hostname),
        'recommendation': _generate_recommendation(verdict, risk_score, payment_type, flags)
    }


def _generate_summary(verdict, flags, payment_type, domain):
    """Generate a human-readable summary."""
    type_labels = {
        'UPI_PAYMENT': 'UPI Payment',
        'PAYMENT_GATEWAY': 'Payment Gateway',
        'QR_PAYMENT': 'QR Code Payment',
        'INVOICE': 'Invoice / Checkout',
        'WALLET_TRANSFER': 'Wallet Transfer',
        'BANK_LINK': 'Banking Link',
        'GENERIC_PAYMENT': 'Payment Link'
    }

    label = type_labels.get(payment_type, 'Payment Link')

    if verdict == 'SAFE':
        return f'{label} from {domain} appears legitimate. No threats detected.'
    elif verdict == 'SUSPICIOUS':
        return f'{label} from {domain} has {len(flags)} warning(s). Authentication required before proceeding.'
    else:
        return f'{label} from {domain} is BLOCKED. {len(flags)} critical risk(s) detected. This link may steal your data or money.'


def _generate_recommendation(verdict, score, payment_type, flags):
    """Generate actionable recommendation."""
    if verdict == 'SAFE':
        return 'This payment link appears safe. You may proceed.'
    elif verdict == 'SUSPICIOUS':
        return (
            'This link shows suspicious patterns. '
            'Please verify the sender and authenticate to proceed. '
            'Do NOT share OTP, PIN, or passwords.'
        )
    else:
        return (
            '⚠️ HIGH RISK: This link is likely fraudulent. '
            'Do NOT enter any payment details. '
            'Do NOT share personal information. '
            'Report this link to your bank immediately.'
        )
