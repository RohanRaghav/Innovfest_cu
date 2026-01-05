# Assignments

- `POST /api/assignments` — Create task assignments. Body: `{ taskId, assigneeIds }` or `{ taskId, assignToZone: true, zone }`. Admin can assign anywhere; Zone Head can assign only within their zone.
- `GET /api/assignments` — List assignments (admin all, zone-head limited to zone, CA gets own assignments).

Assignment document fields:
- `taskId`, `assigneeId`, `assignedBy`, `zone`, `status` (PENDING/COMPLETED), `createdAt`, `updatedAt`, `points`.

When a submission is approved, the related assignment is marked COMPLETED (if present) and the user's `tasksDone` is incremented.
