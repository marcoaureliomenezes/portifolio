import { Award } from "lucide-react";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { CertificationCard } from "./CertificationCard";
import type { ContentData, Certification } from "@/types/content";

/**
 * Certifications — T-RD-07 (AC-RD-05).
 *
 * Was: per-category collapsibles, each cert a full-width row → 1,828px (33% of
 * the page) for 11 certs. Now: flat provider captions + responsive tile grid
 * (2-col md / 3-col lg). No nested collapsibles — the section-level disclosure
 * (MobileCollapsibleSection) is the only fold.
 */

// Provider logos (absolute paths — D-3). Falls back to a text caption.
const PROVIDER_ICONS: Record<string, string> = {
  AWS: "/images/aws_icon.png",
  Azure: "/images/azure_icon.png",
  Databricks: "/images/databricks_icon.png",
};

interface CertificationsSectionProps {
  content: ContentData;
}

function groupByCategory(certifications: Certification[]): Record<string, Certification[]> {
  return certifications.reduce<Record<string, Certification[]>>((acc, cert) => {
    if (!acc[cert.category]) acc[cert.category] = [];
    acc[cert.category].push(cert);
    return acc;
  }, {});
}

export function CertificationsSection({ content }: CertificationsSectionProps) {
  const byCategory = groupByCategory(content.certifications);

  return (
    <section
      id="certificacoes"
      aria-labelledby="certificacoes-heading"
      className="motion-safe:animate-fade-up"
    >
      <MobileCollapsibleSection
        title={content.certificationsTitle}
        icon={Award}
        headingId="certificacoes-heading"
      >
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, certs]) => (
            <div key={category}>
              {/* Slim provider caption — replaces the old collapsible pill */}
              <div className="flex items-center gap-2 mb-3">
                {PROVIDER_ICONS[category] ? (
                  <img
                    src={PROVIDER_ICONS[category]}
                    alt={category}
                    loading="lazy"
                    decoding="async"
                    className="h-5 object-contain"
                  />
                ) : (
                  <h3 className="text-sm font-semibold text-foreground">
                    {category}
                  </h3>
                )}
                <span className="font-mono text-xs text-muted-foreground">
                  {certs.length}{" "}
                  {certs.length !== 1 ? content.certPlural : content.certSingular}
                </span>
              </div>

              <div
                data-testid={`cert-grid-${category}`}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {certs.map((cert) => (
                  <CertificationCard key={cert.name} cert={cert} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </MobileCollapsibleSection>
    </section>
  );
}
