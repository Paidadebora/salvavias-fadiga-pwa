export class FatigueEngine {
  constructor(cb={}){
    this.cb = cb;
    this.config = { EAR_BLINK:0.18, EAR_CLOSED:0.17, MAR_YAWN:0.6, WINDOW_S:60, FPS_EST:24 };
    this.state = { ear:0, mar:0, perclos:0, blinks:0, frames:0, closedFrames:0, blinksPerMin:0, level:'ok', status:'OK' };
  }
  setSensitivity(val){ const f = 1 - (val-50)/200; this.config.EAR_BLINK=0.18*f; this.config.EAR_CLOSED=0.17*f; this.config.MAR_YAWN=0.6*(2-f); }
  async init(video, onLandmarks){
    this.onLandmarks = onLandmarks;
    await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
    await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
    await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
    // eslint-disable-next-line no-undef
    this.mesh = new FaceMesh.FaceMesh({locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
    this.mesh.setOptions({maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.5, minTrackingConfidence:0.5});
    this.mesh.onResults((r)=>this.onResults(r));
    // eslint-disable-next-line no-undef
    this.cam = new CameraUtils.Camera(video, { onFrame: async()=>{{ await this.mesh.send({image:video}); }}, width:1280, height:720 });
    this.cam.start();
  }
  async loadScript(src){ if (document.querySelector(`script[src="${src}"]`)) return; await new Promise((res,rej)=>{{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }}); }
  onResults(res){
    const lm = res.multiFaceLandmarks && res.multiFaceLandmarks[0]; if(!lm){ this.report(null); return; }
    const pts = lm.map(p=>({x:p.x, y:p.y})); this.onLandmarks?.(pts);
    const L=[33,160,158,133,153,144], R=[362,385,387,263,373,380], M=[13,14,308,78];
    const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const EAR=(E)=>{{ const [p1,p2,p3,p4,p5,p6]=E.map(i=>pts[i]); return (d(p2,p6)+d(p3,p5))/(2*d(p1,p4)); }};
    const MAR=()=>{{ const [t,b,r,l]=M.map(i=>pts[i]); return d(t,b)/d(l,r); }};
    const ear=(EAR(L)+EAR(R))/2, mar=MAR();
    this.state.frames++; if (ear<this.config.EAR_CLOSED) this.state.closedFrames++;
    if (!this._wasClosed && ear<this.config.EAR_BLINK) this._wasClosed=true;
    if (this._wasClosed && ear>=this.config.EAR_BLINK) {{ this._wasClosed=false; this.state.blinks++; }}
    const wf=Math.max(1, Math.round(this.config.WINDOW_S*this.config.FPS_EST));
    if (this.state.frames % wf === 0){{
      const perclos=this.state.closedFrames/wf, bpm=this.state.blinks*(60/this.config.WINDOW_S);
      this.state.perclos=perclos; this.state.blinksPerMin=bpm; this.state.blinks=0; this.state.closedFrames=0;
      let level='ok', st='OK';
      if (perclos>0.2 || bpm<8 || mar>this.config.MAR_YAWN) {{ level='warn'; st='AtenÃ§Ã£o'; }}
      if (perclos>0.4 || bpm<5 || mar>(this.config.MAR_YAWN+0.15)) {{ level='danger'; st='Fadiga'; }}
      this.state.level=level; this.state.status=st; this.cb.onAlert?.(level, st);
    }}
    this.state.ear=ear; this.state.mar=mar; this.report(pts);
  }
  report(pts){ this.cb.onMetrics?.({ ear:this.state.ear, mar:this.state.mar, perclos:this.state.perclos, blinksPerMin:this.state.blinksPerMin, level:this.state.level, state:this.state.status }); this.onLandmarks?.(pts); }
}

