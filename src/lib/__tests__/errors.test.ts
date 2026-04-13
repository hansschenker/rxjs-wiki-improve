import { describe, it, expect } from "vitest";
import { getErrorMessage } from "../errors";

describe("getErrorMessage", () => {
  it("returns .message from an Error instance", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns .message from an Error subclass", () => {
    class CustomError extends Error {
      constructor(msg: string) {
        super(msg);
        this.name = "CustomError";
      }
    }
    expect(getErrorMessage(new CustomError("custom boom"))).toBe("custom boom");
  });

  it("returns the string directly when error is a string", () => {
    expect(getErrorMessage("something went wrong")).toBe(
      "something went wrong",
    );
  });

  it("returns default fallback for null", () => {
    expect(getErrorMessage(null)).toBe("An unexpected error occurred");
  });

  it("returns default fallback for undefined", () => {
    expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
  });

  it("returns default fallback for a plain object", () => {
    expect(getErrorMessage({ code: 42 })).toBe("An unexpected error occurred");
  });

  it("returns default fallback for a number", () => {
    expect(getErrorMessage(404)).toBe("An unexpected error occurred");
  });

  it("uses custom fallback when provided", () => {
    expect(getErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });

  it("handles Error with empty message", () => {
    expect(getErrorMessage(new Error(""))).toBe("");
  });
});
