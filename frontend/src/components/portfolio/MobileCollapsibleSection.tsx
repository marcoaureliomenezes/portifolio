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
  children: React.ReactNode;
}

/**
 * Generic collapsible wrapper used on mobile (md:hidden) to wrap a section.
 * On desktop, the parent `*Section` component renders a plain card directly.
 */
export function MobileCollapsibleSection({
  title,
  icon: Icon,
  iconColor = "text-primary",
  defaultOpen = true,
  children,
}: MobileCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible className="md:hidden" open={open} onOpenChange={setOpen}>
      <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                )}
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                {title}
              </div>
              {open ? (
                <ChevronUp className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-primary" />
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
