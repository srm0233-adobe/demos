/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: recipe-meta
 * Base block: table (custom "recipe meta" strip)
 * Source: Food Network recipe detail — apple-cider-chicken-recipe-1952273
 *   #mod-recipe-lead-1 > div.recipeInfo
 *
 * Source structure (div.recipeInfo > .o-RecipeInfo):
 *   ul.o-RecipeInfo__m-Level / __m-Time / __m-Yield, each <li> holding
 *     span.o-RecipeInfo__a-Headline (label, e.g. "Level:")
 *     span.o-RecipeInfo__a-Description (value, e.g. "Easy")
 *   plus a Nutrition Info <li> holding section.o-NutritionInfo > button "Nutrition Info".
 *
 * Emitted block table (matches blocks/recipe-meta/recipe-meta.js decorate):
 *   one row per stat, label / value pair (2 cells → header colspan=2):
 *     | Level | Easy |
 *     | Total | 40 min |
 *     | Prep  | 15 min |
 *     | Cook  | 25 min |
 *     | Yield | 4 servings |
 *   and a single-cell standalone row for the Nutrition Info link:
 *     | Nutrition Info |
 */
export default function parse(element, { document }) {
  const root = element.querySelector('.o-RecipeInfo') || element;

  const cells = [];

  // Label / value stat rows.
  root.querySelectorAll('li').forEach((li) => {
    const labelEl = li.querySelector('.o-RecipeInfo__a-Headline, [class*="a-Headline"]');
    const valueEl = li.querySelector('.o-RecipeInfo__a-Description, [class*="a-Description"]');

    if (labelEl && valueEl) {
      // Strip the trailing colon from the label ("Level:" → "Level").
      const label = labelEl.textContent.replace(/[:\s]+$/, '').trim();
      const value = valueEl.textContent.trim();
      if (label || value) cells.push([label, value]);
      return;
    }

    // Nutrition Info: a standalone link/button with no label/value pair.
    const nutritionBtn = li.querySelector('.o-RecipeInfo__a-NutritionInfo, .o-NutritionInfo button, button');
    if (nutritionBtn) {
      const text = nutritionBtn.textContent.trim();
      if (text) {
        // Render as a link anchored to the on-page nutrition section.
        const a = document.createElement('a');
        a.href = '#nutrition-info';
        a.textContent = text;
        cells.push([a]);
      }
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'recipe-meta', cells });
  element.replaceWith(block);
}
