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

    // Classify the body's direct children: the one holding the profile link is
    // the name (may be a bare <a> after EDS strips the <p> wrapper of a
    // standalone link, or a <p> wrapping it); a short link-less line right after
    // it is a role (e.g. "Food Network Chef"); everything else is description.
    const items = [...body.children];
    const nameIdx = items.findIndex((el) => (el.tagName === 'A' && el.href) || el.querySelector?.('a[href]'));
    items.forEach((el, i) => {
      if (i === nameIdx) {
        el.classList.add(el.tagName === 'A' ? 'cards-chefs-name-link' : 'cards-chefs-name');
      } else if (nameIdx !== -1 && i === nameIdx + 1 && !el.querySelector?.('a') && el.textContent.trim().split(/\s+/).length <= 4) {
        el.classList.add('cards-chefs-role');
      } else {
        el.classList.add('cards-chefs-desc');
      }
    });

    if (portrait.children.length) li.append(portrait);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
