import { GitHubRepo } from '../api/github';

export function RepoSelector(
  repos: GitHubRepo[],
  selected: Set<string>,
  onChange: () => void
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'repo-selector-list';

  repos.forEach((repo) => {
    const row = document.createElement('label');
    row.className = 'repo-selector-row';
    const checked = selected.has(repo.name);

    row.innerHTML = `
      <input type="checkbox" ${checked ? 'checked' : ''} value="${repo.name}">
      <span class="repo-selector-name">${repo.name}</span>
      ${repo.language ? `<span class="repo-selector-lang">${repo.language}</span>` : ''}
    `;

    const checkbox = row.querySelector('input')!;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(repo.name);
      else selected.delete(repo.name);
      onChange();
    });

    el.appendChild(row);
  });

  return el;
}
