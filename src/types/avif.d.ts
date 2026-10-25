/* The painted game assets live beside the PixiJS source. Next's static
 * import loader emits their hashed URLs for both dev and Pages basePath. */
declare module '*.avif' {
  import type {StaticImageData} from 'next/image';
  const image:StaticImageData;
  export default image;
}
