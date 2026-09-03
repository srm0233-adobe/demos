/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsPopularParser from './parsers/cards-popular.js';
import carouselPhotoParser from './parsers/carousel-photo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/att-brand-center-cleanup.js';
import sectionsTransformer from './transformers/att-brand-center-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-popular': cardsPopularParser,
  'carousel-photo': carouselPhotoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'AT&T Brand Center home page: hero, popular-items cards, custom photography carousel, FAQ bar.',
  urls: [
    'http://localhost:8899/home.html',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['body > section.hero-section'],
    },
    {
      name: 'cards-popular',
      instances: ['body > section.popular-section.section > div.container > div.popular-cards'],
    },
    {
      name: 'section-photography',
      instances: ['body > section.photography-section.att-blue.section'],
      section: 'att-blue',
    },
    {
      name: 'carousel-photo',
      instances: ['body > section.photography-section.att-blue.section .photo-cards'],
    },
  ],
  sections: [
    {
      id: 'rc1', name: 'Hero', selector: 'body > section.hero-section',
      style: null, blocks: ['hero-banner'], defaultContent: [],
    },
    {
      id: 'rc2', name: 'Popular items', selector: 'body > section.popular-section.section',
      style: null, blocks: ['cards-popular'],
      defaultContent: ['body > section.popular-section.section > div.container > div:nth-of-type(1)'],
    },
    {
      id: 'rc3', name: 'Custom Photography Collections', selector: 'body > section.photography-section.att-blue.section',
      style: 'att-blue', blocks: ['carousel-photo'],
      defaultContent: ['body > section.photography-section.att-blue.section > div.container > h2'],
    },
    {
      id: 'rc4', name: 'FAQ bar', selector: 'body > section.faq-section.section',
      style: null, blocks: [],
      defaultContent: ['body > section.faq-section.section > div.container > h4'],
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

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Skips section-marker entries (name starting with "section-") — those are
 * styling markers handled by the section transformer, not parseable blocks.
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

    // 4. afterTransform (final cleanup: remove header/footer chrome + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path under the /att-brand-center/ base folder.
    //    The local source URL (/home.html) is remapped to the target site path.
    let rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    if (rawPath === '' || rawPath === '/home' || rawPath === '/index') {
      rawPath = '/att-brand-center/home';
    } else if (!rawPath.startsWith('/att-brand-center')) {
      rawPath = `/att-brand-center${rawPath}`;
    }
    const path = WebImporter.FileUtils.sanitizePath(rawPath);

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
