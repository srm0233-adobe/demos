/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Food Network HOMEPAGE cleanup.
 *
 * Removes non-authorable global chrome and homepage-specific junk so the import
 * contains only the migrated editorial content sections (superLeadHero,
 * content fullWidthPromo, profilePromo, storyPromo, globalVideoPlayer).
 *
 * Separate from foodnetwork-cleanup.js (recipe template) — the homepage shell
 * differs (o-Hub SR heading, leaderboard/pushdown/brandscape ad rail, empty
 * ad-placeholder promo divs, ltp Legal-Terms-and-Privacy dialog).
 *
 * ALL selectors below were verified by reading migration-work/cleaned.html.
 *
 * DO NOT remove the migrated content sections:
 *   div.superLeadHero, the CONTENT div.fullWidthPromo (with .o-FullWidthPromo +
 *   heading), div.profilePromo (with .o-ProfilePromo), div.storyPromo,
 *   div.globalVideoPlayer. Only the EMPTY ad-placeholder promo divs are removed
 *   (they have zero element children — verified in cleaned.html).
 *
 * Images intentionally left on the Food Network CDN (food.fnr.sndimg.com /
 * sndimg.com); localization to /foodnetwork/media/ happens in the import-script
 * step, not here.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Cookie / consent / privacy overlays (block parsing / obscure content) ---
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',       // OneTrust consent container (verified line 2480)
      '#onetrust-pc-sdk',            // OneTrust preference center — hosts "Your Privacy Choices" + GPC block (verified 2483/2501/2522)
      '.onetrust-pc-dark-filter',    // OneTrust dark backdrop overlay
      '#ltp-dialog',                 // "Legal Terms and Privacy" consent dialog (verified 2466/ltp-banner)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // --- Global header / nav / search / profile (site shell) ---
      'header.o-Header',   // global site header incl. flyout nav + on-tv dropdown (verified line 17)
      '#mod-header-1',     // header main area module (verified line 22)
      '#mod-nav-profile-1', // account / profile nav (verified line 989)
      '#mod-search-form-1', // global search form (verified line 943)

      // --- Global footer ---
      'div.footer',          // #site > div.footer wrapper (verified line 2326)
      'footer.o-FooterFresh', // global site footer (verified line 2329)
      '#mod-footer-1',

      // --- Hub / SR-only homepage heading ("Food Network Homepage") ---
      '.o-Hub',            // div.o-Hub > h1.sr-only (verified line 1018)

      // --- Leaderboard / pushdown / brandscape ads ---
      '#leaderboard-wrap',   // verified line 11
      '#leaderboard',        // verified line 12
      '#pushdown_adtag',     // verified line 1010
      '#brandscape',         // verified line 1011
      '.ad-leaderboard-body', // empty in-hero ad slot (verified line 1379)

      // --- In-content ad slots (part of the FN ad shell; not present in this
      //     capture but requested for completeness — remove() no-ops if absent) ---
      '#ad_block_content_1',
      '#ad_block_content_2',
      '#ad_block_content_3',
      '.bigbox-ad',
      '.rr-ad',

      // --- Safe leftover elements ---
      'iframe',   // strip leftover iframes (video/DM already parsed into blocks)
      'link',
      'noscript',
    ]);

    // --- Empty ad-placeholder promo sections ---
    // Homepage has empty <div class="fullWidthPromo section"></div> and
    // <div class="profilePromo capsule section"></div> placeholders (verified
    // in cleaned.html: they have NO .o-FullWidthPromo/.o-ProfilePromo inner and
    // NO heading — completely childless). CONTENT promos always contain a
    // clicktracking span + inner <section> (or, post-parse, a block table), so
    // children.length === 0 uniquely identifies the empty placeholders without
    // touching migrated content. Runs in afterTransform (never before): the
    // nth-of-type selectors used by parsers and the section transformer were
    // computed with these placeholders present, so removing them earlier would
    // shift every subsequent index.
    element
      .querySelectorAll('div.fullWidthPromo.section, div.profilePromo.capsule.section')
      .forEach((div) => {
        if (div.children.length === 0) div.remove();
      });

    // --- Injected tracking-pixel images (none in this capture; defensive) ---
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/sp\.analytics\.yahoo\.com|\/sp\.pl\?|trx-hub\.com|\/i\/m\/i\.png/.test(src)) {
        const p = img.closest('p');
        (p && p.textContent.trim() === '' ? p : img).remove();
      }
    });

    // --- Strip tracking / interaction attributes present in captured DOM ---
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-tracking');
    });
  }
}
