/** Canonical assets for the static Pixi workshop.
 * The Next router removes trailing slashes during SPA navigation,
 * but deployed Pages assets always live under /workshop/assets/.
 * Do not derive a directory with new URL('./', pathWithoutSlash).
 */
export function workshopAssetRoot(locationUrl:string):string {
  const url=new URL(locationUrl);
  if((url.hostname==='127.0.0.1'||url.hostname==='localhost')&&url.port==='3000')
    return 'http://127.0.0.1:3901/';
  return new URL(url.pathname.endsWith('/')?url.pathname:url.pathname+'/',url.origin).href;
}
