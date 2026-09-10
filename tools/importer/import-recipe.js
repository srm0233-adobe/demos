/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import recipeHeroParser from './parsers/recipe-hero.js';
import recipeMetaParser from './parsers/recipe-meta.js';
import ingredientsParser from './parsers/ingredients.js';
import directionsParser from './parsers/directions.js';
import pageNavParser from './parsers/page-nav.js';
import cardsTilesParser from './parsers/cards-tiles.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/foodnetwork-cleanup.js';
import sectionsTransformer from './transformers/foodnetwork-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'recipe-hero': recipeHeroParser,
  'recipe-meta': recipeMetaParser,
  ingredients: ingredientsParser,
  directions: directionsParser,
  'page-nav': pageNavParser,
  'cards-tiles': cardsTilesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'recipe',
  description: 'Food Network recipe detail page',
  urls: [
    'https://www.foodnetwork.com/recipes/sunny-anderson/apple-cider-chicken-recipe-1952273',
  ],
  blocks: [
    {
      name: 'recipe-hero',
      instances: ['#mod-recipe-lead-1 > div.recipeLead', '#mod-recipe-summary-1'],
    },
    {
      name: 'recipe-meta',
      instances: ['#mod-recipe-lead-1 > div.recipeInfo'],
    },
    {
      name: 'ingredients',
      instances: ['section.o-Recipe .o-Ingredients'],
    },
    {
      name: 'directions',
      instances: ['section.o-Recipe .o-Method'],
    },
    {
      name: 'page-nav',
      instances: ['div.assetNavigation'],
    },
    {
      name: 'cards-tiles',
      instances: ['section.o-Recommendations'],
    },
  ],
  sections: [
    {
      id: 'rc1', name: 'Recipe Lead / Hero', selector: ['#mod-recipe-lead-1'],
      style: null, blocks: ['recipe-hero'], defaultContent: [],
    },
    {
      id: 'rc2', name: 'Recipe Meta', selector: ['#mod-recipe-lead-1 > div.recipeInfo'],
      style: null, blocks: ['recipe-meta'], defaultContent: [],
    },
    {
      id: 'rc3', name: 'Recipe Body (Ingredients + Directions)',
      selector: ['section.o-Recipe > div.recipe-body', 'section.o-Recipe'],
      style: null, blocks: ['ingredients', 'directions'], defaultContent: [],
    },
    {
      id: 'rc4', name: 'Prev / Next Recipe Pager', selector: ['div.assetNavigation'],
      style: null, blocks: ['page-nav'], defaultContent: [],
    },
    {
      id: 'rc5', name: 'Looking for Something Else (Related Recipes)',
      selector: ['section.flush-top'], style: null, blocks: ['cards-tiles'],
      defaultContent: ['section.flush-top h2'],
    },
  ],
};

// TRANSFORMER REGISTRY - Array of transformer functions.
// Section transformer runs after cleanup (template has 2+ sections).
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

// Food Network media localize to the DA content host. Source images live on
// the Food Network CDN (food.fnr.sndimg.com / sndimg.com); DA only renders
// images referenced as absolute content.da.live URLs (a bare /foodnetwork/media
// path is not recognized and renders as about:error). Rewrite each source image
// URL to its DA-hosted media path. The image BYTES must be uploaded to DA under
// the same slug (see the media-upload step) for the reference to resolve.
const DA_MEDIA_BASE = 'https://content.da.live/srm0233-adobe/demos/foodnetwork/media';

/**
 * Derive the DA media filename for a Food Network CDN image URL.
 * @param {string} u - source image URL
 * @returns {string|null} `<slug>.png` or null if not a recognized FN image
 */
function mediaSlug(u) {
  // e.g. RE0304_Apple-Cider-Chicken.jpg.rend.hgtvcom.1280.720.suffix/...
  const m = u.match(/([A-Za-z0-9_.-]+)\.(?:jpe?g|png|webp)\.rend\.hgtvcom\.(\d+)\.(\d+)/i);
  if (m) return `${m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${m[2]}x${m[3]}.png`;
  // talent avatars: /talent/<name>/<File>.jpg
  const a = u.match(/talent\/[^/]+\/([A-Za-z0-9_-]+)\.jpe?g/i);
  if (a) return `${a[1].toLowerCase().replace(/_/g, '-')}.png`;
  return null;
}

/**
 * Rewrite every Food Network CDN image reference under `main` to its DA-hosted
 * content.da.live media URL so DA renders it as a managed asset.
 * @param {Element} main - the page root
 */
function localizeImages(main) {
  main.querySelectorAll('img, source').forEach((el) => {
    ['src', 'srcset'].forEach((attr) => {
      const val = el.getAttribute(attr);
      if (!val || !/sndimg\.com/i.test(val)) return;
      const slug = mediaSlug(val);
      if (slug) el.setAttribute(attr, `${DA_MEDIA_BASE}/${slug}`);
    });
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Skips section-marker entries (name starting with "section-").
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    if (blockDef.name.startsWith('section-')) return; // section marker, not a block
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup + section breaks insertion)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup: remove chrome + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Localize Food Network CDN images to DA-hosted content.da.live media
    //    URLs so they render as managed assets (not about:error).
    localizeImages(main);

    // 7. Generate the target path under the /foodnetwork/ base folder.
    //    All recipe pages in this migration collapse to the short slug
    //    /foodnetwork/apple-cider-chicken (single-page migration).
    const path = WebImporter.FileUtils.sanitizePath('/foodnetwork/apple-cider-chicken');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
