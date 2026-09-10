import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Spotlight — a single large editorial spotlight feature.
 *
 * Expected authored structure: one row, two cells —
 *   | [image] | [linked headline] |
 * (a single cell holding both an image and a heading/link also works).
 *
 * Renders one big image beside a linked headline. No description, no CTA.
 */
export default function decorate(block) {
  // EDS decorateButtons() wraps a standalone headline link as a .button CTA
  // before blocks decorate; this block's link is a plain headline, so strip it.
  block.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  block.querySelectorAll('.button-container').forEach((c) => c.replaceWith(...c.childNodes));

  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];

  const figure = document.createElement('div');
  figure.className = 'cards-spotlight-image';
  const body = document.createElement('div');
  body.className = 'cards-spotlight-body';

  // Distribute cells: any cell holding a picture is the image, the rest is body.
  cells.forEach((cell) => {
    if (cell.querySelector('picture, img')) {
      const img = cell.querySelector('img');
      if (img) {
        const optimized = createOptimizedPicture(
          img.src,
          img.alt || '',
          false,
          [{ width: '750' }],
        );
        figure.append(optimized);
      }
      // Any heading/link also in the image cell moves to the body.
      cell.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a').forEach((el) => {
        if (!el.closest('picture')) body.append(el);
      });
    } else {
      while (cell.firstChild) body.append(cell.firstChild);
    }
  });

  block.textContent = '';
  if (figure.children.length) block.append(figure);
  block.append(body);
}
