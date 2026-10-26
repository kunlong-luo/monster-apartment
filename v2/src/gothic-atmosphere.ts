import {Application,Graphics} from 'pixi.js';

/**
 * Optional and intentionally restrained PixiJS 8 overlay.
 * Scene painting and heroine are kept intact; this renders sparse candle motes.
 * A separate IIFE lets the Next HUD stay lightweight and avoids duplicate Pixi installs.
 */
export async function mountAtmosphere(host:HTMLElement):Promise<()=>void>{
  if(!host.isConnected||window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return ()=>{};
  const app=new Application();
  let initialized=false;
  try{
    await app.init({
      resizeTo:host,
      backgroundAlpha:0,
      antialias:false,
      autoDensity:true,
      resolution:Math.min(window.devicePixelRatio||1,1.5),
      preference:'webgl',
      powerPreference:'low-power',
    });
    initialized=true;
    if(!host.isConnected){app.destroy(true);return ()=>{};}
  }catch{
    // WebGL may be disabled. Painting and HUD remain fully playable.
    if(initialized)app.destroy(true);
    return ()=>{};
  }
  const view=app.canvas;
  view.style.cssText='display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  view.setAttribute('aria-hidden','true');
  host.appendChild(view);

  type Mote={view:Graphics;x:number;y:number;speed:number;drift:number;phase:number;alpha:number};
  const motes:Mote[]=[];
  const lowPower=(navigator.hardwareConcurrency||4)<=4||window.innerWidth<650;
  const count=lowPower?10:22;
  let w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
  for(let i=0;i<count;i++){
    const r=(.6+Math.random()*1.15)*(lowPower?.8:1);
    const sprite=new Graphics().circle(0,0,r).fill({
      color:i%4===0?0xffd8ac:0xc6b1ee,
    });
    const particle:Mote={
      view:sprite,x:Math.random()*w,y:Math.random()*h,
      speed:.09+Math.random()*.27,drift:(Math.random()-.5)*.16,
      phase:Math.random()*Math.PI*2,alpha:.13+Math.random()*.24,
    };
    sprite.position.set(particle.x,particle.y);
    sprite.alpha=particle.alpha;
    app.stage.addChild(sprite);
    motes.push(particle);
  }
  const onResize=()=>{
    w=Math.max(1,host.clientWidth);
    h=Math.max(1,host.clientHeight);
  };
  const resize=new ResizeObserver(onResize);resize.observe(host);
  let elapsed=0;
  const onTick=({deltaTime}:{deltaTime:number})=>{
    const dt=Math.min(deltaTime,2);
    elapsed+=dt;
    for(const mote of motes){
      mote.y-=mote.speed*dt;
      mote.x+=mote.drift*dt;
      if(mote.y< -4){mote.y=h+4;mote.x=Math.random()*w;}
      if(mote.x< -5)mote.x=w+5;
      else if(mote.x>w+5)mote.x=-5;
      mote.view.position.set(mote.x,mote.y);
      mote.view.alpha=mote.alpha*(.76+.24*Math.sin(elapsed*.025+mote.phase));
    }
  };
  const onVisible=()=>{
    if(document.visibilityState==='visible')app.ticker.start();
    else app.ticker.stop();
  };
  app.ticker.add(onTick);
  document.addEventListener('visibilitychange',onVisible);
  onVisible();
  return ()=>{
    document.removeEventListener('visibilitychange',onVisible);
    resize.disconnect();
    app.ticker.remove(onTick);
    app.destroy(true,{children:true});
  };
}
