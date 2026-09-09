/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-tiles
 * Base block: cards-tiles (image tile + clickable title, responsive grid)
 * Source: Food Network recipe detail — apple-cider-chicken-recipe-1952273
 *   section.o-Recommendations  ("Looking for Something Else?" related recipes)
 *
 * EDS "cards" convention: 2-column table, one row per card —
 *   cell 1 = image (mandatory), cell 2 = text (title heading/link + optional CTA).
 * This variant renders each row as an image tile with a clickable title below.
 *
 * Source structure:
 *   section.o-Recommendations
 *     header … h2 "Looking for Something Else?"  (emitted as default content above)
 *     .o-Recommendations__TileContainer.l-Columns--4up   (the visible tab's grid)
 *       repeated .o-Recommendations__m-MediaBlock, each a related-recipe tile:
 *         .m-MediaBlock__m-MediaWrap > a > img.m-MediaBlock__a-Image   (photo)
 *         span.m-MediaBlock__a-Headline > a > span…HeadlineText        (linked title)
 *         .m-ReviewSummary .rating-stars[title="4.5 of 5 stars"]       (optional rating)
 *
 * Emitted block table (2 columns → header colspan=2; matches
 * blocks/cards-tiles/cards-tiles.js decorate):
 *     | <image> | [Title](/recipe-link)  <rating> |
 *   The block reads the caption link and auto-links the image to it.
 */
export default function parse(element, { document }) {
  // Use only the first (visible) tile container so we don't pull hidden tabs.
  const container = element.querySelector('.o-Recommendations__TileContainer') || element;
  const tiles = container.querySelectorAll(':scope > .o-Recommendations__m-MediaBlock, :scope > .m-MediaBlock');

  const cells = [];

  tiles.forEach((tile) => {
    const img = tile.querySelector('.m-MediaBlock__a-Image, img[class*="a-Image"], img');

    // Linked title: prefer the headline anchor so the caption is a real link.
    const headline = tile.querySelector('.m-MediaBlock__a-Headline');
    const titleLink = headline ? headline.querySelector('a[href]') : tile.querySelector('a[href]');
    const titleText = (headline ? headline.textContent : (titleLink ? titleLink.textContent : '')).trim();

    if (!img && !titleText) return;

    // Body cell (cell 2): the title as a plain link + optional rating.
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

    // 2-column row: [ image cell, text cell ].
    cells.push([img || '', body]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Emit the section heading as default content above the block.
  const headingSource = element.querySelector('.o-Recommendations__a-HeadlineText, .o-Recommendations__a-Headline, header h2, h2');
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tiles', cells });

  if (headingSource && headingSource.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSource.textContent.trim();
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
