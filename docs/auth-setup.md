# Firebase & MongoDB Setup

Follow these steps to enable authentication and the database for the project.

1. Add environment variables
   - Copy `.env.local.example` to `.env.local` and fill values:
     - NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID
     - FIREBASE_PROJECT_ID
     - FIREBASE_CLIENT_EMAIL (service account email)
     - FIREBASE_PRIVATE_KEY (the private key string; replace newlines with `\n` in env file)
     - MONGODB_URI (your MongoDB connection URI)

2. Create a Firebase project
   - Enable Email/Password sign-in in Authentication → Sign-in methods.
   - Create a Service Account (Project Settings → Service accounts) and copy `client_email` and `private_key` into the env variables.

3. Install dependencies
   - Run: `pnpm install` (or `npm install` / `yarn`)

4. Start the dev server
   - `pnpm dev`

5. First user to register will automatically be made `ADMIN` (server logic sets role ADMIN when users collection is empty). After that, admin can change roles in Admin → All Users.

Notes:
- The server verifies Firebase ID tokens using the Admin SDK before writing/reading user profiles.
- Tasks are managed via Admin → Task Engine and stored in `tasks` collection in MongoDB.

If you want, I can add environment validation checks that run at startup and show a clear error message if any required config is missing.
