SELECT
  a."applicationId",
  a."id" AS "applicationDbId",
  rj."id" AS "journeyId",
  rj."percentage",
  rj."currentStep",
  rj."status"
FROM "Application" a
LEFT JOIN "ResidenceJourney" rj
  ON rj."applicationId" = a."id"
WHERE a."applicationId" = 'cmt04lsy20002vdkwy597piq8';