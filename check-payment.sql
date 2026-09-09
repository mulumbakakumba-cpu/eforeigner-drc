SELECT
  a."id" AS "applicationDbId",
  a."applicationId",
  rj."id" AS "journeyId",
  rj."percentage",
  rj."currentStep",
  p."id" AS "paymentId",
  p."type",
  p."amount",
  p."currency",
  p."status"
FROM "Application" a
INNER JOIN "ResidenceJourney" rj
  ON rj."applicationId" = a."id"
LEFT JOIN "Payment" p
  ON p."journeyId" = rj."id"
WHERE a."id" = 'cmt04lsy20002vdkwy597piq8';