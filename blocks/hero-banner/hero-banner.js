/*
 * hero-banner — auto-advancing hero carousel.
 * Each block row is one slide: cell 1 = background image, cell 2 = copy
 * (eyebrow + heading + body + CTA). A single-row hero renders as a static
 * hero with no controls. Multiple rows become a rotating carousel with
 * prev/next arrows, dot indicators, and auto-advance (pauses on hover).
 */

const AUTOPLAY_MS = 6000;

function showSlide(block, index) {
  const slides = block.querySelectorAll('.hero-banner-slide');
  const dots = block.querySelectorAll('.hero-banner-dot');
  const count = slides.length;
  const next = (index + count) % count;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === next);
    slide.setAttribute('aria-hidden', i !== next);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === next);
    dot.setAttribute('aria-selected', i === next);
  });
  block.dataset.activeSlide = String(next);
}

export default function decorate(block) {
  // Each direct child <div> that the importer produced is one slide row.
  const rows = [...block.children];
  const slides = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const slide = document.createElement('div');
    slide.className = 'hero-banner-slide';

    const media = document.createElement('div');
    media.className = 'hero-banner-media';
    const copy = document.createElement('div');
    copy.className = 'hero-banner-copy';

    // First cell holds the picture/img; the rest is copy.
    const [mediaCell, copyCell] = cells;
    if (mediaCell) {
      const pic = mediaCell.querySelector('picture, img');
      if (pic) media.append(pic.closest('picture') || pic);
    }
    if (copyCell) {
      // Wrap the copy contents in a single dark panel so the overlay box is
      // one continuous block rather than per-element boxes.
      const panel = document.createElement('div');
      panel.className = 'hero-banner-panel';
      [...copyCell.children].forEach((el) => panel.append(el));
      copy.append(panel);
    }

    slide.append(media, copy);
    slides.push(slide);
    row.remove();
  });

  block.textContent = '';
  const track = document.createElement('div');
  track.className = 'hero-banner-track';
  slides.forEach((s) => track.append(s));
  block.append(track);

  if (slides.length > 1) {
    block.classList.add('hero-banner-carousel');

    // Prev / next arrows
    const nav = document.createElement('div');
    nav.className = 'hero-banner-nav';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'hero-banner-arrow hero-banner-prev';
    prev.setAttribute('aria-label', 'Previous slide');
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'hero-banner-arrow hero-banner-next';
    next.setAttribute('aria-label', 'Next slide');
    nav.append(prev, next);
    block.append(nav);

    // Dot indicators
    const dots = document.createElement('div');
    dots.className = 'hero-banner-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-banner-dot';
      dot.setAttribute('aria-label', `Show slide ${i + 1}`);
      dot.addEventListener('click', () => {
        showSlide(block, i);
      });
      dots.append(dot);
    });
    block.append(dots);

    const step = (dir) => {
      const current = parseInt(block.dataset.activeSlide || '0', 10);
      showSlide(block, current + dir);
    };
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));

    // Auto-advance, pausing on hover/focus.
    let timer = null;
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    const start = () => {
      stop();
      timer = window.setInterval(() => step(1), AUTOPLAY_MS);
    };
    block.addEventListener('mouseenter', stop);
    block.addEventListener('mouseleave', start);
    block.addEventListener('focusin', stop);
    block.addEventListener('focusout', start);
    start();
  }

  showSlide(block, 0);
}
