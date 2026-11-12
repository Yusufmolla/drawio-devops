"""Bundle the pinned draw.io browser distribution into the private extension."""
from hashlib import sha256
from pathlib import Path
from urllib.request import urlretrieve
from zipfile import ZipFile

VERSION = "32.6.10"
DIGEST = "a57b06b3b6a876a351dacfe65d027d9509319cd030e9bacf6ae04a034d66a38f"
root = Path(__file__).resolve().parents[1]
archive = root / "draw-editor.war"
if not archive.exists():
    urlretrieve(f"https://github.com/jgraph/drawio/releases/download/v{VERSION}/draw.war", archive)
if sha256(archive.read_bytes()).hexdigest() != DIGEST:
    raise SystemExit("Unexpected SHA-256 for draw-editor.war")

target = root / "dist" / "drawio"
with ZipFile(archive) as release:
    for item in release.infolist():
        if not item.filename.startswith(("WEB-INF/", "META-INF/")):
            release.extract(item, target)

policy = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
          "img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' data: blob:; "
          "worker-src 'self' blob:; object-src 'none'; form-action 'none'; base-uri 'self'")
index = target / "index.html"
index.write_text(index.read_text(encoding="utf-8").replace(
    "<head>", f'<head>\n<meta http-equiv="Content-Security-Policy" content="{policy}">', 1
), encoding="utf-8")
with (target / "js" / "PreConfig.js").open("a", encoding="utf-8") as config:
    config.write("\nwindow.DRAWIO_CONFIG = { lockdown: true };\n")
# VSIX uses URI part names for packaged assets.
for asset in target.rglob("* *"):
    asset.rename(asset.with_name(asset.name.replace(" ", "%20")))
