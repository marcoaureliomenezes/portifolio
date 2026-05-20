/**
 * DiagramAsset.tsx — T-PC-C-02 / T-PC-C-06
 *
 * <picture> element with dark-mode source. When light/dark props are empty
 * strings (assets not yet available), renders an aria-hidden placeholder div
 * + figcaption with the alt text. No broken-image squares.
 *
 * Props:
 *  - light: path to light-mode image (relative to /assets/ or absolute URL)
 *  - dark?: path to dark-mode image (optional — falls back to light when absent)
 *  - alt: accessible description (used as img alt; repeated in figcaption for placeholder mode)
 *
 * Accessibility:
 * - img alt carries the description.
 * - Placeholder div is aria-hidden; figcaption provides visible text.
 */

interface DiagramAssetProps {
  light: string;
  dark?: string;
  alt: string;
  className?: string;
}

export function DiagramAsset({ light, dark, alt, className }: DiagramAssetProps) {
  // Placeholder mode: no assets yet
  if (!light) {
    return (
      <figure className={className}>
        <div
          aria-hidden="true"
          className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center"
        />
        <figcaption className="text-xs text-muted-foreground text-center mt-1">
          {alt}
        </figcaption>
      </figure>
    );
  }

  // When dark is absent, use light for both modes
  const darkSrc = dark ?? light;

  return (
    <figure className={className}>
      <picture>
        <source
          media="(prefers-color-scheme: dark)"
          srcSet={darkSrc}
        />
        <img
          src={light}
          alt={alt}
          className="w-full rounded-lg border border-border"
          loading="lazy"
        />
      </picture>
    </figure>
  );
}
