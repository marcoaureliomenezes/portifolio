import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";

interface MobileCollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  defaultOpen?: boolean;
  headingId?: string;
  children: React.ReactNode;
}

/**
 * Single-render collapsible section that works on ALL viewport sizes.
 * Replaces the previous desktop-card + mobile-collapsible double-render pattern
 * which caused GPU compositing glitches on Android Chrome (hidden elements
 * with images were still rasterized and bled through visible layers).
 */
export function MobileCollapsibleSection({
  title,
  icon: Icon,
  iconColor = "text-primary",
  defaultOpen = true,
  headingId,
  children,
}: MobileCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="w-full shadow-medium border-0 bg-card transition-shadow duration-300">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-4">
            <CardTitle
              id={headingId}
              className="text-lg md:text-2xl font-bold text-foreground flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} aria-hidden="true" />
                )}
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" aria-hidden="true" />
                {title}
              </div>
              {open ? (
                <ChevronUp className="h-5 w-5 text-primary" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 text-primary" aria-hidden="true" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
