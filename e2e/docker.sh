#!/usr/bin/env bash
# Runs the Playwright suite inside the official Playwright image, so visual
# baselines render identically on every machine and in CI (fonts, freetype and
# the chromium build all affect pixels). Extra args pass to `playwright test`:
#
#   npm run test-e2e                          # everything
#   npm run test-e2e -- --project=visual      # just the screenshots
#   npm run test-e2e-update-snapshots         # accept new baselines
#
# Set CONTAINER_RUNTIME=podman to prefer podman over docker.
set -euo pipefail
cd "$(dirname "$0")/.."

# the image tag must match the installed @playwright/test exactly
version=$(node -p "require('./node_modules/@playwright/test/package.json').version")
image="mcr.microsoft.com/playwright:v${version}-noble"

runtime=${CONTAINER_RUNTIME:-$(command -v docker || command -v podman || true)}
if [[ -z "$runtime" ]]; then
  echo "e2e: docker or podman is required to run the e2e suite" >&2
  exit 1
fi

# write files (results, baselines, tmp/) as the current user, not root
if [[ "$(basename "$runtime")" == "podman" ]]; then
  user_args=(--userns=keep-id)
else
  user_args=(--user "$(id -u):$(id -g)")
fi

tty_args=()
[[ -t 1 ]] && tty_args=(-t)

# label=disable: let the container read the repo on SELinux hosts without relabeling it
exec "$runtime" run --rm --init --ipc=host \
  "${user_args[@]}" "${tty_args[@]}" \
  --security-opt label=disable \
  -e HOME=/tmp \
  -e E2E_IN_CONTAINER=1 \
  -e CI \
  -v "$PWD":/work -w /work \
  "$image" \
  npx playwright test "$@"
