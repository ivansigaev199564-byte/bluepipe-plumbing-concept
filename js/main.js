// BluePipe Plumbing — shared behavior + motion system

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Mobile navigation ----------
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  mainNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) mainNav.classList.remove('open');
  });
}

// ---------- Header shadow on scroll ----------
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- FAQ accordions ----------
document.querySelectorAll('.faq-q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    item.closest('.faq-list')
      .querySelectorAll('.faq-item.open')
      .forEach((el) => el.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ---------- Scroll reveal ----------
// Grouped items get a stagger delay based on their index within the parent.
const GROUP_SELECTORS = [
  '.trust-item', '.service-card', '.service-card-v', '.review-card',
  '.value-card', '.team-card', '.neigh-card', '.percent-card',
  '.pill', '.step-h', '.step-v', '.mini-stat', '.faq-item'
];
// Standalone blocks appear as a whole.
const SINGLE_SELECTORS = [
  '.section-head', '.why-card', '.pricing-card', '.cta-banner',
  '.soft-card', '.split > div', '.pills-note', '.card'
];

function tagReveals() {
  GROUP_SELECTORS.forEach((sel) => {
    const byParent = new Map();
    document.querySelectorAll(sel).forEach((el) => {
      if (el.closest('.reveal') && !el.classList.contains('reveal')) return;
      const parent = el.parentElement;
      const i = byParent.get(parent) || 0;
      byParent.set(parent, i + 1);
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min(i, 6) * 75 + 'ms');
    });
  });
  SINGLE_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (el.classList.contains('reveal') || el.querySelector('.reveal') || el.closest('.reveal')) return;
      el.classList.add('reveal');
    });
  });
}

if (!REDUCED && 'IntersectionObserver' in window) {
  tagReveals();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

// ---------- Animated counters ----------
// Parses values like "10+", "2,000+", "4.9", "100%", "60 min", "98%".
function animateCounter(el) {
  const raw = el.textContent.trim();
  const m = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!m) return;
  const prefix = m[1];
  const digits = m[2];
  const suffix = m[3];
  const target = parseFloat(digits.replace(/,/g, ''));
  if (isNaN(target)) return;
  const decimals = (digits.split('.')[1] || '').length;
  const grouped = digits.includes(',');
  const dur = 1300;
  const t0 = performance.now();
  function frame(t) {
    const p = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    const val = target * eased;
    el.textContent = prefix + (grouped
      ? Math.round(val).toLocaleString('en-US')
      : val.toFixed(decimals)) + suffix;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = raw;
  }
  requestAnimationFrame(frame);
}

if (!REDUCED && 'IntersectionObserver' in window) {
  const counters = document.querySelectorAll('.stat b, .mini-stat b, .percent-card b');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        cio.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => cio.observe(el));
}

// ---------- Contact form: portfolio-concept demo notice ----------
// This site is a portfolio concept, so the form does not send anything.
const requestForm = document.querySelector('#requestForm');
if (requestForm) {
  requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = requestForm.querySelector('button[type="submit"]');

    let note = requestForm.querySelector('.demo-note');
    if (!note) {
      note = document.createElement('div');
      note.className = 'demo-note';
      note.innerHTML = '<svg class="icon"><use href="#i-alert"></use></svg>'
        + '<span><b>Demo only.</b> This website is a portfolio concept by Ivan Sigaev. '
        + 'The form is for demonstration purposes — no request has been sent.</span>';
      btn.insertAdjacentElement('afterend', note);
    }
    note.hidden = false;

    btn.innerHTML = '<svg class="icon"><use href="#i-alert"></use></svg> Portfolio Concept — Nothing Sent';
    btn.disabled = true;
    btn.style.background = '#e8a20c';
    btn.style.boxShadow = 'none';
    setTimeout(() => {
      btn.disabled = false;
      btn.style.background = '';
      btn.style.boxShadow = '';
      btn.innerHTML = '<svg class="icon"><use href="#i-calendar"></use></svg> Send Request';
    }, 4000);
  });
}
