#!/bin/sh
# Builds the OpenUI 1.0 packages from a checkout of thesysdev/openui on branch
# release/openui-1.0 and packs them into vendor/openui, where package.json
# installs them from. Usage: scripts/pack-openui.sh [path-to-openui-checkout]
# OPENUI_BRANCH names another branch to pack, e.g. fix/openui-1.0-qa.
set -eu

OPENUI_DIR="$(cd "${1:-../openui-1.0-release}" && pwd)"
OUT="$(cd "$(dirname "$0")/.." && pwd)/vendor/openui"
PNPM="npx --yes pnpm@10.33.0"

expected="${OPENUI_BRANCH:-release/openui-1.0}"
branch="$(git -C "$OPENUI_DIR" branch --show-current)"
if [ "$branch" != "$expected" ]; then
  echo "expected $OPENUI_DIR on $expected, found $branch" >&2
  exit 1
fi

mkdir -p "$OUT"
rm -f "$OUT"/*.tgz
# Build order follows the workspace dependencies.
for pkg in observability lang-core devtools react-lang react-headless react-ui; do
  (cd "$OPENUI_DIR/packages/$pkg" && $PNPM run build && $PNPM pack --pack-destination "$OUT")
done
echo "Packed into $OUT. Run npm install to pick them up."
