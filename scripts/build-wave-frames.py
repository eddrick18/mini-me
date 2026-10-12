"""Read alpha to anchor complete wave frames at the feet; do not alter the PNG."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets/character/taller-pixel'
im = Image.open(root / 'wave.png').convert('RGBA')
w, h = im.size
alpha = im.getchannel('A').point(lambda a: 255 if a >= 128 else 0)
bounds, centers = [], []
for i in range(4):
    left, right = i*w//4, (i+1)*w//4
    box = alpha.crop((left, 0, right, h)).getbbox()
    if not box: raise ValueError('Missing wave frame')
    box = (left+box[0], box[1], left+box[2], box[3])
    feet = alpha.crop((left, box[3]-45, right, box[3])).getbbox()
    centers.append(left+(feet[0]+feet[2])//2)
    bounds.append(box)
height = max(b[3]-b[1] for b in bounds)
half = max(max(center-b[0], b[2]-center) for center, b in zip(centers, bounds))+2
frames = [{'x': center-half, 'y': b[3]-height, 'width': half*2, 'height': height} for center, b in zip(centers, bounds)]
assert all(f['x'] >= 0 and f['y'] >= 0 and f['x']+f['width'] <= w for f in frames)
(root / 'wave-frames.json').write_text(json.dumps({'width': w, 'height': h, 'states': {'wave': frames}}, indent=2), encoding='utf-8')
print('Wave frames anchored at feet:', frames)
