/**
 * disclosure.tsx — T-RD-03 (AC-RD-03)
 *
 * The ONE disclosure pattern of the portfolio. Replaces the three divergent
 * collapsible treatments (section card-header, certs gradient pill, role card)
 * with a single anatomy:
 *
 *   <Disclosure>            — Radix Collapsible root (controlled or default state)
 *     <DisclosureTrigger>   — full-width button; appends ONE chevron that
 *                             rotates 180° (no ChevronUp/Down element swapping)
 *     <DisclosureContent>   — height-animated (collapsible-down/up keyframes)
 *   </Disclosure>
 *
 * ARIA: callers needing a section heading wrap the trigger in the heading
 * element (`<h2><DisclosureTrigger/></h2>`) — heading-wraps-button is the
 * correct disclosure pattern (never button-wraps-heading).
 */

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const Disclosure = Collapsible;

const DisclosureTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsibleTrigger> & {
    /** Extra classes for the chevron icon. */
    chevronClassName?: string;
  }
>(({ className, children, chevronClassName, ...props }, ref) => (
  <CollapsibleTrigger
    ref={ref}
    className={cn(
      "group/disclosure flex w-full items-center justify-between gap-2 text-left",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown
      aria-hidden="true"
      data-testid="disclosure-chevron"
      className={cn(
        "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
        "group-data-[state=open]/disclosure:rotate-180",
        chevronClassName,
      )}
    />
  </CollapsibleTrigger>
));
DisclosureTrigger.displayName = "DisclosureTrigger";

const DisclosureContent = React.forwardRef<
  React.ElementRef<typeof CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsibleContent>
>(({ className, ...props }, ref) => (
  <CollapsibleContent
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=open]:motion-safe:animate-collapsible-down data-[state=closed]:motion-safe:animate-collapsible-up",
      className,
    )}
    {...props}
  />
));
DisclosureContent.displayName = "DisclosureContent";

export { Disclosure, DisclosureTrigger, DisclosureContent };
