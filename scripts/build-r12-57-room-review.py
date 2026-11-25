"""Convert exactly four native room paintings and four transparent standing candidates."""
from pathlib import Path
from hashlib import sha1, sha256
import json
from PIL import Image, __version__ as pillow_version
ROOT=Path(__file__).resolve().parents[1]
catalog=json.loads((ROOT/"art-sources/source-catalog.json").read_text())
entries={row["path"]:row for row in catalog["assets"]}
def digest(data): return sha256(data).hexdigest()
def blob(data): return sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
outputs=[]
for resident in ("yuesha","brook","fern","cinder"):
    for kind,src,size in (
        ("background",f"art-sources/rooms/{resident}/background.png",(1672,941)),
        ("standing",f"art-sources/characters/{resident}/sprites/standing.png",(1086,1448))):
        p=ROOT/src
        data=p.read_bytes()
        item=entries[src]
        assert item["status"]=="review" and len(data)==item["bytes"] and blob(data)==item["gitBlobSha"],src
        with Image.open(p) as probe:
            assert probe.format=="PNG" and probe.size==size,src
            probe.verify()
        with Image.open(p) as opened:
            opened.load()
            im=opened.copy()
        report=None
        if kind=="standing":
            assert "A" in im.getbands(),src
            im=im.convert("RGBA")
            mask=im.getchannel("A")
            histogram=mask.histogram()
            total=im.width*im.height
            assert mask.getextrema()==(0,255) and histogram[0]>total*.05,src
            corners=[mask.getpixel(xy) for xy in ((0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1))]
            near_opaque=sum(histogram[230:])/total
            report={"transparentFraction":histogram[0]/total,"nearOpaqueFraction":near_opaque,
                    "fullyOpaqueFraction":histogram[255]/total,"cornerAlpha":corners,
                    "alphaBounds":list(mask.getbbox()),"requiresAlphaRework":near_opaque<.08 or max(corners)>32}
        else:
            im=im.convert("RGB")
        path=f"public/art/rooms/{resident}/scenic/{kind}.webp"
        out=ROOT/path
        out.parent.mkdir(parents=True,exist_ok=True)
        im.save(out,"WEBP",quality=91,method=6)
        binary=out.read_bytes()
        with Image.open(out) as decoded:
            decoded.load()
            assert decoded.format=="WEBP" and decoded.size==size
            if kind=="standing":
                assert decoded.getchannel("A").tobytes()==im.getchannel("A").tobytes()
        outputs.append({"resident":resident,"kind":kind,"source":src,"sourceSha256":digest(data),
            "sourceGitBlobSha":blob(data),"output":path,"outputSha256":digest(binary),
            "bytes":len(binary),"size":list(size),"alphaReport":report,"status":"review-only"})
        print(path,size,len(binary),report)
assert len(outputs)==8 and len({o["outputSha256"] for o in outputs})==8
(ROOT/"public/art/rooms/r12-57-review-manifest.json").write_text(json.dumps({
    "schemaVersion":1,"sourceCommit":catalog["sourceCommit"],"humanVisualReview":False,
    "productionApproved":False,"pillow":pillow_version,"outputs":outputs
},ensure_ascii=False,indent=2)+"\n")
