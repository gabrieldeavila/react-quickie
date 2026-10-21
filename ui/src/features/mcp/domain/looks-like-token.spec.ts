import { describe, expect, it } from "vitest";
import { looksLikeToken, SECRET_MASK } from "./looks-like-token";

describe("looksLikeToken", () => {
  it("flags long single-word values with letters and digits", () => {
    expect(looksLikeToken("ghp_1234567890abcdefghijKLMN")).toBe(true);
    expect(looksLikeToken("sk-live-0a1b2c3d4e5f6g7h8i9j")).toBe(true);
  });

  it("leaves references, masks, short values and sentences alone", () => {
    expect(looksLikeToken("${GITHUB_TOKEN}")).toBe(false);
    expect(looksLikeToken("Bearer ${GITHUB_TOKEN_WITH_LONG_NAME}")).toBe(false);
    expect(looksLikeToken(SECRET_MASK)).toBe(false);
    expect(looksLikeToken("eu-west-1")).toBe(false);
    expect(looksLikeToken("this has 20 plus characters and spaces")).toBe(false);
    expect(looksLikeToken("abcdefghijklmnopqrstuvwxyz")).toBe(false);
  });
});
