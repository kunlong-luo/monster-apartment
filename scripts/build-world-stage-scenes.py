#!/usr/bin/env python3
"""Publish verified, original-size environment layers for existing GAME routes.

These are transitional world backdrops, NOT validated interactive room art.
Never infer workshop machine anchors or town services from architecture photos.
"""
import hashlib,io,json,sys,zipfile
from pathlib import Path
from PIL import Image,ImageEnhance
OUTPUT=Path("public/art/world-scenes")
ZIP_SHA="1eadb5f0a69e4b12da974cebd3d035dffbd18c157dbf1079a1430b521112c9b3"
SOURCES={
  "workshop-gothic-hall.webp":{
    "source":"IMG_0268.png",
    "sha":"33cb3f2658314e51f54de16b11bf74381ae522c39e8a8857d327117f26ac3d31",
    "brightness":.82,
    "use":"workshop Pixi stage ambient architecture behind real machines",
    "limitation":"gothic hall, not a dedicated blacksmith/forge illustration",
  },
  "town-moonlit-gate.webp":{
    "source":"IMG_0232.png",
    "sha":"d85e79310b5589d2948e9af0b7a566e16d5a3d948ef89d38c14759af5fad5ad3",
    "brightness":1.14,
    "use":"town exterior world layer behind playable trading panel",
    "limitation":"single night-time manor gate, not a complete navigable street map",
  }
}
if len(sys.argv)!=2:raise SystemExit("usage: build-world-stage-scenes.py SOURCE-ZIP-DIR")
archives=list(Path(sys.argv[1]).rglob("*.zip"))
if not archives:raise SystemExit("No officially downloaded publisher ZIP")
archive=max(archives,key=lambda p:p.stat().st_size)
actual_hash=hashlib.sha256(archive.read_bytes()).hexdigest()
if actual_hash!=ZIP_SHA:raise SystemExit("ZIP provenance changed; pause for rights review")
OUTPUT.mkdir(parents=True,exist_ok=True)
records=[]
with zipfile.ZipFile(archive) as z:
  for filename,source in SOURCES.items():
    candidates=[n for n in z.namelist() if Path(n).name==source["source"]]
    if len(candidates)!=1:raise SystemExit("Ambiguous source "+source["source"])
    original=z.read(candidates[0])
    digest=hashlib.sha256(original).hexdigest()
    if digest!=source["sha"]:raise SystemExit("Publisher source content mismatch")
    with Image.open(io.BytesIO(original)) as img:
      if img.size!=(1920,1080):raise SystemExit("Scene is not native 1920x1080")
      # Preserve all original drawing content, no invented cropping/upscaling.
      scene=ImageEnhance.Brightness(img.convert("RGB")).enhance(source["brightness"])
      scene.save(OUTPUT/filename,"WEBP",quality=88,method=6)
    records.append({
      "file":filename,"width":1920,"height":1080,"originalFile":source["source"],
      "sourceSHA256":digest,"sourceZipSHA256":ZIP_SHA,
      "outputSHA256":hashlib.sha256((OUTPUT/filename).read_bytes()).hexdigest(),
      "publisherPage":"https://winechan.itch.io/gothic-manor",
      "publisherLicenseClaim":"public domain","publisherAIClaim":"AI assisted",
      "intendedUse":source["use"],"limitation":source["limitation"],
      "roomArtApproval":False,
    })
(OUTPUT/"source-manifest.json").write_text(json.dumps({
  "status":"world-scene-transitional", "sourcePage":"https://winechan.itch.io/gothic-manor",
  "artifacts":records,
  "doesNotChangeRoomArtReviewStatus":True,
},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Verified full-HD world backdrops:")
for record in records:print(record["file"],record["outputSHA256"])
