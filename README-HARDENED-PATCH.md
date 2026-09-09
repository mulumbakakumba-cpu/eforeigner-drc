eForeigner DRC - Hardened Patch

Basis: uploaded eforeigner-drc-full(1).zip. This patch is intentionally file-scoped so it does not overwrite newer local work you may have made after creating the ZIP.

Changes included:
1. Idempotent application creation with Prisma P2002 replay handling.
2. Idempotency replay checked before writing uploaded files.
3. Duplicate/race uploads cleaned up.
4. Confirmation email sent only for a newly created application.
5. Visa form duplicate handleSubmit removed; submit state/error handling fixed.
6. Birth date and arrival date persisted to Application.
7. Safer DRC application identifier generation.
8. Registration validates input, hashes with bcrypt cost 12, and never returns password hash.
9. Admin role update validates roles and prevents self-demotion.
10. Application status PATCH validates status and allows officer/admin.
11. Receipt endpoint requires authentication and owner/officer/admin authorization.
12. Officer application detail page requires officer/admin authorization.
13. Officer journey API accepts officer/admin, matching service policy.
14. Public tracking no longer exposes email/passport/full personal data; it returns tracking-safe fields.
15. Auth normalizes email and propagates user id into the session.
16. Audit logs gain user foreign keys and indexes.
17. Payment status and audit lookup indexes added.

Apply/verify locally:
pnpm exec prisma generate
pnpm exec prisma validate
pnpm check-types
pnpm build

If your database is already migrated, inspect migration status before applying migrations:
pnpm exec prisma migrate status

Then apply pending migrations in a controlled environment:
pnpm exec prisma migrate deploy

IMPORTANT: Do not copy .env files or secrets into source control. Keep private uploaded documents outside public/. The ZIP contained generated folders/node_modules and existing upload files; this patch does not ask you to replace those data folders.
