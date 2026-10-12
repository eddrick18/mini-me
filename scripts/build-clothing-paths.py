"""Read the atlas pixels and derive vector clothing geometry; source PNGs stay intact."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets/character/taller-pixel'
result = {}
for image_name, manifest_name, key in [('atlas.png', 'frames.json', 'casual'), ('running-outfit.png', 'running-frames.json', 'running'), ('sad.png', 'sad-frames.json', 'casual'), ('wave.png', 'wave-frames.json', 'casual')]:
    pixels = Image.open(root / image_name).convert('RGBA')
    manifest = json.loads((root / manifest_name).read_text(encoding='utf-8-sig'))
    states = {}
    for pose, frames in manifest['states'].items():
        paths = []
        for frame in frames:
            w, h = frame['width'], frame['height']
            bands = [[], [], []]
            for y in range(h):
                row = []
                for x in range(w):
                    r, g, b, alpha = pixels.getpixel((frame['x'] + x, frame['y'] + y))
                    region = .32 < y/h < (.57 if key == 'running' else .68)
                    if pose == 'studying': region &= x/w < .32 or y/h < .53
                    if pose == 'working': region &= x/w < .52
                    if pose in ('gym', 'celebrating'): region &= .25 < x/w < .78
                    if pose == 'music': region &= y/h > .4
                    blue = b > r + 9 and b > g + 3
                    teal = key == 'running' and g > r + 15 and b > r + 15
                    band = min(2, int(max(g, b)/38)) if key == 'casual' else min(2, int(max(g, b)/65))
                    row.append(band if region and (blue or teal) and alpha > 220 else -1)
                x = 0
                while x < w:
                    band = row[x]
                    end = x + 1
                    while end < w and row[end] == band: end += 1
                    if band >= 0: bands[band].append(f'M{x} {y}h{end-x}v1h-{end-x}z')
                    x = end
            paths.append([''.join(band) for band in bands])
        states[pose] = paths
    result.setdefault(key, {}).update(states)
(root / 'clothing-paths.json').write_text(json.dumps(result, separators=(',', ':')), encoding='utf-8')
print('Derived vector clothing paths for', sum(len(v) for group in result.values() for v in group.values()), 'frames')
