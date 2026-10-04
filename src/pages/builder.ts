import { fetchUser, fetchRepos, GitHubUser, GitHubRepo } from '../api/github';
import { generatePortfolioHtml } from '../engine/generator';
import { publishPortfolio } from '../api/publish';
import { PublishingModal } from './publishing';
import { RepoSelector } from '../components/repo-selector';
import { PortfolioPreview } from '../components/preview-frame';

export class BuilderPage {
  private container!: HTMLElement;
  private username = '';
  private profile: GitHubUser | null = null;
  private repos: GitHubRepo[] = [];
  private selectedRepos: Set<string> = new Set();

  async render(container: HTMLElement) {
    this.container = container;

    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const prefillUser = params.get('u');

    if (prefillUser) {
      this.username = prefillUser;
      await this.fetchAndPreview();
      return;
    }

    this.renderInput();
  }

  private async fetchAndPreview() {
    this.renderLoading();
    try {
      const [profile, repos] = await Promise.all([
        fetchUser(this.username),
        fetchRepos(this.username),
      ]);
      this.profile = profile;
      this.repos = repos;
      this.selectedRepos = new Set(repos.map((r) => r.name));
      this.renderPreview();
    } catch (e) {
      this.renderInput();
      const errEl = document.getElementById('hero-error');
      if (errEl) {
        errEl.textContent = e instanceof Error ? e.message : 'Something went wrong';
      }
    }
  }

  private renderLoading() {
    this.container.innerHTML = `
      <div class="hero-section fade-in" style="text-align:center">
        <div class="loading-spinner" style="width:32px;height:32px;border-width:3px;color:var(--accent);margin:0 auto 16px"></div>
        <p style="color:var(--text-secondary);font-size:15px">Loading ${this.username}...</p>
      </div>
    `;
  }

  private renderInput() {
    this.container.innerHTML = `
      <div class="hero-section fade-in">
        <h1 class="hero-title">Your GitHub. Your Portfolio.</h1>
        <p class="hero-subtitle">
          Turn your public repos into a stunning Apple-style portfolio page. Free forever.
        </p>
        <div class="input-group">
          <span class="input-prefix">github.com/</span>
          <input type="text" id="username-input" placeholder="uvwxe" autocomplete="off" spellcheck="false">
          <button id="generate-btn" class="btn-primary">Generate Portfolio</button>
        </div>
        <p id="hero-error" class="hero-error"></p>
      </div>
    `;

    const input = document.getElementById('username-input') as HTMLInputElement;
    const btn = document.getElementById('generate-btn')!;
    const errEl = document.getElementById('hero-error')!;

    const doFetch = async () => {
      const name = input.value.trim();
      if (!name) return;

      this.username = name;
      btn.textContent = 'Loading...';
      btn.setAttribute('disabled', '');
      errEl.textContent = '';

      try {
        const [profile, repos] = await Promise.all([
          fetchUser(name),
          fetchRepos(name),
        ]);
        this.profile = profile;
        this.repos = repos;
        this.selectedRepos = new Set(repos.map((r) => r.name));
        this.renderPreview();
      } catch (e) {
        errEl.textContent = e instanceof Error ? e.message : 'Something went wrong';
        btn.textContent = 'Generate Portfolio';
        btn.removeAttribute('disabled');
      }
    };

    btn.addEventListener('click', doFetch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doFetch();
    });
  }

  private renderPreview() {
    const html = generatePortfolioHtml(this.profile!, this.repos!.filter((r) => this.selectedRepos.has(r.name)));

    this.container.innerHTML = `
      <div class="builder-preview-layout fade-in">
        <div class="builder-header">
          <button id="back-btn" class="btn-outline">Back</button>
          <h2>${this.profile!.name || this.profile!.login}</h2>
          <button id="publish-btn" class="btn-accent">Publish to GitHub Pages</button>
        </div>
        <div class="builder-content">
          <div class="builder-sidebar">
            <h3>Repositories</h3>
            <p class="sidebar-subtitle">${this.repos.length} repos. Uncheck to hide.</p>
            <div id="repo-selector"></div>
            <p id="selected-count" class="selected-count">${this.selectedRepos.size} shown</p>
          </div>
          <div class="builder-main">
            <div id="preview-container"></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-btn')!.addEventListener('click', () => this.renderInput());
    document.getElementById('publish-btn')!.addEventListener('click', () => this.doPublish());

    const repoSelector = RepoSelector(
      this.repos,
      this.selectedRepos,
      () => this.updatePreview()
    );
    document.getElementById('repo-selector')!.appendChild(repoSelector);

    const previewContainer = document.getElementById('preview-container')!;
    previewContainer.appendChild(PortfolioPreview(html));
  }

  private updatePreview() {
    const html = generatePortfolioHtml(
      this.profile!,
      this.repos!.filter((r) => this.selectedRepos.has(r.name))
    );
    const previewContainer = document.getElementById('preview-container')!;
    previewContainer.innerHTML = '';
    previewContainer.appendChild(PortfolioPreview(html));
    const countEl = document.getElementById('selected-count');
    if (countEl) countEl.textContent = `${this.selectedRepos.size} shown`;
  }

  private async doPublish() {
    document.body.appendChild(PublishingModal());

    const html = generatePortfolioHtml(
      this.profile!,
      this.repos!.filter((r) => this.selectedRepos.has(r.name))
    );

    const updateStep = (step: number, status: 'active' | 'done') => {
      document.querySelectorAll('.publish-step').forEach((el, i) => {
        el.classList.remove('active', 'done');
        if (i < step) el.classList.add('done');
        if (i === step) el.classList.add(status);
      });
    };

    updateStep(0, 'active');

    try {
      const result = await publishPortfolio(this.username, html);
      await new Promise<void>((resolve, reject) => {
        (result as unknown as { onStep: (fn: (step: string) => void) => void }).onStep?.((step: string) => {
          const idx = ['auth', 'repo', 'upload', 'pages', 'done'].indexOf(step);
          if (idx >= 0) updateStep(idx, 'done');
          if (step === 'done') resolve();
          if (step === 'error') reject(new Error('publish failed'));
        });
        if (!(result as { onStep?: unknown }).onStep) {
          // Fallback: auto-advance steps
          updateStep(1, 'done');
          setTimeout(() => updateStep(2, 'done'), 500);
          setTimeout(() => updateStep(3, 'done'), 1000);
          setTimeout(() => updateStep(4, 'done'), 1500);
          setTimeout(() => resolve(), 2000);
        }
      });

      updateStep(4, 'done');
      const modal = document.querySelector('.publishing-modal')!;
      modal.innerHTML = `
        <div class="publish-result">
          <div class="result-icon">&#10004;</div>
          <h2>Portfolio published</h2>
          <a href="https://${this.username}.github.io" class="result-url" target="_blank" rel="noopener">
            ${this.username}.github.io
          </a>
          <p class="subtitle" style="margin-top:12px">Live in a few minutes while GitHub Pages deploys.</p>
          <button id="close-modal" class="btn-primary" style="margin-top:16px">Done</button>
        </div>
      `;
      document.getElementById('close-modal')!.addEventListener('click', () => {
        document.querySelector('.publishing-overlay')?.remove();
      });
    } catch (e) {
      const modal = document.querySelector('.publishing-modal')!;
      modal.innerHTML = `
        <div class="publish-result">
          <h2>Something went wrong</h2>
          <p class="publish-error">${e instanceof Error ? e.message : 'Unknown error'}</p>
          <button id="close-modal" class="btn-outline" style="margin-top:16px">Close</button>
        </div>
      `;
      document.getElementById('close-modal')!.addEventListener('click', () => {
        document.querySelector('.publishing-overlay')?.remove();
      });
    }
  }
}
