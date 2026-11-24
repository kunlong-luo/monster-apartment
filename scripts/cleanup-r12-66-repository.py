"""One-time, explicit governance migration. Run only on candidate branch."""
from pathlib import Path
import subprocess, json, re, hashlib, posixpath
ROOT=Path(__file__).resolve().parents[1]
BASE="0f9188a282dfa8a831b9d4d8d389a43e4ed1e2d0"
HISTORY="https://github.com/kunlong-luo/monster-apartment/blob/"+BASE+"/"
DELETE=[
"metadata.json",
".aistudio/artifacts/brain/4a79cd63-2b40-45d8-a7f0-401c555007ec/implementation_plan.md",
".aistudio/artifacts/brain/4a79cd63-2b40-45d8-a7f0-401c555007ec/implementation_plan.md.metadata.json",
"docs/PRODUCT_SPEC.md","docs/UI_DIRECTION.md","docs/DEVELOPMENT_PLAN.md","docs/TECH_STACK_PAGEVELA.md",
"docs/SPIRIT_COLLECTION_V050.md","docs/V060_TACTICAL_DEFENSE.md",
"management/ISSUES.md","management/SPRINT_01.md","management/TASKS.csv",
]
MOVE={"artwork/catalog.json":"docs/archive/external-artwork-catalog-2026-10-29.json",
      "artwork/README.md":"docs/archive/external-artwork-readme-2026-10-29.md"}
def tracked():
    return subprocess.check_output(["git","ls-files","-z"],cwd=ROOT).decode().strip("\0").split("\0")
paths=tracked()
targets=set(DELETE)|set(MOVE)
assert all((ROOT/p).is_file() for p in targets),"preflight: missing old path"
block=[]
for p in paths:
    if p in targets or p=="scripts/cleanup-r12-66-repository.py" or p.endswith(".md") or p.endswith(".csv"):continue
    f=ROOT/p
    if not f.is_file() or f.is_symlink() or f.stat().st_size>2_000_000:continue
    try: text=f.read_text()
    except (UnicodeDecodeError,OSError):continue
    for target in targets:
        # Match the full path or a distinctive basename. Generic metadata.json and README.md
        # only match exact directory-qualified forms or explicit root references.
        names=[target]
        name=posixpath.basename(target)
        if name not in ("metadata.json","README.md","catalog.json"):names.append(name)
        if target=="metadata.json":names += ["./metadata.json","../metadata.json"]
        if any(n in text for n in names):
            # Old source-catalog originalPath is an immutable provenance field, not runtime.
            if p=="art-sources/source-catalog.json" and target.startswith(".aistudio/"):continue
            block.append((p,target))
assert not block, "Non-doc references require manual reconciliation: "+repr(block)
for old,new in MOVE.items():
    dst=ROOT/new
    dst.parent.mkdir(parents=True,exist_ok=True)
    assert not dst.exists()
    (ROOT/old).rename(dst)
for p in DELETE:(ROOT/p).unlink()
changed=[]
# Only repair links affected by this migration. Existing unrelated historical broken
# links are reported separately; never rewrite them to pretend files exist.
pattern=re.compile(r"(\]\()([^)\s]+)(\))")
for old in paths:
    if not old.endswith(".md") or old in DELETE:continue
    p=MOVE.get(old,old)
    f=ROOT/p
    if not f.is_file():continue
    text=f.read_text()
    def fix(m):
        url=m.group(2)
        if re.match(r"^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|/|#)",url):return m.group(0)
        link,sep,fragment=url.partition("#")
        dest=posixpath.normpath(posixpath.join(posixpath.dirname(old),link))
        if dest in DELETE:return m.group(1)+HISTORY+dest+(sep+fragment if sep else "")+m.group(3)
        if dest in MOVE or old in MOVE:
            dest=MOVE.get(dest,dest)
            if (ROOT/dest).exists():
                return m.group(1)+posixpath.relpath(dest,posixpath.dirname(p) or ".")+(sep+fragment if sep else "")+m.group(3)
        return m.group(0)
    updated=pattern.sub(fix,text)
    if updated!=text:
        f.write_text(updated)
        changed.append(p)
# Relocated historical external catalog retains paths INSIDE the original external ZIP,
# not local project paths. Explain that rather than altering the historical hashes.
archive=ROOT/"docs/archive/README.md"
archive.write_text("# 历史外部素材索引\n\n此处只存历史外部归档索引，catalog 中 artwork/ 路径是旧 ZIP 内部路径，不是当前仓库路径。原始索引与 SHA 保留；现行原图在 art-sources/。旧方案、旧任务表从 Git 历史读取，不再建立平行管理目录。\n")
# Produce exact tracked media inventory including retained originals and all physical duplicate slots.
media=[]
ext={".png",".jpg",".jpeg",".webp",".avif",".svg",".gif",".mp4",".ogg",".wav",".mp3"}
for p in sorted(set(paths)-targets):
    f=ROOT/p
    if f.suffix.lower() not in ext or not f.is_file():continue
    data=f.read_bytes()
    media.append({"path":p,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()})
groups={}
for e in media:groups.setdefault(e["sha256"],[]).append(e["path"])
duplicates=[v for v in groups.values() if len(v)>1]
(ROOT/"docs/resource-inventory.json").write_text(json.dumps({"schemaVersion":1,"baseline":BASE,"purpose":"physical inventory only; domain manifests govern admission","media":media,"duplicateGroups":duplicates},ensure_ascii=False,indent=2)+"\n")
report={"baseline":BASE,"deleted":DELETE,"moved":MOVE,"repairedMarkdown":changed,
        "removedBytes":sum(int(subprocess.check_output(["git","cat-file","-s",BASE+":"+p],cwd=ROOT)) for p in DELETE),
        "mediaCount":len(media),"mediaBytes":sum(e["bytes"] for e in media),"duplicateGroups":duplicates}
(ROOT/"docs/engineering/r12-66-cleanup-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print(json.dumps(report,ensure_ascii=False,indent=2))
