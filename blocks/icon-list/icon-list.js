import { createOptimizedPicture } from '../../scripts/aem.js';

async function inlineSvg(picture) {
  const img = picture.querySelector('img');
  if (!img) return;

  try {
    const response = await fetch(img.src);
    if (!response.ok) return;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('svg')) return;

    const svgText = await response.text();
    const svg = new DOMParser()
      .parseFromString(svgText, 'image/svg+xml')
      .querySelector('svg');
    if (!svg) return;

    if (!svg.getAttribute('viewBox')) {
      const width = parseFloat(svg.getAttribute('width'));
      const height = parseFloat(svg.getAttribute('height'));
      if (width && height) svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.classList.add('icon-list-svg');
    svg.setAttribute('role', 'img');
    if (img.alt) svg.setAttribute('aria-label', img.alt);

    picture.replaceWith(svg);
  } catch {
    // leave original <picture> as fallback
  }
}

function animateCounter(element, duration = 4000) {
  const originalText = element.textContent.trim();
  const target = parseInt(originalText.replace(/\D/g, ''), 10);
  if (Number.isNaN(target)) return;

  const suffix = originalText.replace(/[0-9\s]/g, '');
  let start = null;

  const step = (timestamp) => {
    start ??= timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    element.textContent = `${Math.floor(progress * target)} ${suffix}`;
    if (progress < 1) window.requestAnimationFrame(step);
    else element.textContent = originalText;
  };

  window.requestAnimationFrame(step);
}

function observeCounters(block, counters) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counters.forEach((counter) => animateCounter(counter));
      observer.disconnect();
    });
  }, { threshold: 0.4 });

  observer.observe(block);
}

export default async function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }
    [...li.children].forEach((div) => {
      div.className = div.querySelector('picture')
        ? 'icon-list-icon-container'
        : 'icon-list-content';
    });
    ul.append(li);
  });
  block.replaceChildren(ul);

  const pictures = block.querySelectorAll('.icon-list-icon-container picture');
  await Promise.all([...pictures].map(inlineSvg));

  observeCounters(block, block.querySelectorAll('.icon-list-content h2'));
}
