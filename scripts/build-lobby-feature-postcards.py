#!/usr/bin/env python3
"""Build two location-specific LOBBY PROMO postcards from audited original ZIP.

Images only advertise navigation; they do not replace actual town/workshop art.
Publisher page states public domain / AI assisted. Never infer room hotspot approval.
"""
import hashlib, io, json, sys, zipfile
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance

TARGET=Path("public/art/feature-postcards")
SOURCE_PAGE="https://winechan.itch.io/gothic-manor"
EXPECTED_ZIP="1eadb5f0a69e4b12da974cebd3d035dffbd18c157dbf1079a1430b521112c9b3"
POSTERS={
  "gothic-workshop.webp":{
    "source":"IMG_0272.png",
    "sha256":"240fb08050674b2242b115e1e36aae099cb86a7bd2e83fb69fef3fb4fdfc2d16",
    "caption":"炼金工坊入口 · 室内操作台氛围示意",
    "centering":(.50,.57),
  },
  "moonlit-street.webp":{
    "source":"IMG_0232.png",
    "sha256":"d85e79310b5589d2948e9af0b7a566e16d5a3d948ef89d38c14759af5fad5ad3",
    "caption":"月光街入口 · 夜色哥特建筑氛围示意",
    "centering":(.52,.51),
  }
}
if len(sys.argv)!=2:raise SystemExit("usage: build-lobby-feature-postcards.py PACK-DIR")
zips=list(Path(sys.argv[1]).rglob("*.zip"))
if not zips:raise SystemExit("Original publisher source ZIP unavailable")
source=max(zips,key=lambda f:f.stat().st_size)
sha=hashlib.sha256(source.read_bytes()).hexdigest()
if sha!=EXPECTED_ZIP:raise SystemExit("Publisher archive identity changed; manual license/art review required")
TARGET.mkdir(parents=True,exist_ok=True)
records=[]
with zipfile.ZipFile(source) as archive:
  filenames=archive.namelist()
  for output,entry in POSTERS.items():
    source_files=[n for n in filenames if Path(n).name==entry["source"]]
    if len(source_files)!=1:raise SystemExit("Unexpected archive item "+entry["source"])
    raw=archive.read(source_files[0])
    digest=hashlib.sha256(raw).hexdigest()
    if digest!=entry["sha256"]:raise SystemExit("Source image hash mismatch "+entry["source"])
    with Image.open(io.BytesIO(raw)) as im:
      if im.size!=(1920,1080):raise SystemExit("Original is not native 1920x1080")
      wide=ImageOps.fit(im.convert("RGB"),(960,320),
        method=Image.Resampling.LANCZOS,centering=entry["centering"])
      # Small touch of contrast for legibility under the UI shadow, no upscaling.
      wide=ImageEnhance.Contrast(wide).enhance(1.07)
      target=TARGET/output
      wide.save(target,"WEBP",quality=88,method=6)
    records.append({
      "file":output,"pixelSize":[960,320],
      "sourceFile":entry["source"],"sourceSHA256":digest,
      "sourceArchiveSHA256":sha,"publisherPage":SOURCE_PAGE,
      "licenseStatement":"public domain claimed by publisher; AI assisted",
      "intendedUse":"lobby navigation mood illustration only",
      "notApprovedAsPlayableScene":True,
      "altConcept":entry["caption"],
      "outputSHA256":hashlib.sha256(target.read_bytes()).hexdigest(),
    })
(TARGET/"source-manifest.json").write_text(
 json.dumps({"sourcePage":SOURCE_PAGE,"archiveVerified":True,
   "backgroundsStillConcept":True,"postcards":records},
   ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Produced",[(x["file"],x["pixelSize"],x["outputSHA256"]) for x in records])
