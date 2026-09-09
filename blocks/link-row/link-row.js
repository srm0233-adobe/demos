/*
 * link-row — full-width action row(s): leading icon + linked label + chevron.
 *
 * Authored one row per action, two cells (icon | linked label):
 *   | Link Row |                                    |
 *   | :book:   | [Check out the Photography guideline](/…) |
 *   | :people: | [Photography](/…)                        |
 *
 * The icon cell may hold an EDS icon span (:name:) or an image; if empty, a
 * default marker is shown. Each row becomes a bordered card with a chevron.
 */
export default function decorate(block) {
  const list = document.createElement('div');
  list.className = 'link-row-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells[0];
    const labelCell = cells[1] || cells[0];
    const link = labelCell ? labelCell.querySelector('a[href]') : null;

    const item = document.createElement('a');
    item.className = 'link-row-item';
    item.href = link ? link.getAttribute('href') : '#';

    const icon = document.createElement('span');
    icon.className = 'link-row-icon';
    const authoredIcon = iconCell && cells.length > 1
      ? (iconCell.querySelector('.icon, img'))
      : null;
    if (authoredIcon) icon.append(authoredIcon);
    item.append(icon);

    const label = document.createElement('span');
    label.className = 'link-row-label';
    label.textContent = link ? link.textContent.trim() : labelCell.textContent.trim();
    item.append(label);

    const chevron = document.createElement('span');
    chevron.className = 'link-row-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    item.append(chevron);

    list.append(item);
  });

  block.textContent = '';
  block.append(list);
}
