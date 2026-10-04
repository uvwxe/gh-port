export function PublishingModal(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'publishing-overlay';
  overlay.innerHTML = `
    <div class="publishing-modal">
      <h2>Publishing Portfolio</h2>
      <p class="subtitle">Setting up your GitHub Pages site</p>
      <div class="publish-steps">
        <div class="publish-step active" data-step="0">
          <span class="step-icon">1</span>
          Sign in with GitHub
        </div>
        <div class="publish-step" data-step="1">
          <span class="step-icon">2</span>
          Create repository
        </div>
        <div class="publish-step" data-step="2">
          <span class="step-icon">3</span>
          Upload portfolio
        </div>
        <div class="publish-step" data-step="3">
          <span class="step-icon">4</span>
          Enable GitHub Pages
        </div>
        <div class="publish-step" data-step="4">
          <span class="step-icon">5</span>
          Live
        </div>
      </div>
      <div class="loading-spinner"></div>
    </div>
  `;
  return overlay;
}
