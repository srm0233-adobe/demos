/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-tiles
 * Base block: cards-tiles (image tile + clickable title, responsive grid)
 *
 * Handles TWO source shapes (backward-compatible):
 *   A) Recipe detail — section.o-Recommendations ("Looking for Something Else?")
 *        .o-Recommendations__m-MediaBlock  (image + linked headline + optional rating)
 *   B) Homepage — .o-FullWidthPromo card grid (.l-Columns--Nup)
 *        .m-Card  (image + label eyebrow + linked headline + optional CTA button)
 *
 * EDS "cards" convention: 2-column table, one row per card —
 *   cell 1 = image (mandatory), cell 2 = text (linked title + optional extras).
 * Matches blocks/cards-tiles/cards-tiles.js decorate (image cell auto-links to
 * the caption link; caption renders as a plain link, not a button CTA).
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Shape A: recipe recommendations grid ---------------------------------
  const recContainer = element.querySelector('.o-Recommendations__TileContainer');
  const recTiles = element.querySelectorAll(
    '.o-Recommendations__m-MediaBlock, .o-Recommendations__TileContainer .m-MediaBlock',
  );

  // --- Shape B: homepage full-width promo card grid -------------------------
  const promoCards = element.querySelectorAll('.m-Card');

  if (promoCards.length) {
    // Homepage .o-FullWidthPromo card grid.
    promoCards.forEach((card) => {
      const img = card.querySelector('.m-Card__m-MediaWrap img, img[class*="a-Image"], img');

      // Linked headline (the primary caption link).
      const headline = card.querySelector('.m-Card__a-Headline');
      const titleLink = headline
        ? headline.querySelector('a[href]')
        : card.querySelector('.m-Card__m-TextWrap a[href]');
      const titleText = (headline ? headline.textContent : (titleLink ? titleLink.textContent : '')).trim();

      if (!img && !titleText) return;

      const body = [];
      if (titleLink && titleText) {
        const a = document.createElement('a');
        a.href = titleLink.getAttribute('href');
        a.textContent = titleText;
        body.push(a);
      } else if (titleText) {
        const p = document.createElement('p');
        p.textContent = titleText;
        body.push(p);
      }

      cells.push([img || '', body.length ? body : '']);
    });
  } else {
    // Recipe recommendations grid (original behavior).
    const container = recContainer || element;
    let tiles = recTiles.length
      ? recTiles
      : container.querySelectorAll(':scope > .o-Recommendations__m-MediaBlock, :scope > .m-MediaBlock');

    tiles.forEach((tile) => {
      const img = tile.querySelector('.m-MediaBlock__a-Image, img[class*="a-Image"], img');

      const headline = tile.querySelector('.m-MediaBlock__a-Headline');
      const titleLink = headline ? headline.querySelector('a[href]') : tile.querySelector('a[href]');
      const titleText = (headline ? headline.textContent : (titleLink ? titleLink.textContent : '')).trim();

      if (!img && !titleText) return;

      const body = [];
      if (titleLink && titleText) {
        const a = document.createElement('a');
        a.href = titleLink.getAttribute('href');
        a.textContent = titleText;
        body.push(a);
      } else if (titleText) {
        const p = document.createElement('p');
        p.textContent = titleText;
        body.push(p);
      }

      // Optional rating line, e.g. "4.5 / 5".
      const stars = tile.querySelector('.rating-stars[title], [class*="rating-stars"][title]');
      const m = (stars?.getAttribute('title') || '').match(/([\d.]+)\s*of\s*([\d.]+)/i);
      if (m) {
        const rp = document.createElement('p');
        rp.textContent = `${m[1]} / ${m[2]}`;
        body.push(rp);
      }

      cells.push([img || '', body.length ? body : '']);
    });
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Section heading (recipe: .o-Recommendations__a-Headline; homepage: .o-FullWidthPromo__a-Headline).
  const headingSource = element.querySelector(
    '.o-Recommendations__a-HeadlineText, .o-Recommendations__a-Headline, '
    + '.o-FullWidthPromo__a-HeadlineText, .o-FullWidthPromo__a-Headline, header h2, h2',
  );

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tiles', cells });

  if (headingSource && headingSource.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSource.textContent.trim();
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
