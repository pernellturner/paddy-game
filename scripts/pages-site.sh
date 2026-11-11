#!/usr/bin/env bash
# Build _site with only the files the live game loads.
# The rest of the repo stays put; this only copies.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
SITE="$ROOT/_site"
cd "$ROOT"
rm -rf "$SITE"
mkdir -p "$SITE/assets" "$SITE/fonts" "$SITE/levels"

cp index.html level.html manifest.webmanifest build.txt "$SITE/"
cp fonts/*.woff2 "$SITE/fonts/"
: > "$SITE/.nojekyll"

# Scripts and other root files named by the two game pages.
python3 - << 'PY'
import re, shutil
from pathlib import Path
root = Path('.')
site = Path('_site')
names = set()
for page in ('index.html', 'level.html'):
    text = Path(page).read_text(errors='replace')
    for m in re.findall(r'''(?:src|href)=["']([^"'?#]+)''', text):
        if m.startswith(('http:', 'https:', 'data:', '#')):
            continue
        names.add(m.split('?')[0])
for name in sorted(names):
    src = root / name
    if not src.is_file():
        raise SystemExit(f'missing referenced file: {name}')
    dest = site / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    if src.resolve() != dest.resolve():
        shutil.copy2(src, dest)
print(f'pages and linked files: {len(names)}')
PY

# Sprite sheets named by frames.json and by the runtime scripts.
# The game asks for .webp first and only then .png.
python3 - << 'PY'
import json, re, shutil
from pathlib import Path
root = Path('assets')
site = Path('_site/assets')
paths = set()

def add(rel):
    rel = rel.split('?')[0]
    if rel.startswith('assets/'):
        rel = rel[len('assets/'):]
    for ext in ('.webp', '.png', '.jpg', '.json', '.mp3'):
        if rel.endswith(ext):
            rel = rel[:-len(ext)]
            break
    if rel:
        paths.add(rel)

data = json.loads((root / 'frames.json').read_text())
def walk(o):
    if isinstance(o, dict):
        f = o.get('f')
        if isinstance(f, str):
            add(f)
        for v in o.values():
            walk(v)
    elif isinstance(o, list):
        for v in o:
            walk(v)
walk(data)
shutil.copy2(root / 'frames.json', site / 'frames.json')

pat = re.compile(r'''["']((?:assets/)?(?:p|s\d)/[A-Za-z0-9_./-]+)["']''')
for js in list(Path('_site').glob('*.js')) + list(Path('.').glob('*.js')):
    # only scripts we publish
    if not (Path('_site') / js.name).is_file() and js.parent != Path('_site'):
        continue
    text = js.read_text(errors='replace')
    for m in pat.findall(text):
        add(m)

n = 0
missing = []
for rel in sorted(paths):
    webp = root / (rel + '.webp')
    png = root / (rel + '.png')
    src = webp if webp.is_file() else png if png.is_file() else None
    if src is None:
        missing.append(rel)
        continue
    dest = site / (rel + src.suffix)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        shutil.copy2(src, dest)
        n += 1
print(f'sprite sheets copied this pass: {n}')
if missing:
    print(f'sprite ids with no file ({len(missing)}), first: {missing[:8]}')
PY

copy_dir() {
  local src="$1" dest="$2"
  mkdir -p "$dest"
  cp -a "$src"/. "$dest"/
}

# Runtime folders. Raw level-art sources and notes stay in the repo only.
copy_dir assets/sfx "$SITE/assets/sfx"
copy_dir assets/music "$SITE/assets/music"
copy_dir assets/story "$SITE/assets/story"
copy_dir assets/bg26 "$SITE/assets/bg26"
copy_dir assets/w1bg "$SITE/assets/w1bg"
mkdir -p "$SITE/assets/sprites/boxing_v1/approved_play"
copy_dir assets/sprites/boxing_v1/approved_play "$SITE/assets/sprites/boxing_v1/approved_play"
mkdir -p "$SITE/assets/sprites/studio_v1"
copy_dir assets/sprites/studio_v1 "$SITE/assets/sprites/studio_v1"

for f in arena.webp ascended_lock.webp icon-180.png icon-192.png icon-512.png s1_05.png; do
  cp "assets/$f" "$SITE/assets/$f"
done

cp levels/*.json "$SITE/levels/"
mkdir -p "$SITE/levels/art"
# Skip raw/ (source paintings) and .py cutters. Keep the manifests and painted webp/png.
python3 - << 'PY'
import shutil
from pathlib import Path
src = Path('levels/art')
dest = Path('_site/levels/art')
n = 0
for p in src.rglob('*'):
    if not p.is_file():
        continue
    rel = p.relative_to(src)
    if 'raw' in rel.parts or p.suffix in {'.py', '.md'}:
        continue
    out = dest / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(p, out)
    n += 1
print(f'level art files: {n}')
PY

echo "---- _site ----"
du -sh "$SITE"
du -sh "$SITE"/* | sort -hr
