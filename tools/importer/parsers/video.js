/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: video
 * Base block: video (block collection — blocks/video/video.js)
 * Source: Food Network homepage — section.kdp (Kaltura player, "Featured Video")
 *
 * Video convention: 1 column, block-name row + a content row whose single cell
 * holds the video source link and an optional poster image. decorate() reads
 * `block.querySelector('a').href` and shows the poster with a play overlay.
 *
 * The Kaltura (.kdp) player has no server-rendered video URL or entry id in the
 * markup (playback is JS-driven), so we emit the poster image and link to the
 * Food Network video hub as the destination. The source poster image URL
 * (food.fnr.sndimg.com) is preserved for the import-script localization step.
 */
export default function parse(element, { document }) {
  // Poster image (the featured video's still).
  const poster = element.querySelector(
    '.kdp-poster__image, img[class*="poster"], .kdp__player-container img, img',
  );

  const contentCell = [];
  if (poster) contentCell.push(poster);

  // Video link. The Kaltura markup exposes no direct video URL, so link to the
  // Food Network video hub, labelled with the poster's title when available.
  const label = (poster && poster.getAttribute('alt')) || 'Watch Video';
  const link = document.createElement('a');
  link.href = 'https://www.foodnetwork.com/videos';
  link.textContent = label;
  contentCell.push(link);

  // Empty-block guard: nothing to show at all.
  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single-column block: one row, one cell holding poster + link.
  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'video', cells });
  element.replaceWith(block);
}
