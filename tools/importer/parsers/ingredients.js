/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: ingredients
 * Base block: cards (custom "ingredients list")
 * Source: Food Network recipe detail — apple-cider-chicken-recipe-1952273
 *   section.o-Recipe .o-Ingredients
 *
 * Source structure (.o-Ingredients):
 *   h2.o-Ingredients__a-Headline "Ingredients"
 *   repeated p.o-Ingredients__a-Ingredient, each holding a checkbox +
 *   span.o-Ingredients__a-Ingredient--CheckboxLabel with the ingredient text.
 *   A leading "--SelectAll" row ("Deselect All") is a UI control and is skipped.
 *
 * Emitted block table (matches blocks/ingredients/ingredients.js decorate):
 *   one single-cell row per ingredient (1 column):
 *     | 2 tablespoons olive oil |
 *     | 2 tablespoons butter |
 *     ...
 * The "Ingredients" heading is emitted as default content ABOVE the block
 * (the block itself only renders the checkbox list).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each ingredient is a p.o-Ingredients__a-Ingredient; skip the Select/Deselect
  // All control row (--SelectAll).
  const ingredientEls = element.querySelectorAll(
    '.o-Ingredients__a-Ingredient:not(.o-Ingredients__a-Ingredient--SelectAll)',
  );

  ingredientEls.forEach((ing) => {
    const label = ing.querySelector('.o-Ingredients__a-Ingredient--CheckboxLabel, [class*="CheckboxLabel"]');
    const text = (label ? label.textContent : ing.textContent).trim();
    if (!text) return;
    cells.push([text]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Emit the section heading as default content above the block.
  const headingSource = element.querySelector('.o-Ingredients__a-HeadlineText, .o-Ingredients__a-Headline, h2');
  const block = WebImporter.Blocks.createBlock(document, { name: 'ingredients', cells });

  if (headingSource) {
    const h2 = document.createElement('h2');
    h2.textContent = headingSource.textContent.trim() || 'Ingredients';
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
