import { Router } from './router';
import { LandingPage } from './pages/landing';
import { BuilderPage } from './pages/builder';
import { Nav } from './components/nav';
import { Footer } from './components/footer';

const app = document.getElementById('app')!;
const router = new Router(app);

function wrapWithLayout(inner: (container: HTMLElement) => void) {
  return (container: HTMLElement) => {
    const wrapper = document.createElement('div');
    const content = document.createElement('div');

    function navigate(page: string) {
      window.location.hash = page;
    }

    wrapper.appendChild(Nav(navigate));
    wrapper.appendChild(content);
    wrapper.appendChild(Footer());
    container.appendChild(wrapper);

    inner(content);
  };
}

const builderPage = new BuilderPage();

router.route('/', wrapWithLayout((c) => LandingPage(c)));
router.route('/builder', wrapWithLayout((c) => builderPage.render(c)));
router.route('/pricing', wrapWithLayout((c) => {
  c.innerHTML = '';
  LandingPage(c);
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
}));

router.start();
