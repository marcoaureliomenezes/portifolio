import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { track } from "@dadaia/analytics-sdk";
import { CodeBlock } from "../CodeBlock";

vi.mock("@dadaia/analytics-sdk", () => ({ track: vi.fn() }));

const CODE = "uv tool install thing\nthing run --fast \n";

describe("CodeBlock", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => vi.clearAllMocks());

  const setup = (onCopy?: () => void) =>
    render(<CodeBlock code={CODE} copyLabel="Copy" copiedLabel="Copied" onCopy={onCopy} />);

  it("renders the text in a pre", () => {
    const { container } = setup();
    expect(container.querySelector("pre")?.textContent).toBe(CODE);
  });

  it("writes exactly the code to the clipboard", async () => {
    setup();
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith(CODE);
  });

  it("calls onCopy once after a successful copy", async () => {
    const onCopy = vi.fn();
    setup(onCopy);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
  });

  it("does not call onCopy when the write rejects", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const onCopy = vi.fn();
    setup(onCopy);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole("button").textContent).toContain("Copy");
    expect(screen.getByRole("button").textContent).not.toContain("Copied");
  });

  it("switches the label from copyLabel to copiedLabel after copying", async () => {
    setup();
    expect(screen.getByRole("button").textContent).toBe("Copy");
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("button").textContent).toBe("Copied"));
  });

  it("fires no track() itself", async () => {
    const onCopy = vi.fn();
    setup(onCopy);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
    expect(track).not.toHaveBeenCalled();
  });
});
