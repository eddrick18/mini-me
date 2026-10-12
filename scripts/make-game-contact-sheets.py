import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parent.parent
folder=root/'artifacts'/'game-screens'
captures=json.loads((folder/'captures.json').read_text(encoding='utf8'))
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
for c in captures:
    im=Image.open(folder/(c['key']+'.png'))
    x,y,w,h=(round(c[k]) for k in ('x','y','width','height'))
    crop=im.crop((x,y,x+w,y+h))
    crop.save(folder/(c['key']+'-phone.png'))
for batch in range(0,len(captures),6):
    group=captures[batch:batch+6]
    sheet=Image.new('RGB',(1242,1836),'#F3EFFF')
    draw=ImageDraw.Draw(sheet)
    for i,c in enumerate(group):
        x=18+(i%3)*408;y=20+(i//3)*908
        draw.text((x,y),c['key']+' · '+c['title'][:31],fill='#203444',font=font)
        sheet.paste(Image.open(folder/(c['key']+'-phone.png')),(x,y+32))
    sheet.save(root/'artifacts'/f'game-sheet-{batch//6+1:02}.png')
print(f'Created {len(captures)} phone crops and {(len(captures)+5)//6} review sheets.')
