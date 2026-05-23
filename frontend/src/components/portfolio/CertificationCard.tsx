import { ExternalLink, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Certification, ContentData } from "@/types/content";

interface CertificationCardProps {
  cert: Certification;
  labels: Pick<ContentData, "validUntil" | "viewCredential" | "issuerLabel" | "seeMore" | "seeLess">;
  defaultOpen?: boolean;
}

export function CertificationCard({ cert, labels }: CertificationCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border/30 hover:border-accent/40 shadow-soft ml-6">
      <div className="flex items-center justify-between p-4 md:p-5 gap-3">
        {/* Left: icon + name + level + date */}
        <div className="flex items-center gap-3 min-w-0">
          {cert.icon ? (
            <img
              src={cert.icon}
              alt={`${cert.name} badge`}
              loading="lazy"
              decoding="async"
              className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 object-contain"
            />
          ) : (
            <Medal className="w-10 h-10 text-primary flex-shrink-0" />
          )}
          <div className="min-w-0 space-y-1">
            <h4 className="font-bold text-foreground text-xs md:text-sm leading-snug line-clamp-2">
              {cert.name}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {cert.level}
              </Badge>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">{cert.date}</span>
            </div>
          </div>
        </div>

        {/* Right: credential link */}
        {cert.link && cert.link !== "#" && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-shrink-0 gap-1.5 text-xs"
          >
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">{labels.viewCredential}</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
