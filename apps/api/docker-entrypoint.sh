#!/bin/sh
set -e

if [ "${AUTO_SEED:-0}" = "1" ]; then
	node dist/scripts/seed.js
fi

exec node dist/index.js
