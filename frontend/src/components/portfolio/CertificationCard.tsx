import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Certification, ContentData } from "@/types/content";

interface CertificationCardProps {
  cert: Certification;
  labels: Pick<ContentData, "validUntil" | "viewCredential" | "issuer">;
  defaultOpen?: boolean;
}

function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function CertificationCard({
  cert,
  labels,
  defaultOpen = true,
}: CertificationCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card rounded-xl border border-border/30 overflow-hidden motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-1 hover:border-accent/40 shadow-soft hover:shadow-large ml-6">
        <CollapsibleTrigger className="w-full p-4 md:p-6 text-left hover:bg-accent/5 transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {cert.icon ? (
                <img
                  src={cert.icon}
                  alt={`${cert.name} badge`}
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 md:w-16 md:h-16 flex-shrink-0 object-contain"
                />
              ) : (
                <Medal className="w-10 h-10 md:w-16 md:h-16 text-primary flex-shrink-0" />
              )}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-xs md:text-base line-clamp-1">
                  {cert.name}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {cert.level}
                  </Badge>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-muted-foreground text-xs">{cert.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-primary">
              {open ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 md:px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <p className="text-foreground text-sm leading-relaxed">
              {descExpanded ? cert.description : truncateText(cert.description)}
            </p>
            {cert.description.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
              >
                {descExpanded ? "Ver menos" : "Ver mais"}
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="text-xs text-muted-foreground">
              <p>
                <span className="font-semibold">{labels.validUntil}:</span>{" "}
                {cert.validity}
              </p>
              <p>
                <span className="font-semibold">{labels.issuer}:</span> {cert.issuer}
              </p>
            </div>
            {cert.link && cert.link !== "#" && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(cert.link, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                {labels.viewCredential}
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
