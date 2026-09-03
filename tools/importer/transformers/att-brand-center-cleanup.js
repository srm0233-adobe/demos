/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AT&T Brand Center site-wide cleanup.
 * Removes global site chrome (header/nav megamenu, footer) that is not
 * authorable page content. These are authored separately as nav/footer
 * fragments.
 *
 * Selectors verified against migration-work/cleaned.html:
 *   - body > header.site-header (global header + .megamenu nav + .megamenu-footer)
 *   - body > footer.site-footer (global footer)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome — verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      'header.site-header',
      'footer.site-footer',
    ]);
  }
}
