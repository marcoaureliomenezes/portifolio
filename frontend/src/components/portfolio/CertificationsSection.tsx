import { SectionHeading } from "./SectionHeading";
import type { ContentData } from "@/types/content";

/**
 * CertificationsSection: the certifications of the home page as one flat list.
 *
 * Input: `content.certificationsTitle` and `content.certifications`, in content order.
 * Output: `section#certificacoes` with its heading and one `ul`; each entry shows
 * `<name> · <level>` and an `<issuer> · <date>` line. The name links to the
 * credential only when `link` is not `#`.
 * Side effects: none.
 */
interface CertificationsSectionProps {
  content: ContentData;
}

export function CertificationsSection({ content }: CertificationsSectionProps) {
  return (
    <section
      id="certificacoes"
      aria-labelledby="certificacoes-heading"
      className="motion-safe:animate-fade-up"
    >
      <SectionHeading id="certificacoes-heading">
        {content.certificationsTitle}
      </SectionHeading>
      <ul className="mt-4 space-y-3">
        {content.certifications.map((cert) => (
          <li key={cert.id}>
            <p className="text-sm text-foreground">
              {cert.link !== "#" ? (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  {cert.name}
                </a>
              ) : (
                cert.name
              )}{" "}
              · {cert.level}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {cert.issuer} · {cert.date}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
