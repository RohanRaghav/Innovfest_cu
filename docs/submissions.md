# Submissions & Media Uploads

This project uses Cloudinary unsigned uploads from the client to store user proof media.

Steps to configure:
1. In Cloudinary, create an unsigned upload preset (Settings → Upload → Upload presets → Add upload preset → choose Unsigned and note the preset name).
2. Add env vars in `.env.local`:
   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
3. Client components upload the selected file directly to Cloudinary using the preset, then call the server API `/api/submissions` with the `mediaUrl` returned from Cloudinary.

Server side:
- `POST /api/submissions` — create a submission (authenticated). Requires `taskId` and `mediaUrl`.
- `GET /api/submissions` — for admin (all) and zone heads (zone-limited)
- `GET /api/submissions/me` — returns own submissions
- `PATCH /api/submissions/[id]` — Admin or Zone Head reviews and either APPROVE or REJECT. On APPROVE, user's `points` field is incremented and a record is inserted into `evaluations` collection.

UI:
- Task list has `SubmitProof` component to upload files and create submissions.
- Admin page has `Submissions` tab for review.

Notes:
- This is a minimal implementation; you may want to add server-side validations, virus scanning, rate limits, and better error handling.
