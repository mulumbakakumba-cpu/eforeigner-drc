SELECT
  "id",
  "applicationId",
  "idempotencyKey"
FROM "Application"
WHERE "idempotencyKey" = 'test-idempotency-20260820';