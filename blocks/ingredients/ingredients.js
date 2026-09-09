/**
 * Ingredients — a checkable list of recipe ingredients.
 *
 * Expected authored structure: one row per ingredient, each a single
 * cell of text, e.g.
 *   | 2 tablespoons olive oil |
 *   | 1/2 Vidalia onion, chopped |
 *
 * Each ingredient renders as a list item with a checkbox affordance so
 * cooks can tick items off.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'ingredients-list';

  [...block.children].forEach((row) => {
    const cell = row.firstElementChild || row;
    const text = cell.innerHTML.trim();
    if (!text) return;

    const li = document.createElement('li');
    li.className = 'ingredients-item';

    const label = document.createElement('label');
    label.className = 'ingredients-check';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const span = document.createElement('span');
    span.className = 'ingredients-text';
    span.innerHTML = text;

    label.append(checkbox, span);
    li.append(label);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
