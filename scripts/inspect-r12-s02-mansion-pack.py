#!/usr/bin/env python3
"""Review a genuine native 4K free mansion source archive; NEVER publish raw assets."""
import argparse
import hashlib
import io
import json
import re
import zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps, UnidentifiedImageError

Image.MAX_IMAGE_PIXELS = 70_000_000
SOURCE = "https://potat0master.itch.io/free-visual-novel-backgrounds-mansion-pack"
LICENSE = {
    "source": SOURCE,
    "author": "Potat0Master",
    "licenseClaim": "Royalty-free personal and commercial game use, modifications allowed",
    "attribution": "Not required, appreciated",
    "redistribution": "Raw or modified image files must not be redistributed as stand-alone files",
    "limitations": [
        "Verify original site and license prior to any production use",
        "Do not upload archive or extracted full-resolution images to GitHub",
        "4K desktop sources do not establish native, independent mobile artwork",
        "An asset pack does not automatically satisfy six playable room entrances",
        "3D mansion art may not harmonize with the project's anime fantasy heroine",
    ],
}
KEYWORDS = ("hallway", "corridor", "entrance", "stairs", "bedroom",
            "basement", "living", "mansion", "kitchen")
EXTENSIONS = {".png", ".webp", ".jpg", ".jpeg"}


def inspect(archive: Path, out: Path):
    out.mkdir(parents=True, exist_ok=True)
    if archive.stat().st_size > 150 * 1024 * 1024:
        raise ValueError("Refusing large/mismatched publisher archive")
    if "2160p" not in archive.name.lower() or "webp" not in archive.name.lower():
        raise ValueError("Expected publisher 2160p WEBP zip, got " + archive.name)
    images = []
    previews = []
    with zipfile.ZipFile(archive) as z:
        members = [f for f in z.infolist() if not f.is_dir()
                   and Path(f.filename).suffix.lower() in EXTENSIONS]
        if len(members) > 250 or sum(f.file_size for f in members) > 1_000_000_000:
            raise ValueError("Archive exceeds 4K background review bounds")
        for info in members:
            if info.file_size > 35_000_000:
                continue
            try:
                raw = z.read(info)
                with Image.open(io.BytesIO(raw)) as im:
                    im.verify()
                with Image.open(io.BytesIO(raw)) as im:
                    width, height = im.size
                    if width < 256 or height < 256:
                        continue
                    if len(previews) < 30 and any(k in info.filename.lower() for k in KEYWORDS):
                        previews.append((info.filename,
                            ImageOps.contain(im.convert("RGB"), (250, 142),
                                             Image.Resampling.LANCZOS)))
                cover_scale = round(max(1648 * 2 / width, 928 * 2 / height), 3)
                images.append({
                    "originalName": info.filename,
                    "sha256": hashlib.sha256(raw).hexdigest(),
                    "width": width, "height": height, "bytes": len(raw),
                    "pc1648DPR2CoverScale": cover_scale,
                    "pcRetinaPass": cover_scale <= 1.001,
                    "categorySignals": [k for k in KEYWORDS if k in info.filename.lower()],
                    "reviewStatus": "unreviewed; not production",
                })
            except (OSError, ValueError, UnidentifiedImageError) as exc:
                print("Skipped invalid image:", info.filename, str(exc)[:130])
    if not images or not any(item["pcRetinaPass"] for item in images):
        raise ValueError("Publisher archive did not yield real 4K eligible images")

    cols, cell_w, cell_h = 5, 264, 178
    rows = (len(previews) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (19, 12, 28))
    draw = ImageDraw.Draw(sheet)
    for i, (name, pic) in enumerate(previews):
        x = i % cols * cell_w + 7
        y = i // cols * cell_h + 5
        sheet.paste(pic, (x, y))
        # Only publisher filename labels, never re-export 4K images.
        label = Path(name).name
        draw.text((x, y + 145), label[:37], fill=(230, 209, 180))
    if previews:
        sheet.save(out / "S02-real-source-contact-sheet.webp", "WEBP", quality=80)

    report = {
        "schemaVersion": 1,
        "purpose": "S02 multi-room mansion background geometry / native pixel screening",
        "status": "contact-sheet-only; NOT approved for game",
        "publisherZipName": archive.name,
        "publisherZipSHA256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "license": LICENSE,
        "sourceFiles": len(images),
        "pcRetinaPixelCandidates": sum(x["pcRetinaPass"] for x in images),
        "sourcePreviewThumbnails": len(previews),
        "nativeMobileCompositionsProvided": False,
        "artDirectionReviewed": False,
        "sixRoomDoorCoordinatesVerified": False,
        "approvedForGame": False,
        "assets": images,
    }
    (out / "r12-s02-mansion-source-evidence.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# S02 · Free Mansion 4K original-source review",
        "",
        "This is a *review artifact* for the game 怪物公寓, not production art.",
        f"Original publisher page: {SOURCE}",
        "",
        "Publisher permits commercial game use, but forbids redistributing raw",
        "or modified files as a standalone asset collection. No source images",
        "or full-resolution files were placed in Git or uploaded by this job.",
        "",
        f"Verified source images: {len(images)}.",
        f"PC retina pixel candidates: {report['pcRetinaPixelCandidates']}.",
        f"Contact-sheet thumbnails: {len(previews)}.",
        "",
        "4K PC source != independent vertical native mobile art; six clickable",
        "door locations and visual style are also not reviewed. No auto approval.",
        "",
        "| Filename | True pixels | PC 1648×928 DPR2 cover |",
        "| --- | ---: | ---: |",
    ]
    for asset in images[:130]:
        lines.append(f"| {Path(asset['originalName']).name} | "
                     f"{asset['width']}×{asset['height']} | "
                     f"{asset['pc1648DPR2CoverScale']}× |")
    (out / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{len(images)} real source images; {report['pcRetinaPixelCandidates']} "
          "native PC DPR2 pixel candidates. No file promoted.")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    archives = list(args.input_dir.rglob("*.zip"))
    if len(archives) != 1:
        raise SystemExit("Expected exactly one publisher ZIP, got "
                         + str([x.name for x in archives]))
    inspect(archives[0], args.out)
