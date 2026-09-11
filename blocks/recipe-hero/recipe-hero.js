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
    // A video-viewer link (e.g. Scene7/Dynamic Media VideoViewer) renders as an
    // embedded, playable iframe in place of the hero image.
    const videoLink = [...mediaRow.querySelectorAll('a[href]')]
      .find((a) => /videoviewer|s7viewers/i.test(a.getAttribute('href')));
    const pic = mediaRow.querySelector('picture');
    if (videoLink) {
      const figure = document.createElement('div');
      figure.className = 'recipe-hero-image recipe-hero-video';
      const frame = document.createElement('iframe');
      frame.className = 'recipe-hero-video-frame';
      frame.src = videoLink.getAttribute('href');
      frame.title = videoLink.textContent.trim() || 'Recipe video';
      frame.setAttribute('allow', 'autoplay; fullscreen; encrypted-media');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('loading', 'lazy');
      figure.append(frame);
      media.append(figure);
    } else if (pic) {
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

  // --- Rating stars --------------------------------------------------------
  // Turn a "4.4 / 5  270 Reviews" line into filled/empty star glyphs plus a
  // reviews count, matching the reference site's red star rating.
  const rating = content.querySelector('.recipe-hero-rating');
  if (rating) {
    const text = rating.textContent.trim();
    const scoreMatch = text.match(/([\d.]+)\s*\/\s*5/);
    const reviewsMatch = text.match(/([\d,]+)\s*reviews?/i);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      rating.textContent = '';
      const stars = document.createElement('span');
      stars.className = 'recipe-hero-stars';
      stars.setAttribute('aria-label', `${score} out of 5 stars`);
      for (let i = 1; i <= 5; i += 1) {
        const star = document.createElement('span');
        let fill = 'empty';
        if (score >= i) fill = 'full';
        else if (score >= i - 0.5) fill = 'half';
        star.className = `recipe-hero-star recipe-hero-star-${fill}`;
        star.setAttribute('aria-hidden', 'true');
        stars.append(star);
      }
      rating.append(stars);
      if (reviewsMatch) {
        const reviews = document.createElement('span');
        reviews.className = 'recipe-hero-reviews';
        reviews.textContent = `${reviewsMatch[1]} Reviews`;
        rating.append(reviews);
      }
    }
  }

  // --- Share / Save actions ------------------------------------------------
  const actions = document.createElement('div');
  actions.className = 'recipe-hero-actions';

  const title = content.querySelector('h1, h2')?.textContent?.trim() || document.title;

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'recipe-hero-action recipe-hero-save';
  saveBtn.append(
    Object.assign(document.createElement('span'), { className: 'recipe-hero-action-icon', ariaHidden: 'true' }),
    Object.assign(document.createElement('span'), { className: 'recipe-hero-action-label', textContent: 'Save Recipe' }),
  );

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'recipe-hero-action recipe-hero-share';
  shareBtn.append(
    Object.assign(document.createElement('span'), { className: 'recipe-hero-action-icon', ariaHidden: 'true' }),
    Object.assign(document.createElement('span'), { className: 'recipe-hero-action-label', textContent: 'Share' }),
  );

  // Save: toggle a persisted flag for this page and reflect it in the label.
  const saveKey = `fn-saved:${window.location.pathname}`;
  const reflectSaved = () => {
    const saved = localStorage.getItem(saveKey) === '1';
    saveBtn.classList.toggle('is-saved', saved);
    saveBtn.setAttribute('aria-pressed', String(saved));
    saveBtn.querySelector('.recipe-hero-action-label').textContent = saved ? 'Saved' : 'Save Recipe';
  };
  try { reflectSaved(); } catch (e) { /* localStorage unavailable */ }
  saveBtn.addEventListener('click', () => {
    try {
      const saved = localStorage.getItem(saveKey) === '1';
      if (saved) localStorage.removeItem(saveKey);
      else localStorage.setItem(saveKey, '1');
      reflectSaved();
    } catch (e) { /* ignore */ }
  });

  // Share: use the Web Share API when available, else copy the URL.
  shareBtn.addEventListener('click', async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      const label = shareBtn.querySelector('.recipe-hero-action-label');
      const original = label.textContent;
      label.textContent = 'Link copied';
      shareBtn.classList.add('is-copied');
      setTimeout(() => { label.textContent = original; shareBtn.classList.remove('is-copied'); }, 2000);
    } catch (e) { /* user cancelled or API unavailable */ }
  });

  actions.append(saveBtn, shareBtn);
  content.append(actions);

  block.textContent = '';
  if (media.children.length) block.append(media);
  block.append(content);
}
