import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { CertificationCategoryGroup } from "./CertificationCategoryGroup";
import type { ContentData, Certification } from "@/types/content";

interface CertificationsSectionProps {
  content: ContentData;
}

function groupByCategory(
  certifications: Certification[],
): Record<string, Certification[]> {
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
    <section id="certificacoes">
      {/* Desktop */}
      <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3">
            <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 flex-shrink-0" />
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            {content.certificationsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">{groups}</CardContent>
      </Card>

      {/* Mobile */}
      <MobileCollapsibleSection
        title={content.certificationsTitle}
        icon={Award}
        iconColor="text-yellow-600"
      >
        <div className="space-y-6">{groups}</div>
      </MobileCollapsibleSection>
    </section>
  );
}
