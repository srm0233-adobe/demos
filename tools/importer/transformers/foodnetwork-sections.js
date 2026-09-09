/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Food Network section breaks + section metadata.
 *
 * Driven by payload.template.sections (recipe template = 5 sections).
 * All 5 sections have style: null (white background), so NO Section Metadata
 * blocks are emitted — only the 4 <hr> breaks before sections rc2..rc5.
 *
 * Section selectors come directly from tools/importer/page-templates.json
 * (DOM-verified in migration-work/cleaned.html). Breaks are inserted in
 * beforeTransform (while every section element still exists, before parsers
 * replace them); any styled-section metadata would be anchored in afterTransform
 * via a marker (none apply here since every style is null).
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    // Reverse order so each insertion never shifts a not-yet-processed section.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Emit Section Metadata for any section with a style, anchored to the
    // marker <hr> (or surviving original element). No styled sections in the
    // recipe template, so this loop is a no-op there, but kept per reference
    // spec so the transformer is correct if styles are added later.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
