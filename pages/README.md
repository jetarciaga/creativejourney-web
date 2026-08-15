# Temporary Next.js compatibility directory

This directory intentionally contains no route files. Next.js 16 requires the
App Router and Pages Router directories to share a parent when both are found;
the empty root directory keeps the legacy Vite `src/pages` tree out of the
rebuild while that tree remains available for Stage 7 cleanup.
