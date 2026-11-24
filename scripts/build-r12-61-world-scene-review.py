"""Prepare four source-bound landscape candidates without altering production art."""
from pathlib import Path
from hashlib import sha1, sha256
import json
from PIL import Image, __version__ as pillow_version

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / "art-sources/source-catalog.json").read_text())
sources = {e["path"]: e for e in catalog["assets"]}
baseline = json.loads((ROOT / "public/art/r12-53-transition-manifest.json").read_text())
inventory = {e["path"]: e for e in baseline["sourceInventory"]}
def digest(data):
    return sha256(data).hexdigest()
def blob(data):
    return sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

outputs = []
for scene in ("workshop", "town"):
    for version in (1, 2):
        source = f"art-sources/scenes/{scene}/desktop-candidate-v{version}.png"
        entry, expected = sources[source], inventory[source]
        data = (ROOT / source).read_bytes()
        assert entry["status"] == "review" and expected["status"] == "review"
        assert len(data) == entry["bytes"] and blob(data) == entry["gitBlobSha"]
        assert digest(data) == expected["sourceSha256"]
        with Image.open(ROOT / source) as probe:
            assert probe.format == "PNG" and list(probe.size) == expected["size"]
            probe.verify()
        with Image.open(ROOT / source) as im:
            im.load()
            assert im.width > im.height
            rgb = im.convert("RGB")
        output = f"public/art/world-scenes/{scene}/review/desktop-candidate-v{version}.webp"
        dest = ROOT / output
        dest.parent.mkdir(parents=True, exist_ok=True)
        rgb.save(dest, "WEBP", quality=91, method=6)
        binary = dest.read_bytes()
        with Image.open(dest) as decoded:
            decoded.load()
            assert decoded.format == "WEBP" and decoded.size == rgb.size
            assert decoded.mode == "RGB"
        row = {"scene": scene, "variant": version, "source": source,
               "sourceGitBlobSha": blob(data), "sourceSha256": digest(data),
               "output": output, "outputSha256": digest(binary), "bytes": len(binary),
               "nativeSize": list(rgb.size), "outputSize": list(rgb.size),
               "status": "review-only", "device": "desktop"}
        outputs.append(row)
        print(json.dumps(row, ensure_ascii=False))
assert len(outputs) == 4 and len({row["outputSha256"] for row in outputs}) == 4
(ROOT / "public/art/world-scenes/r12-61-workshop-town-review.json").write_text(json.dumps({
    "schemaVersion": 1, "sourceCommit": catalog["sourceCommit"],
    "pillow": pillow_version, "productionApproved": False,
    "humanVisualReview": False, "mobileSourceAvailable": False, "outputs": outputs
}, ensure_ascii=False, indent=2) + "\n")
