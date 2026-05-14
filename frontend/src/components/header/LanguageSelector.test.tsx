/**
 * LanguageSelector.test.tsx — T-QA-03
 *
 * Targets:
 *  - renders 3 language options (pt / en / de)
 *  - calling onValueChange propagates through onLanguageChange
 *  - current value matches the `language` prop
 *
 * Strategy: Radix Select renders its content into a portal and requires
 * pointer events for interaction in jsdom. Rather than fight with portal
 * setup, we mock the Radix Select primitives with lightweight wrappers
 * that expose the value, options, and onChange callback as standard DOM
 * elements. This correctly tests the LanguageSelector logic (option list,
 * value propagation, short/full label switching) without testing the
 * design system component.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { SupportedLanguages } from "@/types/content";

// --------------------------------------------------------------------------
// Mock Radix Select primitives
// --------------------------------------------------------------------------

// The known locale values for the LanguageSelector component.
const LANG_VALUES = ["pt", "en", "de"] as const;

vi.mock("@/components/ui/select", () => {
  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value: string;
      onValueChange: (v: string) => void;
      children: React.ReactNode;
    }) => (
      <div data-testid="select-root" data-value={value}>
        {/* Native select with all known options so fireEvent.change works */}
        <select
          data-testid="select-native"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        >
          {LANG_VALUES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        {/* Children rendered for item/value visibility tests */}
        {children}
      </div>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="select-trigger">{children}</div>
    ),
    SelectValue: ({ children }: { children?: React.ReactNode }) => (
      <span data-testid="select-value">{children}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({
      value,
      children,
    }: {
      value: string;
      children: React.ReactNode;
    }) => (
      <button data-testid={`select-item-${value}`} data-value={value}>
        {children}
      </button>
    ),
  };
});

// Import after mock so the module sees the stubbed primitives
import { LanguageSelector } from "./LanguageSelector";

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("LanguageSelector", () => {
  it("renders 3 language options (pt, en, de)", () => {
    render(
      <LanguageSelector language="pt" onLanguageChange={vi.fn()} />
    );

    expect(screen.getByTestId("select-item-pt")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-en")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-de")).toBeInTheDocument();
  });

  it("option labels are correct human-readable names", () => {
    render(
      <LanguageSelector language="pt" onLanguageChange={vi.fn()} />
    );

    expect(screen.getByText("Português")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
  });

  it("current value reflects the language prop (pt)", () => {
    render(
      <LanguageSelector language="pt" onLanguageChange={vi.fn()} />
    );

    const root = screen.getByTestId("select-root");
    expect(root).toHaveAttribute("data-value", "pt");
  });

  it("current value reflects the language prop (en)", () => {
    render(
      <LanguageSelector language="en" onLanguageChange={vi.fn()} />
    );

    const root = screen.getByTestId("select-root");
    expect(root).toHaveAttribute("data-value", "en");
  });

  it("current value reflects the language prop (de)", () => {
    render(
      <LanguageSelector language="de" onLanguageChange={vi.fn()} />
    );

    const root = screen.getByTestId("select-root");
    expect(root).toHaveAttribute("data-value", "de");
  });

  it("calls onLanguageChange with the new locale when selection changes", () => {
    const onLanguageChange = vi.fn();

    render(
      <LanguageSelector language="pt" onLanguageChange={onLanguageChange} />
    );

    // Use fireEvent.change on the native <select> element in the mock
    const nativeSelect = screen.getByTestId("select-native");
    fireEvent.change(nativeSelect, { target: { value: "en" } });

    expect(onLanguageChange).toHaveBeenCalledWith("en" as SupportedLanguages);
  });

  it("calls onLanguageChange with 'de' when Deutsch is selected", () => {
    const onLanguageChange = vi.fn();

    render(
      <LanguageSelector language="pt" onLanguageChange={onLanguageChange} />
    );

    const nativeSelect = screen.getByTestId("select-native");
    fireEvent.change(nativeSelect, { target: { value: "de" } });

    expect(onLanguageChange).toHaveBeenCalledWith("de" as SupportedLanguages);
  });

  it("compact mode renders short label (PT) in the trigger value", () => {
    render(
      <LanguageSelector language="pt" onLanguageChange={vi.fn()} compact />
    );

    // compact mode shows current?.short in SelectValue
    expect(screen.getByTestId("select-value")).toHaveTextContent("PT");
  });

  it("compact mode renders EN for English", () => {
    render(
      <LanguageSelector language="en" onLanguageChange={vi.fn()} compact />
    );

    expect(screen.getByTestId("select-value")).toHaveTextContent("EN");
  });
});
