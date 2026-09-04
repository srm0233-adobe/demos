/*
 * sidenav — folder-driven sticky side navigation.
 *
 * Builds the guidelines side menu from the query index of the guidelines
 * folder (helix-query.yaml -> query-index.json). The block's content is a
 * single cell naming the section (e.g. "Guidelines"); everything else is
 * derived from the index so the nav grows automatically as pages are added.
 *
 * Ordering is controlled by a fixed section list here (FIXED_ORDER); pages are
 * matched to it by nav-title/title. Any indexed page not in the list is
 * appended alphabetically after the known sections.
 */

// Fixed top-level order for the guidelines section.
const FIXED_ORDER = [
  'Introduction',
  'Brand guidelines',
  'Business guidelines',
  'Consumer guidelines',
  'FirstNet guidelines',
  'Additional resources',
];

const INDEX_PATH = '/att-brand-center/guidelines/query-index.json';

async function fetchIndex() {
  try {
    const resp = await fetch(INDEX_PATH);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

/** Order index entries by FIXED_ORDER, appending unknowns alphabetically. */
function orderEntries(entries) {
  const labelOf = (e) => (e.navTitle || e.title || '').trim();
  const known = [];
  FIXED_ORDER.forEach((label) => {
    const match = entries.find((e) => labelOf(e).toLowerCase() === label.toLowerCase());
    if (match) known.push(match);
  });
  const rest = entries
    .filter((e) => !FIXED_ORDER.some((l) => l.toLowerCase() === labelOf(e).toLowerCase()))
    .sort((a, b) => labelOf(a).localeCompare(labelOf(b)));
  return [...known, ...rest];
}

export default async function decorate(block) {
  // The single authored cell holds the section label (falls back to "Guidelines").
  const sectionLabel = (block.textContent || '').trim() || 'Guidelines';
  block.textContent = '';

  const all = await fetchIndex();
  // Only real content pages in the guidelines category (skip the index itself).
  const entries = all.filter((e) => {
    const cat = (e.category || '').trim().toLowerCase();
    const path = e.path || '';
    if (path.endsWith('/query-index')) return false;
    return cat === 'guidelines' || cat === '';
  });

  const ordered = orderEntries(entries);

  const heading = document.createElement('p');
  heading.className = 'sidenav-heading';
  heading.textContent = sectionLabel;
  block.append(heading);

  const list = document.createElement('ul');
  list.className = 'sidenav-list';

  const here = window.location.pathname.replace(/\.html$/, '');
  ordered.forEach((entry) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = entry.path;
    a.textContent = (entry.navTitle || entry.title || '').trim();
    if (entry.path === here) {
      li.classList.add('sidenav-active');
      a.setAttribute('aria-current', 'page');
    }
    li.append(a);
    list.append(li);
  });

  block.append(list);
}
