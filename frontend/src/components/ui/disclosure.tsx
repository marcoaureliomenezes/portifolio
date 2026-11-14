/**
 * disclosure.tsx — the disclosure primitives of the portfolio.
 *
 *   <Disclosure>          — Radix Collapsible root (controlled or default state)
 *     <CollapsibleTrigger> — the caller's trigger
 *     <DisclosureContent>  — height-animated (collapsible-down/up keyframes)
 *   </Disclosure>
 *
 * ARIA: callers needing a section heading wrap the trigger in the heading
 * element (`<h2><CollapsibleTrigger/></h2>`) — heading-wraps-button is the
 * correct disclosure pattern (never button-wraps-heading).
 */

import * as React from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const Disclosure = Collapsible;

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

export { Disclosure, DisclosureContent };
