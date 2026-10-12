"""Derive overlay coordinates from the generated sprite without editing its pixels."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets/character/taller-pixel'
pixels = Image.open(root / 'individual/running-idle.png').convert('RGBA')
w, h = 101, 242
bands = [[], [], []]
for y in range(h):
    row = []
    for x in range(w):
        r, g, b, a = pixels.getpixel((int((x + .5) * pixels.width / w), int((y + .5) * pixels.height / h)))
        clothing = .35 < y / h < .64 and a > 220 and ((g > r + 15 and b > r + 15) or (b > r + 9 and b > g + 3))
        row.append(min(2, int(max(g, b) / 65)) if clothing else -1)
    x = 0
    while x < w:
        band = row[x]
        end = x + 1
        while end < w and row[end] == band:
            end += 1
        if band >= 0:
            bands[band].append(f'M{x} {y}h{end-x}v1h-{end-x}z')
        x = end
(root / 'standing-clothing-paths.json').write_text(json.dumps([[''.join(band) for band in bands]]), encoding='utf-8')
