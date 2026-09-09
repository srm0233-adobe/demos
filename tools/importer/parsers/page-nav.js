/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: page-nav
 * Base block: page-nav (prev/next pager)
 * Source: Food Network recipe detail — apple-cider-chicken-recipe-1952273
 *   div.assetNavigation
 *
 * Source structure:
 *   section.o-AssetNavigation .prev-next-wrapper .l-Columns--2up
 *     a.o-AssetNavigation__a-Button "Prev Recipe"  (href → previous recipe)
 *     a.o-AssetNavigation__a-Button "Next Recipe"  (href → next recipe)
 *
 * Emitted block table (matches blocks/page-nav/page-nav.js decorate):
 *   one row per direction, caption / link pair (2 cells → header colspan=2):
 *     | PREVIOUS | [Prev Recipe](/…) |
 *     | NEXT     | [Next Recipe](/…) |
 * The block reads the caption to choose the prev/next direction & arrow side.
 */
export default function parse(element, { document }) {
  const cells = [];

  const links = element.querySelectorAll('a.o-AssetNavigation__a-Button, .prev-next-wrapper a[href], .l-Columns a[href]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const label = link.textContent.trim();
    // Direction from the label ("Prev Recipe" → PREVIOUS, else NEXT).
    const caption = /prev/i.test(label) ? 'PREVIOUS' : 'NEXT';

    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    cells.push([caption, a]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'page-nav', cells });
  element.replaceWith(block);
}
