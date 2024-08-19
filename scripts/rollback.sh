#!/bin/bash
cd /app
yarn install
yarn ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:revert -d ./data-source.ts
