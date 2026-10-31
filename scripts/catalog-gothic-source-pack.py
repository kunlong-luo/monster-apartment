#!/usr/bin/env python3
"""Catalog the downloaded publisher ZIP. Review candidates are never production."""
import hashlib,json,io,sys,zipfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps

Image.MAX_IMAGE_PIXELS=50_000_000
out=Path("docs/art-reviews/sources/winechan-gothic-manor-full-pack")
out.mkdir(parents=True,exist_ok=True)
downloads=list(Path(sys.argv[1]).rglob("*.zip"))
if not downloads:raise SystemExit("The publisher source ZIP was not downloaded")
source=max(downloads,key=lambda p:p.stat().st_size)
pack_hash=hashlib.sha256(source.read_bytes()).hexdigest()
records=[]
valid=[]
with zipfile.ZipFile(source) as archive:
  for member in archive.infolist():
    if member.is_dir() or not member.filename.lower().endswith((".png",".jpg",".jpeg",".webp")):continue
    if member.file_size>20_000_000:continue
    try:
      data=archive.read(member)
      with Image.open(io.BytesIO(data)) as im:
        if im.width>12000 or im.height>12000:continue
        width,height=im.size
        thumb=ImageOps.fit(im.convert("RGB"),(288,162),method=Image.Resampling.LANCZOS)
      pix=list(thumb.resize((80,45)).getdata())
      wine=sum(r>g*1.18 and r>b*1.10 and r>48 and r<220 for r,g,b in pix)/len(pix)
      darkness=sum((r+g+b)/3<115 for r,g,b in pix)/len(pix)
      is_hd=width>=1920 and height>=1080 and abs(width/height-16/9)<.015
      row={"fileInPublisherZip":member.filename,"width":width,"height":height,
        "bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),
        "native16by9FullHD":is_hd,"redCoverage":round(wine,3),
        "darkCoverage":round(darkness,3),"humanReviewed":False}
      records.append(row)
      if is_hd:valid.append((wine*.75+darkness*.25,row,thumb,data))
    except (OSError,ValueError,zipfile.BadZipFile):
      continue
valid.sort(reverse=True,key=lambda x:x[0])
candidates=valid[:8]
sheet=Image.new("RGB",(4*302,2*211),(18,14,23))
canvas=ImageDraw.Draw(sheet)
for i,(_,row,thumb,data) in enumerate(candidates):
  x=(i%4)*302+7;y=(i//4)*211+5
  sheet.paste(thumb,(x,y))
  canvas.text((x,y+169),f"{i+1:02d}. {row['width']}x{row['height']}  wine={row['redCoverage']}",fill=(228,194,157))
  filename=f"candidate-{i+1:02d}.webp"
  with Image.open(io.BytesIO(data)) as im:
    im.convert("RGB").save(out/filename,"WEBP",quality=82,method=4)
  row["candidateOutput"]=filename
sheet.save(out/"review-contact-sheet.webp","WEBP",quality=80,method=4)
# Every native image gets an index slot; red-ranking alone must never choose
# the scene. Human reviewers can compare all interiors/exteriors by filename.
with zipfile.ZipFile(source) as archive:
  for page_number,start in enumerate(range(0,len(records),16),1):
    page=Image.new("RGB",(4*266,4*178),(16,12,20))
    draw=ImageDraw.Draw(page)
    for k,row in enumerate(records[start:start+16]):
      try:
        data=archive.read(row["fileInPublisherZip"])
        with Image.open(io.BytesIO(data)) as art:
          tile=ImageOps.fit(art.convert("RGB"),(250,141),method=Image.Resampling.LANCZOS)
        x=(k%4)*266+8;y=(k//4)*178+6
        page.paste(tile,(x,y))
        draw.text((x,y+145),str(start+k+1)+". "+Path(row["fileInPublisherZip"]).name,fill=(233,211,187))
      except (OSError,ValueError,KeyError):
        pass
    page.save(out/f"full-index-{page_number:02d}.webp","WEBP",quality=78,method=4)
report={"state":"candidate-only-not-production",
  "publisher":"WineChan","licenseClaim":"public domain (publisher page)",
  "sourcePage":"https://winechan.itch.io/gothic-manor",
  "aiDisclosure":"AI assisted","downloadMethod":"publisher free-download",
  "sourceZipSha256":pack_hash,"zipBytes":source.stat().st_size,
  "examinedImages":len(records),"fullHD16by9":len(valid),
  "selectedUnreviewedCandidates":[r["candidateOutput"] for _,r,_,_ in candidates],
  "assets":records,
  "rightsIndependentlyReviewed":False,"hotspotsReviewed":False}
(out/"intake.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("Source ZIP",source.name,"images",len(records),"HD widescreen",len(valid),"candidates",len(candidates))
