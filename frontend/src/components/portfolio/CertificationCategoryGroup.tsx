import { useState } from "react";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CertificationCard } from "./CertificationCard";
import type { Certification, ContentData } from "@/types/content";

const PROVIDER_ICONS: Record<string, string> = {
  AWS: "images/aws_icon.png",
  Azure: "images/azure_icon.png",
  Databricks: "images/databricks_icon.png",
};

interface CertificationCategoryGroupProps {
  category: string;
  certs: Certification[];
  labels: Pick<ContentData, "validUntil" | "viewCredential" | "issuerLabel" | "seeMore" | "seeLess" | "certSingular" | "certPlural">;
  defaultOpen?: boolean;
}

export function CertificationCategoryGroup({
  category,
  certs,
  labels,
  defaultOpen = true,
}: CertificationCategoryGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const providerIcon = PROVIDER_ICONS[category] ?? null;

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
      <div className="pl-8">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 md:gap-3">
                {providerIcon ? (
                  <img
                    src={providerIcon}
                    alt={category}
                    loading="lazy"
                    decoding="async"
                    className="h-8 md:h-10 object-contain"
                  />
                ) : (
                  <>
                    <Trophy className="w-4 h-4 md:w-6 md:h-6 text-yellow-600" />
                    <h3 className="text-sm md:text-xl font-bold text-foreground">
                      {category}
                    </h3>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-primary">
                <span className="text-xs md:text-sm text-muted-foreground">
                  {certs.length} {certs.length !== 1 ? labels.certPlural : labels.certSingular}
                </span>
                {open ? (
                  <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3 md:mt-4 space-y-3 md:space-y-4">
            {certs.map((cert) => (
              <CertificationCard
                key={cert.name}
                cert={cert}
                labels={{
                  validUntil: labels.validUntil,
                  viewCredential: labels.viewCredential,
                  issuerLabel: labels.issuerLabel,
                  seeMore: labels.seeMore,
                  seeLess: labels.seeLess,
                }}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
