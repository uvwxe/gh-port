export function Footer() {
  const el = document.createElement('footer');
  el.className = 'footer';
  el.innerHTML = `
    <p>Built by <a href="https://github.com/uvwxe" target="_blank" rel="noopener">uvwxe</a></p>
  `;
  return el;
}
