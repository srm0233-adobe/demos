/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-spotlight
 * Base block: cards (repo variant — blocks/cards-spotlight/cards-spotlight.js)
 * Source: Food Network homepage — .o-FullWidthPromo with a single .m-FeatureCard
 *
 * Base "cards" convention: 2 columns, one row per card — cell 1 = image,
 * cell 2 = text. This spotlight variant is a single large feature, so it emits
 * exactly ONE row: [ image | linked headline ]. No description, no CTA
 * (matches blocks/cards-spotlight/cards-spotlight.js decorate).
 *
 * Source DOM:
 *   .o-FullWidthPromo__m-FeatureCard / .m-FeatureCard
 *     .m-FeatureCard__m-MediaWrap > a > … img.a-Image           (photo, linked)
 *     .m-FeatureCard__m-TextWrap .m-FeatureCard__a-Headline > a  (linked headline)
 */
export default function parse(element, { document }) {
  const card = element.querySelector('.m-FeatureCard, .o-FullWidthPromo__m-FeatureCard') || element;

  const img = card.querySelector('.m-FeatureCard__m-MediaWrap img, img[class*="a-Image"], img');

  const headline = card.querySelector('.m-FeatureCard__a-Headline');
  const titleLink = headline
    ? headline.querySelector('a[href]')
    : card.querySelector('.m-FeatureCard__m-TextWrap a[href]');
  const titleText = (headline ? headline.textContent : (titleLink ? titleLink.textContent : '')).trim();

  // Empty-block guard.
  if (!img && !titleText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  let body = '';
  if (titleLink && titleText) {
    const a = document.createElement('a');
    a.href = titleLink.getAttribute('href');
    a.textContent = titleText;
    body = a;
  } else if (titleText) {
    const p = document.createElement('p');
    p.textContent = titleText;
    body = p;
  }

  // Single row, two cells: [ image | linked headline ].
  const cells = [[img || '', body]];

  const headingSource = element.querySelector(
    '.o-FullWidthPromo__a-HeadlineText, .o-FullWidthPromo__a-Headline, header h2, h2',
  );

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-spotlight', cells });

  if (headingSource && headingSource.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSource.textContent.trim();
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
