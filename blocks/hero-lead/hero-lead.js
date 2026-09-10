import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero Lead — a light editorial lead feature.
 *
 * Expected authored structure:
 *   Row 1 (the main feature): [big image] | [linked headline]
 *   Rows 2..n (optional side rail): [thumbnail] | [linked title]
 *     — e.g. an "On Tonight" schedule / shows rail beside the lead.
 *
 * Renders the main feature large on the left and the remaining rows as a
 * compact companion rail on the right.
 */
function buildFeature(row, { large }) {
  const item = document.createElement('div');
  item.className = large ? 'hero-lead-feature' : 'hero-lead-rail-item';

  const cells = [...row.children];
  const figure = document.createElement('div');
  figure.className = 'hero-lead-image';
  const body = document.createElement('div');
  body.className = 'hero-lead-body';

  cells.forEach((cell) => {
    const img = cell.querySelector('img');
    if (img && cell.textContent.trim() === '') {
      const optimized = createOptimizedPicture(
        img.src,
        img.alt || '',
        large,
        [{ width: large ? '900' : '200' }],
      );
      figure.append(optimized);
    } else {
      while (cell.firstChild) body.append(cell.firstChild);
    }
  });

  if (figure.children.length) item.append(figure);
  item.append(body);
  return item;
}

/**
 * EDS decorateButtons() wraps a standalone link in a cell as a .button /
 * .button-container CTA before blocks decorate. This block's links are plain
 * text headlines, so strip that decoration.
 */
function stripButtons(root) {
  root.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  root.querySelectorAll('.button-container').forEach((c) => c.replaceWith(...c.childNodes));
}

export default function decorate(block) {
  stripButtons(block);
  const rows = [...block.children];
  if (!rows.length) return;

  const feature = buildFeature(rows[0], { large: true });

  const rail = document.createElement('div');
  rail.className = 'hero-lead-rail';
  rows.slice(1).forEach((row) => rail.append(buildFeature(row, { large: false })));

  block.textContent = '';
  block.append(feature);
  if (rail.children.length) {
    block.append(rail);
  } else {
    // No companion rail: render as a full-bleed banner with the text overlaid
    // as a box in the bottom-left corner.
    block.classList.add('hero-lead-overlay');
    const section = block.closest('.section');
    if (section) section.classList.add('hero-lead-full');
  }
}
