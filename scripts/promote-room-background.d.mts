export declare function sha256(bytes:Buffer):string;
export type BackgroundApproval={
  room:string;asset:string;approved:boolean;humanVisualReview:boolean;
  assetSha256:string;sourceType:string;sourceReference:string;original:boolean;
  commercialUse:boolean;rightsConfirmed:boolean;reviewer:string;reviewNotes:string;
  reviewedAt:string;noBakedUI:boolean;noBakedCharacterInBackground:boolean;
  generationResolution?:{width:number;height:number}|null;
  visualReview:Record<string,boolean>;objectAnchors:Record<string,number[]>;
};
export declare function verifyRoomApproval(args:{
  room:string;review:BackgroundApproval;imageBytes:Buffer;
  anchors:Record<string,number[]>;
}):{
  original:true;commercialUse:true;reviewer:string;reviewNotes:string;
  reviewedAt:string;sourceType:string;sourceReference:string;
  noBakedUI:true;noBakedCharacterInBackground:true;
  backgroundSha256:string;reviewScreens:readonly string[];
  dimensions:{width:number;height:number};
  generationResolution:{width:number;height:number}|null;
};
