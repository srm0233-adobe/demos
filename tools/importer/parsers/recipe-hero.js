/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: recipe-hero
 * Base block: hero (custom "recipe lead")
 * Source: Food Network recipe detail — apple-cider-chicken-recipe-1952273
 *
 * The recipe lead is authored across TWO DOM instances that live side-by-side
 * under a shared parent (#mod-recipe-lead-1 .recipe-lead):
 *   - div.recipeLead        → the video poster / hero photo (+ WATCH button)
 *   - #mod-recipe-summary-1  → attribution (eyebrow + author avatar), title, rating
 * A third sibling (div.recipeInfo) is a DIFFERENT block (recipe-meta) and must
 * be left untouched.
 *
 * Because both hero instances are matched by page-templates.json, this parser
 * fires twice against the same shared parent. It builds the full block on the
 * FIRST invocation (reading from the shared parent so BOTH regions are still
 * present) and simply removes the leftover second region on the SECOND
 * invocation — guarded by a marker so exactly one block is produced.
 *
 * Emitted block table (matches blocks/recipe-hero/recipe-hero.js decorate):
 *   Row 1 (media):   | <hero photo>        | WATCH |   (2 cells → header colspan=2)
 *   Row 2 (content): | eyebrow attribution |
 *   Row 3 (content): | author avatar       |         (picture-only cell → avatar)
 *   Row 4 (content): | title heading       |
 *   Row 5 (content): | rating line         |
 */
export default function parse(element, { document }) {
  const HERO_DONE = 'data-excat-recipe-hero-done';

  // Shared parent that contains both hero regions (+ the recipeInfo sibling).
  const container = element.closest('.recipe-lead, #mod-recipe-lead-1') || element.parentElement || element;

  // Second (or later) invocation: block already built — drop this leftover
  // source region so it doesn't linger in the output. Never remove recipeInfo.
  if (container.getAttribute(HERO_DONE)) {
    element.remove();
    return;
  }

  // --- Media: hero photo + optional WATCH overlay -------------------------
  const photo = container.querySelector('.kdp-poster__image, img.kdp-poster__image, [class*="poster__image"]');
  const watchText = (container.querySelector('.kdp-poster__button-text')?.textContent || '').trim();

  // --- Content: eyebrow attribution, avatar, title, rating ----------------
  // First occurrences only (the summary is duplicated in a hidden print block).
  const eyebrowSource = container.querySelector('.o-Attribution__a-Name');
  const avatar = container.querySelector('.o-Attribution__a-Image, img[class*="Attribution__a-Image"]');
  const titleSource = container.querySelector('.o-AssetTitle__a-Headline, h1 .o-AssetTitle__a-HeadlineText, .o-AssetTitle__a-HeadlineText');
  const starsEl = container.querySelector('.rating-stars[title], [class*="rating-stars"][title]');
  const reviewsText = (container.querySelector('.reviews-ct')?.textContent || '').trim();

  // Empty-block guard: if we can't find a photo or a title, leave content in place.
  if (!photo && !titleSource) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1 — media (photo + WATCH overlay text in a 2nd cell).
  if (photo) {
    const mediaRow = [photo];
    if (watchText) mediaRow.push(watchText);
    cells.push(mediaRow);
  }

  // Row 2 — eyebrow attribution, e.g. "Recipe courtesy of Sunny Anderson".
  if (eyebrowSource) {
    const p = document.createElement('p');
    // Preserve the author link inside the eyebrow.
    p.innerHTML = eyebrowSource.innerHTML.trim();
    cells.push([p]);
  }

  // Row 3 — author avatar (picture-only cell so the block treats it as avatar).
  if (avatar) cells.push([avatar]);

  // Row 4 — centered title, e.g. "Apple Cider Chicken".
  if (titleSource) {
    const h1 = document.createElement('h1');
    h1.textContent = titleSource.textContent.trim();
    cells.push([h1]);
  }

  // Row 5 — rating line, e.g. "4.4 / 5  270 Reviews".
  if (starsEl || reviewsText) {
    const p = document.createElement('p');
    const parts = [];
    const m = (starsEl?.getAttribute('title') || '').match(/([\d.]+)\s*of\s*([\d.]+)/i);
    if (m) parts.push(`${m[1]} / ${m[2]}`);
    if (reviewsText) parts.push(reviewsText);
    p.textContent = parts.join('  ');
    if (parts.length) cells.push([p]);
  }

  container.setAttribute(HERO_DONE, '1');
  const block = WebImporter.Blocks.createBlock(document, { name: 'recipe-hero', cells });
  element.replaceWith(block);
}
