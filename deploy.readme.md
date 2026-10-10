# Deployment: GitHub → Docker Hub → Dokploy

This setup publishes two images to the private Docker Hub repository `khalids01/ecommerce-shops`. Dokploy fetches this GitHub repo, reads `docker-compose.production.yml`, pulls the images and injects runtime configuration from the Compose service's Environment settings.

Each shop has separate application containers, PostgreSQL, Redis, domains, credentials and backups. The production Compose file contains web/API only; provision PostgreSQL and Redis separately in Dokploy.

## Quick start for the current `ecommerce` branch

1. In GitHub Actions settings, set secret `DOCKERHUB_TOKEN` to a Docker Hub read/write token. Set variables `BRAND=foodshop` (or your actual brand) and `VITE_SERVER_URL` to your real public HTTPS API URL.
2. In Dokploy, connect branch `ecommerce`, select `docker-compose.production.yml`, configure private Docker Hub registry credentials, and supply the service environment described below.
3. Push the committed release with `git push origin ecommerce` and wait for **Publish Docker images** to succeed.
4. Copy `IMAGE_TAG=sha-<full-commit>` from the Actions summary into Dokploy and deploy. For a moving tag, use `IMAGE_TAG=ecommerce`, deploying only after the complete workflow succeeds.

This publishes images automatically on push; pulling and deploying remain a Dokploy action. Do not enable Dokploy's GitHub-push deployment trigger: it can run before the new images exist.

## Files

| File | Purpose |
| --- | --- |
| `.github/workflows/publish-images.yml` | Publish images on a push to `ecommerce` or `main`, or manually from Actions |
| `docker/web.Dockerfile` | Build and run the SSR web app |
| `docker/api.Dockerfile` | Generate the Prisma client, build and run the API |
| `.dockerignore` | Keep local env files, credentials, dependencies and test artifacts out of build context |
| `docker-compose.production.yml` | Pull images and start application containers in Dokploy |
| `scripts/publish-images.sh` | Build and publish from your PC |

Both Dockerfiles preserve workspace source and the frozen dependency installation because runtime imports reference workspace packages. This initial packaging also retains development dependencies; it is not a minimal production dependency image. Bun is pinned to the repo's package-manager version, 1.3.3. Builds use package build scripts, not root `build`, which loads test environment values.

## 1. Docker Hub credentials

Create a personal access token in Docker Hub account settings with **Read & Write** permission for publishing. Save it in GitHub repository **Settings → Secrets and variables → Actions → Secrets**:

```text
DOCKERHUB_TOKEN=<Docker Hub publishing token>
```

The workflow logs in as `khalids01`. The PC's saved login is independent of GitHub Actions. Dokploy also needs its own registry login with read access. Do not commit tokens or put them in Docker build arguments.

For local publication, authenticate as this account:

```bash
docker login --username khalids01
```

Use a Docker Hub token when prompted for the password. Saved credentials were detected on this PC, but the earlier read-only repository check returned 404, so private repository access still needs confirmation through a successful authenticated pull or publication.

## 2. GitHub public build variables

In **Settings → Secrets and variables → Actions → Variables**, configure:

| Variable | Example | Required |
| --- | --- | --- |
| `BRAND` | `foodshop` | Yes: `foodshop`, `bestsky` or `airshop` |
| `VITE_SERVER_URL` | `https://api.shop.example.com` | Yes |
| `VITE_ENABLE_POLAR` | `false` | Defaults to false |
| `VITE_OWNER_SETUP_CHECK` | `false` | Defaults to false |
| `AUTH_SESSION_COOKIE_NAME` | `better-auth.session_token` | Defaults to this value |

Replace example domains with your actual domains. These values are public web build configuration. Changing the browser configuration requires rebuilding the web image; changing Dokploy env alone will not rewrite its browser bundle. Keep the corresponding Dokploy values equal to the values used to build the selected image.

The workflow builds one selected shop per run, using repository variable `BRAND`. To build a different shop, change its public variables and run the workflow. This is not a multi-shop build matrix. Do not publish different API URLs/configuration under the same brand/commit tag; use a new commit for changed build configuration.

The default target architecture is `linux/amd64`; select a matching target if your VPS is ARM. Workflow builds and local builds must target the same architecture for a given release.

## 3. The three workflows

### Push to GitHub and publish images

Commit your intended changes, then:

```bash
git push origin ecommerce
```

The Actions workflow builds and pushes:

```text
khalids01/ecommerce-shops:web-foodshop-sha-<full-commit>
khalids01/ecommerce-shops:api-foodshop-sha-<full-commit>
```

After both succeed, it updates branch-specific moving tags, such as `web-foodshop-ecommerce` and `api-foodshop-ecommerce` for a push to `ecommerce` (`*-main` for `main`). The Actions summary shows the exact `IMAGE_TAG=sha-<full-commit>` to deploy. Tags include the brand so different shop images can coexist in your single Docker Hub repository. Treat SHA tags as immutable; Docker Hub itself does not enforce that rule with this configuration.

### Push to GitHub without Docker builds

Include `[skip docker]` in the latest commit message:

```bash
git commit -m "docs: update deployment guide [skip docker]"
git push origin ecommerce
```

Stage the intended files before committing. The publishing job is skipped; other workflows can still run. Only the latest commit message in the push is checked. A push to a branch other than `ecommerce` or `main` also does not trigger image publication. No separate repository is required.

Correction to the earlier chat proposal: `git push -o skip-docker` is not the supported GitHub mechanism used here. Do not use it.

To build a skipped commit later: open **Actions → Publish Docker images → Run workflow**, select `ecommerce` or `main` and run it. GitHub requires the dispatch workflow to exist on the repository default branch for the Run workflow button. Manual runs bypass `[skip docker]`.

### Build locally and publish to Docker Hub

Commit your changes first; the script refuses a dirty checkout. It uses the same Dockerfiles and commit tag scheme as CI.

```bash
docker login --username khalids01
BRAND=foodshop VITE_SERVER_URL=https://api.shop.example.com bun run images:publish
```

Optional public flags can be supplied as environment variables on the same command. For an ARM VPS use `BUILD_PLATFORM=linux/arm64` with an appropriately configured Buildx builder. The default is `linux/amd64`.

Both images are built and pushed. The script prints the Dokploy `IMAGE_TAG`. It does not change the moving `main` tags. Use the same public configuration as CI if publishing the same commit; avoid overwriting an existing release with different build values.

## 4. Prepare PostgreSQL, Redis and application prerequisites

Create a dedicated PostgreSQL database and Redis service for this shop. Put them on a network reachable by the API (`dokploy-network` is used here), and use their internal service DNS names in connection URLs. `localhost` inside the API container refers to that container, not your VPS or a separate database container. Avoid publishing database ports to the internet.

Before application deployment, provision the schema required by the selected release and the RBAC/owner prerequisites described in `docs/ecommerce-runtime-operations-v3.md`. Docker builds only generate the Prisma client; neither builds nor container startup apply migrations, seed data or create an owner. Review the exact database target, migration state and backups before separately applying schema changes. No database operation was performed as part of creating this setup.

Configure OAuth apps, SMTP and file storage as needed. The server currently requires all three OAuth provider ID/secret pairs even if you intend to use only one provider. Use real provider configuration for enabled sign-in flows. File uploads require your separately provisioned file server.

## 5. Configure Dokploy

1. Create a project/environment for the shop and a **Docker Compose** service (regular Compose, not Swarm Stack).
2. Connect the GitHub repository and select `ecommerce` (the current release branch), or `main` if that is your intended release source.
3. Set the Compose file path to `docker-compose.production.yml` at the repository root.
4. Configure Docker Hub registry authentication for `khalids01` with a token that can read the private repository. Use Dokploy's registry settings and select/associate the registry where the installed version requires it. Registry host: `docker.io`. The credential must be available on the deployment server.
5. Disable automatic deployment on the initial GitHub push. Wait for image publication before deploying.
6. Enter runtime values in this **Compose service's Environment settings**. Values in a project environment must be inherited or copied into this service; verify they reach its generated `.env`.

Dokploy writes service variables to `.env`. Compose passes that file to the API using `env_file`, and explicitly maps the web server's variables. Do not put `DOCKERHUB_TOKEN` in the application environment; configure registry authentication separately.

Example service environment (replace placeholders):

```dotenv
BRAND=foodshop
IMAGE_TAG=sha-REPLACE_WITH_FULL_PUBLISHED_COMMIT
VITE_SERVER_URL=https://api.shop.example.com
VITE_ENABLE_POLAR=false
VITE_OWNER_SETUP_CHECK=false
AUTH_SESSION_COOKIE_NAME=better-auth.session_token

DATABASE_URL=postgresql://SHOP_USER:URL_ENCODED_PASSWORD@POSTGRES_SERVICE:5432/SHOP_DATABASE
REDIS_URL=redis://:URL_ENCODED_PASSWORD@REDIS_SERVICE:6379
REDIS_KEY_PREFIX=foodshop:
BETTER_AUTH_SECRET=REPLACE_WITH_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
BETTER_AUTH_URL=https://api.shop.example.com
CORS_ORIGIN=https://shop.example.com
GITHUB_CLIENT_ID=REPLACE_ME
GITHUB_CLIENT_SECRET=REPLACE_ME
GOOGLE_CLIENT_ID=REPLACE_ME
GOOGLE_CLIENT_SECRET=REPLACE_ME
DISCORD_CLIENT_ID=REPLACE_ME
DISCORD_CLIENT_SECRET=REPLACE_ME
ENABLE_POLAR=false
OWNER_SETUP_CHECK=false
COURIER_WORKERS_ENABLED=false
```

Generate an auth secret locally with `openssl rand -hex 32`. Never reuse the example placeholders.

Compose fixes `NODE_ENV=production`, `E2E_MODE=false`, API port 3000 and web port 3001. Leave `VITE_PORT` out of the service env. Optional server variables are defined in `packages/env/src/env.server.ts`: SMTP, file server, cookie domain, Polar and courier credentials/encryption keys. Set `AUTH_COOKIE_DOMAIN` to the appropriate parent domain only when the auth flow needs a shared cookie across web/API subdomains. Configure provider callback URLs for the public API domain and verify sign-in after deployment.

Courier workers default to disabled in the example until you intentionally enable them with the proper provider credentials. If enabling Polar, supply its required server variables and rebuild the web image with `VITE_ENABLE_POLAR=true`.

## 6. Domains and first deployment

Point your web/API DNS records at the VPS. In Dokploy's Compose **Domains** settings:

| Domain | Service | Container port |
| --- | --- | --- |
| `shop.example.com` | `web` | `3001` |
| `api.shop.example.com` | `api` | `3000` |

Enable HTTPS. Compose joins the existing external `dokploy-network`; Dokploy normally creates it. There are no fixed container names or published host ports, so independent projects can coexist.

After both images appear in Docker Hub and the schema/runtime prerequisites are ready, set the exact `IMAGE_TAG` from the Actions summary or local script output and click **Deploy**. Dokploy pulls the two images and starts the containers; it does not build application images from source.

Inspect both service logs and health state. API `/health/live` is a process health check, not proof of database readiness. The web health check fetches `/`, so it can also fail when the landing page cannot render.

Verify the deployed release:

```bash
curl --fail https://api.shop.example.com/health/live
curl --fail --head https://shop.example.com/
```

Then verify sign-in/session behavior, catalog access and a supervised order flow. Successful image builds alone do not establish deployment or merchant acceptance.

## 7. Updates and rollback

For a controlled release: push to `ecommerce` (or `main`), wait for Actions to finish, copy its exact SHA tag into Dokploy `IMAGE_TAG`, then deploy.

For a moving release: set `IMAGE_TAG=ecommerce` for this branch (`main` for the main branch), wait for Actions to finish, then deploy. `pull_policy: always` makes Dokploy refresh the tags. Updating the two moving tags is not atomic; deploy only after the entire workflow succeeds. This setup intentionally leaves deployment as a Dokploy action and has no webhook secret or automatic release trigger.

For rollback: set `IMAGE_TAG` to the previous known-good SHA tag and deploy. Confirm its web build variables match the service environment. Application rollback does not undo database changes; confirm schema compatibility first.

## Troubleshooting

- **Denied/unauthorized pulling images:** check the Dokploy registry login on the deployment server, token permissions and exact private repository name. GitHub/PC authentication does not grant VPS access.
- **Manifest unknown:** confirm both brand/SHA tags exist. Never deploy while publication is incomplete.
- **Brand mismatch:** use the image built for the configured `BRAND`.
- **Browser still calls the previous API URL:** rebuild the web image with the correct `VITE_SERVER_URL`, then deploy that new tag.
- **API exits on environment validation:** complete the required variables, including OAuth credentials, and leave Polar disabled until configured.
- **Database connection fails:** use reachable internal service names and confirm credentials/network membership and schema prerequisites.
- **Missing dokploy-network:** confirm Dokploy's network exists on the deployment server before deploying this Compose file.

## Status and references

On 2026-10-10, both Dockerfiles were built locally with frozen dependencies (foodshop web build using the placeholder public URL `https://api.example.com`). API compilation, Prisma client generation, and web client/SSR compilation passed. Compose interpolation and the local publishing script syntax were checked. These local check images are not release images: configure your actual public API URL in GitHub before publishing. No registry push/pull, GitHub Actions run, VPS deployment, or database change was performed. Runtime images retain workspace source and development dependencies.

- [Docker Hub login in GitHub Actions](https://github.com/docker/login-action)
- [Dokploy Compose environment and deployment configuration](https://docs.dokploy.com/docs/core/docker-compose)
- [Dokploy Compose domains](https://docs.dokploy.com/docs/core/docker-compose/domains)
- [GitHub workflow skip instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
- Existing project operations guide: `docs/ecommerce-runtime-operations-v3.md`
