# Food Network Migration Plan — /foodnetwork

Migrate **foodnetwork.com** into the `srm0233-adobe/demos/foodnetwork` site section (Document Authoring), covering the **homepage + one recipe detail page**, with **full design + header/footer chrome**, and all **images downloaded into `/foodnetwork/media`**.

**Status: APPROVED — recipe URL + target path confirmed.** Execution requires **Execute mode** — this turn is still plan mode (read-only), so I can't run scrape/import/build/publish commands yet. Switch to Execute mode and I'll begin at Phase 1.

## Goal & Scope

- **Sources:**
  - Homepage: https://www.foodnetwork.com/
  - Recipe detail (`recipe` template): **https://www.foodnetwork.com/recipes/sunny-anderson/apple-cider-chicken-recipe-1952273**
- **Target paths:**
  - Homepage → `/foodnetwork/` (index)
  - Recipe → **`/foodnetwork/apple-cider-chicken`** (short slug, confirmed)
- **Site target:** `https://content.da.live/srm0233-adobe/demos/foodnetwork/` → published on `main--demos--srm0233-adobe`.
- **Templates:** 2 — `home` (homepage) and `recipe` (recipe detail).
- **Design:** extract Food Network's design tokens (colors, fonts, spacing) into a scoped theme; build header nav + footer as reusable fragments in the `/foodnetwork` folder.
- **Images:** downloaded from the Food Network CDN into `content/foodnetwork/media/` and referenced locally.

## Key Constraints & Notes

- **Fresh, unrelated site** from the existing `att-brand-center` work. All new work namespaced under `/foodnetwork/` — no changes to att-brand-center content; shared block/CSS changes stay backward-compatible.
- **Design isolation:** Food Network's look (red/black brand, its own fonts) must not bleed into att-brand-center. Scope Food Network design via a template/theme class (e.g. a `foodnetwork` theme) rather than overwriting global `styles/brand.css` / `styles.css` tokens.
- **Reusable blocks first:** reuse existing blocks (cards, hero, columns, section-hero, etc.) where they fit; create new Food Network-specific variants only where the design requires.
- **DA authoring gotchas (proven this session):** block tables use `<th colspan="2">` headers to convert correctly; section metadata as proper tables; content lives in DA (git-ignored), code lives in git.
- **Bot protection:** foodnetwork.com may block automated scraping; use the scrape tool's Bright Data fallback if needed.
- **Fonts:** if Food Network uses licensed/proprietary fonts, fall back to the closest web-safe/Google font (can't rehost licensed fonts).

## Workflow

### Phase 0 — Setup & scoping
- [x] Confirm the recipe detail URL (`/recipes/sunny-anderson/apple-cider-chicken-recipe-1952273`).
- [x] Confirm recipe target path → short slug **`/foodnetwork/apple-cider-chicken`**.
- [ ] Set up `/foodnetwork` project context (profile/target under `srm0233-adobe/demos`, `/foodnetwork` base path).
- [ ] Create `content/foodnetwork/media/` for downloaded assets.

### Phase 1 — Scrape & analyze source
- [ ] Scrape the homepage: DOM, metadata, image inventory (download images → `/foodnetwork/media`).
- [ ] Scrape the recipe page: DOM, metadata, images.
- [ ] Analyze both pages → identify sections, content sequences, block variants; produce authoring analysis.

### Phase 2 — Templates & block mapping
- [ ] Create `tools/importer/page-templates.json` with `home` + `recipe` templates.
- [ ] Map DOM selectors to blocks; decide reuse vs. new variants (e.g. recipe-hero, ingredients/steps, recipe-meta, homepage feature rails).
- [ ] Build any new block variants (JS/CSS) needed for Food Network layouts.

### Phase 3 — Import infrastructure & content
- [ ] Generate parsers + transformers (cleanup, sections; image → `/foodnetwork/media` rewrite).
- [ ] Generate import script(s); run import → produce `content/foodnetwork/index.plain.html` + `content/foodnetwork/apple-cider-chicken.plain.html`.
- [ ] Review/adjust parsers so content maps cleanly.

### Phase 4 — Design migration
- [ ] Extract Food Network design tokens (colors, typography, spacing) into a **scoped** Food Network theme (not the global att-brand-center tokens).
- [ ] Style the homepage + recipe blocks to match the source (visual verification per block).
- [ ] Resolve fonts (rehost/Google/system fallback).

### Phase 5 — Header & footer chrome
- [ ] Build the Food Network **nav** fragment (`/foodnetwork/nav`) — global header/menu, wired via the header block's dual-fetch.
- [ ] Build the Food Network **footer** fragment (`/foodnetwork/footer`).
- [ ] Ensure `/foodnetwork` pages fetch the Food Network nav/footer (not att-brand-center's).

### Phase 6 — Publish & verify
- [ ] Upload pages, nav, footer, and media to DA; preview + publish each.
- [ ] Verify blocks decorate, design applies, images load from `/foodnetwork/media`, nav/footer render.
- [ ] Commit all code to `main`; push.
- [ ] Full-page visual QA of homepage + recipe page vs. the source.

## Deliverables

- `/foodnetwork/` (homepage) + **`/foodnetwork/apple-cider-chicken`** (recipe) published pages
- `/foodnetwork/nav` + `/foodnetwork/footer` reusable fragments
- `content/foodnetwork/media/` with downloaded images
- New/updated block code + a scoped Food Network theme, committed to `main`
- `tools/importer/` artifacts (templates, parsers, transformers, import script)

## Open Questions (confirm at execution start)

- [ ] Whether the homepage's personalized/dynamic rails should be captured as **static snapshots** (best-effort, since the live site is JS-rendered and may vary) — default: yes, snapshot what's rendered at scrape time.

## Checklist (high-level)

- [x] Phase 0 — Recipe URL + short slug confirmed (remaining setup runs in Execute mode)
- [ ] Phase 1 — Scrape & analyze homepage + recipe page
- [ ] Phase 2 — Templates, block mapping, new variants
- [ ] Phase 3 — Import infrastructure & content import
- [ ] Phase 4 — Scoped design migration + fonts
- [ ] Phase 5 — Header nav + footer fragments
- [ ] Phase 6 — Publish, verify, visual QA, commit

> **Plan approved; recipe URL and short slug (`/foodnetwork/apple-cider-chicken`) locked in.** All open decisions are resolved (I'll default to snapshotting the homepage's dynamic rails as rendered). To start, I need **Execute mode** — plan mode is read-only and blocks the scrape/import/build/publish steps. Switch to Execute mode and I'll begin Phase 1: scrape and analyze the homepage and the apple-cider-chicken recipe page, downloading images into `/foodnetwork/media`.
