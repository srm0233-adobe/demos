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

  // tools/importer/import-fn-home.js
  var import_fn_home_exports = {};
  __export(import_fn_home_exports, {
    default: () => import_fn_home_default
  });

  // tools/importer/parsers/hero-lead.js
  function parse(element, { document: document2 }) {
    const wraps = [...element.querySelectorAll(".m-MediaBlock__m-MediaWrap")];
    const heads = [...element.querySelectorAll(".m-MediaBlock__a-Headline")];
    const count = Math.max(wraps.length, heads.length);
    const cells = [];
    for (let i = 0; i < count; i += 1) {
      const wrap = wraps[i];
      const headline = heads[i];
      const img = wrap ? wrap.querySelector("img") : null;
      const srcLink = headline ? headline.querySelector("a[href]") : null;
      const titleText = (headline ? headline.textContent : "").trim();
      let body = "";
      if (srcLink && titleText) {
        const a = document2.createElement("a");
        a.href = srcLink.getAttribute("href");
        a.textContent = titleText;
        body = a;
      } else if (titleText) {
        const p = document2.createElement("p");
        p.textContent = titleText;
        body = p;
      }
      if (!img && body === "") continue;
      cells.push([img || "", body]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-lead", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tiles.js
  function parse2(element, { document: document2 }) {
    const cells = [];
    const recContainer = element.querySelector(".o-Recommendations__TileContainer");
    const recTiles = element.querySelectorAll(
      ".o-Recommendations__m-MediaBlock, .o-Recommendations__TileContainer .m-MediaBlock"
    );
    const promoCards = element.querySelectorAll(".m-Card");
    if (promoCards.length) {
      promoCards.forEach((card) => {
        const img = card.querySelector('.m-Card__m-MediaWrap img, img[class*="a-Image"], img');
        const headline = card.querySelector(".m-Card__a-Headline");
        const titleLink = headline ? headline.querySelector("a[href]") : card.querySelector(".m-Card__m-TextWrap a[href]");
        const titleText = (headline ? headline.textContent : titleLink ? titleLink.textContent : "").trim();
        if (!img && !titleText) return;
        const body = [];
        if (titleLink && titleText) {
          const a = document2.createElement("a");
          a.href = titleLink.getAttribute("href");
          a.textContent = titleText;
          body.push(a);
        } else if (titleText) {
          const p = document2.createElement("p");
          p.textContent = titleText;
          body.push(p);
        }
        cells.push([img || "", body.length ? body : ""]);
      });
    } else {
      const container = recContainer || element;
      let tiles = recTiles.length ? recTiles : container.querySelectorAll(":scope > .o-Recommendations__m-MediaBlock, :scope > .m-MediaBlock");
      tiles.forEach((tile) => {
        const img = tile.querySelector('.m-MediaBlock__a-Image, img[class*="a-Image"], img');
        const headline = tile.querySelector(".m-MediaBlock__a-Headline");
        const titleLink = headline ? headline.querySelector("a[href]") : tile.querySelector("a[href]");
        const titleText = (headline ? headline.textContent : titleLink ? titleLink.textContent : "").trim();
        if (!img && !titleText) return;
        const body = [];
        if (titleLink && titleText) {
          const a = document2.createElement("a");
          a.href = titleLink.getAttribute("href");
          a.textContent = titleText;
          body.push(a);
        } else if (titleText) {
          const p = document2.createElement("p");
          p.textContent = titleText;
          body.push(p);
        }
        const stars = tile.querySelector('.rating-stars[title], [class*="rating-stars"][title]');
        const m = ((stars == null ? void 0 : stars.getAttribute("title")) || "").match(/([\d.]+)\s*of\s*([\d.]+)/i);
        if (m) {
          const rp = document2.createElement("p");
          rp.textContent = `${m[1]} / ${m[2]}`;
          body.push(rp);
        }
        cells.push([img || "", body.length ? body : ""]);
      });
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const headingSource = element.querySelector(
      ".o-Recommendations__a-HeadlineText, .o-Recommendations__a-Headline, .o-FullWidthPromo__a-HeadlineText, .o-FullWidthPromo__a-Headline, header h2, h2"
    );
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-tiles", cells });
    if (headingSource && headingSource.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSource.textContent.trim();
      element.replaceWith(h2, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-spotlight.js
  function parse3(element, { document: document2 }) {
    const card = element.querySelector(".m-FeatureCard, .o-FullWidthPromo__m-FeatureCard") || element;
    const img = card.querySelector('.m-FeatureCard__m-MediaWrap img, img[class*="a-Image"], img');
    const headline = card.querySelector(".m-FeatureCard__a-Headline");
    const titleLink = headline ? headline.querySelector("a[href]") : card.querySelector(".m-FeatureCard__m-TextWrap a[href]");
    const titleText = (headline ? headline.textContent : titleLink ? titleLink.textContent : "").trim();
    if (!img && !titleText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let body = "";
    if (titleLink && titleText) {
      const a = document2.createElement("a");
      a.href = titleLink.getAttribute("href");
      a.textContent = titleText;
      body = a;
    } else if (titleText) {
      const p = document2.createElement("p");
      p.textContent = titleText;
      body = p;
    }
    const cells = [[img || "", body]];
    const headingSource = element.querySelector(
      ".o-FullWidthPromo__a-HeadlineText, .o-FullWidthPromo__a-Headline, header h2, h2"
    );
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-spotlight", cells });
    if (headingSource && headingSource.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSource.textContent.trim();
      element.replaceWith(h2, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-chefs.js
  function parse4(element, { document: document2 }) {
    const wraps = [...element.querySelectorAll(".m-MediaBlock__m-MediaWrap")];
    const texts = [...element.querySelectorAll(".m-MediaBlock__m-TextWrap")];
    const count = Math.max(wraps.length, texts.length);
    const cells = [];
    for (let i = 0; i < count; i += 1) {
      const wrap = wraps[i];
      const text = texts[i];
      const img = wrap ? wrap.querySelector("img") : null;
      const body = [];
      const headline = text ? text.querySelector(".m-MediaBlock__a-Headline") : null;
      const nameLink = headline ? headline.querySelector("a[href]") : null;
      const nameText = (headline ? headline.textContent : "").trim();
      if (nameLink && nameText) {
        const a = document2.createElement("a");
        a.href = nameLink.getAttribute("href");
        a.textContent = nameText;
        body.push(a);
      } else if (nameText) {
        const p = document2.createElement("p");
        p.textContent = nameText;
        body.push(p);
      }
      const desc = text ? text.querySelector(".m-MediaBlock__a-Description") : null;
      const descText = desc ? desc.textContent.trim() : "";
      if (descText) {
        const p = document2.createElement("p");
        p.textContent = descText;
        body.push(p);
      }
      if (!img && body.length === 0) continue;
      cells.push([img || "", body.length ? body : ""]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const headingSource = element.querySelector(
      ".o-Capsule__a-HeadlineText, .o-Capsule__a-Headline, header h2, header h3, h2"
    );
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-chefs", cells });
    if (headingSource && headingSource.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSource.textContent.trim();
      element.replaceWith(h2, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-news.js
  function parse5(element, { document: document2 }) {
    const stories = [...element.querySelectorAll(".m-StoryCard")];
    const cells = [];
    stories.forEach((story) => {
      const img = story.querySelector('.m-StoryCard__m-MediaWrap img, img[class*="a-Image"], img');
      const body = [];
      const time = story.querySelector('.m-StoryCard__a-Time, [class*="a-Time"], [class*="a-Label"]');
      const eyebrowText = time ? time.textContent.trim() : "";
      if (eyebrowText) {
        const p = document2.createElement("p");
        p.textContent = eyebrowText;
        body.push(p);
      }
      const headline = story.querySelector(".m-StoryCard__a-Headline");
      const titleLink = headline ? headline.querySelector("a[href]") : null;
      const titleText = (headline ? headline.textContent : "").trim();
      if (titleLink && titleText) {
        const h3 = document2.createElement("h3");
        const a = document2.createElement("a");
        a.href = titleLink.getAttribute("href");
        a.textContent = titleText;
        h3.append(a);
        body.push(h3);
      } else if (titleText) {
        const h3 = document2.createElement("h3");
        h3.textContent = titleText;
        body.push(h3);
      }
      const desc = story.querySelector(".m-StoryCard__a-Description");
      const descText = desc ? desc.textContent.trim() : "";
      if (descText) {
        const p = document2.createElement("p");
        p.textContent = descText;
        body.push(p);
      }
      if (!img && body.length === 0) return;
      cells.push([img || "", body.length ? body : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const headingSource = element.querySelector(
      ".o-Capsule__a-HeadlineText, .o-Capsule__a-Headline, header h2, h2"
    );
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
    if (headingSource && headingSource.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSource.textContent.trim();
      element.replaceWith(h2, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/video.js
  function parse6(element, { document: document2 }) {
    const poster = element.querySelector(
      '.kdp-poster__image, img[class*="poster"], .kdp__player-container img, img'
    );
    const contentCell = [];
    if (poster) contentCell.push(poster);
    const label = poster && poster.getAttribute("alt") || "Watch Video";
    const link = document2.createElement("a");
    link.href = "https://www.foodnetwork.com/videos";
    link.textContent = label;
    contentCell.push(link);
    if (contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/promo-banner.js
  function parse7(element, { document: document2 }) {
    const card = element.querySelector(".m-FeatureCard, .o-FullWidthPromo__m-FeatureCard") || element;
    const img = card.querySelector('.m-FeatureCard__m-MediaWrap img, img[class*="a-Image"], img');
    const contentCell = [];
    if (img) contentCell.push(img);
    const label = card.querySelector('.m-FeatureCard__a-Label, [class*="a-Label"]');
    const labelText = label ? label.textContent.trim() : "";
    if (labelText) {
      const p = document2.createElement("p");
      p.textContent = labelText;
      contentCell.push(p);
    }
    const headline = card.querySelector(".m-FeatureCard__a-Headline");
    const ctaLink = headline ? headline.querySelector("a[href]") : card.querySelector(".m-FeatureCard__m-TextWrap a[href], .m-FeatureCard__m-MediaWrap a[href]");
    const headingText = (headline ? headline.textContent : ctaLink ? ctaLink.textContent : "").trim();
    if (headingText) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingText;
      contentCell.push(h2);
    }
    if (ctaLink) {
      const a = document2.createElement("a");
      a.href = ctaLink.getAttribute("href");
      a.textContent = "Subscribe";
      contentCell.push(a);
    }
    if (contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "promo-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/foodnetwork-home-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // OneTrust consent container (verified line 2480)
        "#onetrust-pc-sdk",
        // OneTrust preference center — hosts "Your Privacy Choices" + GPC block (verified 2483/2501/2522)
        ".onetrust-pc-dark-filter",
        // OneTrust dark backdrop overlay
        "#ltp-dialog"
        // "Legal Terms and Privacy" consent dialog (verified 2466/ltp-banner)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // --- Global header / nav / search / profile (site shell) ---
        "header.o-Header",
        // global site header incl. flyout nav + on-tv dropdown (verified line 17)
        "#mod-header-1",
        // header main area module (verified line 22)
        "#mod-nav-profile-1",
        // account / profile nav (verified line 989)
        "#mod-search-form-1",
        // global search form (verified line 943)
        // --- Global footer ---
        "div.footer",
        // #site > div.footer wrapper (verified line 2326)
        "footer.o-FooterFresh",
        // global site footer (verified line 2329)
        "#mod-footer-1",
        // --- Hub / SR-only homepage heading ("Food Network Homepage") ---
        ".o-Hub",
        // div.o-Hub > h1.sr-only (verified line 1018)
        // --- Leaderboard / pushdown / brandscape ads ---
        "#leaderboard-wrap",
        // verified line 11
        "#leaderboard",
        // verified line 12
        "#pushdown_adtag",
        // verified line 1010
        "#brandscape",
        // verified line 1011
        ".ad-leaderboard-body",
        // empty in-hero ad slot (verified line 1379)
        // --- In-content ad slots (part of the FN ad shell; not present in this
        //     capture but requested for completeness — remove() no-ops if absent) ---
        "#ad_block_content_1",
        "#ad_block_content_2",
        "#ad_block_content_3",
        ".bigbox-ad",
        ".rr-ad",
        // --- Safe leftover elements ---
        "iframe",
        // strip leftover iframes (video/DM already parsed into blocks)
        "link",
        "noscript"
      ]);
      element.querySelectorAll("div.fullWidthPromo.section, div.profilePromo.capsule.section").forEach((div) => {
        if (div.children.length === 0) div.remove();
      });
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (/sp\.analytics\.yahoo\.com|\/sp\.pl\?|trx-hub\.com|\/i\/m\/i\.png/.test(src)) {
          const p = img.closest("p");
          (p && p.textContent.trim() === "" ? p : img).remove();
        }
      });
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-tracking");
      });
    }
  }

  // tools/importer/transformers/foodnetwork-home-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
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
        const anchor = marker || querySection(element, section.selector);
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

  // tools/importer/import-fn-home.js
  var parsers = {
    "hero-lead": parse,
    "cards-tiles": parse2,
    "cards-spotlight": parse3,
    "cards-chefs": parse4,
    "cards-news": parse5,
    video: parse6,
    "promo-banner": parse7
  };
  var S = "#site > div.full-width > div.main.parsys > ";
  var fw = (n, inner) => `${S}div.fullWidthPromo.section:nth-of-type(${n}) ${inner}`;
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Food Network editorial homepage",
    urls: ["https://www.foodnetwork.com/"],
    blocks: [
      { name: "hero-lead", instances: [`${S}div.superLeadHero.section .o-SuperLeadHero`] },
      {
        name: "cards-tiles",
        instances: [fw(2, ".o-FullWidthPromo"), fw(3, ".o-FullWidthPromo"), fw(5, ".o-FullWidthPromo"), fw(8, ".o-FullWidthPromo")]
      },
      {
        name: "cards-spotlight",
        instances: [fw(4, ".o-FullWidthPromo"), fw(6, ".o-FullWidthPromo"), fw(14, ".o-FullWidthPromo")]
      },
      { name: "cards-chefs", instances: [`${S}div.profilePromo.capsule.section:nth-of-type(9) .o-ProfilePromo`] },
      { name: "cards-news", instances: [`${S}div.storyPromo.section .o-StoryPromo`] },
      { name: "video", instances: [`${S}div.globalVideoPlayer.section .kdp`] },
      { name: "promo-banner", instances: [fw(15, ".o-FullWidthPromo")] }
    ],
    sections: [
      { id: "rc4", name: "Lead Hero", selector: [`${S}div.superLeadHero.section`], style: null, blocks: ["hero-lead"], defaultContent: [] },
      { id: "rc5", name: "Recipes and Shows", selector: [`${S}div.fullWidthPromo.section:nth-of-type(2)`], style: null, blocks: ["cards-tiles"], defaultContent: [] },
      { id: "rc6", name: "Quick Bread Recipes", selector: [`${S}div.fullWidthPromo.section:nth-of-type(3)`], style: null, blocks: ["cards-tiles"], defaultContent: [] },
      { id: "rc7", name: "More Cooking Inspiration", selector: [`${S}div.fullWidthPromo.section:nth-of-type(4)`], style: null, blocks: ["cards-spotlight"], defaultContent: [] },
      { id: "rc8", name: "Shop With Us", selector: [`${S}div.fullWidthPromo.section:nth-of-type(5)`], style: null, blocks: ["cards-tiles"], defaultContent: [] },
      { id: "rc9", name: "Trending Right Now", selector: [`${S}div.fullWidthPromo.section:nth-of-type(6)`], style: null, blocks: ["cards-spotlight"], defaultContent: [] },
      { id: "rc11", name: "Inspired By Shows", selector: [`${S}div.fullWidthPromo.section:nth-of-type(8)`], style: null, blocks: ["cards-tiles"], defaultContent: [] },
      { id: "rc12", name: "Meet Our Chefs", selector: [`${S}div.profilePromo.capsule.section:nth-of-type(9)`], style: null, blocks: ["cards-chefs"], defaultContent: [] },
      { id: "rc13", name: "What is New", selector: [`${S}div.storyPromo.section`], style: null, blocks: ["cards-news"], defaultContent: [] },
      { id: "rc14", name: "Featured Video", selector: [`${S}div.globalVideoPlayer.section`], style: null, blocks: ["video"], defaultContent: [] },
      { id: "rc17", name: "What We are Cooking", selector: [`${S}div.fullWidthPromo.section:nth-of-type(14)`], style: null, blocks: ["cards-spotlight"], defaultContent: [] },
      { id: "rc18", name: "Food Network Magazine", selector: [`${S}div.fullWidthPromo.section:nth-of-type(15)`], style: null, blocks: ["promo-banner"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  var DA_MEDIA_BASE = "https://content.da.live/srm0233-adobe/demos/foodnetwork/media";
  function mediaSlug(u) {
    const m = u.match(/([A-Za-z0-9_.-]+)\.(?:jpe?g|png|webp)\.rend\.hgtvcom\.(\d+)\.(\d+)/i);
    if (m) return `${m[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${m[2]}x${m[3]}.png`;
    const a = u.match(/talent\/[^/]+\/([A-Za-z0-9_-]+)\.jpe?g/i);
    if (a) return `${a[1].toLowerCase().replace(/_/g, "-")}.png`;
    return null;
  }
  function localizeImages(main) {
    main.querySelectorAll("img, source").forEach((el) => {
      ["src", "srcset"].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (!val || !/sndimg\.com/i.test(val)) return;
        const slug = mediaSlug(val);
        if (slug) el.setAttribute(attr, `${DA_MEDIA_BASE}/${slug}`);
      });
    });
  }
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
  var import_fn_home_default = {
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
      localizeImages(main);
      const path = WebImporter.FileUtils.sanitizePath("/foodnetwork/index");
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
  return __toCommonJS(import_fn_home_exports);
})();
