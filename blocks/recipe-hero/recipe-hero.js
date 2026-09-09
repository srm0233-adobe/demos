import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Recipe Hero — a light, centered recipe lead.
 *
 * Expected authored structure (rows):
 *   1. Recipe photo (a picture/img). Optionally a second cell holding a
 *      "watch" link/label rendered as a play overlay on the photo.
 *   2. Attribution + title block:
 *        - eyebrow line, e.g. "Recipe courtesy of Sunny Anderson"
 *        - optional author avatar (a small picture/img)
 *        - the recipe title (heading)
 *        - optional rating line, e.g. "4.4 / 5  270 Reviews"
 *
 * The author may collapse everything into a single content cell; this
 * decorator is tolerant of extra/omitted cells.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // First row is the hero media (may include a watch overlay in a 2nd cell).
  const mediaRow = rows[0];
  // Remaining rows carry the attribution/title/rating content.
  const contentRows = rows.slice(1);

  // --- Media ---------------------------------------------------------------
  const media = document.createElement('div');
  media.className = 'recipe-hero-media';
  if (mediaRow) {
    const cells = [...mediaRow.children];
    const pic = mediaRow.querySelector('picture');
    if (pic) {
      const img = pic.querySelector('img');
      const optimized = createOptimizedPicture(
        img?.src,
        img?.alt || '',
        true,
        [{ width: '1200' }],
      );
      const figure = document.createElement('div');
      figure.className = 'recipe-hero-image';
      figure.append(optimized);

      // A link or text in a second cell becomes the WATCH play overlay.
      const overlaySource = cells[1];
      const overlayLink = overlaySource?.querySelector('a');
      const overlayText = overlaySource?.textContent?.trim();
      if (overlayLink || overlayText) {
        const overlay = overlayLink || document.createElement('span');
        overlay.className = 'recipe-hero-watch';
        if (!overlayLink) overlay.textContent = overlayText;
        else if (!overlay.textContent.trim()) overlay.textContent = 'Watch';
        figure.append(overlay);
      }
      media.append(figure);
    }
  }

  // --- Content -------------------------------------------------------------
  const content = document.createElement('div');
  content.className = 'recipe-hero-content';

  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      // An avatar image within the attribution area.
      const pic = cell.querySelector('picture');
      if (pic && cell.textContent.trim() === '') {
        const img = pic.querySelector('img');
        const avatar = createOptimizedPicture(
          img?.src,
          img?.alt || '',
          false,
          [{ width: '120' }],
        );
        const wrap = document.createElement('div');
        wrap.className = 'recipe-hero-avatar';
        wrap.append(avatar);
        content.append(wrap);
        return;
      }

      // Otherwise move the cell's children (eyebrow p, heading, rating p).
      while (cell.firstChild) {
        const node = cell.firstChild;
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();
          if (tag === 'p' && !node.classList.length) {
            // First plain paragraph is the eyebrow, later ones the rating.
            if (!content.querySelector('.recipe-hero-eyebrow')) {
              node.classList.add('recipe-hero-eyebrow');
            } else {
              node.classList.add('recipe-hero-rating');
            }
          }
        }
        content.append(node);
      }
    });
  });

  block.textContent = '';
  if (media.children.length) block.append(media);
  block.append(content);
}
