import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-container';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  // Replace social media text with icons
  const socialIcons = {
    facebook: 'ti ti-facebook',
    twitter: 'fa-brands fa-x-twitter',
    instagram: 'ti ti-instagram',
    linkedin: 'ti ti-linkedin'
  };

  block.querySelectorAll('.company-info ul a').forEach((link) => {
    const text = link.textContent.trim().toLowerCase();

    if (socialIcons[text]) {
      link.innerHTML = `<i class="${socialIcons[text]}" aria-hidden="true"></i>`;
      link.setAttribute('aria-label', text);
      link.classList.add('social-icon');
    }
  });
}
