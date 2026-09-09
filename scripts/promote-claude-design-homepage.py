from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANDING = ROOT / "landing"
SOURCE = LANDING / "claude-design-preview.html"
TARGET = LANDING / "index.html"

CANONICAL_TITLE = "The Last Bench — From Last Bench. To The World."
CANONICAL_DESCRIPTION = (
    "A cinematic journey from Bangladesh to Malaysia. Last Bench helps Bangladeshi students "
    "explore study options, prepare their next step, and move forward with human guidance."
)


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise SystemExit(f"Missing expected {label}: {needle}")


def main() -> None:
    html = SOURCE.read_text()

    require(html, "Last Bench — Claude Design Preview", "preview title")
    require(html, "./claude-design-support.js", "Claude Design runtime")
    require(html, "./claude-design-ds/tokens.css", "design tokens")
    require(html, 'href="/app/"', "student dashboard route")
    require(html, 'name="signup"', "Netlify form detector")

    html = html.replace(
        "<title>Last Bench — Claude Design Preview</title>",
        f"<title>{CANONICAL_TITLE}</title>",
        1,
    )
    html = html.replace(
        '<meta name="description" content="Verified Claude Design export preview for Last Bench.">',
        f'<meta name="description" content="{CANONICAL_DESCRIPTION}">',
        1,
    )

    metadata = (
        '\n<meta property="og:title" content="The Last Bench — From Last Bench. To The World.">\n'
        '<meta property="og:description" content="A cinematic Bangladesh → Malaysia student journey with human guidance.">\n'
        '<meta property="og:image" content="./assets/logo-full.png">\n'
        '<meta property="og:type" content="website">\n'
        '<meta name="theme-color" content="#070b16">\n'
    )
    html = html.replace(
        f'<meta name="description" content="{CANONICAL_DESCRIPTION}">',
        f'<meta name="description" content="{CANONICAL_DESCRIPTION}">{metadata}',
        1,
    )

    # Prefer the repository-bundled Three.js runtime over a third-party CDN.
    html = html.replace(
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.min.js"></script>',
        '<script src="./vendor/three.min.js"></script>',
        1,
    )

    # Bench AI is intentionally separate from the Claude Design component so the
    # current advisor/fallback behavior survives future visual export updates.
    bench_ai = '<script src="./bench-ai.js" defer></script>'
    if bench_ai not in html:
        html = html.replace('</head>', f'{bench_ai}\n</head>', 1)

    # Production guardrails: the promoted page must not keep preview labeling.
    if "Claude Design Preview" in html:
        raise SystemExit("Preview label still present after promotion patch")

    # Ensure the signup handler remains the production-safe patched version.
    require(html, "Submission confirms WhatsApp/email contact consent", "contact-consent payload")
    require(html, "Could not submit right now. Please try again.", "signup failure state")

    TARGET.write_text(html)
    print(f"Promoted Claude Design homepage to {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
