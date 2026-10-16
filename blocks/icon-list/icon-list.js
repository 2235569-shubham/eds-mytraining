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

function renderIconClass(cell) {
  const raw = cell.textContent.trim();
  if (!raw) return false;

  const icon = document.createElement('i');
  icon.className = raw;
  icon.setAttribute('aria-hidden', 'true');
  cell.replaceChildren(icon);
  return true;
}

export default async function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }
    [...li.children].forEach((div, index) => {
      const isIcon = index === 0 && renderIconClass(div);
      div.className = isIcon ? 'icon-list-icon-container' : 'icon-list-content';
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
  
  observeCounters(block, block.querySelectorAll('.icon-list-content h2'));
}
