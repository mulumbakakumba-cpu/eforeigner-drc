INSERT INTO "Payment"
(
  "id",
  "journeyId",
  "type",
  "amount",
  "currency",
  "status",
  "createdAt"
)
SELECT
  'payment-' || gen_random_uuid()::text,
  rj."id",
  'RESIDENCE_PERMIT',
  100,
  'USD',
  'PENDING',
  NOW()
FROM "ResidenceJourney" rj
INNER JOIN "Application" a
  ON a."id" = rj."applicationId"
WHERE a."id" = 'cmt04lsy20002vdkwy597piq8'
  AND NOT EXISTS (
    SELECT 1
    FROM "Payment" p
    WHERE p."journeyId" = rj."id"
      AND p."status" = 'PENDING'
  );