const INSTRUCTION_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Same rule as the API: lowercase letters, digits and dashes, up to 64. */
export function isValidInstructionId(id: string): boolean {
  return INSTRUCTION_ID.test(id);
}

/** "Landing Pages (v2)" → "landing-pages-v2"; accents are folded. */
export function idFromName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/, "");
}
