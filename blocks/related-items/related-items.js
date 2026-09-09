import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * related-items — a horizontal strip of related asset thumbnails.
 *
 * Authored one thumbnail per row:
 *   | Related Items |
 *   | <picture>     |            (optionally wrapped in a link)
 *   | <picture>     |
 *   ...
 * A "Related Items" heading is rendered above the strip.
 */
export default function decorate(block) {
  const heading = document.createElement('p');
  heading.className = 'related-items-heading';
  heading.textContent = 'Related Items';

  const strip = document.createElement('ul');
  strip.className = 'related-items-strip';

  [...block.children].forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    const pic = cell.querySelector('picture');
    if (!pic) return;
    const li = document.createElement('li');
    li.className = 'related-items-thumb';
    const link = cell.querySelector('a[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(pic);
      li.append(a);
    } else {
      li.append(pic);
    }
    strip.append(li);
  });

  strip.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    img.closest('picture').replaceWith(optimized);
  });

  block.textContent = '';
  block.append(heading, strip);
}
