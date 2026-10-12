"""Create original, short game cues without external samples or services."""
import math, random, struct, wave
from pathlib import Path
root = Path(__file__).resolve().parents[1] / 'assets/audio'
root.mkdir(parents=True, exist_ok=True)
rate = 22050
random.seed(42)
def write(name, notes, sigh=False):
    samples=[]
    for frequency, duration in notes:
        length=int(rate*duration)
        for i in range(length):
            t=i/rate
            envelope=min(1,i/(rate*.015))*min(1,(length-i)/(rate*.07))
            if sigh:
                f=frequency*(1-.25*i/length)
                value=.15*math.sin(2*math.pi*f*t)+.025*random.uniform(-1,1)
            else:
                value=.19*math.sin(2*math.pi*frequency*t)+.035*math.sin(4*math.pi*frequency*t)
            samples.append(struct.pack('<h',round(value*envelope*32767)))
    with wave.open(str(root/(name+'.wav')),'wb') as out:
        out.setnchannels(1); out.setsampwidth(2); out.setframerate(rate); out.writeframes(b''.join(samples))
write('xp',[(659,.12),(880,.22)])
write('quest',[(523,.1),(659,.1),(784,.22)])
write('level',[(523,.1),(659,.1),(784,.1),(1047,.32)])
write('sigh',[(220,.48)],True)
