/*
 * section-hero — reusable blue hero band for a site section.
 *
 * Authored as a single-cell block containing (in any order):
 *   - a breadcrumb paragraph (links separated by ›)
 *   - a heading (the section title)
 *   - a "Share" link
 *
 * The block classifies those pieces and lays them out: breadcrumb top-left,
 * Share top-right, large title below.
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const nodes = [...cell.children];

  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const share = nodes.find((n) => n.querySelector?.('a') && /share/i.test(n.textContent));
  const breadcrumb = nodes.find((n) => n !== heading && n !== share && n.textContent.trim());

  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'section-hero-inner';

  const top = document.createElement('div');
  top.className = 'section-hero-top';
  if (breadcrumb) {
    breadcrumb.classList.add('section-hero-breadcrumb');
    top.append(breadcrumb);
  }
  if (share) {
    const shareLink = share.querySelector('a') || share;
    shareLink.classList.add('section-hero-share');
    top.append(shareLink);
  }
  inner.append(top);

  if (heading) {
    heading.classList.add('section-hero-title');
    inner.append(heading);
  }

  block.append(inner);
}
