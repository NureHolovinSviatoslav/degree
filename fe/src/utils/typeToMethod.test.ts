import { describe, it, expect } from "vitest";
import { typeToMethod } from "./typeToMethod";

describe("typeToMethod", () => {
  it("should map 'create' to POST", () => {
    expect(typeToMethod.create).toBe("POST");
  });

  it("should map 'update' to PATCH", () => {
    expect(typeToMethod.update).toBe("PATCH");
  });

  it("should return undefined for an unknown type", () => {
    expect(
      (typeToMethod as Record<string, string | undefined>)["read"],
    ).toBeUndefined();
  });
});
