#!/usr/bin/env python3
"""Inspect a licensed publisher ZIP without extracting or republishing originals.

Output is a contact sheet + immutable SHA/dimensions metadata, NOT a game asset.
Never treat pixel budget or publisher license statement as human art approval.
"""
import argparse
import hashlib
import io
import json
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps, UnidentifiedImageError

Image.MAX_IMAGE_PIXELS = 90_000_000
FORMATS = {".png", ".jpg", ".jpeg", ".webp"}
MIN_DESKTOP = (3296, 1856)  # 1648x928 CSS at DPR2, assuming cover geometry
TARGETS = (
    ("pc-1440-dpr1", 1440, 900, 1, "desktop"),
    ("pc-1648-dpr2", 1648, 928, 2, "desktop"),
    ("phone-390x844-dpr2", 390, 844, 2, "mobile"),
    ("phone-390x550-dpr2", 390, 550, 2, "mobile"),
)


def inspect(zip_path: Path, out: Path) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    entries = []
    thumbs = []
    seen = set()
    with zipfile.ZipFile(zip_path) as archive:
        members = [m for m in archive.infolist()
                   if not m.is_dir() and Path(m.filename).suffix.lower() in FORMATS]
        # Reject archive bombs; inspect in memory, NEVER extract paths to disk.
        if len(members) > 200 or sum(m.file_size for m in members) > 600_000_000:
            raise ValueError("Archive exceeds expected candidate-only source bounds")
        for item in members:
            if item.file_size > 40_000_000:
                continue
            try:
                contents = archive.read(item)
                with Image.open(io.BytesIO(contents)) as image:
                    image.verify()
                with Image.open(io.BytesIO(contents)) as image:
                    width, height = image.size
                    if width < 256 or height < 256 or width > 12000 or height > 12000:
                        continue
                    thumb = ImageOps.contain(image.convert("RGB"), (264, 148),
                                             method=Image.Resampling.LANCZOS)
                checksum = hashlib.sha256(contents).hexdigest()
                if checksum in seen:
                    continue
                seen.add(checksum)
                samples = {
                    key: round(max(css_w * dpr / width, css_h * dpr / height), 3)
                    for key, css_w, css_h, dpr, _ in TARGETS
                }
                index = len(entries) + 1
                stem = Path(item.filename).stem.lower()
                is_scene = stem not in {"metal_grunge", "bg_wallpaper"}
                entries.append({
                    "index": index, "sourceFile": item.filename,
                    "compositionId": stem, "role": "scene" if is_scene else "texture",
                    "width": width, "height": height,
                    "bytes": len(contents), "sha256": checksum,
                    "nativeDesktop4k": width >= 3840 and height >= 2160,
                    "passesDesktopRetinaCover": all(
                        samples[key] <= 1.001 for key, _, _, _, kind in TARGETS
                        if kind == "desktop"),
                    "coverScale": samples, "humanReviewed": False,
                    "approvedForGame": False,
                })
                thumbs.append(thumb)
            except (OSError, ValueError, UnidentifiedImageError) as exc:
                print("Skipped unreadable image", item.filename, str(exc)[:120])
    if not entries:
        raise ValueError("No readable raster source images in publisher ZIP")

    cols = 4
    cell_w, cell_h = 282, 194
    rows = (len(entries) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (17, 12, 23))
    brush = ImageDraw.Draw(sheet)
    for i, (entry, thumb) in enumerate(zip(entries, thumbs)):
        x, y = (i % cols) * cell_w + 9, (i // cols) * cell_h + 9
        sheet.paste(thumb, (x, y))
        brush.text((x, y + 152),
                   f"{entry['index']:02d} · {entry['width']}x{entry['height']}",
                   fill=(232, 215, 193))
        if entry["passesDesktopRetinaCover"]:
            brush.text((x, y + 169), "Pixel candidate; NOT approved",
                       fill=(172, 211, 173))
        else:
            brush.text((x, y + 169), "Below target DPR2 pixel budget",
                       fill=(238, 190, 149))
    sheet.save(out / "contact-sheet.webp", "WEBP", quality=83, method=5)

    # A JPG and WebP of the same composition count as one scene, not two.
    grouped_scenes = {}
    for entry in entries:
        if entry["role"] != "scene":
            continue
        grouped_scenes.setdefault(entry["compositionId"], []).append(entry)
    unique_retina_scenes = sum(
        any(item["passesDesktopRetinaCover"] for item in versions)
        for versions in grouped_scenes.values()
    )
    report = {
        "schemaVersion": 1,
        "status": "review-only-not-production",
        "publisher": "Ebbasuke",
        "sourcePage": "https://ebbasuke.itch.io/gloomy-mansion-background-pack",
        "licenseClaim": "CC BY 4.0; credit required; do not redistribute source pack as-is",
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
        "originalZipSHA256": hashlib.sha256(zip_path.read_bytes()).hexdigest(),
        "sourceImages": len(entries),
        "uniqueSceneCompositions": len(grouped_scenes),
        "retinaDesktopSceneCompositions": unique_retina_scenes,
        "retinaDesktopFiles": sum(e["passesDesktopRetinaCover"] for e in entries),
        "minimumNativeDesktop": list(MIN_DESKTOP),
        "notes": [
            "Publisher claims 19 4K filtered-photo backgrounds; verify actual individual files.",
            "Photo-derived gothic interiors may not match established anime fantasy art direction.",
            "Contact sheet is a low-resolution review index, not a crop or in-game screenshot.",
            "No individual art rights, suitability, subject-specific hotspots, or mobile portrait composition was signed off.",
            "Never place originals into public/art/world-scenes/r12 or change production manifest from this report.",
        ],
        "assets": entries,
    }
    (out / "candidate-evidence.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# R12 · Ebbasuke 4K real-source candidate evidence",
        "",
        "**Review only. No original source file or public production asset was committed.**",
        "",
        "Publisher: https://ebbasuke.itch.io/gloomy-mansion-background-pack",
        "License claim: CC BY 4.0; attribution is required; do not redistribute the pack as-is.",
        "",
        f"Parsed files: {len(entries)}; distinct scene compositions: {len(grouped_scenes)}; "
        f"PC DPR2 distinct scene candidates: {unique_retina_scenes}.",
        "Pixel fit is not quality or license sign-off. No independent mobile composition is included or approved.",
        "",
        "| # | Publisher file | Native pixels | PC DPR2 cover scale | Status |",
        "| --- | --- | ---: | ---: | --- |",
    ]
    for entry in entries:
        md.append(f"| {entry['index']} | {entry['sourceFile']} | "
                  f"{entry['width']}×{entry['height']} | "
                  f"{entry['coverScale']['pc-1648-dpr2']}× | Review only |")
    md.append("")
    (out / "candidate-evidence.md").write_text("\n".join(md), encoding="utf-8")

    # Release exactly TWO individually attributed native-4K review samples,
    # not the publisher's whole pack. They are not approved scene replacements.
    sample_targets = {
        "bbg_entrance": ("S02-apartment-foyer", "公寓入口的空间透视候选"),
        "bbg_library": ("S05-orders-library", "委托档案室氛围候选；非正式契约大厅"),
    }
    examples = []
    sample_dir = out / "local-preview-only"
    sample_dir.mkdir(exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive:
        for stem, (slug, role) in sample_targets.items():
            matching = [entry for entry in entries
                        if entry["compositionId"] == stem
                        and entry["sourceFile"].lower().endswith(".webp")]
            if len(matching) != 1:
                raise ValueError("Expected exactly one original WebP for " + stem)
            entry = matching[0]
            original = archive.read(entry["sourceFile"])
            if hashlib.sha256(original).hexdigest() != entry["sha256"]:
                raise ValueError("Selected WebP fingerprint mismatch")
            target = sample_dir / (slug + ".webp")
            target.write_bytes(original)
            examples.append({
                "previewFile": str(target.relative_to(out)),
                "sourceFile": entry["sourceFile"],
                "description": role,
                "pixels": [entry["width"], entry["height"]],
                "sha256": entry["sha256"],
                "reviewOnly": True,
                "rightsHumanApproved": False,
                "gameVisualApproved": False,
            })
    credits = [
        "# R12 本地高清绘景审稿样本 / CC BY 4.0",
        "",
        "Author: Ebbasuke · Gloomy Mansion Background Pack (4K)",
        "Source: https://ebbasuke.itch.io/gloomy-mansion-background-pack",
        "License: https://creativecommons.org/licenses/by/4.0/",
        "No art modification was applied. Two WebP images were renamed only.",
        "These are two individually selected images, not the publisher source pack.",
        "",
        "仅用于本地浏览器里的构图、源像素与风格审稿。没有经过人工",
        "画风/契约物件/商业权益最终复核，**不得作为正式游戏生产资源**。",
        "不包含独立手机竖版；手机端仅能观察 PC 横图裁切。",
        "",
        "可打开 /apartment/?r12-art-review=1 或 /orders/?r12-art-review=1",
        "使用第一项 PC 横版文件选择器预览；审稿工具不会上传或保存文件。",
        "",
    ]
    (sample_dir / "CREDITS.md").write_text(
        "\n".join(credits), encoding="utf-8")
    (sample_dir / "review-samples.json").write_text(
        json.dumps(examples, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")

    print(f"Review report: {len(entries)} raster files; "
          f"{len(grouped_scenes)} distinct scenes; "
          f"{unique_retina_scenes} scenes meeting PC DPR2 pixel sampling. "
          "No image promoted.")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    opts = parser.parse_args()
    archives = sorted(opts.archive_dir.rglob("*.zip"), key=lambda f: f.stat().st_size,
                      reverse=True)
    if not archives:
        raise SystemExit("Publisher ZIP not found; review download log")
    inspect(archives[0], opts.out)
