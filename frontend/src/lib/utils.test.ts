import { describe, expect, it } from "vitest"
import { cn } from "./utils"

const STEPS = ["label", "meta", "body", "item", "hero", "title", "title-sm"]

describe("cn() treats the type-scale steps as font sizes", () => {
  it.each(STEPS)("text-%s replaces an earlier text-sm and text-xs", (step) => {
    expect(cn("text-sm", `text-${step}`)).toBe(`text-${step}`)
    expect(cn("text-xs", `text-${step}`)).toBe(`text-${step}`)
  })

  it.each(STEPS)("text-sm and text-xs replace an earlier text-%s", (step) => {
    expect(cn(`text-${step}`, "text-sm")).toBe("text-sm")
    expect(cn(`text-${step}`, "text-xs")).toBe("text-xs")
  })

  it.each(STEPS)("text-%s and a text colour both survive, in either order", (step) => {
    expect(cn(`text-${step}`, "text-header-text")).toBe(`text-${step} text-header-text`)
    expect(cn("text-header-text", `text-${step}`)).toBe(`text-header-text text-${step}`)
    expect(cn(`text-${step}`, "text-muted-foreground")).toBe(`text-${step} text-muted-foreground`)
    expect(cn("text-muted-foreground", `text-${step}`)).toBe(`text-muted-foreground text-${step}`)
  })
})
