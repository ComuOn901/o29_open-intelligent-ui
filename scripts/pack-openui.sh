#!/bin/sh
# Builds the OpenUI 1.0 packages from a checkout of thesysdev/openui on branch
# release/openui-1.0 and packs them into vendor/openui, where package.json
# installs them from. Usage: scripts/pack-openui.sh [path-to-openui-checkout]
set -eu

OPENUI_DIR="$(cd "${1:-../openui-1.0-release}" && pwd)"
OUT="$(cd "$(dirname "$0")/.." && pwd)/vendor/openui"
PNPM="npx --yes pnpm@10.33.0"

branch="$(git -C "$OPENUI_DIR" branch --show-current)"
if [ "$branch" != "release/openui-1.0" ]; then
  echo "expected $OPENUI_DIR on release/openui-1.0, found $branch" >&2
  exit 1
fi

mkdir -p "$OUT"
rm -f "$OUT"/*.tgz
# Build order follows the workspace dependencies.
for pkg in observability lang-core devtools react-lang react-headless react-ui; do
  (cd "$OPENUI_DIR/packages/$pkg" && $PNPM run build && $PNPM pack --pack-destination "$OUT")
done
echo "Packed into $OUT. Run npm install to pick them up."
