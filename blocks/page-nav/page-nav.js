/*
 * page-nav — previous/next pager shown at the foot of a detail page.
 *
 * Authored with up to two rows (label | link); the row's first cell is the
 * small caption (PREVIOUS / NEXT) and the second is the linked target:
 *   | Page Nav |                                  |
 *   | NEXT     | [Brand voice](/…/brand-voice)    |
 *   | PREVIOUS | [Overview](/…/overview)          |
 * A single NEXT row renders right-aligned with a circular arrow (matches the
 * guidelines "NEXT / Brand voice" pattern).
 */
export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const [capCell, linkCell] = [...row.children];
    if (!linkCell) return;
    const caption = capCell.textContent.trim();
    const link = linkCell.querySelector('a[href]');
    if (!link) return;
    const dir = /prev/i.test(caption) ? 'prev' : 'next';
    items.push({
      dir, caption, href: link.getAttribute('href'), label: link.textContent.trim(),
    });
  });

  block.textContent = '';
  const wrap = document.createElement('div');
  wrap.className = 'page-nav-wrap';

  items.forEach(({
    dir, caption, href, label,
  }) => {
    const a = document.createElement('a');
    a.className = `page-nav-item page-nav-${dir}`;
    a.href = href;
    const text = document.createElement('span');
    text.className = 'page-nav-text';
    const cap = document.createElement('span');
    cap.className = 'page-nav-caption';
    cap.textContent = caption || (dir === 'prev' ? 'Previous' : 'Next');
    const lbl = document.createElement('span');
    lbl.className = 'page-nav-label';
    lbl.textContent = label;
    text.append(cap, lbl);
    const arrow = document.createElement('span');
    arrow.className = 'page-nav-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    if (dir === 'prev') a.append(arrow, text);
    else a.append(text, arrow);
    wrap.append(a);
  });

  block.append(wrap);
}
