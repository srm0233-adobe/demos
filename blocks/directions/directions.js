/**
 * Directions — auto-numbered sequential recipe steps.
 *
 * Expected authored structure: one row per step, each a single cell of
 * step text, e.g.
 *   | Heat oil and 1 tablespoon butter in a skillet... |
 *   | Season the chicken with salt and pepper... |
 *
 * Steps render as an ordered list so numbering is automatic; a single
 * cell holding one long paragraph is treated as one step.
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  ol.className = 'directions-list';

  [...block.children].forEach((row) => {
    const cell = row.firstElementChild || row;
    const html = cell.innerHTML.trim();
    if (!html) return;

    const li = document.createElement('li');
    li.className = 'directions-step';

    const body = document.createElement('div');
    body.className = 'directions-step-body';
    body.innerHTML = html;

    li.append(body);
    ol.append(li);
  });

  block.replaceChildren(ol);
}
