#!/usr/bin/env python3
"""Static gates for huepfbeuteltier.xyz-website (no build step)."""
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

root = Path(__file__).resolve().parent.parent
errors, notes = [], []

# 1. required files
for f in ["index.html", "assets/styles.css", "assets/app.js", "vercel.json", "README.md"]:
    if not (root / f).is_file():
        errors.append(f"missing {f}")

# 2. JSON
try:
    json.loads((root / "vercel.json").read_text())
    notes.append("vercel.json valid")
except Exception as e:
    errors.append(f"vercel.json invalid: {e}")

# 3. JS syntax
r = subprocess.run(["node", "--check", str(root / "assets" / "app.js")], capture_output=True, text=True)
if r.returncode != 0:
    errors.append("app.js syntax: " + r.stderr.strip()[:300])
else:
    notes.append("app.js syntax ok")

html = (root / "index.html").read_text()
css = (root / "assets" / "styles.css").read_text()

# 4. ids unique + anchors resolve
ids = re.findall(r'\bid="([^"]+)"', html)
dupes = {i for i in ids if ids.count(i) > 1}
if dupes:
    errors.append("duplicate ids: " + ", ".join(sorted(dupes)))
anchors = {h for h in re.findall(r'href="#([^"]+)"', html) if h}
missing = anchors - set(ids)
if missing:
    errors.append("anchors without target: " + ", ".join(sorted(missing)))
notes.append(f"{len(anchors)} anchors resolve")

# 5. tag balance (non-void elements)
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr", "path", "circle", "ellipse", "rect", "use", "stop"}


class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            errors.append(f"stray </{tag}>")
        elif self.stack[-1] != tag:
            errors.append(f"mismatched </{tag}>, open <{self.stack[-1]}>")
        else:
            self.stack.pop()


c = Checker()
c.feed(html)
if c.stack:
    errors.append("unclosed tags: " + ", ".join(c.stack[-5:]))

# 6. CSS braces
opens, closes = css.count("{"), css.count("}")
if opens != closes:
    errors.append(f"css braces unbalanced: {opens} open / {closes} close")
else:
    notes.append(f"css braces balanced ({opens})")

# 7. required content markers
for marker in ["gegenrechts", "Antifaschismus", "Ausreden-Automat", "Känguru-Index"]:
    if marker not in html:
        errors.append("missing content marker: " + marker)

# 8. no local asset 404s
for ref in set(re.findall(r'(?:src|href)="(assets/[^"]+)"', html)):
    if not (root / ref).is_file():
        errors.append("missing asset: " + ref)

for n in notes:
    print("  ok  " + n)
if errors:
    print("\nFAILED:")
    for e in errors:
        print("  - " + e)
    sys.exit(1)
print("\nALL GATES PASSED")
