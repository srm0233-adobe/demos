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
 * loads and decorates the header for the AT&T Brand Center layout:
 * logo | Menu / Search / My Workspace | avatar + brand selector.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment — metadata-independent dual-fetch:
  // /content/nav first (localhost / aem up), then /nav (DA/EDS production).
  let fragment = await loadFragment('/content/nav');
  if (!fragment) fragment = await loadFragment('/nav');

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
