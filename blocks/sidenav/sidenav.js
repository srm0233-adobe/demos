/*
 * sidenav — reusable, folder-driven sticky side navigation for a site section.
 *
 * Renders the child pages of the current section from that section's query
 * index, so any section (guidelines, assets, connect, …) can reuse it by
 * dropping a Sidenav block on the page.
 *
 * Authoring: a single cell whose text is the section heading label
 *   | Sidenav       |
 *   | Guidelines    |
 *
 * How the section is resolved (no per-page config needed):
 *   - The section folder is the page's parent path, e.g. a page at
 *     /att-brand-center/guidelines/brand-guidelines lives in the
 *     "/att-brand-center/guidelines" section.
 *   - The block fetches "{sectionPath}/query-index.json" (the index a
 *     helix-query.yaml rule publishes for that folder).
 *
 * Ordering: SECTION_ORDER maps a section path to a fixed label order. Sections
 * without an entry fall back to the index order, then alphabetical for any
 * labels not listed. Add a section by adding one line here — no other change.
 */

// Fixed top-level order per section path. Extend for new sections.
const SECTION_ORDER = {
  '/att-brand-center/guidelines': [
    'Introduction',
    'Brand guidelines',
    'Business guidelines',
    'Consumer guidelines',
    'FirstNet guidelines',
    'Additional resources',
  ],
};

/** The section folder path for the current (or given) page path. */
function sectionPathFor(pathname) {
  const clean = pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const idx = clean.lastIndexOf('/');
  return idx > 0 ? clean.slice(0, idx) : clean;
}

async function fetchIndex(sectionPath) {
  try {
    const resp = await fetch(`${sectionPath}/query-index.json`);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

const labelOf = (e) => (e.navTitle || e.title || '').trim();

/** Order entries by the section's fixed list, then index order / alphabetical. */
function orderEntries(entries, order) {
  if (!order || !order.length) return entries;
  const known = [];
  order.forEach((label) => {
    const match = entries.find((e) => labelOf(e).toLowerCase() === label.toLowerCase());
    if (match) known.push(match);
  });
  const rest = entries
    .filter((e) => !order.some((l) => l.toLowerCase() === labelOf(e).toLowerCase()))
    .sort((a, b) => labelOf(a).localeCompare(labelOf(b)));
  return [...known, ...rest];
}

export default async function decorate(block) {
  const here = window.location.pathname.replace(/\.html$/, '');
  const sectionPath = sectionPathFor(here);

  // Authored label (falls back to the section folder name, title-cased).
  const authored = (block.textContent || '').trim();
  const folderName = sectionPath.split('/').pop() || '';
  const sectionLabel = authored
    || folderName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  block.textContent = '';

  const all = await fetchIndex(sectionPath);
  // Real content pages in this section (skip the index row itself).
  const entries = all.filter((e) => (e.path || '') !== `${sectionPath}/query-index`);

  const ordered = orderEntries(entries, SECTION_ORDER[sectionPath]);

  const heading = document.createElement('p');
  heading.className = 'sidenav-heading';
  heading.textContent = sectionLabel;
  block.append(heading);

  const list = document.createElement('ul');
  list.className = 'sidenav-list';

  ordered.forEach((entry) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = entry.path;
    a.textContent = labelOf(entry);
    if (entry.path === here) {
      li.classList.add('sidenav-active');
      a.setAttribute('aria-current', 'page');
    }
    li.append(a);
    list.append(li);
  });

  block.append(list);
}
