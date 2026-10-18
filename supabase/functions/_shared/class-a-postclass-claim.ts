/**
 * Recheck the database-returned claim state before any provider call.
 * The CLASS[Λ] legacy fail-closed BEFORE UPDATE trigger rewrites a requested
 * "processing" transition to "skipped". PostgreSQL UPDATE ... RETURNING
 * still yields a row in that case, so row existence alone is not a claim.
 *
 * This guard blocks sending until a reviewed, production-verified governance
 * migration permits processing specifically for the authorized sender.
 */
export function postclassClaimAccepted(
  row: { id: number | string; status: string } | null | undefined,
  expectedId: number | string
): boolean {
  return Boolean(row && String(row.id) === String(expectedId) && row.status === "processing");
}
