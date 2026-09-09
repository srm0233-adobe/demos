import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Pick the footer fragment by site section: Food Network pages get the Food
  // Network footer, everything else gets the AT&T Brand Center footer. Each is
  // a metadata-independent dual-fetch (localhost / aem up path first, then the
  // DA/EDS production path).
  const isFoodNetwork = window.location.pathname.replace('/content', '').startsWith('/foodnetwork');
  let fragment;
  if (isFoodNetwork) {
    fragment = await loadFragment('/content/foodnetwork/footer');
    if (!fragment) fragment = await loadFragment('/foodnetwork/footer');
  } else {
    fragment = await loadFragment('/content/att-brand-center/footer');
    if (!fragment) fragment = await loadFragment('/att-brand-center/footer');
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
}
