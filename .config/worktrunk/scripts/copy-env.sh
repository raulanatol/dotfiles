#!/usr/bin/env sh
set -e

TASK_PATH="$1"

if [ -z "$TASK_PATH" ]; then
    echo "Task path not provided, aborting .env copy" >&2
    exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "Copying .env* files from $REPO_ROOT to $TASK_PATH"

mkdir -p "$TASK_PATH"

ENV_FILES_FOUND=$(find "$REPO_ROOT" -maxdepth 1 -type f -name ".env*")

if [ -z "$ENV_FILES_FOUND" ]; then
    echo "No .env* files found in $REPO_ROOT, nothing to copy"
    exit 0
fi

for f in $ENV_FILES_FOUND; do
    echo " - Copying $(basename "$f")"
    cp "$f" "$TASK_PATH"/
done

echo ".env* files copy completed"
