"""Match a new base-Paddy sheet to the in-game idle Paddy palette (idle_test_1 / o_idle / walk):
per-pixel luminance is histogram-matched part-way to idle, then the chroma is replaced by idle's chroma at that luminance
(so cream stays warm cream, fawn stays fawn, chocolate stays chocolate). Blue FX, eye shines and white stars are left alone.
The dark cartoon outline band is lifted toward the fur just inside it, closer to idle's soft edge."""
import json,numpy as np,os
from PIL import Image,ImageFilter
from scipy import ndimage as nd
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
F=json.load(open('assets/frames.json'))
def arr(f): return np.asarray(Image.open('assets/'+f+'.png').convert('RGBA')).astype(float)
# idle palette: chroma vs luminance curve
B=np.linspace(0,255,33)
acc=np.zeros((32,3));cnt=np.zeros(32);lums=[]
for k in ['idle_test_1','o_idle','walk']:
  for f in F[k]:
    a=arr(f['f']);m=a[...,3]>200;c=a[...,:3][m];l=c.mean(1);b=np.clip(np.digitize(l,B)-1,0,31)
    for i in range(32): s=b==i; acc[i]+=c[s].sum(0); cnt[i]+=s.sum()
    lums.append(l)
IDL=np.concatenate(lums)
mean=acc/np.maximum(cnt,1)[:,None];ch=mean-mean.mean(1,keepdims=True)
ok=cnt>50;xs=(B[:-1]+B[1:])/2
CH=np.stack([np.interp(xs,xs[ok],ch[ok,j]) for j in range(3)],1)
def grade(a,lummatch=.6,soft=True):
  c=a[...,:3].copy();al=a[...,3];m=al>20
  fx=(c[...,2]>c[...,0]+15)|((c.min(2)>235))   # blue streaks, eye highlights, white stars stay
  l=c.mean(2)
  # luminance: histogram-match body pixels toward idle's luminance distribution (partial)
  body=m&~fx;src=np.sort(l[body]);q=np.searchsorted(src,l)/max(1,len(src));tgt=np.quantile(IDL,np.clip(q,0,1))
  l2=l*(1-lummatch)+tgt*lummatch
  b=np.clip(np.digitize(l2,B)-1,0,31);chg=np.stack([np.interp(l2,xs,CH[:,j]) for j in range(3)],2)
  new=l2[...,None]+chg
  out=np.where((body)[...,None],new,c)
  if soft:  # soften the dark cartoon outline: edge band pixels much darker than the fur just inside -> lift toward it
    inner=nd.binary_erosion(m,iterations=4);edge=m&~nd.binary_erosion(m,iterations=3)
    blur=np.stack([nd.uniform_filter(out[...,j]*inner,9)/np.maximum(nd.uniform_filter(inner.astype(float),9),1e-3) for j in range(3)],2)
    lo=out.mean(2);bl=blur.mean(2);fix=edge&(lo<bl-45)&~fx
    out[fix]=out[fix]*.35+blur[fix]*.65
  return np.dstack([np.clip(out,0,255),al]).astype(np.uint8)
