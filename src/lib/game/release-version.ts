/** Numeric ordering avoids V3.100 being mistaken as older than V3.99.
 * Ignore invalid/older manifests: CDNs can briefly serve old release files. */
export function isNewerGameRelease(candidate:string,current:string):boolean{
  const pattern=/^V(\d+)\.(\d+)(?:\.(\d+))?$/;
  const next=candidate.match(pattern);
  const now=current.match(pattern);
  if(!next||!now)return false;
  for(let part=1;part<=3;part++){
    const nextPart=Number(next[part]??0);
    const currentPart=Number(now[part]??0);
    if(nextPart!==currentPart)return nextPart>currentPart;
  }
  return false;
}
