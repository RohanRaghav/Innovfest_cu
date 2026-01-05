# Referral Codes

Referral codes are generated as:
- First 5 alphanumeric characters of the email local part (before @), plus the last 5 digits of phone (numeric-only), upper-cased. Example: `johnsmith` + `9001234567` => `JOHNS34567` (sliced as needed).
- If phone or email parts are missing, a random code is generated.

Admins can resend referral codes and the system ensures uniqueness by appending a small suffix when needed.
