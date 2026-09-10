import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Closes every open header panel (menu / search / brand selector) and clears
 * the active state on the trigger buttons.
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-panel').forEach((p) => p.classList.remove('open'));
  nav.querySelectorAll('.nav-action[aria-expanded="true"], .nav-brand-selector[aria-expanded="true"]')
    .forEach((t) => t.setAttribute('aria-expanded', 'false'));
  nav.classList.remove('nav-open');
  document.body.style.overflowY = '';
}

/**
 * Toggles a panel open/closed. Opening a panel closes any other open panel.
 */
function togglePanel(nav, trigger, panel) {
  const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  closeAllPanels(nav);
  if (!isOpen) {
    trigger.setAttribute('aria-expanded', 'true');
    if (panel) {
      panel.classList.add('open');
      nav.classList.add('nav-open');
      if (!isDesktop.matches) document.body.style.overflowY = 'hidden';
    }
  }
}

/** Builds an SVG-free icon element (CSS draws the glyph). */
function icon(name) {
  const i = document.createElement('span');
  i.className = `nav-icon nav-icon-${name}`;
  i.setAttribute('aria-hidden', 'true');
  return i;
}

/**
 * True when the current page lives in the Food Network section, so the header
 * should render the Food Network nav rather than the AT&T Brand Center nav.
 */
function isFoodNetwork() {
  return window.location.pathname.replace('/content', '').startsWith('/foodnetwork');
}

// Inline SVG glyphs for the Food Network header. Explicit #1a1a1a stroke/fill
// so they render charcoal regardless of the surrounding cascade (a bare
// currentcolor/mask approach was inheriting the global link/button colors).
const FN_ICON_SVG = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M21 21l-4.3-4.3"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 12.4a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L21 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path stroke-linecap="round" d="M4 21a8 8 0 0 1 16 0"/></svg>',
};

// Food Network round logo badge: red circle with a white "food" script + a
// small "network" wordmark beneath. Drawn as SVG so it's crisp and self-colored.
const FN_LOGO_SVG = '<svg viewBox="0 0 100 100" role="img" aria-label="Food Network"><circle cx="50" cy="50" r="50" fill="#c8102e"/><text x="50" y="52" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-style="italic" font-weight="700" font-size="34" fill="#fff">food</text><text x="50" y="70" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="10" letter-spacing="1.5" fill="#fff">NETWORK</text></svg>';

/** Builds an inline-SVG icon span for the Food Network header. */
function fnIcon(name) {
  const i = document.createElement('span');
  i.className = `nav-icon nav-icon-${name}`;
  i.setAttribute('aria-hidden', 'true');
  i.innerHTML = FN_ICON_SVG[name] || '';
  return i;
}

/**
 * Loads and decorates the Food Network header to match the reference site:
 * hamburger + round logo badge on the left, primary category links, a search
 * field, and bookmark / cart / account action icons on the right.
 * @param {Element} block The header block element
 */
async function decorateFoodNetwork(block) {
  let fragment = await loadFragment('/content/foodnetwork/nav');
  if (!fragment) fragment = await loadFragment('/foodnetwork/nav');
  if (!fragment) return;

  // Parse robustly regardless of how the fragment is sectioned — Document
  // Authoring can collapse the authored blocks (logo / primary / utility) into
  // a single <div>, so select by role: brand = first standalone link (not in a
  // <ul>), primary nav = first <ul>.
  const primaryList = fragment.querySelector('ul');
  const logoLink = [...fragment.querySelectorAll('a')].find((a) => !a.closest('ul')) || null;
  const homeHref = logoLink?.getAttribute('href') || '/foodnetwork/index';

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.classList.add('nav-foodnetwork');

  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  // --- Hamburger ----------------------------------------------------------
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.append(fnIcon('menu'));

  // --- Logo badge ---------------------------------------------------------
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandLink = document.createElement('a');
  brandLink.href = homeHref;
  brandLink.setAttribute('aria-label', 'Food Network');
  const logo = document.createElement('span');
  logo.className = 'nav-logo';
  logo.innerHTML = FN_LOGO_SVG;
  brandLink.append(logo);
  brand.append(brandLink);

  // --- Primary links ------------------------------------------------------
  const links = document.createElement('ul');
  links.className = 'nav-links';
  primaryList?.querySelectorAll(':scope > li > a').forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent;
    li.append(link);
    links.append(li);
  });

  // --- Search -------------------------------------------------------------
  const search = document.createElement('form');
  search.className = 'nav-search';
  search.setAttribute('role', 'search');
  search.action = '//www.foodnetwork.com/search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.name = 'searchTerm';
  searchInput.placeholder = 'What are you looking for?';
  searchInput.className = 'nav-search-input';
  searchInput.setAttribute('aria-label', 'Search');
  const searchSubmit = document.createElement('button');
  searchSubmit.type = 'submit';
  searchSubmit.className = 'nav-search-submit';
  searchSubmit.setAttribute('aria-label', 'Search');
  searchSubmit.append(fnIcon('search'));
  search.append(searchInput, searchSubmit);

  // --- Action icons (bookmark / cart / account) ---------------------------
  const actions = document.createElement('div');
  actions.className = 'nav-actions';
  [
    { name: 'bookmark', label: 'Saved', href: '//www.foodnetwork.com/site/newsletter-sign-up' },
    { name: 'cart', label: 'Shopping list', href: '//www.foodnetwork.com/shopping-list' },
    { name: 'user', label: 'Account', href: '//www.foodnetwork.com/profiles' },
  ].forEach(({ name, label, href }) => {
    const a = document.createElement('a');
    a.className = `nav-action nav-action-${name}`;
    a.href = href;
    a.setAttribute('aria-label', label);
    a.append(fnIcon(name));
    actions.append(a);
  });

  bar.append(hamburger, brand, links, search, actions);
  nav.append(bar);

  // Hamburger toggles the primary links on small screens.
  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', String(open));
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

/**
 * loads and decorates the header for the AT&T Brand Center layout:
 * logo | Menu / Search / My Workspace | avatar + brand selector.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Food Network pages get their own simpler nav; AT&T pages fall through.
  if (isFoodNetwork()) {
    await decorateFoodNetwork(block);
    return;
  }

  // load nav as fragment — metadata-independent dual-fetch. The nav lives in
  // the att-brand-center section: /content/att-brand-center/nav (localhost /
  // aem up) first, then /att-brand-center/nav (DA/EDS production).
  let fragment = await loadFragment('/content/att-brand-center/nav');
  if (!fragment) fragment = await loadFragment('/att-brand-center/nav');

  // The fragment sections, in order:
  //   0: logo, 1: megamenu columns, 2: My Workspace, 3: brand options, 4: popular searches
  const sections = [...fragment.children];
  const logoSection = sections[0];
  const menuSection = sections[1];
  const workspaceSection = sections[2];
  const brandSection = sections[3];
  const searchSection = sections[4];

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // ---- Top bar -------------------------------------------------------------
  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  // Brand / logo (left)
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const logoLink = logoSection?.querySelector('a');
  if (logoLink) brand.append(logoLink);

  // Center actions: Menu, Search, My Workspace
  const actions = document.createElement('div');
  actions.className = 'nav-actions';

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'nav-action nav-action-menu';
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.append(icon('menu'), Object.assign(document.createElement('span'), { textContent: 'Menu' }));

  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'nav-action nav-action-search';
  searchBtn.setAttribute('aria-expanded', 'false');
  searchBtn.append(icon('search'), Object.assign(document.createElement('span'), { textContent: 'Search' }));

  const workspaceLink = document.createElement('a');
  workspaceLink.className = 'nav-action nav-action-workspace';
  const wsSrc = workspaceSection?.querySelector('a');
  workspaceLink.href = wsSrc ? wsSrc.getAttribute('href') : '/att-brand-center/workspace';
  workspaceLink.append(icon('workspace'), Object.assign(document.createElement('span'), { textContent: 'My Workspace' }));

  actions.append(menuBtn, searchBtn, workspaceLink);

  // Right side: user avatar + brand selector
  const account = document.createElement('div');
  account.className = 'nav-account';

  const avatar = document.createElement('span');
  avatar.className = 'nav-avatar';
  avatar.setAttribute('aria-label', 'Profile');
  avatar.setAttribute('role', 'img');

  const brandSelector = document.createElement('button');
  brandSelector.type = 'button';
  brandSelector.className = 'nav-brand-selector';
  brandSelector.setAttribute('aria-expanded', 'false');
  const brandLabel = document.createElement('span');
  brandLabel.className = 'nav-brand-selector-label';
  brandLabel.textContent = 'AT&T brand';
  brandSelector.append(brandLabel, icon('chevron'));

  account.append(avatar, brandSelector);

  bar.append(brand, actions, account);
  nav.append(bar);

  // ---- Menu panel (megamenu) ----------------------------------------------
  const menuPanel = document.createElement('div');
  menuPanel.className = 'nav-panel nav-panel-menu';
  const menuInner = document.createElement('div');
  menuInner.className = 'nav-panel-inner nav-megamenu';

  // Each top-level <li> in the menu section becomes a column (heading + links).
  // loadFragment wraps content in .default-content-wrapper, so find the first
  // <ul> in the section and take its direct <li> children.
  const menuList = menuSection ? menuSection.querySelector('ul') : null;
  const topItems = menuList ? [...menuList.querySelectorAll(':scope > li')] : [];
  topItems.forEach((li) => {
    // The heading link may be a direct child or wrapped in a <p> after the
    // fragment round-trips through Document Authoring. Take the first <a> that
    // is NOT inside the nested <ul>.
    const sublist = li.querySelector(':scope > ul');
    const heading = [...li.querySelectorAll('a')].find((a) => !sublist || !sublist.contains(a));
    if (heading && sublist) {
      const col = document.createElement('div');
      col.className = 'nav-megamenu-col';
      const h = document.createElement('a');
      h.className = 'nav-megamenu-heading';
      h.href = heading.getAttribute('href');
      h.textContent = heading.textContent;
      col.append(h);
      const list = document.createElement('ul');
      sublist.querySelectorAll(':scope > li > a').forEach((a) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent;
        item.append(link);
        list.append(item);
      });
      col.append(list);
      menuInner.append(col);
    }
  });
  menuPanel.append(menuInner);

  // Standalone links (e.g. FAQ and Help) render below the columns — a top item
  // with no nested <ul>. The link may be wrapped in a <p>.
  const standalone = topItems.filter((li) => !li.querySelector(':scope > ul') && li.querySelector('a'));
  if (standalone.length) {
    const foot = document.createElement('div');
    foot.className = 'nav-megamenu-foot';
    standalone.forEach((li) => {
      const a = li.querySelector('a');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent;
      foot.append(link);
    });
    menuPanel.append(foot);
  }
  nav.append(menuPanel);

  // ---- Search panel --------------------------------------------------------
  const searchPanel = document.createElement('div');
  searchPanel.className = 'nav-panel nav-panel-search';
  const searchInner = document.createElement('div');
  searchInner.className = 'nav-panel-inner';

  const searchForm = document.createElement('form');
  searchForm.className = 'nav-search-form';
  searchForm.setAttribute('role', 'search');
  searchForm.action = '/att-brand-center/search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.placeholder = 'Search Item';
  searchInput.className = 'nav-search-input';
  searchInput.setAttribute('aria-label', 'Search');
  const searchSubmit = document.createElement('button');
  searchSubmit.type = 'submit';
  searchSubmit.className = 'nav-search-submit';
  searchSubmit.setAttribute('aria-label', 'Search');
  searchSubmit.append(icon('search'));
  searchForm.append(searchInput, searchSubmit);
  searchInner.append(searchForm);

  // Popular searches (heading + link grid) from the fragment.
  if (searchSection) {
    const popTitle = document.createElement('p');
    popTitle.className = 'nav-search-popular-title';
    popTitle.textContent = (searchSection.querySelector('p')?.textContent || 'Popular Searches');
    const popList = document.createElement('ul');
    popList.className = 'nav-search-popular';
    searchSection.querySelectorAll('ul > li > a').forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent;
      li.append(link);
      popList.append(li);
    });
    searchInner.append(popTitle, popList);
  }
  searchPanel.append(searchInner);
  nav.append(searchPanel);

  // ---- Brand selector panel ------------------------------------------------
  const brandPanel = document.createElement('div');
  brandPanel.className = 'nav-panel nav-panel-brand';
  const brandInner = document.createElement('div');
  brandInner.className = 'nav-panel-inner nav-brand-options';
  if (brandSection) {
    brandSection.querySelectorAll('ul > li').forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      // Description is the text node after the link (" — Explore ...").
      const desc = li.textContent.replace(a.textContent, '').replace(/^\s*[—-]\s*/, '').trim();
      const opt = document.createElement('a');
      opt.className = 'nav-brand-option';
      opt.href = a.getAttribute('href');
      const title = document.createElement('span');
      title.className = 'nav-brand-option-title';
      title.textContent = a.textContent;
      opt.append(title);
      if (desc) {
        const caption = document.createElement('span');
        caption.className = 'nav-brand-option-caption';
        caption.textContent = desc;
        opt.append(caption);
      }
      brandInner.append(opt);
    });
  }
  brandPanel.append(brandInner);
  nav.append(brandPanel);

  // ---- Close button (inside expanded panels) -------------------------------
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nav-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', () => closeAllPanels(nav));
  nav.append(closeBtn);

  // ---- Wiring --------------------------------------------------------------
  menuBtn.addEventListener('click', () => togglePanel(nav, menuBtn, menuPanel));
  searchBtn.addEventListener('click', () => {
    const willOpen = searchBtn.getAttribute('aria-expanded') !== 'true';
    togglePanel(nav, searchBtn, searchPanel);
    if (willOpen) searchInput.focus();
  });
  brandSelector.addEventListener('click', () => togglePanel(nav, brandSelector, brandPanel));

  // Selecting a brand updates the label and closes the panel.
  brandInner.querySelectorAll('.nav-brand-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.preventDefault();
      brandLabel.textContent = opt.querySelector('.nav-brand-option-title').textContent;
      closeAllPanels(nav);
    });
  });

  // Close on Escape and on outside click.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllPanels(nav);
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllPanels(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
