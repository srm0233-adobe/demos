/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: directions
 * Base block: cards (custom "directions steps")
 * Source: Food Network recipe detail — apple-cider-chicken-recipe-1952273
 *   section.o-Recipe .o-Method
 *
 * Source structure (.o-Method):
 *   header.o-Method__m-Header > h2 "Directions"
 *   .o-Method__m-Body > ol > li.o-Method__m-Step (one <li> per cooking step;
 *   this recipe has a single long step).
 *
 * Emitted block table (matches blocks/directions/directions.js decorate):
 *   one single-cell row per step (1 column); the block renders these as an
 *   auto-numbered <ol>:
 *     | Heat oil and 1 tablespoon butter in a skillet... |
 * The "Directions" heading is emitted as default content ABOVE the block
 * (the block itself only renders the ordered list).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Prefer explicit step items; fall back to <ol>/<ul> list items, then to
  // paragraphs, so single- or multi-step recipes both work.
  let steps = element.querySelectorAll('.o-Method__m-Step, [class*="__m-Step"]');
  if (!steps.length) steps = element.querySelectorAll('.o-Method__m-Body li, ol > li, ul > li');
  if (!steps.length) steps = element.querySelectorAll('.o-Method__m-Body p, p');

  steps.forEach((step) => {
    const text = step.textContent.trim();
    if (!text) return;
    const p = document.createElement('p');
    p.textContent = text;
    cells.push([p]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Emit the section heading as default content above the block.
  const headingSource = element.querySelector('.o-Method__a-HeadlineText, .o-Method__a-Headline, h2');
  const block = WebImporter.Blocks.createBlock(document, { name: 'directions', cells });

  if (headingSource) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSource.textContent.trim() || 'Directions';
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
