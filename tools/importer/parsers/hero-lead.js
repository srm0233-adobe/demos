/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-lead
 * Base block: hero (CUSTOM repo variant — blocks/hero-lead/hero-lead.js)
 * Source: Food Network homepage — .o-SuperLeadHero  (editorial "lead" feature)
 *
 * Structure (per blocks/hero-lead/hero-lead.js decorate — 2 columns, N rows):
 *   Row 1  (the large feature): [ big image | linked headline ]
 *   Rows 2..n (companion rail):  [ thumbnail | linked title ]
 * decorate treats the FIRST row as the large feature and the rest as a compact
 * side rail, so we emit one row per media block in source order.
 *
 * Source DOM (.o-SuperLeadHero__m-Body):
 *   repeated .m-MediaBlock, each:
 *     .m-MediaBlock__m-MediaWrap > a > img.m-MediaBlock__a-Image   (photo, linked)
 *     .m-MediaBlock__m-TextWrap  .m-MediaBlock__a-Headline > a > span…HeadlineText  (linked title)
 *
 * The image cell must contain ONLY the image (decorate treats a text-empty cell
 * as the image figure); the body cell holds the title as a clean link.
 */
export default function parse(element, { document }) {
  // Zip the image side and the text side by index — robust against the source's
  // deeply/loosely nested markup where .m-MediaBlock wrappers can appear nested.
  const wraps = [...element.querySelectorAll('.m-MediaBlock__m-MediaWrap')];
  const heads = [...element.querySelectorAll('.m-MediaBlock__a-Headline')];
  const count = Math.max(wraps.length, heads.length);

  const cells = [];

  for (let i = 0; i < count; i += 1) {
    const wrap = wraps[i];
    const headline = heads[i];

    const img = wrap ? wrap.querySelector('img') : null;

    // Build a clean title link from the headline anchor.
    const srcLink = headline ? headline.querySelector('a[href]') : null;
    const titleText = (headline ? headline.textContent : '').trim();

    let body = '';
    if (srcLink && titleText) {
      const a = document.createElement('a');
      a.href = srcLink.getAttribute('href');
      a.textContent = titleText;
      body = a;
    } else if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText;
      body = p;
    }

    // Skip an entirely empty item.
    if (!img && body === '') continue;

    // 2-column row: [ image cell, text cell ].
    cells.push([img || '', body]);
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-lead', cells });
  element.replaceWith(block);
}
