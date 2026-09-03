/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-popular
 * Base block: cards
 * Source: AT&T Brand Center "home" — .popular-cards > .card
 * Generated: 2026-09-03
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 *  - Row 1: block name (added by createBlock)
 *  - Each card row: [ image cell, body cell ]
 *      image cell -> single picture (.cards-popular-card-image)
 *      body cell  -> title link + description (.cards-popular-card-body)
 */
export default function parse(element, { document }) {
  // Each card. Validated against source: <div class="card"> children of .popular-cards.
  const cards = element.querySelectorAll(':scope > .card, :scope > div.card, .card');

  const cells = [];
  cards.forEach((card) => {
    // Image column (mandatory). The image is wrapped in a linking <a> in source.
    const img = card.querySelector('img, picture');

    // Body column: title (styled as heading, wraps a link) + description.
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
    const description = card.querySelector('p');

    const bodyCell = [];
    if (heading) bodyCell.push(heading);
    if (description) bodyCell.push(description);

    // Skip cards with no meaningful content.
    if (!img && bodyCell.length === 0) return;

    cells.push([img || '', bodyCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-popular', cells });
  element.replaceWith(block);
}
