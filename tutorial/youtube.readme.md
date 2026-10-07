# Connect the tutorial YouTube channel

This integration reuses `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, the existing API server, owner login, and Redis. It does not upload videos yet.

## Google setup

1. In the Google Cloud project for the existing OAuth client, enable **YouTube Data API v3**.
2. Edit that existing **Web application** OAuth client. Keep its Google sign-in redirect URI and add:
   - Local: `http://localhost:3000/integrations/youtube/callback` if your `BETTER_AUTH_URL` uses that origin.
   - Production: `https://YOUR-API-DOMAIN/integrations/youtube/callback`.
3. The callback origin is derived from `BETTER_AUTH_URL`; match its scheme, hostname, and port exactly. The path is `/integrations/youtube/callback` (with the correct spelling).
4. Configure the consent screen for YouTube upload and read-only permissions. When the app is in testing, add your channel's Google account as a test user. Choose the intended channel during authorization.

Existing Google sign-in continues to use `/api/auth/callback/google`. The YouTube callback handles channel authorization separately with the same OAuth client.

## Server setup

Add to the API environment (Dokploy environment for production):

```dotenv
YOUTUBE_ENABLED=true
# Recommended: pin the channel ID after confirming it in YouTube Studio.
YOUTUBE_CHANNEL_ID=UC_your_channel_id
```

`YOUTUBE_CHANNEL_ID` is optional. Leave it unset for the first connection if you do not know the ID; the Tutorials page shows the connected ID. Set it and restart afterwards to pin future connections. Existing connections should be disconnected and reconnected when changing the intended channel.

Use the existing `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, `REDIS_URL`, and unique `REDIS_KEY_PREFIX`. No new port or client secret is required. Enable this on the deployment where you manage tutorial production.

Restart the API after updating its environment. Sign in as the platform owner, open **Admin → Tutorials → Connect YouTube**, choose the channel account, and approve both permissions. You return to Tutorials with the connected channel name and ID.

Stay signed in through the flow. The callback requires the same owner session that started authorization. Starting on one hostname and returning to a different API hostname can prevent the session cookie from reaching the callback.

## Storage and permissions

- Authorization state is random, bound to the owner and session, expires after ten minutes, and is consumed once. The flow also uses PKCE.
- Refresh tokens are encrypted with AES-256-GCM in Redis, scoped by the existing Redis prefix. Tokens never appear in the browser status response.
- Keep Redis persistent and protect backups. Clearing Redis, changing the auth secret, or changing the Google client requires reconnecting. Back up the corresponding configuration securely as well.
- Disconnect removes this deployment's stored credentials; it does not revoke the shared Google client's grant. You can revoke access in your Google account when needed.
- External OAuth apps in testing can receive refresh tokens that expire after seven days for these scopes. Consent-screen publishing and Google's API upload compliance audit are separate processes.

## Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/integrations/youtube/status` | GET | Owner-only connection metadata |
| `/integrations/youtube/connect` | POST | Start channel authorization |
| `/integrations/youtube/callback` | GET | Google redirect, owner-session and state checks |
| `/integrations/youtube/disconnect` | POST | Remove local credentials |

## Next stage: uploading and playback

A separate uploader still needs to exchange the refresh token for access tokens, upload reviewed videos, and save their YouTube IDs in the tutorial catalog. The current player also needs YouTube iframe support. Connecting the channel does not publish a video or change existing tutorial media.

Google restricts uploads from unaudited API projects created after 28 July 2020 to private viewing until the API project passes its compliance audit. An unlisted tutorial workflow therefore depends on completing that audit where applicable.

References: [YouTube server OAuth](https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps), [refresh token expiration](https://developers.google.com/identity/protocols/oauth2#expiration), [upload restrictions](https://developers.google.com/youtube/v3/docs/videos/insert).
