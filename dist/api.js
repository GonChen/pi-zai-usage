/**
 * Z.ai Usage Checker - Pi Extension
 * Provider-specific API interaction using shared library primitives
 */
import { buildAuthHeaders, safeFetch, safeParseJson, UsageError, } from "@alexanderfortin/pi-usage-lib";
import { formatInstantFromEpochMs, formatTimeRemainingFromEpochMs, } from "@alexanderfortin/pi-usage-lib/datetime";
// Candidate (provider, monitor URL) pairs.
// pi ships two built-in zai providers (see docs/providers.md):
//   - zai            → https://api.z.ai        (Global, ZAI_API_KEY)
//   - zai-coding-cn  → https://open.bigmodel.cn (China, ZAI_CODING_CN_API_KEY)
// The monitor path /api/monitor/usage/quota/limit is identical on both hosts.
// Try each provider that has a key configured and return the first success.
const ZAI_ENDPOINTS = [
    { provider: "zai-coding-cn", url: "https://open.bigmodel.cn/api/monitor/usage/quota/limit" },
    { provider: "zai", url: "https://api.z.ai/api/monitor/usage/quota/limit" },
];
/**
 * Fetch Z.ai usage from the API
 *
 * Uses shared library primitives (buildAuthHeaders, safeFetch, safeParseJson)
 * for sandbox-aware auth, error handling, and JSON parsing.
 *
 * Iterates over known zai providers (zai-coding-cn, zai), using whichever one
 * has an API key configured, and picks the matching monitor endpoint host.
 */
export async function getZaiUsage(modelRegistry) {
    let lastError = null;
    let attempted = 0;
    for (const { provider, url } of ZAI_ENDPOINTS) {
        const headers = await buildAuthHeaders(modelRegistry, provider);
        // Skip providers with no key configured to avoid guaranteed 1001.
        if (!headers.Authorization)
            continue;
        attempted++;
        try {
            const response = await safeFetch(url, { headers });
            const parsed = await safeParseJson(response);
            // Z.ai API can return HTTP 200 with an error body
            // e.g. {"code":1001,"msg":"Authentication parameter not received...","success":false}
            const apiError = parsed;
            if (typeof apiError.success === "boolean" && !apiError.success && apiError.msg) {
                throw new UsageError(`Z.ai API error: ${apiError.msg}`, `api${apiError.code ?? "unknown"}`);
            }
            const data = parsed;
            const tokensLimit = data.data?.limits?.find((limit) => limit.type === "TOKENS_LIMIT");
            if (!tokensLimit) {
                throw new UsageError("TOKENS_LIMIT not found in API response", "nolimit");
            }
            const result = {
                percentage: tokensLimit.percentage,
            };
            if (tokensLimit.nextResetTime) {
                result.resetTime = formatInstantFromEpochMs(tokensLimit.nextResetTime);
                result.timeRemaining = formatTimeRemainingFromEpochMs(tokensLimit.nextResetTime);
            }
            return result;
        }
        catch (e) {
            lastError = e;
        }
    }
    if (lastError)
        throw lastError;
    throw new UsageError("No Z.ai API key configured (set ZAI_CODING_CN_API_KEY or ZAI_API_KEY)", "nokey");
}
// Re-export UsageError for consumers that need it
export { UsageError };
//# sourceMappingURL=api.js.map