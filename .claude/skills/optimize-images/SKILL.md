---
name: optimize-images
description: Compress and convert image assets to WebP with a JPEG fallback, resize to display size, lazy-load below the fold, and hit a total-asset budget — in one planned pass, without trial-and-error reprocessing. Use when asked to compress/optimize images, shrink asset size, convert to WebP, fix a "page too heavy"/slow-loading page, or when a build ships oversized images. This project's budget: `src/assets` under 2MB, no single image over 300KB.
---

# Optimize images

Shrink and modernize image assets **in one planned pass**. This skill exists because doing it
ad-hoc caused ~10 wasted reprocessing cycles once: originals restored three times, content
recompressed thrice, a carousel recompression that *inflated* files, and a size inversion
misread as a "cwebp anomaly." All of that is avoidable by planning the whole job before touching
a file and measuring instead of guessing.

## The one rule

**Plan the whole job first; process each image exactly once, from the pristine original; change
file size by changing DIMENSIONS, not by guessing quality numbers.** Encoder output size is not
reliably monotonic in `-q` across passes with different sources — chasing quality is the trap.

## Workflow

### 1. Measure and budget *before* processing
- List assets by size:
  `find src/assets -type f \( -iname '*.jpg' -o -iname '*.png' -o -iname '*.webp' \) -exec du -k {} + | sort -rn`
- Get dimensions per image: `sips -g pixelWidth -g pixelHeight <file>`
- Find each image's **rendered** width in the component SCSS (e.g. a 400px card, a 700px
  container). **Target width = 2× rendered width** (retina), capped at the source width — never
  upscale.
- Do the budget math up front. If shipping `<picture>` (WebP **and** JPEG) for N content images,
  estimate `sum(webp) + sum(jpg) + hero/carousel + misc` against the budget
  (`du -sh src/assets` < 2MB, no file > 300KB). If it won't fit, pick the lever **now**:
  - Drop the JPEG fallback for decorative/hero images → WebP-only (WebP is ~97% supported).
  - Reduce target dimensions (the reliable size lever).
  - Do **not** try to squeeze under budget by nudging `-q`.

### 2. Delete unused assets first
For each candidate: `grep -rn "<basename>" src/ index.html` — delete only if there are zero
references. Confirm distinct names (`whaleShark` ≠ `cebuWhaleShark`). Shrinks the set you compress.

### 3. Process each image ONCE, from the pristine original
If the working-tree copy is already modified from an earlier attempt, restore it first:
`git checkout HEAD -- <path>` (and verify it's the full-size original with `sips -g pixelWidth`).
Then, per image — WebP from the pristine source, then the JPEG fallback in place:
```bash
cwebp -quiet -resize <W> 0 -q <WQ> orig.jpg -o out.webp   # W = 2x display px; WQ ~68–78 (primary)
sips -Z <W> -s format jpeg -s formatOptions <JQ> orig.jpg  # JQ ~56–64 (fallback, rarely served)
```
WebP is the path most users get — keep its quality good. The JPEG is a legacy fallback — compress
it harder.

### 4. Wire the components
```jsx
<picture>
  {imgWebp && <source srcSet={imgWebp} type="image/webp" />}
  <img src={imgJpg} alt="" loading="lazy" />
</picture>
```
Add `picture { display: contents; }` to the component's SCSS so existing `img` rules (object-fit,
absolute positioning, `width: %`, scale) keep applying unchanged. Use `loading="lazy"` **only
below the fold**; leave above-the-fold hero/carousel images eager.

### 5. Verify — measure, don't assume
- `du -sh src/assets` under budget; `find src/assets -type f -size +300k` prints nothing.
- `npm run build` succeeds and emits both `.webp` and `.jpg` for each content image.
- No dangling refs after renames/removals: `grep -rn "carousel_0[0-9]\.jpg" src/` (etc.).
- Serve the build (`npm run preview`) and **screenshot the affected pages** — `display: contents`
  layout regressions only surface in a browser, not in the build.

## Pitfalls (each cost real churn once)
- **Double-compression.** Never resize/recompress an already-processed file. Always start from a
  `git checkout HEAD --` original; re-encoding a q70 JPEG to q60 stacks artifacts.
- **Quality isn't monotonic across passes.** The same `cwebp -q 62` can yield a *larger* file than
  `-q 70` when the source or resize differs between runs. Change **dimensions** to change size.
- **Recompressing an already-optimal file inflates it.** Re-encoding well-compressed carousel
  JPEGs made them bigger. If a source is already small/efficient, leave it (or convert to WebP) —
  don't `sips`-recompress it.
- **Don't mask exit codes.** `cmd | tail` reports tail's status, not the tool's. Use
  `set -o pipefail`, or run the command alone and check `$?`.
- **"Eager" is about load timing, not format.** You can convert an above-the-fold image to WebP
  and keep it eager.

## Tools
macOS built-in `sips` (resize + JPEG re-encode) and `cwebp` (Homebrew `webp` package). No Node
dependencies required.
