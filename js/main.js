const links = Array.from(document.querySelectorAll('[data-random]'));
const panelButtons = Array.from(document.querySelectorAll('[data-panel]'));
const closeButtons = Array.from(document.querySelectorAll('.panel-close'));
const intro = document.querySelector('.intro');
const panels = {
  contact: document.getElementById('panel-contact'),
  bio: document.getElementById('panel-bio'),
};

const getLayoutBounds = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const compact = width < 769;
  const padding = compact ? Math.max(24, Math.min(width, height) * 0.08) : Math.max(24, Math.min(width, height) * 0.05);
  const introRect = intro?.getBoundingClientRect();

  if (!introRect) {
    return { width, height, padding, forbiddenZone: null };
  }

  const forbiddenZone = {
    left: Math.max(padding, introRect.left - (compact ? 64 : 48)),
    right: Math.min(width - padding, introRect.right + (compact ? 64 : 48)),
    top: Math.max(padding, introRect.top - (compact ? 56 : 36)),
    bottom: Math.min(height - padding, introRect.bottom + (compact ? 56 : 36)),
  };

  return { width, height, padding, forbiddenZone };
};

const overlapsForbiddenZone = (x, y, link, forbiddenZone) => {
  if (!forbiddenZone) return false;

  const linkRight = x + link.offsetWidth;
  const linkBottom = y + link.offsetHeight;

  return !(
    linkRight < forbiddenZone.left ||
    x > forbiddenZone.right ||
    linkBottom < forbiddenZone.top ||
    y > forbiddenZone.bottom
  );
};

const placeFromRatios = () => {
  const { width, height, padding, forbiddenZone } = getLayoutBounds();

  links.forEach((link) => {
    const ratioX = Number(link.dataset.rx || 0.5);
    const ratioY = Number(link.dataset.ry || 0.5);
    const maxX = Math.max(padding, width - link.offsetWidth - padding);
    const maxY = Math.max(padding, height - link.offsetHeight - padding);
    let x = padding + ratioX * (maxX - padding);
    let y = padding + ratioY * (maxY - padding);

    if (overlapsForbiddenZone(x, y, link, forbiddenZone)) {
      placeWithSpacing();
      return;
    }

    link.style.left = `${x}px`;
    link.style.top = `${y}px`;
  });
};

const placeWithSpacing = () => {
  const { width, height, padding, forbiddenZone } = getLayoutBounds();
  const compact = width < 769;
  const placed = [];
  const minDistance = compact ? Math.max(120, Math.min(width, height) * 0.32) : Math.max(150, Math.min(width, height) * 0.18);
  const maxTries = compact ? 220 : 160;
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
      ok =
        !overlapsForbiddenZone(x, y, link, forbiddenZone) &&
        placed.every((pos) => Math.hypot(pos.x - x, pos.y - y) >= minDistance);
      tries += 1;
    }

    if (!ok) {
      const fallbackPositions = [
        { x: padding, y: padding },
        { x: width - link.offsetWidth - padding, y: padding },
        { x: padding, y: height - link.offsetHeight - padding },
        { x: width - link.offsetWidth - padding, y: height - link.offsetHeight - padding },
        { x: (width - link.offsetWidth) / 2, y: padding },
        { x: padding, y: (height - link.offsetHeight) / 2 },
        { x: width - link.offsetWidth - padding, y: (height - link.offsetHeight) / 2 },
        { x: (width - link.offsetWidth) / 2, y: height - link.offsetHeight - padding },
      ];

      const fallback = fallbackPositions.find(
        (pos) =>
          !overlapsForbiddenZone(pos.x, pos.y, link, forbiddenZone) &&
          placed.every((other) => Math.hypot(other.x - pos.x, other.y - pos.y) >= minDistance * 0.8),
      );

      if (fallback) {
        x = fallback.x;
        y = fallback.y;
      }
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
