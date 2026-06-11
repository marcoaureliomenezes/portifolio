import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
} from "@/components/ui/disclosure";
import type { LucideIcon } from "lucide-react";

interface MobileCollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  headingId?: string;
  children: React.ReactNode;
}

/**
 * Single-render collapsible section that works on ALL viewport sizes.
 *
 * T-RD-03 redesign: built on the shared Disclosure primitive (one rotating
 * chevron, animated height) and with correct ARIA — the <h2> WRAPS the trigger
 * button (heading-wraps-button), never the inverse. Ornamental gradient bar
 * removed (C-3): the section icon + title carry the identity alone.
 */
export function MobileCollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  headingId,
  children,
}: MobileCollapsibleSectionProps) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      <Card className="w-full shadow-soft border border-border/40 bg-card">
        <CardHeader className="py-4 md:py-5">
          <h2
            id={headingId}
            className="text-xl md:text-2xl font-bold text-foreground"
          >
            <DisclosureTrigger>
              <span className="flex items-center gap-3">
                {Icon && (
                  <Icon
                    className="w-5 h-5 flex-shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                {title}
              </span>
            </DisclosureTrigger>
          </h2>
        </CardHeader>
        <DisclosureContent>
          <CardContent>{children}</CardContent>
        </DisclosureContent>
      </Card>
    </Disclosure>
  );
}
