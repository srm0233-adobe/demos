/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-chefs
 * Base block: cards (repo variant — blocks/cards-chefs/cards-chefs.js)
 * Source: Food Network homepage — .o-ProfilePromo / .o-Capsule ("Meet Our Chefs & Hosts")
 *
 * Base "cards" convention: 2 columns, one row per card (image cell + text cell).
 * This chefs variant renders each row as [ circular portrait | linked name + role/bio ].
 * decorate() puts the text-empty image cell as the portrait and the rest as body.
 *
 * Source DOM — repeated .m-MediaBlock (.o-Capsule__m-MediaBlock), each:
 *   .m-MediaBlock__m-MediaWrap > a > img.m-MediaBlock__a-Image     (portrait, linked)
 *   .m-MediaBlock__m-TextWrap
 *     .m-MediaBlock__a-Headline > a  (linked name)
 *     .m-MediaBlock__a-Description   (role / short bio)
 */
export default function parse(element, { document }) {
  const wraps = [...element.querySelectorAll('.m-MediaBlock__m-MediaWrap')];
  const texts = [...element.querySelectorAll('.m-MediaBlock__m-TextWrap')];
  const count = Math.max(wraps.length, texts.length);

  const cells = [];

  for (let i = 0; i < count; i += 1) {
    const wrap = wraps[i];
    const text = texts[i];

    const img = wrap ? wrap.querySelector('img') : null;

    const body = [];

    // Linked name.
    const headline = text ? text.querySelector('.m-MediaBlock__a-Headline') : null;
    const nameLink = headline ? headline.querySelector('a[href]') : null;
    const nameText = (headline ? headline.textContent : '').trim();
    if (nameLink && nameText) {
      const a = document.createElement('a');
      a.href = nameLink.getAttribute('href');
      a.textContent = nameText;
      body.push(a);
    } else if (nameText) {
      const p = document.createElement('p');
      p.textContent = nameText;
      body.push(p);
    }

    // Role / short bio.
    const desc = text ? text.querySelector('.m-MediaBlock__a-Description') : null;
    const descText = desc ? desc.textContent.trim() : '';
    if (descText) {
      const p = document.createElement('p');
      p.textContent = descText;
      body.push(p);
    }

    if (!img && body.length === 0) continue;

    // 2-column row: [ portrait | name + role ].
    cells.push([img || '', body.length ? body : '']);
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Section heading ("Meet Our Chefs & Hosts").
  const headingSource = element.querySelector(
    '.o-Capsule__a-HeadlineText, .o-Capsule__a-Headline, header h2, header h3, h2',
  );

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-chefs', cells });

  if (headingSource && headingSource.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSource.textContent.trim();
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
