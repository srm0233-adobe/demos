import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards News — a vertical list of story cards.
 *
 * Expected authored structure: one row per story, cells —
 *   | [image] | [category eyebrow + linked headline + description] |
 * The text cell holds, in order: an eyebrow line (category tag), a linked
 * headline, and a short description paragraph.
 *
 * Renders each story as an image beside a text column (eyebrow, headline,
 * description).
 */
export default function decorate(block) {
  // Strip EDS button decoration from standalone headline links.
  block.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  block.querySelectorAll('.button-container').forEach((c) => c.replaceWith(...c.childNodes));

  const ul = document.createElement('ul');
  ul.className = 'cards-news-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-news-item';

    const cells = [...row.children];
    const figure = document.createElement('div');
    figure.className = 'cards-news-image';
    const body = document.createElement('div');
    body.className = 'cards-news-body';

    cells.forEach((cell) => {
      const img = cell.querySelector('img');
      if (img && cell.textContent.trim() === '') {
        const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]);
        figure.append(optimized);
      } else {
        // First plain paragraph without a link is the category eyebrow.
        const paras = [...cell.querySelectorAll(':scope > p')];
        const eyebrow = paras.find((p) => !p.querySelector('a') && p.textContent.trim());
        if (eyebrow) eyebrow.classList.add('cards-news-eyebrow');
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    if (figure.children.length) li.append(figure);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
