import { afterEach, describe, expect, it, vi } from "vitest";
import { yearRange, yearsSince } from "./formatPeriod";

describe("yearRange", () => {
  it.each([
    ["04-2015 a 07-2018", "2015–18"],
    ["08-2016 to 08-2017", "2016–17"],
    ["03/2010 bis 09/2012", "2010–12"],
    ["04/2015 a 07/2018", "2015–18"],
    ["01-2015 bis 02-2015", "2015"],
  ])("reads %s as %s", (raw, expected) => {
    expect(yearRange(raw)).toBe(expected);
  });

  it.each(["not a period", "05-2021 a Presente", "05-2021 to present", "01-2020 bis Heute", "2015 a 2018"])(
    "returns %s unchanged",
    (raw) => {
      expect(yearRange(raw)).toBe(raw);
    },
  );
});

describe("yearsSince", () => {
  afterEach(() => vi.useRealTimers());

  const periods = ["05-2021 a Presente", "11-2020 a 05-2021"];

  it("counts whole years from the earliest start, before the anniversary month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    expect(yearsSince(periods, new Date())).toBe(5);
  });

  it("counts whole years from the earliest start, at the anniversary month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-15T12:00:00Z"));
    expect(yearsSince(periods, new Date())).toBe(6);
  });

  it("reads the slash form and the to and bis separators", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    expect(yearsSince(["06/2019 to 01/2020", "02/2018 bis 05/2019"], new Date())).toBe(8);
  });
});
