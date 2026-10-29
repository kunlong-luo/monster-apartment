import type {PoseFrame} from './prepare-room-poses.mjs';
export type PortraitApproval={
  room:string;approved:boolean;humanVisualReview:boolean;
  original:boolean;commercialUse:boolean;rightsConfirmed:boolean;
  sourceType:string;sourceReference:string;reviewer:string;reviewNotes:string;reviewedAt:string;
  sameFootAnchor:boolean;transparentEdgesReviewed:boolean;noBakedBackgroundInResident:boolean;
  identityConsistent:boolean;poseReview:Record<string,boolean>;frames:Record<string,PoseFrame>;
};
export declare function verifyPortraitApproval(args:{
  room:string;review:PortraitApproval;assets:Record<string,Buffer>
}):PortraitApproval;
