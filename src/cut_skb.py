"""Cut the Skybreaker Paddy sheets (generated/sk/<sheet>.jpg, six poses each on magenta) into assets/p/skb_<sheet>_NN.png/.webp,
merge them into assets/frames.json, then flip SPRITES_IN in skybreaker.js.  Usage: python3 src/cut_skb.py"""
import os,sys,json,re,importlib.util
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
spec=importlib.util.spec_from_file_location('cm','src/cut_mf.py')
src=open('src/cut_mf.py').read()
# reuse cut_mf's cutter, pointed at generated/sk and the 'skb' prefix
src=src.replace("FORMS=['mst','mde','mph','mfm','mmc','mtc','mch','mbk']","FORMS=['skb']").replace("generated/mf/{pre}/","generated/sk/")
src=src.replace("which=[sys.argv[1]] if len(sys.argv)>1 else FORMS","which=FORMS")
sys.argv=[sys.argv[0]]
exec(compile(src,'cut_mf(skb)','exec'))
from PIL import Image
fr=json.load(open('assets/frames.json'))
for k,v in fr.items():
    if k.startswith('skb_'):
        for f in v: Image.open('assets/'+f['f']+'.png').save('assets/'+f['f']+'.webp',quality=88,method=6)
s=open('skybreaker.js').read();s=s.replace('const SPRITES_IN=false;','const SPRITES_IN=true;');open('skybreaker.js','w').write(s)
print('skybreaker sprites in:',sorted(k for k in fr if k.startswith('skb_')))
