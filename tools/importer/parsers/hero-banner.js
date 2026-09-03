/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-banner
 * Base block: hero
 * Source: AT&T Brand Center "home" — body > section.hero-section
 *
 * Multi-slide hero carousel. Each ".hero" child of the section becomes one
 * block row with two cells:
 *  - Cell 1: background image
 *  - Cell 2: content (eyebrow + heading + body + CTA), in source order
 *
 * A single-slide hero still works: it produces a one-row block.
 */
export default function parse(element, { document }) {
  // Collect slides. Each ".hero" is a slide; fall back to treating the whole
  // section as a single slide if no ".hero" wrappers exist.
  let slides = element.querySelectorAll(':scope > .hero, :scope .hero');
  if (!slides || slides.length === 0) slides = [element];

  const cells = [];

  slides.forEach((slide) => {
    // Background image for this slide.
    const bgImage = slide.querySelector(
      'img.hero-bg, img[class*="hero-bg"], img[class*="background"], img[class*="-bg"], img',
    );

    // Content wrapper for this slide.
    const copy = slide.querySelector('.hero-copy, [class*="copy"], [class*="content"]');

    const contentCell = [];
    if (copy) {
      copy.querySelectorAll(':scope > *').forEach((child) => {
        if (child === bgImage || child.contains(bgImage)) return;
        contentCell.push(child);
      });
    } else {
      const eyebrow = slide.querySelector('.eyebrow, [class*="eyebrow"]');
      const heading = slide.querySelector('h1, h2, h3, [class*="title"]');
      if (eyebrow) contentCell.push(eyebrow);
      if (heading) contentCell.push(heading);
      slide.querySelectorAll('p').forEach((p) => {
        if (p !== eyebrow) contentCell.push(p);
      });
    }

    // Skip an entirely empty slide.
    if (!bgImage && contentCell.length === 0) return;

    // One row per slide: [ image cell, content cell ].
    cells.push([bgImage || '', contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
