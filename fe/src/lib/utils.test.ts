import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-2 py-1", "bg-red-500");
    expect(result).toContain("px-2");
    expect(result).toContain("py-1");
    expect(result).toContain("bg-red-500");
  });

  it("should resolve conflicting Tailwind classes to the last one", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
    expect(result).not.toContain("px-2");
  });

  it("should handle falsy values gracefully", () => {
    const result = cn("base", undefined, null, false, "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
  });
});
