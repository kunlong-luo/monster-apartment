/**
 * R09.5 diagnostic-only WebGL API resource telemetry.
 * This is injected by Playwright BEFORE Pixi initialises, never shipped to
 * players. Counters track create/delete API calls (not GPU bytes or residency).
 * Resource identity is held only in WeakMaps to avoid creating a test leak.
 */
export const WORKSHOP_WEBGL_RESOURCE_NAMES=[
  'texture','buffer','framebuffer','renderbuffer','program',
  'shader','vertexArray','sampler','query','transformFeedback',
] as const;
export type WorkshopWebGLResourceName=typeof WORKSHOP_WEBGL_RESOURCE_NAMES[number];
export type WorkshopWebGLResourceCount={
  created:number;deleted:number;live:number;highWater:number;
};
export type WorkshopWebGLContextReport={
  id:number;webglVersion:1|2;connected:boolean;lost:boolean;
  drawCalls:number;resources:Record<WorkshopWebGLResourceName,WorkshopWebGLResourceCount>;
};
export type WorkshopWebGLProbeReport={
  schema:1;contextCount:number;contexts:WorkshopWebGLContextReport[];
};
declare global {
  interface Window {
    __workshopWebGLProbe?:{snapshot:()=>WorkshopWebGLProbeReport};
  }
}

/** Keep this function self-contained: Playwright serializes it into an init script. */
export function installWorkshopWebGLProbe():void{
  const names=[
    'texture','buffer','framebuffer','renderbuffer','program',
    'shader','vertexArray','sampler','query','transformFeedback',
  ] as const;
  type Name=typeof names[number];
  type Counts={created:number;deleted:number;live:number;highWater:number};
  type State={
    id:number;webglVersion:1|2;canvas:WeakRef<HTMLCanvasElement>;lost:boolean;
    drawCalls:number;drawDepth:number;resources:Record<Name,Counts>;
  };
  const states:State[]=[];
  const contexts=new WeakMap<object,State>();
  const resources=new WeakMap<object,{owner:number;kind:Name}>();
  const resourceMethods:ReadonlyArray<readonly[Name,string,string]>=[
    ['texture','createTexture','deleteTexture'],
    ['buffer','createBuffer','deleteBuffer'],
    ['framebuffer','createFramebuffer','deleteFramebuffer'],
    ['renderbuffer','createRenderbuffer','deleteRenderbuffer'],
    ['program','createProgram','deleteProgram'],
    ['shader','createShader','deleteShader'],
    ['vertexArray','createVertexArray','deleteVertexArray'],
    ['sampler','createSampler','deleteSampler'],
    ['query','createQuery','deleteQuery'],
    ['transformFeedback','createTransformFeedback','deleteTransformFeedback'],
  ];
  const protos:object[]=[];
  if(typeof WebGLRenderingContext!=='undefined')
    protos.push(WebGLRenderingContext.prototype);
  if(typeof WebGL2RenderingContext!=='undefined')
    protos.push(WebGL2RenderingContext.prototype);
  const override=(proto:object,method:string,
    wrap:(native:(...args:unknown[])=>unknown)=>
      (this:object,...args:unknown[])=>unknown)=>{
    if(!Object.prototype.hasOwnProperty.call(proto,method))return;
    const original=(proto as Record<string,unknown>)[method];
    if(typeof original!=='function')return;
    Object.defineProperty(proto,method,{
      configurable:true,writable:true,value:wrap(original as (...args:unknown[])=>unknown),
    });
  };
  for(const proto of protos){
    for(const [kind,create,dispose] of resourceMethods){
      override(proto,create,native=>function(this:object,...args:unknown[]){
        const result=native.apply(this,args);
        const state=contexts.get(this);
        if(state&&result!==null&&typeof result==='object'&&!resources.has(result)){
          resources.set(result,{owner:state.id,kind});
          const count=state.resources[kind];
          count.created++;count.live++;
          count.highWater=Math.max(count.highWater,count.live);
        }
        return result;
      });
      override(proto,dispose,native=>function(this:object,...args:unknown[]){
        const state=contexts.get(this);
        const target=args[0];
        if(state&&target!==null&&typeof target==='object'){
          const found=resources.get(target);
          if(found?.owner===state.id&&found.kind===kind){
            resources.delete(target);
            const count=state.resources[kind];
            count.deleted++;count.live--;
          }
        }
        return native.apply(this,args);
      });
    }
    for(const method of [
      'drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced',
    ]){
      override(proto,method,native=>function(this:object,...args:unknown[]){
        const state=contexts.get(this);
        if(state){
          if(state.drawDepth===0)state.drawCalls++;
          state.drawDepth++;
        }
        try{return native.apply(this,args);}
        finally{if(state)state.drawDepth--;}
      });
    }
  }
  const originalGetContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(...args:unknown[]){
    const gl=(originalGetContext as (...a:unknown[])=>unknown).apply(this,args);
    const kind=String(args[0]);
    if(gl&&typeof gl==='object'&&
      (kind==='webgl'||kind==='webgl2'||kind==='experimental-webgl')&&
      !contexts.has(gl)){
      const counts=Object.fromEntries(names.map(name=>[
        name,{created:0,deleted:0,live:0,highWater:0},
      ])) as Record<Name,Counts>;
      const state:State={
        id:states.length+1,webglVersion:kind==='webgl2'?2:1,
        canvas:new WeakRef(this),lost:false,drawCalls:0,drawDepth:0,
        resources:counts,
      };
      contexts.set(gl,state);
      states.push(state);
      this.addEventListener('webglcontextlost',()=>{state.lost=true;});
      this.addEventListener('webglcontextrestored',()=>{state.lost=false;});
    }
    return gl;
  } as typeof HTMLCanvasElement.prototype.getContext;
  window.__workshopWebGLProbe={
    snapshot:()=>({
      schema:1 as const,
      contextCount:states.length,
      contexts:states.map(state=>({
        id:state.id,webglVersion:state.webglVersion,
        connected:state.canvas.deref()?.isConnected??false,
        lost:state.lost,drawCalls:state.drawCalls,
        resources:Object.fromEntries(names.map(name=>[
          name,{...state.resources[name]},
        ])) as Record<Name,Counts>,
      })),
    }),
  };
}
