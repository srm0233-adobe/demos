import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Chefs — a horizontal strip of people profiles.
 *
 * Expected authored structure: one row per person, cells —
 *   | [circular portrait] | [linked name] | [role] |
 * The name and role may also arrive together in a single text cell.
 *
 * Renders a responsive grid of profiles: circular portrait above a linked
 * name and a role/subtitle.
 */
export default function decorate(block) {
  // Strip EDS button decoration from standalone name links.
  block.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  block.querySelectorAll('.button-container').forEach((c) => c.replaceWith(...c.childNodes));

  const ul = document.createElement('ul');
  ul.className = 'cards-chefs-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-chefs-item';

    const cells = [...row.children];
    const portrait = document.createElement('div');
    portrait.className = 'cards-chefs-portrait';
    const body = document.createElement('div');
    body.className = 'cards-chefs-body';

    cells.forEach((cell) => {
      const img = cell.querySelector('img');
      if (img && cell.textContent.trim() === '') {
        const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]);
        portrait.append(optimized);
      } else {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    if (portrait.children.length) li.append(portrait);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
