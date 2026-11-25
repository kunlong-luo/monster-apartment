"""R12.53: deterministic, source-verified transition artwork, never production CG approval."""
from pathlib import Path
from hashlib import sha1, sha256
import json
from PIL import Image, __version__ as pillow_version

ROOT = Path(__file__).resolve().parents[1]
CAT = json.loads((ROOT / "art-sources/source-catalog.json").read_text())
SOURCES = {e["path"]: e for e in CAT["assets"]}
def digest(data):
    return sha256(data).hexdigest()
def blob(data):
    return sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
def source(path):
    p = ROOT / path
    data = p.read_bytes()
    e = SOURCES[path]
    assert len(data) == e["bytes"] and blob(data) == e["gitBlobSha"], path
    with Image.open(p) as verify:
        assert verify.format == "PNG", path
        verify.verify()
    with Image.open(p) as opened:
        opened.load()
        return opened.copy(), data
inventory = []
for path, entry in sorted(SOURCES.items()):
    im, data = source(path)
    row = {"path":path,"sourceSha256":digest(data),"gitBlobSha":blob(data),
           "size":list(im.size),"mode":im.mode,"status":entry["status"]}
    if "A" in im.getbands():
        alpha=im.getchannel("A")
        row["alphaExtrema"]=list(alpha.getextrema())
        row["transparentPixels"]=alpha.histogram()[0]
        row["opaquePixels"]=alpha.histogram()[255]
    inventory.append(row)
assert len(inventory) == 33
outputs = []
def export(src, dest, expected, kind, crop=None, alpha=False):
    im, data = source(src)
    assert SOURCES[src]["status"] == "review", src
    assert im.size == expected, (src,im.size,expected)
    if alpha:
        assert "A" in im.getbands() and im.getchannel("A").getextrema() == (0,255), src
        im=im.convert("RGBA")
    else:
        im=im.convert("RGB")
    if crop:
        x,y,r,b=crop
        assert 0<=x<r<=im.width and 0<=y<b<=im.height
        im=im.crop(crop)
    p=ROOT/dest
    p.parent.mkdir(parents=True,exist_ok=True)
    old=blob(p.read_bytes()) if p.exists() else None
    im.save(p,"WEBP",quality=91,method=6)
    out=p.read_bytes()
    with Image.open(p) as decoded:
        decoded.load()
        assert decoded.format=="WEBP" and decoded.size==im.size
        if alpha:
            assert "A" in decoded.getbands() and decoded.getchannel("A").getextrema()==(0,255)
            assert decoded.getchannel("A").tobytes()==im.getchannel("A").tobytes()
    result={"source":src,"sourceSha256":digest(data),"sourceGitBlobSha":blob(data),
            "sourceSize":list(expected),"crop":list(crop) if crop else None,
            "output":dest,"size":list(im.size),"outputSha256":digest(out),
            "bytes":len(out),"alpha":alpha,"kind":kind,"priorGitBlobSha":old}
    outputs.append(result)
    print(dest,im.size,len(out),kind)
    return result
A="art-sources/"
P="public/art/"
C=P+"characters/"
front={i:A+"characters/"+i+"/identity/front.png" for i in ("yuesha","brook","fern","cinder")}
boxes={"yuesha":(250,0,850,600),"brook":(300,0,900,600),"fern":(315,0,915,600),"cinder":(220,0,820,600)}
for i, box in boxes.items():
    dest=P+"yuesha-avatar-v3.webp" if i=="yuesha" else C+i+"/face.webp"
    export(front[i],dest,(1086,1448),"identity-avatar",box)
export(front["yuesha"],P+"yuesha-portrait-v3.webp",(1086,1448),"identity-portrait")
export(front["yuesha"],P+"yuesha-bust-v3.webp",(1086,1448),"identity-bust",(78,0,1008,910))
for device,size in (("desktop",(1672,941)),("mobile",(941,1672))):
    export(A+"covers/welcome-"+device+".png",P+"covers/world-cover"+("-mobile" if device=="mobile" else "")+".webp",size,"welcome")
    export(A+"scenes/lobby/"+device+".png",P+"lobby-hero-v4"+("-mobile" if device=="mobile" else "")+".webp",size,"lobby")
manifest_path=ROOT/(C+"cg-manifest.json")
manifest=json.loads(manifest_path.read_text())
for card,entry in manifest["cards"].items():
    assert entry["status"]=="portrait"
    resident,variant=card.split("-")
    sprite=resident in ("brook","cinder")
    src=A+"characters/"+resident+("/sprites/standing.png" if sprite else "/cg/"+variant+".png")
    result=export(src,entry["previewPath"],(1086,1448),"sprite-transition-card" if sprite else "illustrated-cg-candidate",alpha=sprite)
    assert result["bytes"]>=100000
    entry["previewSha256"]=result["outputSha256"]
    entry["previewSourceKind"]=result["kind"]
manifest_path.write_text(json.dumps(manifest,indent=2)+"\n")
assert len(outputs)==15 and len({e["output"] for e in outputs})==15
(ROOT/(P+"r12-53-transition-manifest.json")).write_text(json.dumps({
    "schemaVersion":1,"sourceCommit":CAT["sourceCommit"],"pillow":pillow_version,
    "status":"transition-candidate-not-production-cg","humanVisualReview":False,
    "outputs":outputs,"sourceInventory":inventory
},ensure_ascii=False,indent=2)+"\n")
