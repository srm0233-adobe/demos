/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document: document2 }) {
    let slides = element.querySelectorAll(":scope > .hero, :scope .hero");
    if (!slides || slides.length === 0) slides = [element];
    const cells = [];
    slides.forEach((slide) => {
      const bgImage = slide.querySelector(
        'img.hero-bg, img[class*="hero-bg"], img[class*="background"], img[class*="-bg"], img'
      );
      const copy = slide.querySelector('.hero-copy, [class*="copy"], [class*="content"]');
      const contentCell = [];
      if (copy) {
        copy.querySelectorAll(":scope > *").forEach((child) => {
          if (child === bgImage || child.contains(bgImage)) return;
          contentCell.push(child);
        });
      } else {
        const eyebrow = slide.querySelector('.eyebrow, [class*="eyebrow"]');
        const heading = slide.querySelector('h1, h2, h3, [class*="title"]');
        if (eyebrow) contentCell.push(eyebrow);
        if (heading) contentCell.push(heading);
        slide.querySelectorAll("p").forEach((p) => {
          if (p !== eyebrow) contentCell.push(p);
        });
      }
      if (!bgImage && contentCell.length === 0) return;
      cells.push([bgImage || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-popular.js
  function parse2(element, { document: document2 }) {
    const cards = element.querySelectorAll(":scope > .card, :scope > div.card, .card");
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img, picture");
      const heading = card.querySelector("h1, h2, h3, h4, h5, h6");
      const description = card.querySelector("p");
      const bodyCell = [];
      if (heading) bodyCell.push(heading);
      if (description) bodyCell.push(description);
      if (!img && bodyCell.length === 0) return;
      cells.push([img || "", bodyCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-popular", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-photo.js
  function parse3(element, { document: document2 }) {
    const slides = element.querySelectorAll(":scope > .card, :scope > div.card, .card");
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img, picture");
      const heading = slide.querySelector("h1, h2, h3, h4, h5, h6");
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (!img && contentCell.length === 0) return;
      cells.push([img || "", contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-photo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/att-brand-center-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.site-header",
        "footer.site-footer"
      ]);
    }
  }

  // tools/importer/transformers/att-brand-center-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-banner": parse,
    "cards-popular": parse2,
    "carousel-photo": parse3
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "AT&T Brand Center home page: hero, popular-items cards, custom photography carousel, FAQ bar.",
    urls: [
      "http://localhost:8899/home.html"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: ["body > section.hero-section"]
      },
      {
        name: "cards-popular",
        instances: ["body > section.popular-section.section > div.container > div.popular-cards"]
      },
      {
        name: "section-photography",
        instances: ["body > section.photography-section.att-blue.section"],
        section: "att-blue"
      },
      {
        name: "carousel-photo",
        instances: ["body > section.photography-section.att-blue.section .photo-cards"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Hero",
        selector: "body > section.hero-section",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "Popular items",
        selector: "body > section.popular-section.section",
        style: null,
        blocks: ["cards-popular"],
        defaultContent: ["body > section.popular-section.section > div.container > div:nth-of-type(1)"]
      },
      {
        id: "rc3",
        name: "Custom Photography Collections",
        selector: "body > section.photography-section.att-blue.section",
        style: "att-blue",
        blocks: ["carousel-photo"],
        defaultContent: ["body > section.photography-section.att-blue.section > div.container > h2"]
      },
      {
        id: "rc4",
        name: "FAQ bar",
        selector: "body > section.faq-section.section",
        style: null,
        blocks: [],
        defaultContent: ["body > section.faq-section.section > div.container > h4"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      if (blockDef.name.startsWith("section-")) return;
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      let rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      if (rawPath === "" || rawPath === "/home" || rawPath === "/index") {
        rawPath = "/att-brand-center/home";
      } else if (!rawPath.startsWith("/att-brand-center")) {
        rawPath = `/att-brand-center${rawPath}`;
      }
      const path = WebImporter.FileUtils.sanitizePath(rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
