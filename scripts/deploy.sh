#!/bin/bash
cd /app
yarn install
yarn build
yarn ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./data-source.ts
