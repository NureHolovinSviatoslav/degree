import { describe, it, expect } from "vitest";
import { formatDateToYYYYMMDD } from "./parseDate";

describe("formatDateToYYYYMMDD", () => {
  it("should format a regular date correctly", () => {
    const date = new Date(2024, 0, 15);
    expect(formatDateToYYYYMMDD(date)).toBe("2024-01-15");
  });

  it("should pad single-digit month and day with zeros", () => {
    const date = new Date(2023, 2, 5);
    expect(formatDateToYYYYMMDD(date)).toBe("2023-03-05");
  });

  it("should return NaN-based string for an invalid date", () => {
    const invalid = new Date("not-a-date");
    const result = formatDateToYYYYMMDD(invalid);
    expect(result).toContain("NaN");
  });
});
