/** Type contract for the Node-only CG production audit. */
export declare const CG_PATHS:Readonly<Record<
  'yuesha-eclipse'|'yuesha-vow'|'brook-tide'|'fern-spring'|'cinder-ember',string
>>;
export declare const CG_VIEWPORTS:readonly string[];
export declare function inspectCharacterCg(bytes:Buffer):{
  width:number;height:number;bytes:number;sha256:string;
};
export declare function assertCharacterCgReview(args:{
  card:string;review:Record<string,unknown>;bytes:Buffer;
}):{width:number;height:number;bytes:number;sha256:string};
export declare function auditCharacterCg():{production:number;total:number};
