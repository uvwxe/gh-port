import { GitHubUser } from '../api/github';

export function Nav(onNavigate: (page: string) => void) {
  const el = document.createElement('nav');
  el.className = 'nav';
  el.innerHTML = `
    <div class="nav-inner">
      <span class="nav-logo">Portfolio</span>
      <div class="nav-links">
        <button data-nav="builder">Build</button>
        <button data-nav="pricing">Pricing</button>
        <button class="nav-cta" data-nav="builder">Get Started</button>
      </div>
    </div>
  `;
  el.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => onNavigate(btn.getAttribute('data-nav')!));
  });
  return el;
}
