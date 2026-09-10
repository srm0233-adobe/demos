/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLeadParser from './parsers/hero-lead.js';
import cardsTilesParser from './parsers/cards-tiles.js';
import cardsSpotlightParser from './parsers/cards-spotlight.js';
import cardsChefsParser from './parsers/cards-chefs.js';
import cardsNewsParser from './parsers/cards-news.js';
import videoParser from './parsers/video.js';
import promoBannerParser from './parsers/promo-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/foodnetwork-home-cleanup.js';
import sectionsTransformer from './transformers/foodnetwork-home-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-lead': heroLeadParser,
  'cards-tiles': cardsTilesParser,
  'cards-spotlight': cardsSpotlightParser,
  'cards-chefs': cardsChefsParser,
  'cards-news': cardsNewsParser,
  video: videoParser,
  'promo-banner': promoBannerParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (home)
const S = '#site > div.full-width > div.main.parsys > ';
const fw = (n, inner) => `${S}div.fullWidthPromo.section:nth-of-type(${n}) ${inner}`;
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Food Network editorial homepage',
  urls: ['https://www.foodnetwork.com/'],
  blocks: [
    { name: 'hero-lead', instances: [`${S}div.superLeadHero.section .o-SuperLeadHero`] },
    {
      name: 'cards-tiles',
      instances: [fw(2, '.o-FullWidthPromo'), fw(3, '.o-FullWidthPromo'), fw(5, '.o-FullWidthPromo'), fw(8, '.o-FullWidthPromo')],
    },
    {
      name: 'cards-spotlight',
      instances: [fw(4, '.o-FullWidthPromo'), fw(6, '.o-FullWidthPromo'), fw(14, '.o-FullWidthPromo')],
    },
    { name: 'cards-chefs', instances: [`${S}div.profilePromo.capsule.section:nth-of-type(9) .o-ProfilePromo`] },
    { name: 'cards-news', instances: [`${S}div.storyPromo.section .o-StoryPromo`] },
    { name: 'video', instances: [`${S}div.globalVideoPlayer.section .kdp`] },
    { name: 'promo-banner', instances: [fw(15, '.o-FullWidthPromo')] },
  ],
  sections: [
    { id: 'rc4', name: 'Lead Hero', selector: [`${S}div.superLeadHero.section`], style: null, blocks: ['hero-lead'], defaultContent: [] },
    { id: 'rc5', name: 'Recipes and Shows', selector: [`${S}div.fullWidthPromo.section:nth-of-type(2)`], style: null, blocks: ['cards-tiles'], defaultContent: [] },
    { id: 'rc6', name: 'Quick Bread Recipes', selector: [`${S}div.fullWidthPromo.section:nth-of-type(3)`], style: null, blocks: ['cards-tiles'], defaultContent: [] },
    { id: 'rc7', name: 'More Cooking Inspiration', selector: [`${S}div.fullWidthPromo.section:nth-of-type(4)`], style: null, blocks: ['cards-spotlight'], defaultContent: [] },
    { id: 'rc8', name: 'Shop With Us', selector: [`${S}div.fullWidthPromo.section:nth-of-type(5)`], style: null, blocks: ['cards-tiles'], defaultContent: [] },
    { id: 'rc9', name: 'Trending Right Now', selector: [`${S}div.fullWidthPromo.section:nth-of-type(6)`], style: null, blocks: ['cards-spotlight'], defaultContent: [] },
    { id: 'rc11', name: 'Inspired By Shows', selector: [`${S}div.fullWidthPromo.section:nth-of-type(8)`], style: null, blocks: ['cards-tiles'], defaultContent: [] },
    { id: 'rc12', name: 'Meet Our Chefs', selector: [`${S}div.profilePromo.capsule.section:nth-of-type(9)`], style: null, blocks: ['cards-chefs'], defaultContent: [] },
    { id: 'rc13', name: 'What is New', selector: [`${S}div.storyPromo.section`], style: null, blocks: ['cards-news'], defaultContent: [] },
    { id: 'rc14', name: 'Featured Video', selector: [`${S}div.globalVideoPlayer.section`], style: null, blocks: ['video'], defaultContent: [] },
    { id: 'rc17', name: 'What We are Cooking', selector: [`${S}div.fullWidthPromo.section:nth-of-type(14)`], style: null, blocks: ['cards-spotlight'], defaultContent: [] },
    { id: 'rc18', name: 'Food Network Magazine', selector: [`${S}div.fullWidthPromo.section:nth-of-type(15)`], style: null, blocks: ['promo-banner'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup then sections (template has 2+ sections).
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

/**
 * Find all blocks on the page based on the embedded template configuration.
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    if (blockDef.name.startsWith('section-')) return;
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

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page (before afterTransform removes empty placeholders,
    //    so the :nth-of-type indices the selectors rely on are still intact)
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

    // 4. afterTransform (final cleanup: remove chrome + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. The Food Network homepage maps to /foodnetwork/index.
    const path = WebImporter.FileUtils.sanitizePath('/foodnetwork/index');

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
