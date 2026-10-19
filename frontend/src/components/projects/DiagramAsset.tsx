/**
 * DiagramAsset.tsx — T-PC-C-02 / T-PC-C-06 / T-PC2-R2-05
 *
 * Renders the architecture diagram with light/dark variants. When light/dark
 * props are empty strings (assets not yet available), renders an aria-hidden
 * placeholder div + figcaption with the alt text. No broken-image squares.
 *
 * rc-2 (AC-PC2-R2-04): variant switching is THEME-aware, not OS-aware. The app
 * toggles the `dark` class on <html> (useTheme), so the dark image is shown via
 * Tailwind `dark:` classes — a <source media="(prefers-color-scheme)"> would
 * ignore the manual toggle and show the wrong variant.
 *
 * Props:
 *  - light: path to light-mode image (relative to /assets/ or absolute URL)
 *  - dark?: path to dark-mode image (optional — falls back to light when absent)
 *  - alt: accessible description (used as img alt; repeated in figcaption for placeholder mode)
 *
 * Accessibility:
 * - img alt carries the description (on both variants; only one is visible).
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

  // Single-variant mode: same image regardless of theme.
  if (!dark || dark === light) {
    return (
      <figure className={className}>
        <img
          src={light}
          alt={alt}
          className="w-full rounded-lg border border-border"
          loading="lazy"
        />
      </figure>
    );
  }

  // Theme-aware mode: html.dark class decides which variant is visible.
  return (
    <figure className={className}>
      <img
        src={light}
        alt={alt}
        data-testid="diagram-light"
        className="w-full rounded-lg border border-border dark:hidden"
        loading="lazy"
      />
      <img
        src={dark}
        alt={alt}
        data-testid="diagram-dark"
        className="w-full rounded-lg border border-border hidden dark:block"
        loading="lazy"
      />
    </figure>
  );
}
