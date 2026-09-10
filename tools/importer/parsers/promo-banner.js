/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: promo-banner
 * Base block: promo-banner (repo block — blocks/promo-banner/promo-banner.js)
 * Source: Food Network homepage — .o-FullWidthPromo "Food Network Magazine"
 *   (a colored subscription band: image + heading + CTA link to the shop).
 *
 * Emits the promo content: image, heading, and a CTA link so the band renders
 * with its subscribe call-to-action. Source shop URL and FN CDN image URL are
 * preserved for the import-script localization step.
 *
 * Source DOM:
 *   .m-FeatureCard
 *     .m-FeatureCard__m-MediaWrap > a[href=shop…] > … img.a-Image   (image, linked)
 *     .m-FeatureCard__m-TextWrap
 *       .m-FeatureCard__a-Label            (eyebrow — e.g. "The August/September Issue")
 *       .m-FeatureCard__a-Headline > a     (heading, linked to shop)
 */
export default function parse(element, { document }) {
  const card = element.querySelector('.m-FeatureCard, .o-FullWidthPromo__m-FeatureCard') || element;

  const img = card.querySelector('.m-FeatureCard__m-MediaWrap img, img[class*="a-Image"], img');

  const contentCell = [];
  if (img) contentCell.push(img);

  // Eyebrow / issue label.
  const label = card.querySelector('.m-FeatureCard__a-Label, [class*="a-Label"]');
  const labelText = label ? label.textContent.trim() : '';
  if (labelText) {
    const p = document.createElement('p');
    p.textContent = labelText;
    contentCell.push(p);
  }

  // Heading + CTA link (both point at the subscription shop URL).
  const headline = card.querySelector('.m-FeatureCard__a-Headline');
  const ctaLink = headline
    ? headline.querySelector('a[href]')
    : card.querySelector('.m-FeatureCard__m-TextWrap a[href], .m-FeatureCard__m-MediaWrap a[href]');
  const headingText = (headline ? headline.textContent : (ctaLink ? ctaLink.textContent : '')).trim();

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    contentCell.push(h2);
  }

  // CTA as a real link (button). Use a concise action label to avoid repeating
  // the headline text verbatim.
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href');
    a.textContent = 'Subscribe';
    contentCell.push(a);
  }

  // Empty-block guard.
  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single-column band: one row, one cell holding image + heading + CTA.
  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'promo-banner', cells });
  element.replaceWith(block);
}
