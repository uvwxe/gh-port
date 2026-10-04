export class Router {
  private routes: Map<string, (container: HTMLElement) => void> = new Map();

  constructor(private container: HTMLElement) {}

  route(path: string, handler: (container: HTMLElement) => void) {
    this.routes.set(path, handler);
  }

  start() {
    window.addEventListener('hashchange', () => this.handle());
    this.handle();
  }

  private handle() {
    const hash = window.location.hash.slice(1) || '/';
    let route = hash.split('?')[0] || '/';
    if (route !== '/' && !route.startsWith('/')) {
      route = '/' + route;
    }

    const tokenMatch = hash.match(/token=([^&]+)/);
    if (tokenMatch) {
      sessionStorage.setItem('gh_token', tokenMatch[1]);
      window.location.hash = '#builder';
      return;
    }

    if (hash.includes('upgraded=true')) {
      window.location.hash = '#builder';
      return;
    }

    const handler = this.routes.get(route);
    if (handler) {
      this.container.innerHTML = '';
      handler(this.container);
    } else {
      this.routes.get('/')?.(this.container);
    }
  }
}
