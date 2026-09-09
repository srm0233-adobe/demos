import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * asset-detail — asset preview (left) + info panel (right).
 *
 * Authored as key/value rows (like a metadata block):
 *   | Asset Detail    |                                              |
 *   | image           | <picture>                                    |
 *   | description     | AT&T employees photographed in a meeting …   |
 *   | expiration      | 09/15/28                                     |
 *   | photography-type| Custom                                       |
 *   | license         | Rights Managed                               |
 *   | keywords        | Brand Shoot, 2025, brand, …                  |
 *   | download        | /path/to/download                            |
 *   | cart            | /path/to/cart                                |
 *   | tags            | RGB, Office, Interiors, Photography, …        |
 *
 * Any key may be omitted. The block builds the two-column layout and styles
 * the info sections; the download/cart values become the two CTA buttons.
 */

function firstLink(cell) {
  const a = cell.querySelector('a');
  return a ? a.getAttribute('href') : (cell.textContent.trim() || '#');
}

export default function decorate(block) {
  // Read key/value rows.
  const data = {};
  let imageCell = null;
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = [...row.children];
    if (!valueCell) return;
    const key = keyCell.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    if (key === 'image') {
      imageCell = valueCell;
    } else {
      data[key] = valueCell;
    }
  });

  block.textContent = '';

  // ---- media column ----
  const media = document.createElement('div');
  media.className = 'asset-detail-media';
  if (imageCell) {
    const pic = imageCell.querySelector('picture');
    if (pic) media.append(pic);
  }

  // ---- info column ----
  const info = document.createElement('div');
  info.className = 'asset-detail-info';

  // tabs
  const tabs = document.createElement('div');
  tabs.className = 'asset-detail-tabs';
  tabs.innerHTML = '<a href="#details" class="asset-detail-tab active">Details</a><a href="#usage-rights" class="asset-detail-tab">Usage Rights</a>';
  info.append(tabs);

  const addField = (label, node, className) => {
    const p = document.createElement('p');
    p.className = className;
    if (label) {
      const strong = document.createElement('strong');
      strong.textContent = `${label} `;
      p.append(strong);
    }
    p.append(node);
    info.append(p);
  };

  if (data.description) {
    addField('Description:', document.createTextNode(data.description.textContent.trim()), 'asset-detail-description');
  }

  if (data.expiration) {
    const wrap = document.createElement('div');
    wrap.className = 'asset-detail-expiration';
    const date = document.createElement('span');
    date.className = 'asset-detail-expiration-date';
    date.textContent = data.expiration.textContent.trim();
    const lbl = document.createElement('span');
    lbl.className = 'asset-detail-expiration-label';
    lbl.textContent = 'Expiration Date';
    wrap.append(date, lbl);
    info.append(wrap);
  }

  if (data['photography-type'] || data.license) {
    const meta = document.createElement('div');
    meta.className = 'asset-detail-meta';
    const col = (value, label) => {
      const c = document.createElement('div');
      c.className = 'asset-detail-meta-col';
      const v = document.createElement('span');
      v.className = 'asset-detail-meta-value';
      v.textContent = value;
      const l = document.createElement('span');
      l.className = 'asset-detail-meta-label';
      l.textContent = label;
      c.append(v, l);
      return c;
    };
    if (data['photography-type']) meta.append(col(data['photography-type'].textContent.trim(), 'Photography type'));
    if (data.license) meta.append(col(data.license.textContent.trim(), 'License Info'));
    info.append(meta);
  }

  if (data.keywords) {
    addField('Keywords:', document.createTextNode(data.keywords.textContent.trim()), 'asset-detail-keywords');
  }

  // CTA buttons
  if (data.download || data.cart) {
    const cta = document.createElement('div');
    cta.className = 'asset-detail-cta';
    if (data.download) {
      const dl = document.createElement('a');
      dl.className = 'asset-detail-button';
      dl.href = firstLink(data.download);
      dl.textContent = 'Download';
      cta.append(dl);
    }
    if (data.cart) {
      const cart = document.createElement('a');
      cart.className = 'asset-detail-button';
      cart.href = firstLink(data.cart);
      cart.textContent = 'Add to cart';
      cta.append(cart);
    }
    info.append(cta);
  }

  // tags (comma list -> links) + See All
  if (data.tags) {
    const tagsWrap = document.createElement('p');
    tagsWrap.className = 'asset-detail-tags';
    const list = data.tags.textContent.split(',').map((t) => t.trim()).filter(Boolean);
    list.forEach((t, i) => {
      const a = document.createElement('a');
      a.href = `/att-brand-center/search?q=${encodeURIComponent(t)}`;
      a.textContent = t;
      tagsWrap.append(a);
      if (i < list.length - 1) tagsWrap.append(document.createTextNode(', '));
    });
    const seeAll = document.createElement('a');
    seeAll.className = 'asset-detail-see-all';
    seeAll.href = '#see-all';
    seeAll.textContent = 'See All';
    tagsWrap.append(document.createTextNode(' … '), seeAll);
    info.append(tagsWrap);
  }

  // optimize the image
  const img = media.querySelector('picture > img');
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimized);
  }

  block.append(media, info);
}
