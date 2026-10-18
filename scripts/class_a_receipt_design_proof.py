#!/usr/bin/env python3
"""CLASS[Λ] synthetic Parliament receipt layout proof. NOT a receipt renderer.

Requires the privately approved, already-sanitized preview screenshot supplied
via --sanitized-reference. Never accepts an original personalized receipt image.
The reference checksum is exact so the wrong student's PII cannot be substituted.
The output is fictional, flattened and invalid for financial issuance.
Requires Pillow (pip install Pillow) and a local DejaVu Sans font.
"""
from __future__ import annotations
import argparse, hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

APPROVED_SANITIZED_SHA256 = "a016f74abf76b2a1d54aeee113ef9c279a8bd21fc231f6b870dbcf326161a60d"
BG = (250, 252, 250)
PANEL = (240, 247, 242)
INK = (24, 38, 31)
MUTED = (83, 103, 92)
GREEN = (0, 205, 86)
DARK = (0, 48, 32)
WHITE = (255, 255, 255)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def f(size: int, bold: bool = False):
    return ImageFont.truetype(BOLD if bold else FONT, size)

FIXTURES = {
    "alpha": ("Sample Learner Alpha", "sample.a@example.invalid.test", "DEMO-ALPHA-01"),
    "beta": ("Sample Learner Beta", "sample.b@example.invalid.test", "DEMO-BETA-02"),
}

def valid_test_values(name: str, email: str, regid: str):
    if (name, email, regid) not in FIXTURES.values():
        raise ValueError("Only the two fixed fictional preview records are permitted")

def text(draw, xy, s, sz=18, col=INK, bold=False, maxw=None):
    ft=f(sz,bold)
    if maxw:
        while sz >= 11 and draw.textbbox((0,0),s,font=ft)[2] > maxw:
            sz -= 1
            ft = f(sz,bold)
        if draw.textbbox((0,0),s,font=ft)[2] > maxw:
            raise ValueError(f"field too wide for visual card: {s[:22]}")
    draw.text(xy,s,font=ft,fill=col)

def output_paths(out: Path):
    if out.suffix.lower() != ".png":
        raise ValueError("Output path must end in .png; paired PDF is written separately")
    return out, out.with_suffix(".pdf")

def proof(reference: Path, out: Path, learner: str, email: str, regid: str):
    valid_test_values(learner,email,regid)
    png, pdf=output_paths(out)
    data=reference.read_bytes()
    if hashlib.sha256(data).hexdigest()!=APPROVED_SANITIZED_SHA256:
        raise ValueError("Refusing image: approved sanitized reference SHA256 mismatch")
    im=Image.open(reference).convert("RGB")
    if im.size!=(1024,1536):
        raise ValueError("Reference dimensions mismatch")
    dr=ImageDraw.Draw(im)
    # Keep the approved cinematic header and bottom footer EXACTLY intact.
    # Rebuild the central section using strictly fictional fields.
    dr.rectangle((0,466,1024,1268),fill=BG)
    dr.rounded_rectangle((24,478,1000,813),radius=25,fill=WHITE)
    text(dr,(65,493),"Receipt No.",19,MUTED)
    text(dr,(557,493),"Issue Date",19,MUTED)
    text(dr,(65,527),"DEMO - NOT ISSUED",24,INK,True,430)
    text(dr,(557,528),"Not applicable",22,INK,True,395)
    dr.line((65,572,958,572),fill=(196,224,207),width=2)
    dr.rounded_rectangle((47,588,505,796),radius=18,fill=PANEL)
    dr.rounded_rectangle((520,588,979,796),radius=18,fill=PANEL)
    text(dr,(68,610),"STUDENT INFORMATION",18,INK,True)
    text(dr,(540,610),"COURSE DETAILS",18,INK,True)
    left=[("Name",learner),("Email",email),("Registration ID",regid)]
    right=[("Program","CLASS[Λ] AI Course"),("Mode","Synthetic example"),("Batch","Not applicable")]
    for i,(label,value) in enumerate(left):
        y=655+44*i
        text(dr,(68,y),label,17,MUTED)
        text(dr,(225,y),value,16,INK,True,261)
    for i,(label,value) in enumerate(right):
        y=655+44*i
        text(dr,(540,y),label,17,MUTED)
        text(dr,(669,y),value,16,INK,True,292)
    dr.rounded_rectangle((30,819,995,1097),radius=25,fill=DARK)
    text(dr,(69,847),"PAYMENT DETAILS / DESIGN PREVIEW ONLY",19,(184,232,203),True)
    text(dr,(69,911),"Amount Received",22,WHITE)
    text(dr,(69,950),"NOT APPLICABLE",37,GREEN,True,461)
    text(dr,(69,1030),"No money recorded or verified",18,WHITE)
    pay=[("Transaction ID","Not provided"),("Transaction date","Not provided"),("Payment status","UNVERIFIED")]
    for i,(label,value) in enumerate(pay):
        y=906+53*i
        text(dr,(554,y),label,17,(185,217,197))
        text(dr,(765,y),value,17,WHITE,True,211)
    dr.ellipse((59,1129,126,1196),fill=(0,139,83))
    text(dr,(83,1140),"!",38,WHITE,True)
    text(dr,(152,1125),"VISUAL APPROVAL PREVIEW",27,INK,True)
    text(dr,(152,1170),"Synthetic layout validation only - no financial document.",17,MUTED)
    text(dr,(152,1200),"The official receipt issuing gate remains disabled.",18,(0,99,56),True)
    # The exact SHA-pinned header carries the baked-in red SAMPLE NOT VALID flag.
    out.parent.mkdir(parents=True,exist_ok=True)
    im.save(png,format="PNG",optimize=True)
    im.save(pdf,format="PDF",resolution=120.0)
    return pdf

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--sanitized-reference",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    p.add_argument("--fixture",choices=tuple(FIXTURES),default="alpha")
    a=p.parse_args()
    name,email,regid=FIXTURES[a.fixture]
    print(proof(a.sanitized_reference,a.out,name,email,regid))
