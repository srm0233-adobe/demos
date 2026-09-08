import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * cards-tiles — image tile with a clickable title below, in a responsive grid.
 *
 * Authoring: each block row is one tile with two cells —
 *   | image | [Title](/link) |
 * The author only needs to link the TITLE. The block reads that link and
 * automatically makes the image link to the same destination, so both the
 * image and the text are clickable from a single authored URL.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture')) div.className = 'cards-tiles-tile-image';
      else div.className = 'cards-tiles-tile-body';
    });

    // Auto-link the image to the caption's destination (single authored link).
    const body = li.querySelector('.cards-tiles-tile-body');
    const imageCell = li.querySelector('.cards-tiles-tile-image');
    const captionLink = body ? body.querySelector('a[href]') : null;
    const picture = imageCell ? imageCell.querySelector('picture') : null;
    if (captionLink && picture && !imageCell.querySelector('a')) {
      const imgLink = document.createElement('a');
      imgLink.href = captionLink.getAttribute('href');
      imgLink.setAttribute('aria-hidden', 'true');
      imgLink.setAttribute('tabindex', '-1');
      imgLink.className = 'cards-tiles-tile-image-link';
      picture.replaceWith(imgLink);
      imgLink.append(picture);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
