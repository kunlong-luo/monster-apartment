/** Static WebP files are handled by the Next image loader in both
 * development and GitHub Pages static export. The standalone tsc check does
 * not generate next-env.d.ts, so preserve a minimal structural image type. */
declare module '*.webp' {
  const image: {
    src: string;
    width: number;
    height: number;
    blurDataURL?: string;
    blurWidth?: number;
    blurHeight?: number;
  };
  export default image;
}
