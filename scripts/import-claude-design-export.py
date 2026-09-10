from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

EXPORT_SHA256 = "658020389ad977a436e6308fe2fa7948f1d7e3a79547be18f290459ec6df9ff9"
DRIVE_FILE_ID = "1GlFQ6t0A9W3KbDq_7uEIsODZZXP77VbR"
SNAPSHOT_DATE = "2026-09-08"
DS_ID = "design-system-e48d1fb3-af2d-4eaf-8457-fcbdcd9d040c"


def require(path: Path) -> Path:
    if not path.exists():
        raise SystemExit(f"Missing required Claude Design export path: {path}")
    return path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Could not locate {label} in Claude Design export")
    return text.replace(old, new, 1)


def copy_exact_source(src: Path, repo: Path) -> None:
    dest = repo / "design-source" / "claude-design" / SNAPSHOT_DATE
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    for name in (
        "Malaysia Experience v2.dc.html",
        "Last Bench Dashboard.dc.html",
        "Last Bench Mobile App.dc.html",
        "support.js",
        "image-slot.js",
        "ios-frame.jsx",
        "github.md",
    ):
        shutil.copy2(require(src / name), dest / name)

    for name in (
        "_ds",
        "ds",
        "design_handoff_journey_and_dashboard",
        "design_handoff_last_bench",
        "assets",
    ):
        shutil.copytree(require(src / name), dest / name)

    provenance = (
        f"# Verified Claude Design export — {SNAPSHOT_DATE}\n\n"
        "Source: user-exported Claude Design Project HTML ZIP.\n\n"
        f"Google Drive file id: `{DRIVE_FILE_ID}`\n\n"
        f"SHA-256: `{EXPORT_SHA256}`\n\n"
        "This directory preserves the exported source exactly. Do not silently treat it as newer "
        "than current production logic. Production fixes, form handling, security, accessibility, "
        "and locked brand assets remain authoritative when they conflict.\n"
    )
    (dest / "PROVENANCE.md").write_text(provenance, encoding="utf-8")


def build_preview(src: Path, repo: Path) -> None:
    landing = repo / "landing"
    ds_out = landing / "claude-design-ds"
    ds_out.mkdir(parents=True, exist_ok=True)

    shutil.copy2(require(src / "support.js"), landing / "claude-design-support.js")
    shutil.copy2(require(src / "image-slot.js"), landing / "claude-design-image-slot.js")
    shutil.copy2(
        require(src / "_ds" / DS_ID / "tokens" / "tokens.css"),
        ds_out / "tokens.css",
    )
    shutil.copy2(require(src / "_ds" / DS_ID / "styles.css"), ds_out / "styles.css")

    out = require(src / "Malaysia Experience v2.dc.html").read_text(encoding="utf-8")
    out = out.replace(
        '<script src="./support.js"></script>',
        '<script src="./claude-design-support.js"></script>',
    )
    out = out.replace(
        f'href="_ds/{DS_ID}/tokens/tokens.css"',
        'href="./claude-design-ds/tokens.css"',
    )
    out = out.replace(
        f'href="_ds/{DS_ID}/styles.css"',
        'href="./claude-design-ds/styles.css"',
    )
    out = out.replace(
        '<script src="./image-slot.js"></script>',
        '<script src="./claude-design-image-slot.js"></script>',
    )
    out = out.replace('href="Last Bench Dashboard.dc.html"', 'href="/app/"')
    out = out.replace(
        '<title>Last Bench — From Last Bench. To The World.</title>',
        '<title>Last Bench — Claude Design Preview</title>\n'
        '<meta name="description" content="Verified Claude Design export preview for Last Bench.">',
    )

    name_input = '<input value="{{ seatName }}" onChange="{{ setSeatName }}" placeholder="{{ t.phName }}"'
    out = replace_once(
        out,
        name_input,
        '<input name="company" value="{{ seatCompany }}" onChange="{{ setSeatCompany }}" '
        'autocomplete="off" tabindex="-1" aria-hidden="true" '
        'style="position:absolute;left:-10000px;width:1px;height:1px;opacity:0;pointer-events:none;">\n'
        '            ' + name_input,
        "signup honeypot anchor",
    )

    contact_input = (
        '<input value="{{ seatContact }}" onChange="{{ setSeatContact }}" '
        'placeholder="{{ t.phEmail }}" style="min-height:48px;background:rgba(255,255,255,.06);'
        "border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:13px 15px;color:#fff;"
        "font-family:'Sora','Hind Siliguri',sans-serif;font-size:14px;outline:none;box-sizing:border-box;"
        '" style-focus="border-color:#00C853;">'
    )
    out = replace_once(
        out,
        contact_input,
        contact_input
        + '\n            <div style="font-size:10.5px;line-height:1.55;'
        'color:rgba(242,247,243,.5);">{{ t.signupConsent }}</div>',
        "signup consent anchor",
    )

    out = replace_once(
        out,
        "        signupTitle: 'TAKE YOUR SEAT', signupSub: 'From Bangladesh to Malaysia — the journey starts with a name.',",
        "        signupTitle: 'TAKE YOUR SEAT', signupSub: 'From Bangladesh to Malaysia — the journey starts with a name.',\n"
        "        signupConsent: 'By submitting, you agree that Last Bench may contact you by WhatsApp, phone, or email about your Malaysia study journey.',",
        "English signup consent translation",
    )
    out = replace_once(
        out,
        "        signupTitle: 'আপনার আসন নিন', signupSub: 'বাংলাদেশ থেকে মালয়েশিয়া — যাত্রা শুরু হয় একটি নাম দিয়ে।',",
        "        signupTitle: 'আপনার আসন নিন', signupSub: 'বাংলাদেশ থেকে মালয়েশিয়া — যাত্রা শুরু হয় একটি নাম দিয়ে।',\n"
        "        signupConsent: 'জমা দিলে আপনি সম্মতি দিচ্ছেন যে মালয়েশিয়ায় পড়াশোনার বিষয়ে লাস্ট বেঞ্চ WhatsApp, ফোন বা ইমেইলে আপনার সঙ্গে যোগাযোগ করতে পারে।',",
        "Bangla signup consent translation",
    )
    out = replace_once(
        out,
        "      seatName: this.state.seatName || '', seatContact: this.state.seatContact || '',\n"
        "      setSeatName: (e) => this.setState({ seatName: e.target.value, seatErr: '' }),\n"
        "      setSeatContact: (e) => this.setState({ seatContact: e.target.value, seatErr: '' }),",
        "      seatName: this.state.seatName || '', seatContact: this.state.seatContact || '',\n"
        "      seatCompany: this.state.seatCompany || '',\n"
        "      setSeatName: (e) => this.setState({ seatName: e.target.value, seatErr: '' }),\n"
        "      setSeatContact: (e) => this.setState({ seatContact: e.target.value, seatErr: '' }),\n"
        "      setSeatCompany: (e) => this.setState({ seatCompany: e.target.value }),",
        "signup state bindings",
    )

    replacement = r'''
      signUp: () => {
        if (this.state.seatSubmitting || (this.state.seatCompany || '').trim()) return;
        const nm = (this.state.seatName || '').trim();
        const ct = (this.state.seatContact || '').trim();
        const T = this.state.lang === 'bn';
        if (nm.length < 2) return this.setState({ seatErr: T ? 'আপনার পূর্ণ নাম লিখুন।' : 'Please enter your full name.' });
        const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ct);
        const okPhone = /^[+]?[\d\s-]{9,}$/.test(ct);
        if (!okEmail && !okPhone) return this.setState({ seatErr: T ? 'একটি সঠিক ইমেইল বা ফোন নম্বর দিন।' : 'Enter a valid email or phone number.' });
        this.setState({ seatSubmitting: true, seatErr: '' });
        const payload = {
          full_name: nm,
          phone: okPhone ? ct : null,
          email: okEmail ? ct : null,
          stage: 'claude-design-experience',
          source: 'lastbench-homepage',
          language: T ? 'bn' : 'en',
          contact_consent: true
        };
        fetch('https://tocxdyqlrvzthpexnmxe.supabase.co/rest/v1/lastbench_signups', {
          method: 'POST',
          headers: {
            apikey: 'sb_publishable_uLq6k_t3B-dnNJW9d1Kh-Q_3kyoSUa_',
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify(payload)
        })
          .then((res) => {
            if (!res.ok) throw new Error('Signup failed');
            try {
              localStorage.setItem('lb_student_name', nm);
              localStorage.setItem('lb_lang', this.state.lang);
            } catch (_) {}
            this.setState({ joined: true, seatSubmitting: false, seatErr: '' });
          })
          .catch(() => this.setState({
            seatSubmitting: false,
            seatErr: T ? 'এখন জমা দেওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।' : 'Could not submit right now. Please try again.'
          }));
      },
      joined:'''
    pattern = re.compile(
        r"\n\s+signUp:\s*\(\)\s*=>\s*\{.*?\n\s+\},\n\s+joined:",
        re.S,
    )
    out, count = pattern.subn(lambda _: replacement, out, count=1)
    if count != 1:
        raise SystemExit("Could not patch Claude Design signup handler")

    (landing / "claude-design-preview.html").write_text(out, encoding="utf-8")


def write_status(repo: Path) -> None:
    status = (
        "# Claude Design sync status\n\n"
        "The verified 2026-09-08 Claude Design export is stored under "
        "`design-source/claude-design/2026-09-08/`.\n\n"
        "A production-safe review route is generated at `landing/claude-design-preview.html`.\n\n"
        "The live root `landing/index.html` is intentionally not overwritten by the import. "
        "The user-exported Claude project contains older/non-production behavior in places, while "
        "the current root contains newer production hardening such as Supabase lead capture, "
        "contact consent, accessibility improvements, and advisor integrations.\n\n"
        "Promotion rule: visually review the preview against the approved Claude Design project, "
        "then port or promote approved sections without deleting newer production protections.\n"
    )
    (repo / "CLAUDE_DESIGN_SYNC_STATUS.md").write_text(status, encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(
            "Usage: import-claude-design-export.py <extracted-export-dir> <repo-root>"
        )
    src = Path(sys.argv[1]).resolve()
    repo = Path(sys.argv[2]).resolve()
    require(src / "Malaysia Experience v2.dc.html")
    copy_exact_source(src, repo)
    build_preview(src, repo)
    write_status(repo)
    print("Claude Design export imported and preview generated.")


if __name__ == "__main__":
    main()
