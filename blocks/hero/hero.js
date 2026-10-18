export default async function decorate(block) {
  const heroContent = block.firstElementChild?.lastElementChild;
  heroContent?.classList.add('hero-section');
}
