import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { CertificationCategoryGroup } from "./CertificationCategoryGroup";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
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

  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      id="certificacoes"
      aria-labelledby="certificacoes-heading"
      ref={ref}
      className={cn("opacity-0", inView && "opacity-100 motion-safe:animate-fade-up")}
    >
      {/* Desktop */}
      <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle
            id="certificacoes-heading"
            className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3"
          >
            <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 flex-shrink-0" aria-hidden="true" />
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" aria-hidden="true" />
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
        headingId="certificacoes-heading"
      >
        <div className="space-y-6">{groups}</div>
      </MobileCollapsibleSection>
    </section>
  );
}
