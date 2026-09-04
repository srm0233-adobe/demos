/*
 * sidenav — reusable, folder-driven sticky side navigation for a site section.
 *
 * Renders the child pages of the current section from that section's query
 * index, so any section (guidelines, assets, connect, …) can reuse it by
 * dropping a Sidenav block on the page.
 *
 * Authoring: first row is the section heading label; optional following rows
 * are key/value config.
 *   | Sidenav        |
 *   | Guidelines     |
 *   | in-page | h2   |   <- which content heading levels become jump links
 *
 * `in-page` accepts: a comma list of heading levels (e.g. "h2" or "h1, h2"),
 * or "off"/"none" to disable in-page jump links. Default: "h2".
 *
 * In-page jump links: for the ACTIVE page, the sidenav nests the page's own
 * content headings (at the configured levels) beneath its entry as anchor
 * links that scroll to the section, with a scrollspy that highlights the
 * section currently in view.
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

/** slugify heading text into a stable anchor id. */
function slug(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Read the block's authored cells into { label, config } before we clear it.
 * Row 1 = section label. Later rows with 2 cells = key/value config.
 */
function readAuthoring(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  let label = '';
  const config = {};
  rows.forEach((row, i) => {
    const cells = [...row.children];
    if (i === 0) {
      label = (cells[0]?.textContent || '').trim();
    } else if (cells.length >= 2) {
      config[cells[0].textContent.trim().toLowerCase()] = cells[1].textContent.trim();
    }
  });
  return { label, config };
}

/** Which heading levels become in-page jump links (default h2; off = none). */
function inPageLevels(config) {
  const raw = (config['in-page'] || 'h2').toLowerCase();
  if (raw === 'off' || raw === 'none' || raw === 'false') return [];
  return raw.split(',').map((s) => s.trim()).filter((s) => /^h[1-6]$/.test(s));
}

/** Collect content headings (at the given levels) from the page's default content. */
function collectSectionHeadings(levels) {
  if (!levels.length) return [];
  const scope = document.querySelector('main .sidenav-container .default-content-wrapper')
    || document.querySelector('main');
  if (!scope) return [];
  const sel = levels.join(',');
  return [...scope.querySelectorAll(sel)]
    .filter((h) => h.textContent.trim())
    .map((h) => {
      if (!h.id) h.id = slug(h.textContent);
      return { id: h.id, text: h.textContent.trim(), el: h };
    });
}

/** Highlight the in-view section link as the user scrolls (scrollspy). */
function initScrollSpy(headings, linkById) {
  if (!headings.length || !('IntersectionObserver' in window)) return;
  const setActive = (id) => {
    linkById.forEach((li, key) => li.classList.toggle('sidenav-subactive', key === id));
  };
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    });
    // Highlight the first heading (document order) currently visible.
    const firstVisible = headings.find((h) => visible.has(h.id));
    if (firstVisible) setActive(firstVisible.id);
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
  headings.forEach((h) => observer.observe(h.el));
}

export default async function decorate(block) {
  const here = window.location.pathname.replace(/\.html$/, '');
  const sectionPath = sectionPathFor(here);

  const { label: authored, config } = readAuthoring(block);
  const folderName = sectionPath.split('/').pop() || '';
  const sectionLabel = authored
    || folderName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  block.textContent = '';

  const all = await fetchIndex(sectionPath);
  // Real content pages in this section (skip the index row itself).
  const entries = all.filter((e) => (e.path || '') !== `${sectionPath}/query-index`);
  const ordered = orderEntries(entries, SECTION_ORDER[sectionPath]);

  // In-page jump-link headings for the active page.
  const levels = inPageLevels(config);
  const sectionHeadings = collectSectionHeadings(levels);

  const heading = document.createElement('p');
  heading.className = 'sidenav-heading';
  heading.textContent = sectionLabel;
  block.append(heading);

  const list = document.createElement('ul');
  list.className = 'sidenav-list';

  const linkById = new Map();

  ordered.forEach((entry) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = entry.path;
    a.textContent = labelOf(entry);
    li.append(a);

    if (entry.path === here) {
      li.classList.add('sidenav-active');
      a.setAttribute('aria-current', 'page');

      // Nest this page's in-page section headings as jump links.
      if (sectionHeadings.length) {
        const sub = document.createElement('ul');
        sub.className = 'sidenav-sublist';
        sectionHeadings.forEach((h) => {
          const subLi = document.createElement('li');
          const subA = document.createElement('a');
          subA.href = `#${h.id}`;
          subA.textContent = h.text;
          subA.addEventListener('click', (e) => {
            e.preventDefault();
            h.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', `#${h.id}`);
          });
          subLi.append(subA);
          sub.append(subLi);
          linkById.set(h.id, subLi);
        });
        li.append(sub);
      }
    }
    list.append(li);
  });

  block.append(list);

  initScrollSpy(sectionHeadings, linkById);
}
