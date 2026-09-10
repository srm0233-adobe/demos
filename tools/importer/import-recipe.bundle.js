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

  // tools/importer/import-recipe.js
  var import_recipe_exports = {};
  __export(import_recipe_exports, {
    default: () => import_recipe_default
  });

  // tools/importer/parsers/recipe-hero.js
  function parse(element, { document: document2 }) {
    var _a, _b;
    const HERO_DONE = "data-excat-recipe-hero-done";
    const container = element.closest(".recipe-lead, #mod-recipe-lead-1") || element.parentElement || element;
    if (container.getAttribute(HERO_DONE)) {
      element.remove();
      return;
    }
    const photo = container.querySelector('.kdp-poster__image, img.kdp-poster__image, [class*="poster__image"]');
    const watchText = (((_a = container.querySelector(".kdp-poster__button-text")) == null ? void 0 : _a.textContent) || "").trim();
    const eyebrowSource = container.querySelector(".o-Attribution__a-Name");
    const avatar = container.querySelector('.o-Attribution__a-Image, img[class*="Attribution__a-Image"]');
    const titleSource = container.querySelector(".o-AssetTitle__a-Headline, h1 .o-AssetTitle__a-HeadlineText, .o-AssetTitle__a-HeadlineText");
    const starsEl = container.querySelector('.rating-stars[title], [class*="rating-stars"][title]');
    const reviewsText = (((_b = container.querySelector(".reviews-ct")) == null ? void 0 : _b.textContent) || "").trim();
    if (!photo && !titleSource) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (photo) {
      const mediaRow = [photo];
      if (watchText) mediaRow.push(watchText);
      cells.push(mediaRow);
    }
    if (eyebrowSource) {
      const p = document2.createElement("p");
      p.innerHTML = eyebrowSource.innerHTML.trim();
      cells.push([p]);
    }
    if (avatar) cells.push([avatar]);
    if (titleSource) {
      const h1 = document2.createElement("h1");
      h1.textContent = titleSource.textContent.trim();
      cells.push([h1]);
    }
    if (starsEl || reviewsText) {
      const p = document2.createElement("p");
      const parts = [];
      const m = ((starsEl == null ? void 0 : starsEl.getAttribute("title")) || "").match(/([\d.]+)\s*of\s*([\d.]+)/i);
      if (m) parts.push(`${m[1]} / ${m[2]}`);
      if (reviewsText) parts.push(reviewsText);
      p.textContent = parts.join("  ");
      if (parts.length) cells.push([p]);
    }
    container.setAttribute(HERO_DONE, "1");
    const block = WebImporter.Blocks.createBlock(document2, { name: "recipe-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/recipe-meta.js
  function parse2(element, { document: document2 }) {
    const root = element.querySelector(".o-RecipeInfo") || element;
    const cells = [];
    root.querySelectorAll("li").forEach((li) => {
      const labelEl = li.querySelector('.o-RecipeInfo__a-Headline, [class*="a-Headline"]');
      const valueEl = li.querySelector('.o-RecipeInfo__a-Description, [class*="a-Description"]');
      if (labelEl && valueEl) {
        const label = labelEl.textContent.replace(/[:\s]+$/, "").trim();
        const value = valueEl.textContent.trim();
        if (label || value) cells.push([label, value]);
        return;
      }
      const nutritionBtn = li.querySelector(".o-RecipeInfo__a-NutritionInfo, .o-NutritionInfo button, button");
      if (nutritionBtn) {
        const text = nutritionBtn.textContent.trim();
        if (text) {
          const a = document2.createElement("a");
          a.href = "#nutrition-info";
          a.textContent = text;
          cells.push([a]);
        }
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "recipe-meta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/ingredients.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    const ingredientEls = element.querySelectorAll(
      ".o-Ingredients__a-Ingredient:not(.o-Ingredients__a-Ingredient--SelectAll)"
    );
    ingredientEls.forEach((ing) => {
      const label = ing.querySelector('.o-Ingredients__a-Ingredient--CheckboxLabel, [class*="CheckboxLabel"]');
      const text = (label ? label.textContent : ing.textContent).trim();
      if (!text) return;
      cells.push([text]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const headingSource = element.querySelector(".o-Ingredients__a-HeadlineText, .o-Ingredients__a-Headline, h2");
    const block = WebImporter.Blocks.createBlock(document2, { name: "ingredients", cells });
    if (headingSource) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSource.textContent.trim() || "Ingredients";
      element.replaceWith(h2, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/directions.js
  function parse4(element, { document: document2 }) {
    const cells = [];
    let steps = element.querySelectorAll('.o-Method__m-Step, [class*="__m-Step"]');
    if (!steps.length) steps = element.querySelectorAll(".o-Method__m-Body li, ol > li, ul > li");
    if (!steps.length) steps = element.querySelectorAll(".o-Method__m-Body p, p");
    steps.forEach((step) => {
      const text = step.textContent.trim();
      if (!text) return;
      const p = document2.createElement("p");
      p.textContent = text;
      cells.push([p]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const headingSource = element.querySelector(".o-Method__a-HeadlineText, .o-Method__a-Headline, h2");
    const block = WebImporter.Blocks.createBlock(document2, { name: "directions", cells });
    if (headingSource) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingSource.textContent.trim() || "Directions";
      element.replaceWith(h2, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/page-nav.js
  function parse5(element, { document: document2 }) {
    const cells = [];
    const links = element.querySelectorAll("a.o-AssetNavigation__a-Button, .prev-next-wrapper a[href], .l-Columns a[href]");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const label = link.textContent.trim();
      const caption = /prev/i.test(label) ? "PREVIOUS" : "NEXT";
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = label;
      cells.push([caption, a]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "page-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tiles.js
  function parse6(element, { document: document2 }) {
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

  // tools/importer/transformers/foodnetwork-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-pc-sdk",
        ".onetrust-pc-dark-filter"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // --- Global header / nav / search (site shell) ---
        "header.o-Header",
        // global site header, verified line 21
        "#mod-header-1",
        // header area module
        "#mod-nav-profile-1",
        // account/profile nav
        "#mod-search-form-1",
        // global search form
        // --- Global footer ---
        "footer.o-FooterFresh",
        // global site footer
        "#mod-footer-1",
        // --- Breadcrumbs ---
        ".o-Breadcrumb",
        ".breadcrumb.tagbasedBreadcrumb",
        // --- Ad slots ---
        "#leaderboard-wrap",
        "#leaderboard",
        "#pushdown_adtag",
        ".bigbox-ad",
        ".rr-ad",
        // --- Right-rail promo widgets (What's Cooking, Shop With Us, editorial promos, newsletter) ---
        ".rightRail",
        // right-rail parsys wrapper (contains What's Cooking + Shop With Us editorial promos)
        ".rightRailTop",
        "#mod-newsletter-1",
        // newsletter signup
        ".o-Newsletter",
        "#mod-editorial-promo-1",
        "#mod-editorial-promo-2",
        ".o-ShoppingEmbed",
        // "Tools You May Need" product/shop embed widget
        // --- UGC: ratings, reviews, private notes, comments ---
        ".o-RatingsAndReviews",
        // "270 Reviews" list + rating submission form
        "#mod-recipe-private-notes-1",
        // "My Private Notes" UI (.private-notes)
        ".o-UserComments",
        "#user-review",
        // --- Social share UI (site chrome) ---
        "#mod-social-share-1",
        // --- Other site chrome / promo streams ---
        "#mod-on-tv-full-width-1",
        // NOTE: do NOT remove '#mod-multi-content-stream-1' — verified in cleaned.html
        // it is the inner scroll container INSIDE section.o-Recommendations
        // (#mod-looking-for-something-1), which is migrated rc5 content (the
        // "Looking for Something Else?" recipe-card grid parsed by cards-tiles).
        // --- Non-authorable recipe-body leftovers (verified 0-conflict with the
        //     migrated blocks and with section.o-Recommendations) ---
        ".o-RecipeInfo",
        // duplicate Level/Total/Prep meta list + Save Recipe button panel
        ".o-AssetActions",
        // Save Recipe / print / social action bar in the recipe lead
        ".o-VideoPromo",
        // "Watch how to make this recipe" video-promo media block (tracking-alt thumb)
        ".o-Attribution",
        // "Show: … / Episode: …" attribution line
        ".o-Capsule",
        // Tools You May Need, Categories, More from, editorial/newsletter capsules
        ".o-AutoPilot__m-AutoPilot-Wrap",
        // "Related Pages" autopilot link list
        // --- Safe leftover elements ---
        "iframe",
        "link",
        "noscript"
      ]);
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

  // tools/importer/transformers/foodnetwork-sections.js
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

  // tools/importer/import-recipe.js
  var parsers = {
    "recipe-hero": parse,
    "recipe-meta": parse2,
    ingredients: parse3,
    directions: parse4,
    "page-nav": parse5,
    "cards-tiles": parse6
  };
  var PAGE_TEMPLATE = {
    name: "recipe",
    description: "Food Network recipe detail page",
    urls: [
      "https://www.foodnetwork.com/recipes/sunny-anderson/apple-cider-chicken-recipe-1952273"
    ],
    blocks: [
      {
        name: "recipe-hero",
        instances: ["#mod-recipe-lead-1 > div.recipeLead", "#mod-recipe-summary-1"]
      },
      {
        name: "recipe-meta",
        instances: ["#mod-recipe-lead-1 > div.recipeInfo"]
      },
      {
        name: "ingredients",
        instances: ["section.o-Recipe .o-Ingredients"]
      },
      {
        name: "directions",
        instances: ["section.o-Recipe .o-Method"]
      },
      {
        name: "page-nav",
        instances: ["div.assetNavigation"]
      },
      {
        name: "cards-tiles",
        instances: ["section.o-Recommendations"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Recipe Lead / Hero",
        selector: ["#mod-recipe-lead-1"],
        style: null,
        blocks: ["recipe-hero"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "Recipe Meta",
        selector: ["#mod-recipe-lead-1 > div.recipeInfo"],
        style: null,
        blocks: ["recipe-meta"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Recipe Body (Ingredients + Directions)",
        selector: ["section.o-Recipe > div.recipe-body", "section.o-Recipe"],
        style: null,
        blocks: ["ingredients", "directions"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Prev / Next Recipe Pager",
        selector: ["div.assetNavigation"],
        style: null,
        blocks: ["page-nav"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "Looking for Something Else (Related Recipes)",
        selector: ["section.flush-top"],
        style: null,
        blocks: ["cards-tiles"],
        defaultContent: ["section.flush-top h2"]
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
  var import_recipe_default = {
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
      const path = WebImporter.FileUtils.sanitizePath("/foodnetwork/apple-cider-chicken");
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
  return __toCommonJS(import_recipe_exports);
})();
