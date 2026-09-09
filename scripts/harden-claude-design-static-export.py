from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANDING = ROOT / "landing"
FILES = [LANDING / "index.html", LANDING / "claude-design-preview.html"]

OLD_GRAIN = "background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%22.82%22 numOctaves=%223%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22256%22 height=%22256%22 filter=%22url(%23n)%22/></svg>');"
NEW_GRAIN = "background-image:url('./assets/film-grain.svg');"


def patch_html(path: Path) -> None:
    text = path.read_text()
    if OLD_GRAIN in text:
        text = text.replace(OLD_GRAIN, NEW_GRAIN)
    elif NEW_GRAIN not in text:
        raise SystemExit(f"Expected Claude grain background not found in {path}")
    path.write_text(text)


def main() -> None:
    token_flat = LANDING / "claude-design-ds" / "tokens.css"
    token_nested = LANDING / "claude-design-ds" / "tokens" / "tokens.css"
    state = LANDING / ".image-slots.state.json"
    grain = LANDING / "assets" / "film-grain.svg"

    for required in (token_flat, token_nested, state, grain):
        if not required.exists():
            raise SystemExit(f"Missing required static runtime asset: {required}")

    if token_flat.read_bytes() != token_nested.read_bytes():
        raise SystemExit("Nested Claude Design token copy differs from canonical token file")

    for path in FILES:
        patch_html(path)

    print("Claude Design static export hardened: nested tokens, image-slot state and local film grain are ready.")


if __name__ == "__main__":
    main()
