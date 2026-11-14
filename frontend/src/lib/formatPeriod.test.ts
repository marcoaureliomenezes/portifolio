import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPeriod, yearRange, yearsSince } from "./formatPeriod";

describe("yearRange", () => {
  it.each([
    ["04-2015 a 07-2018", "2015–18"],
    ["08-2016 to 08-2017", "2016–17"],
    ["03/2010 bis 09/2012", "2010–12"],
    ["04/2015 a 07/2018", "2015–18"],
    ["01-2015 bis 02-2015", "2015"],
    ["04-2015 a 07-2018 (3a 4m)", "2015–18"],
    ["04-2015 to 07-2018 (3y 4m)", "2015–18"],
    ["04/2015 bis 07/2018 (3 J. 4 M.)", "2015–18"],
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

  it("is 0 when the earliest start is in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    expect(yearsSince(["01-2030 a Presente"], new Date())).toBe(0);
  });
});

describe("formatPeriod", () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    ["02-2024 a Presente", "pt", "fev. de 2024 – Presente · 2 anos 8 meses"],
    ["02-2024 to Present", "en", "Feb 2024 – Present · 2 yrs 8 mths"],
    ["02/2024 bis Heute", "de", "Feb. 2024 – Heute · 2 J 8 Mon."],
    ["07-2022 a 02-2024", "pt", "jul. de 2022 – fev. de 2024 · 1 ano 7 meses"],
    ["07-2022 to 02-2024", "en", "Jul 2022 – Feb 2024 · 1 yr 7 mths"],
    ["07/2022 bis 02/2024", "de", "Juli 2022 – Feb. 2024 · 1 J 7 Mon."],
    ["04-2015 a 07-2018 (3a 4m)", "pt", "abr. de 2015 – jul. de 2018 · 3 anos 3 meses"],
    ["04-2015 to 07-2018 (3y 4m)", "en", "Apr 2015 – Jul 2018 · 3 yrs 3 mths"],
    ["04/2015 bis 07/2018 (3 J. 4 M.)", "de", "Apr. 2015 – Juli 2018 · 3 J 3 Mon."],
    ["05/2021 bis Heute (5 J. 1 M.)", "de", "Mai 2021 – Heute · 5 J 5 Mon."],
  ] as const)("renders %s in %s as %s", (raw, lang, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    expect(formatPeriod(raw, lang)).toBe(expected);
  });

  it.each(["Jan 2021 – Present", "not a period", "2015 a 2018"])("returns %s unchanged", (raw) => {
    expect(formatPeriod(raw, "de")).toBe(raw);
  });
});
