"""Extract whole-body generated frames and read palette geometry; no repainting."""
import json
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1] / 'assets/character/taller-pixel'
sheet = Image.open(root / 'windbreaker-interactions.png').convert('RGBA')
paths = []
for i in range(4):
    cw, ch = sheet.width // 2, sheet.height // 2
    cell = sheet.crop(((i % 2)*cw, (i // 2)*ch, (i % 2+1)*cw, (i // 2+1)*ch))
    mask = cell.getchannel('A').point(lambda a: 255 if a > 220 else 0)
    bounds = mask.getbbox()
    assert bounds is not None
    foot = mask.crop((0, bounds[3]-25, cw, bounds[3])).getbbox()
    center = (foot[0]+foot[2])//2
    frame = cell.crop((center-240, bounds[3]-720, center+240, bounds[3]))
    frame.save(root / f'individual/windbreaker-{i}.png')
    assert frame.size == (480,720)
    visible = frame.getchannel('A').point(lambda a: 255 if a > 220 else 0).getbbox()
    assert visible[0] > 0 and visible[2] < frame.width, f'Frame {i} clips the character horizontally'
    bands = [[],[],[]]
    w,h = 160,240
    for y in range(h):
        row=[]
        for x in range(w):
            r,g,b,a=frame.getpixel((x*3+1,y*3+1))
            region=.32<y/h<.64
            if i >= 2:
                region |= .20<y/h<.44 and x/w<.40
            clothing=region and a>220 and ((g>r+15 and b>r+15) or (b>r+9 and b>g+3))
            row.append(min(2,int(max(g,b)/65)) if clothing else -1)
        x=0
        while x<w:
            band=row[x]; end=x+1
            while end<w and row[end]==band: end+=1
            if band>=0: bands[band].append(f'M{x} {y}h{end-x}v1h-{end-x}z')
            x=end
    paths.append([''.join(band) for band in bands])
(root/'windbreaker-clothing-paths.json').write_text(json.dumps(paths),encoding='utf-8')
print('Packaged four whole-body windbreaker frames at one baseline')
