import type { z } from "zod";
import type { MediaSchema } from "@/lib/schemas/projects";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DiagramAsset } from "./DiagramAsset";

const BOX = "w-full h-auto max-w-full";

export function Media({ media }: { media: z.infer<typeof MediaSchema> }) {
  const { ref, inView } = useInView<HTMLElement>();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const wide = useMediaQuery("(min-width: 640px)");

  let body = null;
  if (media.type === "svg") {
    body = <DiagramAsset light={media.light} dark={media.dark} alt={media.alt} />;
  } else {
    const cut = wide ? media.desktop : media.phone;
    const size = { width: cut.width, height: cut.height };
    if (reduced) {
      body = <img src={cut.poster} alt={media.alt} className={BOX} {...size} />;
    } else if (inView) {
      body = (
        <video
          aria-label={media.alt}
          className={BOX}
          poster={cut.poster}
          preload="none"
          autoPlay
          muted
          loop
          playsInline
          {...size}
        >
          <source src={cut.webm} type="video/webm" />
          <source src={cut.mp4} type="video/mp4" />
        </video>
      );
    }
  }

  return (
    <figure ref={ref}>
      {body}
      {media.caption && <figcaption className="text-meta">{media.caption}</figcaption>}
    </figure>
  );
}
