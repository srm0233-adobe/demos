/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AT&T Brand Center section breaks + section metadata.
 *
 * Template "home" has 4 sections (page-templates.json), so section breaks
 * are required (expected <hr> = 3). Only section rc3 (Custom Photography
 * Collections) carries a style ("att-blue"), so exactly 1 Section Metadata
 * block is expected.
 *
 * Section selectors are DOM-verified boundaries from page analysis and were
 * confirmed against migration-work/cleaned.html:
 *   rc1 body > section.hero-section
 *   rc2 body > section.popular-section.section
 *   rc3 body > section.photography-section.att-blue.section  (style: att-blue)
 *   rc4 body > section.faq-section.section
 *
 * Uses both hooks and reverse iteration per the reference implementation:
 * breaks are inserted in beforeTransform (while every section element still
 * exists, before parsers replace them), and Section Metadata is anchored to
 * a marker <hr> in afterTransform.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = payload.template.sections || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break/metadata
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
