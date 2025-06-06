#!/bin/bash

if [ "$CF_PAGES_BRANCH" == "dev" ]; then
    pnpm build --mode development
else
    pnpm build
fi