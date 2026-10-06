#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Commit your changes before publishing images tagged with a Git commit.' >&2
  exit 1
fi
: "${BRAND:?Set BRAND to foodshop, bestsky or airshop}"
: "${VITE_SERVER_URL:?Set VITE_SERVER_URL to your public API URL}"
case "$BRAND" in foodshop|bestsky|airshop) ;; *) echo 'Invalid BRAND' >&2; exit 1 ;; esac
image_repository=khalids01/ecommerce-shops
image_tag="sha-$(git rev-parse HEAD)"
build_platform="${BUILD_PLATFORM:-linux/amd64}"
docker buildx build --platform "$build_platform" --push \
  --file docker/api.Dockerfile \
  --tag "$image_repository:api-$BRAND-$image_tag" .
docker buildx build --platform "$build_platform" --push \
  --file docker/web.Dockerfile \
  --build-arg "BRAND=$BRAND" \
  --build-arg "VITE_SERVER_URL=$VITE_SERVER_URL" \
  --build-arg "VITE_ENABLE_POLAR=${VITE_ENABLE_POLAR:-false}" \
  --build-arg "VITE_OWNER_SETUP_CHECK=${VITE_OWNER_SETUP_CHECK:-false}" \
  --build-arg "AUTH_SESSION_COOKIE_NAME=${AUTH_SESSION_COOKIE_NAME:-better-auth.session_token}" \
  --tag "$image_repository:web-$BRAND-$image_tag" .
printf '\nBoth images published. Set Dokploy IMAGE_TAG=%s\n' "$image_tag"
