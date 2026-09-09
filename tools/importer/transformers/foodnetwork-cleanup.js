/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Food Network site-wide cleanup.
 *
 * Removes non-authorable global chrome and UGC/ad widgets so the import
 * contains only page-level authorable recipe content.
 *
 * ALL selectors below were verified by reading migration-work/cleaned.html.
 * NOTE: `.bodyRight` and `#site.flush-top` are intentionally NOT removed — they
 * are ancestors of migrated content (rc5 `section.o-Recommendations` /
 * `#mod-looking-for-something-1`, and the `assetNavigation` pager). Only the
 * specific non-authorable descendants are targeted.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie / consent overlays (OneTrust). Verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // --- Global header / nav / search (site shell) ---
      'header.o-Header',        // global site header, verified line 21
      '#mod-header-1',          // header area module
      '#mod-nav-profile-1',     // account/profile nav
      '#mod-search-form-1',     // global search form

      // --- Global footer ---
      'footer.o-FooterFresh',   // global site footer
      '#mod-footer-1',

      // --- Breadcrumbs ---
      '.o-Breadcrumb',
      '.breadcrumb.tagbasedBreadcrumb',

      // --- Ad slots ---
      '#leaderboard-wrap',
      '#leaderboard',
      '#pushdown_adtag',
      '.bigbox-ad',
      '.rr-ad',

      // --- Right-rail promo widgets (What's Cooking, Shop With Us, editorial promos, newsletter) ---
      '.rightRail',             // right-rail parsys wrapper (contains What's Cooking + Shop With Us editorial promos)
      '.rightRailTop',
      '#mod-newsletter-1',      // newsletter signup
      '.o-Newsletter',
      '#mod-editorial-promo-1',
      '#mod-editorial-promo-2',
      '.o-ShoppingEmbed',       // "Tools You May Need" product/shop embed widget

      // --- UGC: ratings, reviews, private notes, comments ---
      '.o-RatingsAndReviews',        // "270 Reviews" list + rating submission form
      '#mod-recipe-private-notes-1', // "My Private Notes" UI (.private-notes)
      '.o-UserComments',
      '#user-review',

      // --- Social share UI (site chrome) ---
      '#mod-social-share-1',

      // --- Other site chrome / promo streams ---
      '#mod-on-tv-full-width-1',
      // NOTE: do NOT remove '#mod-multi-content-stream-1' — verified in cleaned.html
      // it is the inner scroll container INSIDE section.o-Recommendations
      // (#mod-looking-for-something-1), which is migrated rc5 content (the
      // "Looking for Something Else?" recipe-card grid parsed by cards-tiles).

      // --- Non-authorable recipe-body leftovers (verified 0-conflict with the
      //     migrated blocks and with section.o-Recommendations) ---
      '.o-RecipeInfo',      // duplicate Level/Total/Prep meta list + Save Recipe button panel
      '.o-AssetActions',    // Save Recipe / print / social action bar in the recipe lead
      '.o-VideoPromo',      // "Watch how to make this recipe" video-promo media block (tracking-alt thumb)
      '.o-Attribution',     // "Show: … / Episode: …" attribution line
      '.o-Capsule',         // Tools You May Need, Categories, More from, editorial/newsletter capsules
      '.o-AutoPilot__m-AutoPilot-Wrap', // "Related Pages" autopilot link list

      // --- Safe leftover elements ---
      'iframe',
      'link',
      'noscript',
    ]);

    // Strip injected analytics tracking-pixel images (e.g. Yahoo dot beacons)
    // that appear in the rendered DOM but carry no authorable content.
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/sp\.analytics\.yahoo\.com|\/sp\.pl\?|trx-hub\.com|\/i\/m\/i\.png/.test(src)) {
        const p = img.closest('p');
        (p && p.textContent.trim() === '' ? p : img).remove();
      }
    });

    // Strip tracking / interaction attributes present in captured DOM.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-tracking');
    });
  }
}
