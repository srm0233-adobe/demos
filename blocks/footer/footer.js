import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment — metadata-independent dual-fetch. The footer lives
  // in the att-brand-center section: /content/att-brand-center/footer (localhost
  // / aem up) first, then /att-brand-center/footer (DA/EDS production).
  let fragment = await loadFragment('/content/att-brand-center/footer');
  if (!fragment) fragment = await loadFragment('/att-brand-center/footer');

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
}
