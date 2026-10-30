/** Public-folder URLs are NOT automatically prefixed by next/image.
 * Retain catalog/save-facing /art paths, but resolve them for Pages at
 * the point of rendering. Static Image imports already contain the basePath. */
export function siteAssetUrl(path:string,basePath=process.env.NEXT_PUBLIC_GAME_BASE_PATH??''):string {
  if(!path.startsWith('/')||path.startsWith('//'))return path;
  const prefix=basePath.replace(/\/+$/,'');
  if(!prefix||path===prefix||path.startsWith(prefix+'/'))return path;
  return prefix+path;
}
