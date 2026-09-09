/*
 * spacer — reusable vertical spacing block.
 *
 * Drop a Spacer block into a section to add empty vertical space (padding)
 * above or below the surrounding content. Optional size via the block's cell:
 *   | Spacer |        -> default (medium)
 *   | Spacer |
 *   | large  |        -> small | medium | large | xlarge, or a length (e.g. 120px, 4rem)
 *
 * A named size maps to a CSS class; a length value is applied inline as height.
 */

const SIZES = ['small', 'medium', 'large', 'xlarge'];

export default function decorate(block) {
  const value = (block.textContent || '').trim().toLowerCase();
  block.textContent = '';

  let size = 'medium';
  if (SIZES.includes(value)) {
    size = value;
  } else if (value && /^\d+(\.\d+)?(px|rem|em|vh)$/.test(value)) {
    // explicit length — apply directly and skip the named-size class
    block.style.height = value;
    block.setAttribute('aria-hidden', 'true');
    return;
  }

  block.classList.add(`spacer-${size}`);
  block.setAttribute('aria-hidden', 'true');
}
