/**
 * Claude (Anthropic) for outbound + inbound email copy. Server-side only.
 *
 * ANTHROPIC_API_KEY — required to enable AI copy.
 * ANTHROPIC_MODEL — optional; overrides default (see Anthropic models docs).
 * CLAUDE_COPY_DISABLED=true — keep key installed but force template-only copy.
 */

/** Default when ANTHROPIC_MODEL is unset. Older IDs may 404 on the API — confirm in Anthropic models docs. */
export const CLAUDE_DEFAULT_MODEL = "claude-sonnet-4-6";

export function anthropicApiKey(): string {
  return process.env.ANTHROPIC_API_KEY?.trim() ?? "";
}

export function claudeModelId(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || CLAUDE_DEFAULT_MODEL;
}

export function isClaudeCopyConfigured(): boolean {
  if (String(process.env.CLAUDE_COPY_DISABLED ?? "").toLowerCase() === "true") return false;
  return Boolean(anthropicApiKey());
}
