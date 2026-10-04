export function PortfolioPreview(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'portfolio-preview-wrapper';

  const iframe = document.createElement('iframe');
  iframe.className = 'portfolio-preview-frame';
  iframe.srcdoc = html;
  iframe.setAttribute('sandbox', 'allow-scripts');

  wrapper.appendChild(iframe);
  return wrapper;
}
