import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) on Escape
 * @param {KeyboardEvent} e keydown event
 */
function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) when focus leaves the nav
 * @param {FocusEvent} e focusout event
 */
function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean|string} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop > button').forEach((button) => {
    button.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  // the desktop nav is always expanded, so aria-expanded only applies to the mobile menu
  if (isDesktop.matches) nav.removeAttribute('aria-expanded');
  else nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  const topBarContent = fragment.lastElementChild;
  if (topBarContent) {
    const topbar = document.createElement('div');
    topbar.className = 'nav-topbar';
    const wrapper = topBarContent.firstElementChild;
    const items = [...wrapper.children];
    const left = document.createElement('div');
    left.classList.add('nav-topbar-left');
    const address = document.createElement('span');
    address.classList.add('topbar-address');
    address.innerHTML = `<i class="fa fa-home"></i>${items[0].textContent}`;
    const phone = document.createElement('span');
    phone.classList.add('topbar-phone');
    phone.innerHTML = `<i class="fa fa-mobile"></i>${items[1].innerHTML}`;
    const email = document.createElement('span');
    email.classList.add('topbar-email');
    email.innerHTML = `<i class="fa fa-envelope"></i>${items[2].innerHTML}`;
    left.append(address, phone, email);
    topbar.append(left);
    const right = document.createElement('div');
    right.classList.add('nav-topbar-right');
    const timings = document.createElement('p');
    timings.classList.add('topbar-hours');
    timings.innerHTML = `<i class="fa fa-clock"></i>${items[3].textContent.trim()}`;
    const socials = document.createElement('ul');
    socials.classList.add('topbar-socials');
    const socialIcons = {
      facebook: 'fa-brands fa-facebook-f',
      twitter: 'fa-brands fa-x-twitter',
      instagram: 'fa-brands fa-instagram',
    };
    items.slice(4).forEach((item) => {
      const anchor = item.querySelector('a');
      if (!anchor) return;
      const text = anchor.textContent.trim().toLowerCase();
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = anchor.href;
      a.title = text;
      a.target = '_blank';
      const icon = document.createElement('i');
      icon.className = socialIcons[text] || '';
      a.append(icon);
      li.append(a);
      socials.append(li);
    });
    right.append(timings, socials);
    topbar.append(right);
    topBarContent.innerHTML = '';
    topBarContent.append(topbar);
    topBarContent.classList.add('topbar-wrapper');
    fragment.removeChild(topBarContent);
  }
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  // We explicitly assign classes so the button gets 'nav-cta'
  const classes = ['brand', 'sections', 'tools', 'cta'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      const subList = navSection.querySelector(':scope > ul');
      if (!subList) return;
      navSection.classList.add('nav-drop');
      // wrap the dropdown label in a button so it is announced as expandable
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-expanded', false);
      [...navSection.childNodes].forEach((node) => {
        if (node !== subList) button.append(node);
      });
      navSection.prepend(button);
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        if (isDesktop.matches) {
          button.focus();
          toggleAllNavSections(navSections);
        }
        button.setAttribute('aria-expanded', !expanded);
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  if (topBarContent) {
    block.append(topBarContent);
  }
  block.append(navWrapper);

  // -----------------------------------------------------------------
  // SCROLL & STICKY LOGIC
  // -----------------------------------------------------------------
  const OFFSET = 50;

  const updateStickyHeader = () => {
    const headerHeight = block.offsetHeight;

    document.body.classList.toggle(
      'header-scrolled',
      window.scrollY > headerHeight + OFFSET
    );
  };

  window.addEventListener('scroll', updateStickyHeader);
  window.addEventListener('resize', updateStickyHeader);

// Initial check
  updateStickyHeader();
}
