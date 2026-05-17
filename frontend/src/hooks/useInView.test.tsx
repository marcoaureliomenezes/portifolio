import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInView } from "./useInView";

function Probe() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="probe" data-in-view={inView ? "true" : "false"} />
  );
}

describe("useInView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an IntersectionObserver and observes the bound element", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const ObserverSpy = vi.fn().mockImplementation(() => ({
      observe,
      unobserve: vi.fn(),
      disconnect,
      takeRecords: () => [],
    }));
    Object.defineProperty(globalThis, 'IntersectionObserver', { value: ObserverSpy, writable: true, configurable: true });

    render(<Probe />);
    expect(ObserverSpy).toHaveBeenCalled();
    expect(observe).toHaveBeenCalled();
  });

  it("falls through to inView=true when IntersectionObserver is unavailable (graceful fallback)", () => {
    Object.defineProperty(globalThis, 'IntersectionObserver', { value: undefined, writable: true, configurable: true });
    const { getByTestId } = render(<Probe />);
    expect(getByTestId("probe").getAttribute("data-in-view")).toBe("true");
  });
});
