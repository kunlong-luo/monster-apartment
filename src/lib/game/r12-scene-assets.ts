import sceneManifest from '../../../public/art/world-scenes/r12-scene-manifest.json';

/** Only assets explicitly promoted by the audited R12 manifest may be rendered.
 * Images in the review ZIP, and reserved (but absent) production paths, are
 * intentionally NOT used by the live game.
 */
export type R12SceneArea = 'apartment'|'orders'|'warehouse';
export type R12SceneSource = Readonly<{desktop:string;mobile:string}>;
export const R12_ART_BASE_PATH = process.env.NEXT_PUBLIC_GAME_BASE_PATH ?? '';

function publicUrl(file:string):string{
  return R12_ART_BASE_PATH+'/'+file.replace(/^public\//,'');
}

export function approvedR12Scene(area:R12SceneArea):R12SceneSource|null{
  const entry=sceneManifest.scenes[area];
  if(entry.status!=='production')return null;
  // A matching SHA and signed review are enforced during pnpm check:design.
  return {desktop:publicUrl(entry.desktop),mobile:publicUrl(entry.mobile)};
}
