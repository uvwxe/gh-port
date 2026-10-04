import type { GitHubUser, GitHubRepo } from '../api/github';
import { renderPortfolio } from './template';

export function generatePortfolioHtml(profile: GitHubUser, repos: GitHubRepo[]): string {
  return renderPortfolio(profile, repos);
}
