/**
 * DiagramAsset.tsx — T-PC-C-02
 *
 * <picture> element with dark-mode source. When light/dark props are empty
 * strings (assets not yet available — T-PC-C-06), renders an aria-hidden
 * placeholder div + figcaption with the alt text. No broken-image squares.
 *
 * Props:
 *  - light: path to light-mode image (relative to /assets/ or absolute URL)
 *  - dark: path to dark-mode image
 *  - alt: accessible description (used as img alt; repeated in figcaption for placeholder mode)
 *
 * Accessibility:
 * - img alt carries the description.
 * - Placeholder div is aria-hidden; figcaption provides visible text.
 */

interface DiagramAssetProps {
  light: string;
  dark: string;
  alt: string;
  className?: string;
}

export function DiagramAsset({ light, dark, alt, className }: DiagramAssetProps) {
  // Placeholder mode: no assets yet (T-PC-C-06 delivers real diagrams)
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

  return (
    <figure className={className}>
      <picture>
        <source
          media="(prefers-color-scheme: dark)"
          srcSet={dark}
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
