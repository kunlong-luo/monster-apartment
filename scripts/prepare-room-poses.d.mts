export declare const ROOM_POSES:readonly string[];
export type PoseFrame={width:number;height:number;sha256:string;bytes:number};
export declare function inspectPoseAssets(input:Record<string,Buffer>):Record<string,PoseFrame>;
export declare function portraitReviewHtml(input:{room:string}):string;
