/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-photo
 * Base block: carousel
 * Source: AT&T Brand Center "home" — .photo-cards > .card
 * Generated: 2026-09-03
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 *  - Row 1: block name (added by createBlock)
 *  - Each slide row: [ image cell, content cell ]
 *      image cell   -> single image (carousel-photo-slide-image), no other content
 *      content cell -> title (carousel-photo-slide-content)
 */
export default function parse(element, { document }) {
  // Each slide. Validated against source: <div class="card"> children of .photo-cards.
  const slides = element.querySelectorAll(':scope > .card, :scope > div.card, .card');

  const cells = [];
  slides.forEach((slide) => {
    // Image column (mandatory), no other content per description.
    const img = slide.querySelector('img, picture');

    // Content column: title (styled as heading). Description/CTA optional (none in source).
    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');

    const contentCell = [];
    if (heading) contentCell.push(heading);

    // Skip slides with no meaningful content.
    if (!img && contentCell.length === 0) return;

    cells.push([img || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-photo', cells });
  element.replaceWith(block);
}
