/**
 * EmailModal.test.tsx — T-QA-03
 *
 * Targets:
 *  - modal opens on trigger click
 *  - ESC closes the modal (dialog disappears from DOM)
 *  - focus returns to trigger after closing
 *  - role="dialog" and aria-modal="true" present when open
 *
 * Strategy: Radix Dialog renders into a portal attached to document.body.
 * @testing-library/user-event handles keyboard events including ESC.
 * We stub ResizeObserver (not available in jsdom) so Radix doesn't throw.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll } from "vitest";
import { EmailModal } from "./EmailModal";

// --------------------------------------------------------------------------
// jsdom polyfills required by Radix Dialog
// --------------------------------------------------------------------------

beforeAll(() => {
  if (typeof window.ResizeObserver === "undefined") {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// --------------------------------------------------------------------------
// Helper: render EmailModal with a simple button trigger
// --------------------------------------------------------------------------

function renderEmailModal() {
  const triggerLabel = "Abrir email";
  render(
    <EmailModal
      email="test@example.com"
      trigger={<button>{triggerLabel}</button>}
    />
  );
  return { triggerButton: screen.getByRole("button", { name: triggerLabel }) };
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("EmailModal", () => {
  it("trigger is rendered before dialog opens", () => {
    const { triggerButton } = renderEmailModal();
    expect(triggerButton).toBeInTheDocument();
  });

  it("dialog is NOT present before trigger is clicked", () => {
    renderEmailModal();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("dialog opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderEmailModal();

    await user.click(triggerButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("dialog has aria-modal='true' when open", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderEmailModal();

    await user.click(triggerButton);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders the email address inside the dialog", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderEmailModal();

    await user.click(triggerButton);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("dialog closes when ESC is pressed", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderEmailModal();

    await user.click(triggerButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focus returns to trigger after ESC closes the dialog", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderEmailModal();

    await user.click(triggerButton);
    await user.keyboard("{Escape}");

    expect(triggerButton).toHaveFocus();
  });

  it("dialog closes via the X close button", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderEmailModal();

    await user.click(triggerButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Radix Dialog injects a close button with sr-only "Close" text
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
