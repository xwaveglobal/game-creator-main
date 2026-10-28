from pathlib import Path
from PIL import Image
import json
import zipfile

root = Path(__file__).resolve().parent
out = root / 'character-sprite-pack'
out.mkdir(exist_ok=True)
(out / 'frames').mkdir(exist_ok=True)
cell_w, cell_h = 448, 736
animations = [
    ('jump', 'skater-jump-sequence.png', ['anticipation', 'takeoff', 'apex', 'descent', 'landing']),
    ('slide_down', 'skater-down-slide-sequence.png', ['neutral', 'enter', 'hold', 'recover', 'neutral_end']),
    ('turn_left', 'skater-left-sequence.png', ['neutral', 'enter', 'carve', 'recover', 'neutral_end']),
    ('turn_right', 'skater-right-sequence.png', ['neutral', 'enter', 'carve', 'recover', 'neutral_end']),
]
sheet = Image.new('RGBA', (cell_w * 5, cell_h * 4))
meta = {'image': 'character-spritesheet.png', 'size': {'w': sheet.width, 'h': sheet.height},
        'columns': 5, 'rows': 4, 'cellSize': {'w': cell_w, 'h': cell_h},
        'coordinateSystem': 'pixels, origin top-left', 'alpha': 'straight',
        'view': 'rear', 'frames': {}, 'animations': {}}
for row, (action, source, phases) in enumerate(animations):
    strip = Image.open(root / source).convert('RGBA')
    names = []
    for col, phase in enumerate(phases):
        left, right = round(col * strip.width / 5), round((col + 1) * strip.width / 5)
        frame = Image.new('RGBA', (cell_w, cell_h))
        crop = strip.crop((left, 0, right, strip.height))
        frame.paste(crop, ((cell_w - crop.width) // 2, cell_h - crop.height))
        name = f'{action}_{col:02d}_{phase}'
        frame.save(out / 'frames' / f'{name}.png')
        sheet.paste(frame, (col * cell_w, row * cell_h))
        meta['frames'][name] = {'frame': {'x': col * cell_w, 'y': row * cell_h, 'w': cell_w, 'h': cell_h},
                               'pivot': {'x': 0.5, 'y': 1.0}, 'durationMs': 100}
        names.append(name)
    meta['animations'][action] = {'frames': names, 'fps': 10, 'loop': False,
                                  'holdFrame': names[2] if action != 'jump' else None}
sheet.save(out / 'character-spritesheet.png')
(out / 'character-spritesheet.json').write_text(json.dumps(meta, indent=2), encoding='utf-8')
(out / 'README.txt').write_text('''CHARACTER SPRITE PACK
20 RGBA frames, fixed cells 448 x 736 pixels, atlas 2240 x 2944.
Rows from top: jump, slide_down, turn_left, turn_right.
Each row plays left to right. Suggested initial speed: 10 fps.
JSON uses top-left pixel coordinates; pivot is bottom center.
Hold frame 2 (zero-based) for slide/turn while input remains pressed.
Use alpha blending and clamp texture wrapping; use gutters when repacking for mipmaps.
For a 3D scene, map frames onto a camera-facing quad/billboard.
These are 2D rear-view illustrations, not a mesh, rig, normal map, or 360-degree model.
Frames are split evenly from the generated five-pose strips. Some cloak edges touch
cell boundaries; these concept frames may need cleanup and alignment for production.
Frame timing and pivot are suggested defaults, not motion-capture measurements.
''', encoding='utf-8')
archive = root / 'character-sprite-pack.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for file in sorted(out.rglob('*')):
        if file.is_file():
            z.write(file, file.relative_to(out))
assert Image.open(out / 'character-spritesheet.png').size == (2240, 2944)
assert len(meta['frames']) == 20
assert len(list((out / 'frames').glob('*.png'))) == 20
print(f'Created {archive}; 20 frames, 4 animations, transparent RGBA atlas 2240x2944')
