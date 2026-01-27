const links = Array.from(document.querySelectorAll('[data-random]'));
const panelButtons = Array.from(document.querySelectorAll('[data-panel]'));
const closeButtons = Array.from(document.querySelectorAll('.panel-close'));
const panels = {
  contact: document.getElementById('panel-contact'),
  bio: document.getElementById('panel-bio'),
};

const placeFromRatios = () => {
  const padding = 12;
  const width = window.innerWidth;
  const height = window.innerHeight;

  links.forEach((link) => {
    const ratioX = Number(link.dataset.rx || 0.5);
    const ratioY = Number(link.dataset.ry || 0.5);
    const maxX = Math.max(padding, width - link.offsetWidth - padding);
    const maxY = Math.max(padding, height - link.offsetHeight - padding);
    const x = padding + ratioX * (maxX - padding);
    const y = padding + ratioY * (maxY - padding);
    link.style.left = `${x}px`;
    link.style.top = `${y}px`;
  });
};

const placeWithSpacing = () => {
  const padding = 12;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const placed = [];
  const minDistance = 140;
  const maxTries = 80;
  const quadrants = [
    { minX: 0, maxX: 0.5, minY: 0, maxY: 0.5 },
    { minX: 0.5, maxX: 1, minY: 0, maxY: 0.5 },
    { minX: 0, maxX: 0.5, minY: 0.5, maxY: 1 },
    { minX: 0.5, maxX: 1, minY: 0.5, maxY: 1 },
  ];

  links.forEach((link) => {
    let x = padding;
    let y = padding;
    let tries = 0;
    let ok = false;
    const zone = quadrants[placed.length % quadrants.length];

    while (!ok && tries < maxTries) {
      const ratioX = zone.minX + Math.random() * (zone.maxX - zone.minX);
      const ratioY = zone.minY + Math.random() * (zone.maxY - zone.minY);
      const maxX = Math.max(padding, width - link.offsetWidth - padding);
      const maxY = Math.max(padding, height - link.offsetHeight - padding);
      x = padding + ratioX * (maxX - padding);
      y = padding + ratioY * (maxY - padding);
      ok = placed.every((pos) => Math.hypot(pos.x - x, pos.y - y) >= minDistance);
      tries += 1;
    }

    link.dataset.rx = (x / width).toFixed(3);
    link.dataset.ry = (y / height).toFixed(3);
    link.style.left = `${x}px`;
    link.style.top = `${y}px`;
    placed.push({ x, y });
  });
};

window.addEventListener('load', () => {
  placeWithSpacing();
});

window.addEventListener('resize', () => {
  placeFromRatios();
});

window.addEventListener('load', () => {
  links.forEach((el, index) => {
    el.style.opacity = 0;
    setTimeout(() => {
      el.style.transition = 'opacity 600ms ease';
      el.style.opacity = 1;
    }, 600 + index * 500);
  });
});

const showPanel = (key) => {
  if (!panels[key]) return;
  document.body.dataset.panel = key;
  Object.keys(panels).forEach((name) => {
    panels[name].setAttribute('aria-hidden', name !== key ? 'true' : 'false');
  });
};

const hidePanels = () => {
  delete document.body.dataset.panel;
  Object.values(panels).forEach((panel) => {
    panel.setAttribute('aria-hidden', 'true');
  });
};

panelButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.panel;
    if (!key) return;
    if (document.body.dataset.panel === key) {
      hidePanels();
      return;
    }
    showPanel(key);
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    hidePanels();
  });
});
