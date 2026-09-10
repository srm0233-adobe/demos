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

    // 6. Localize Food Network CDN images to DA-hosted content.da.live media
    //    URLs so they render as managed assets (not about:error).
    localizeImages(main);

    // 7. The Food Network homepage maps to /foodnetwork/index.
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
