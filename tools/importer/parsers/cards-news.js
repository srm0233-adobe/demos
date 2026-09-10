/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-news
 * Base block: cards (repo variant — blocks/cards-news/cards-news.js)
 * Source: Food Network homepage — .o-StoryPromo ("What's New")
 *
 * Base "cards" convention: 2 columns, one row per card (image cell + text cell).
 * This news variant renders each row as
 *   [ image | eyebrow (category/time) + linked headline + description ].
 * decorate() treats the FIRST link-less <p> in the text cell as the eyebrow, so
 * the category/time is emitted as a plain <p> BEFORE the linked headline.
 *
 * Source DOM — repeated .m-StoryCard, each:
 *   .m-StoryCard__m-TextWrap
 *     p.m-StoryCard__a-Time                        (eyebrow — e.g. "Just Now")
 *     .m-StoryCard__a-Headline > a                 (linked headline)
 *     .m-StoryCard__a-Description                  (short description)
 *   .m-StoryCard__m-MediaWrap > a > img.a-Image    (story image, linked)
 */
export default function parse(element, { document }) {
  const stories = [...element.querySelectorAll('.m-StoryCard')];

  const cells = [];

  stories.forEach((story) => {
    const img = story.querySelector('.m-StoryCard__m-MediaWrap img, img[class*="a-Image"], img');

    const body = [];

    // Eyebrow: category tag or timestamp. Rendered as a plain (link-less) <p>.
    const time = story.querySelector('.m-StoryCard__a-Time, [class*="a-Time"], [class*="a-Label"]');
    const eyebrowText = time ? time.textContent.trim() : '';
    if (eyebrowText) {
      const p = document.createElement('p');
      p.textContent = eyebrowText;
      body.push(p);
    }

    // Linked headline.
    const headline = story.querySelector('.m-StoryCard__a-Headline');
    const titleLink = headline ? headline.querySelector('a[href]') : null;
    const titleText = (headline ? headline.textContent : '').trim();
    if (titleLink && titleText) {
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = titleLink.getAttribute('href');
      a.textContent = titleText;
      h3.append(a);
      body.push(h3);
    } else if (titleText) {
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      body.push(h3);
    }

    // Description.
    const desc = story.querySelector('.m-StoryCard__a-Description');
    const descText = desc ? desc.textContent.trim() : '';
    if (descText) {
      const p = document.createElement('p');
      p.textContent = descText;
      body.push(p);
    }

    if (!img && body.length === 0) return;

    // 2-column row: [ image | eyebrow + headline + description ].
    cells.push([img || '', body.length ? body : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Section heading ("What's New").
  const headingSource = element.querySelector(
    '.o-Capsule__a-HeadlineText, .o-Capsule__a-Headline, header h2, h2',
  );

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });

  if (headingSource && headingSource.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSource.textContent.trim();
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
