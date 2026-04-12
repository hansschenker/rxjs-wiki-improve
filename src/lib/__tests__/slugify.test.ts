import { describe, it, expect } from "vitest";
import { slugify } from "../slugify";

describe("slugify", () => {
  it("converts a basic title to a slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("collapses consecutive special chars into a single hyphen", () => {
    expect(slugify("hello--world")).toBe("hello-world");
    expect(slugify("hello---world")).toBe("hello-world");
    expect(slugify("hello - world")).toBe("hello-world");
    expect(slugify("foo!!bar$$baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
    expect(slugify("---leading")).toBe("leading");
    expect(slugify("trailing---")).toBe("trailing");
    expect(slugify("!hello!")).toBe("hello");
  });

  it("trims surrounding whitespace before processing", () => {
    expect(slugify("  hello  ")).toBe("hello");
    expect(slugify("  spaced out  ")).toBe("spaced-out");
    expect(slugify("\thello\n")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
    expect(slugify("---")).toBe("");
  });

  it("passes through an already-valid slug unchanged", () => {
    expect(slugify("already-valid")).toBe("already-valid");
    expect(slugify("abc123")).toBe("abc123");
  });

  it("handles numeric-only titles", () => {
    expect(slugify("2024")).toBe("2024");
    expect(slugify("42 is the answer")).toBe("42-is-the-answer");
  });

  it("handles mixed case and special characters", () => {
    expect(slugify("Transformer Architecture")).toBe("transformer-architecture");
    expect(slugify("What is GPT-4?")).toBe("what-is-gpt-4");
    expect(slugify("C++ & Rust: A Comparison")).toBe("c-rust-a-comparison");
  });
});
