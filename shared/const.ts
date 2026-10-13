// Compatibility name used only by the legacy tRPC logout mutation. The primary
// REST logout clears both Supabase cookies; clearing this refresh cookie makes
// the fallback tRPC logout unable to revive a web session.
export const COOKIE_NAME = "lb_refresh_token";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
