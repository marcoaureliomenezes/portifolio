import { Award } from "lucide-react";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { CertificationCategoryGroup } from "./CertificationCategoryGroup";
import type { ContentData, Certification } from "@/types/content";

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
  const labels = {
    validUntil: content.validUntil,
    viewCredential: content.viewCredential,
    issuerLabel: content.issuerLabel,
    seeMore: content.seeMore,
    seeLess: content.seeLess,
    certSingular: content.certSingular,
    certPlural: content.certPlural,
  };

  const groups = Object.entries(byCategory).map(([category, certs]) => (
    <CertificationCategoryGroup
      key={category}
      category={category}
      certs={certs}
      labels={labels}
    />
  ));

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
        <div className="space-y-8">{groups}</div>
      </MobileCollapsibleSection>
    </section>
  );
}
