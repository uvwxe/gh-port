export function LandingPage(container: HTMLElement) {
  container.innerHTML = `
    <div class="hero-section fade-in">
      <h1 class="hero-title">Your GitHub.<br>Your Portfolio.</h1>
      <p class="hero-subtitle">
        Turn your public repos into a stunning Apple-style portfolio page in 30 seconds. Free forever.
      </p>
      <div class="input-group">
        <span class="input-prefix">github.com/</span>
        <input type="text" id="hero-username-input" placeholder="uvwxe" autocomplete="off" spellcheck="false">
        <button id="hero-generate-btn" class="btn-primary">Generate Portfolio</button>
      </div>
      <p id="hero-error" class="hero-error"></p>
    </div>

    <div class="examples-section">
      <h2 class="examples-title">See what it looks like</h2>
      <div class="examples-grid">
        <div class="example-card">
          <div class="example-preview">
            <span>portfolio preview</span>
          </div>
          <div class="example-info">
            <div class="example-username">torvalds</div>
            <div class="example-repos">6 repos &middot; linux kernel</div>
          </div>
        </div>
        <div class="example-card">
          <div class="example-preview">
            <span>portfolio preview</span>
          </div>
          <div class="example-info">
            <div class="example-username">gaearon</div>
            <div class="example-repos">89 repos &middot; React core</div>
          </div>
        </div>
        <div class="example-card">
          <div class="example-preview">
            <span>portfolio preview</span>
          </div>
          <div class="example-info">
            <div class="example-username">karpathy</div>
            <div class="example-repos">45 repos &middot; AI researcher</div>
          </div>
        </div>
      </div>
    </div>

    <div class="pricing-section" id="pricing">
      <h2 class="pricing-title">Simple pricing</h2>
      <div class="pricing-cards">
        <div class="pricing-card">
          <div class="pricing-name">Free</div>
          <div class="pricing-price">$0<span>/forever</span></div>
          <ul class="pricing-features">
            <li>Apple-style portfolio theme</li>
            <li>GitHub Pages hosting</li>
            <li>Auto-generated from repos</li>
            <li>Repo selection</li>
            <li>One-click publish</li>
          </ul>
          <button class="btn-outline" onclick="window.location.hash='#builder'">Get Started Free</button>
        </div>
        <div class="pricing-card pro">
          <div class="pricing-name">Pro</div>
          <div class="pricing-price">$9<span>/month</span></div>
          <ul class="pricing-features">
            <li>Everything in Free</li>
            <li>5+ premium themes</li>
            <li>Custom domain support</li>
            <li>Visit analytics</li>
            <li>Priority support</li>
          </ul>
          <button class="btn-accent" id="pro-btn">Upgrade to Pro</button>
        </div>
      </div>
    </div>
  `;

  const heroInput = document.getElementById('hero-username-input') as HTMLInputElement;
  const heroBtn = document.getElementById('hero-generate-btn')!;
  const heroErr = document.getElementById('hero-error')!;

  const goBuilder = () => {
    const name = heroInput.value.trim();
    if (name) {
      window.location.hash = `#builder?u=${encodeURIComponent(name)}`;
    } else {
      window.location.hash = '#builder';
    }
  };

  heroBtn.addEventListener('click', goBuilder);
  heroInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') goBuilder();
  });

  document.getElementById('pro-btn')!.addEventListener('click', async () => {
    const res = await fetch('/api/stripe-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) window.location.href = data.url;
    else alert(data.error || 'Stripe not configured');
  });
}
