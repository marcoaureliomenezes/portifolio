/**
 * AvatarImageModal.test.tsx — T-QA-03
 *
 * Targets:
 *  - modal opens when trigger is clicked
 *  - ESC closes the modal
 *  - focus returns to trigger after closing
 *  - role="dialog" and aria-modal="true" present when open
 *
 * Strategy: mirrors EmailModal.test.tsx — same Radix Dialog polyfill
 * strategy. AvatarImageModal renders a full-size img inside the dialog.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll } from "vitest";
import { AvatarImageModal } from "./AvatarImageModal";

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
// Helper: render AvatarImageModal with a simple button trigger
// --------------------------------------------------------------------------

function renderAvatarModal() {
  const triggerLabel = "Ver avatar";
  render(
    <AvatarImageModal
      avatarUrl="https://example.com/avatar.png"
      name="Marco Aurelio"
      trigger={<button>{triggerLabel}</button>}
    />
  );
  return { triggerButton: screen.getByRole("button", { name: triggerLabel }) };
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("AvatarImageModal", () => {
  it("trigger is rendered before dialog opens", () => {
    const { triggerButton } = renderAvatarModal();
    expect(triggerButton).toBeInTheDocument();
  });

  it("dialog is NOT present before trigger is clicked", () => {
    renderAvatarModal();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("dialog opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderAvatarModal();

    await user.click(triggerButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("dialog has aria-modal='true' when open", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderAvatarModal();

    await user.click(triggerButton);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("avatar image is rendered inside the dialog", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderAvatarModal();

    await user.click(triggerButton);

    const img = screen.getByAltText("Foto de Marco Aurelio");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("dialog closes when ESC is pressed", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderAvatarModal();

    await user.click(triggerButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focus returns to trigger after ESC closes the dialog", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderAvatarModal();

    await user.click(triggerButton);
    await user.keyboard("{Escape}");

    expect(triggerButton).toHaveFocus();
  });

  it("dialog title contains the person's name (sr-only)", async () => {
    const user = userEvent.setup();
    const { triggerButton } = renderAvatarModal();

    await user.click(triggerButton);

    // The DialogTitle is in sr-only, but it's still in the DOM
    expect(screen.getByText("Foto de Marco Aurelio")).toBeInTheDocument();
  });
});
