import { describe, it, expect } from "vitest";
import { toEnum } from "./toEnum";

const StatusEnum = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
} as const;

describe("toEnum", () => {
  it("should return the value when it exists in the enum", () => {
    expect(toEnum("active", StatusEnum)).toBe("active");
  });

  it("should return undefined when value is not in enum and no default given", () => {
    expect(toEnum("unknown", StatusEnum)).toBeUndefined();
  });

  it("should return the default value when value is not in enum", () => {
    expect(toEnum("missing", StatusEnum, "fallback")).toBe("fallback");
  });
});
