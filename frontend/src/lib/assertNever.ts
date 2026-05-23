/**
 * assertNever — T-PC-B-04
 *
 * TypeScript exhaustiveness helper. Placed in the `default` branch of a
 * `switch` over a discriminated union to guarantee at compile time that
 * every case is handled. If a new `kind` is added to the `Project` union
 * without updating the switch, TypeScript will emit a type error here.
 *
 * At runtime this function is unreachable when types are correct; it throws
 * as a last-resort safety net during development (e.g., when JSON data has
 * an unexpected `kind` value and the DEV Zod guard is disabled).
 *
 * Usage:
 *   switch (project.kind) {
 *     case "case-study": return <CaseStudyTemplate ... />;
 *     case "meta":       return <MetaProjectTemplate ... />;
 *     case "games":      return <GamesProjectTemplate ... />;
 *     default:           return assertNever(project);
 *   }
 */
export function assertNever(value: never): never {
  throw new Error(
    `assertNever: unhandled discriminated union value — ${JSON.stringify(value)}`,
  );
}
