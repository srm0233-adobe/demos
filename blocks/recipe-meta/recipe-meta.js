/**
 * Recipe Meta — a compact horizontal strip of recipe stats.
 *
 * Expected authored structure: one row per stat, each row a
 * label / value pair, e.g.
 *   | Level | Easy |
 *   | Total | 40 min |
 *   | Prep  | 15 min |
 *   | Cook  | 25 min |
 *   | Yield | 4 servings |
 *   | Nutrition Info | [link] |
 *
 * A single-value row (one cell) renders as a standalone item (e.g. a
 * "Nutrition Info" link with no label).
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    const item = document.createElement('div');
    item.className = 'recipe-meta-item';

    const [labelCell, valueCell] = cells;
    if (valueCell) {
      const label = document.createElement('span');
      label.className = 'recipe-meta-label';
      label.innerHTML = labelCell.innerHTML;

      const value = document.createElement('span');
      value.className = 'recipe-meta-value';
      value.innerHTML = valueCell.innerHTML;

      item.append(label, value);
    } else if (labelCell) {
      // Single cell — a standalone value/link (e.g. "Nutrition Info").
      const value = document.createElement('span');
      value.className = 'recipe-meta-value';
      value.innerHTML = labelCell.innerHTML;
      item.append(value);
    }
    return item;
  });

  // Group the stats into columns of two stacked rows (Level/Total, Prep/Cook,
  // Yield/Nutrition), matching foodnetwork.com's 3-column meta strip with
  // vertical dividers between columns.
  const strip = document.createElement('div');
  strip.className = 'recipe-meta-strip';
  for (let i = 0; i < items.length; i += 2) {
    const col = document.createElement('div');
    col.className = 'recipe-meta-col';
    col.append(...items.slice(i, i + 2));
    strip.append(col);
  }

  // EDS decorateButtons() wraps standalone links (e.g. "Nutrition Info") as
  // .button / .button-container before blocks decorate. Strip that so meta
  // links render as plain text links, not CTA pills.
  strip.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  strip.querySelectorAll('.button-container').forEach((c) => {
    c.replaceWith(...c.childNodes);
  });

  block.replaceChildren(strip);
}
