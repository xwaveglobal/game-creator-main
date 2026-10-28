"""Package the Vite output as a single offline HTML demo and a source ZIP."""
from pathlib import Path
import re
import zipfile

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
html = (dist / 'index.html').read_text(encoding='utf-8')
script = next((dist / 'assets').glob('*.js')).read_text(encoding='utf-8')
css = next((dist / 'assets').glob('*.css')).read_text(encoding='utf-8')
html = re.sub(r'<script type="module" crossorigin src="[^"]+"></script>',
              lambda _: '<script type="module">' + script.replace('</script', '<\\/script') + '</script>', html)
html = re.sub(r'<link rel="stylesheet" crossorigin href="[^"]+">',
              lambda _: '<style>' + css + '</style>', html)
out = root / 'output' / 'shadow-rider-3d'
out.mkdir(exist_ok=True)
(out / 'shadow-rider-demo.html').write_text(html, encoding='utf-8')
with zipfile.ZipFile(out / 'shadow-rider-source.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for pattern in ['index.html', 'package.json', 'package-lock.json', 'README.md', 'src/*', 'scripts/*']:
        for file in root.glob(pattern):
            if file.is_file():
                archive.write(file, file.relative_to(root))
    archive.write(out / 'shadow-rider-demo.html', 'shadow-rider-demo.html')
print(out / 'shadow-rider-demo.html')
print(out / 'shadow-rider-source.zip')
