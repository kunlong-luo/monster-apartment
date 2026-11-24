/** Repo-held R12 paintings for OPT-IN layout study only.
 * This intentionally does not import or modify the production manifest.
 * Each WebP is 1672×941 (desktop) / 941×1672 (portrait), well below the
 * 3840×2160 / 1080×1920 original-pixel review floors. Never promote these
 * previews to production or persist their URLs in a player save.
 */
export type R12ReviewSceneArea='apartment'|'orders'|'warehouse';
type R12ReviewPainting=Readonly<{path:string;width:number;height:number}>;
export type R12ReviewPair=Readonly<{
  desktop:R12ReviewPainting;
  mobile:R12ReviewPainting;
}>;
const desktop=(path:string):R12ReviewPainting=>({path,width:1672,height:941});
const mobile=(path:string):R12ReviewPainting=>({path,width:941,height:1672});
export const R12_REPOSITORY_REVIEW_ART:Readonly<Record<R12ReviewSceneArea,R12ReviewPair>>={
  apartment:{
    desktop:desktop('/art/world-scenes/review/2026-11-23/apartment-six-door-desktop-v1.webp'),
    mobile:mobile('/art/world-scenes/review/2026-11-23/apartment-six-door-mobile-v1.webp'),
  },
  orders:{
    desktop:desktop('/art/world-scenes/review/2026-11-22/orders-desktop-v1.webp'),
    mobile:mobile('/art/world-scenes/review/2026-11-22/orders-mobile-v1.webp'),
  },
  warehouse:{
    desktop:desktop('/art/world-scenes/review/2026-11-22/warehouse-desktop-v1.webp'),
    mobile:mobile('/art/world-scenes/review/2026-11-23/warehouse-mobile-v1.webp'),
  },
} as const;
