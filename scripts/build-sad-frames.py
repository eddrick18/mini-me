"""Derive sad sprite frame geometry from alpha; never change the source PNG."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]/'assets/character/taller-pixel'
im=Image.open(root/'sad.png').convert('RGBA');w,h=im.size
bounds=[]
for i in range(4):
 left=i*w//4;right=(i+1)*w//4
 alpha=im.getchannel('A').crop((left,0,right,h)).point(lambda a:255 if a>=128 else 0)
 box=alpha.getbbox()
 if not box:raise ValueError('Missing sad frame')
 bounds.append((left+box[0],box[1],left+box[2],box[3]))
height=max(b[3]-b[1] for b in bounds)
frames=[{'x':b[0],'y':b[3]-height,'width':b[2]-b[0],'height':height} for b in bounds]
(root/'sad-frames.json').write_text(json.dumps({'width':w,'height':h,'states':{'sad':frames}},indent=2),encoding='utf-8')
print('Sad atlas',im.size,'alpha range',im.getchannel('A').getextrema(),'frames',frames)
