import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * cards-tiles — image tile with a clickable title below, in a responsive grid.
 *
 * Authoring: each block row is one tile with two cells —
 *   | image | body |
 * The body holds the linked title, and may optionally add an eyebrow/kicker
 * line above it and a meta/subtitle line below it (each its own paragraph):
 *   | image | Shortcut Meals · [23 Easy Dishes …](/link) · Premieres Sun 9|8c |
 * The block reads the title link and automatically makes the image link to the
 * same destination, so both the image and text are clickable from one URL.
 *
 * Schedule variant (`cards-tiles (schedule)`): renders as a 4-up row and lets
 * the last card be a text-only "TV schedule" card (no image) with a red badge,
 * up-next / on-tonight listings, and Watch-Live / full-schedule links.
 */

/**
 * Classifies the paragraphs of a normal card body relative to its title link:
 * text before the link is an eyebrow/kicker, the link paragraph is the title,
 * and text after the link is meta/subtitle.
 */
function enrichBody(body) {
  const paras = [...body.querySelectorAll(':scope > p')];
  const titleIdx = paras.findIndex((p) => p.querySelector('a[href]'));
  paras.forEach((p, i) => {
    if (i === titleIdx) p.classList.add('cards-tiles-title');
    else if (titleIdx !== -1 && i < titleIdx) p.classList.add('cards-tiles-eyebrow');
    else p.classList.add('cards-tiles-meta');
  });
}

/**
 * Decorates a text-only card as the TV schedule card. Paragraphs are tagged by
 * role: first = red badge; a "|" line = a time; a link whose text mentions
 * "live" = the primary Watch-Live CTA; a section label (UP NEXT / ON TONIGHT)
 * is a short line ending its run with the following linked line as the show
 * title; the final remaining link = the plain "see full schedule" link.
 */
function decorateScheduleCard(li) {
  li.classList.add('cards-tiles-card-schedule');
  const cell = li.querySelector('.cards-tiles-tile-body') || li.firstElementChild;
  if (!cell) return;
  cell.className = 'cards-tiles-schedule';
  const paras = [...cell.children].filter((el) => el.tagName === 'P');
  let prevWasLabel = false;
  paras.forEach((p, i) => {
    const link = p.querySelector('a[href]');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary');
      p.classList.remove('button-container');
    }
    const text = p.textContent.trim();
    const isLabel = !link && /^[a-z][a-z\s'&]*$/i.test(text) && text.split(/\s+/).length <= 3;
    if (i === 0) {
      p.classList.add('cards-tiles-schedule-badge');
    } else if (link && /live/i.test(text)) {
      p.classList.add('cards-tiles-schedule-cta');
    } else if (link && prevWasLabel) {
      p.classList.add('cards-tiles-schedule-show');
    } else if (link) {
      p.classList.add('cards-tiles-schedule-more');
    } else if (/\|/.test(text)) {
      p.classList.add('cards-tiles-schedule-time');
    } else if (isLabel) {
      p.classList.add('cards-tiles-schedule-label');
    } else {
      p.classList.add('cards-tiles-schedule-show');
    }
    prevWasLabel = p.classList.contains('cards-tiles-schedule-label');
  });
}

export default function decorate(block) {
  // Tag the block with its card count so the CSS can size the row to match the
  // reference site (4-up 290px cards, 3-up 397px cards, 2-up 610px cards).
  const cardCount = block.children.length;
  block.classList.add(`cards-tiles-count-${cardCount}`);

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture')) div.className = 'cards-tiles-tile-image';
      else div.className = 'cards-tiles-tile-body';
    });

    const imageCell = li.querySelector('.cards-tiles-tile-image');

    // A card with no image is the text-only schedule card.
    if (!imageCell) {
      decorateScheduleCard(li);
      ul.append(li);
      return;
    }

    // Caption links must render as plain text links, not EDS button CTAs.
    // A link that is the only content in its cell gets decorated as .button /
    // wrapped in .button-container; undo that here.
    const body = li.querySelector('.cards-tiles-tile-body');
    if (body) {
      body.querySelectorAll('a.button').forEach((a) => a.classList.remove('button'));
      body.querySelectorAll('.button-container').forEach((wrap) => {
        wrap.classList.remove('button-container');
      });
      enrichBody(body);
    }

    // Auto-link the image to the caption's destination (single authored link).
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
