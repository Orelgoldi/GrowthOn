gsap.registerPlugin(ScrollTrigger);

// ── EmailJS setup (fill in your keys to enable email notifications) ──
const EMAILJS_PUBLIC_KEY  = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ── Load dynamic content from localStorage (admin edits) ──
function loadContent() {
  try {
    const map = JSON.parse(localStorage.getItem('growthon_content') || '{}');
    const apply = (sel, key, attr = 'textContent') => {
      const el = document.querySelector(sel);
      if (el && map[key]) attr === 'html' ? (el.innerHTML = map[key]) : (el[attr] = map[key]);
    };
    apply('.hero__title',               'hero_title', 'html');
    apply('.hero__body',                'hero_body');
    apply('.about__title',              'about_title', 'html');
    apply('.about__body:nth-of-type(1)','about_body_1');
    apply('.about__body:nth-of-type(2)','about_body_2');
    apply('.values__title',             'values_title', 'html');
    apply('.values__sub',               'values_sub');
    apply('.testimonials__title',       'testimonials_title', 'html');
    apply('.contact__title',            'contact_title', 'html');
  } catch(e) { /* silently fail — hardcoded defaults remain */ }
}
loadContent();

// ── Mobile nav burger ──
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  const spans = burger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.cssText = 'transform:translateY(7px) rotate(45deg)';
    spans[1].style.cssText = 'opacity:0';
    spans[2].style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => s.style.cssText = '');
  }
});

function closeMobileMenu() {
  mobileMenu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', false);
  document.body.style.overflow = '';
  burger.querySelectorAll('span').forEach(s => s.style.cssText = '');
}
window.closeMobileMenu = closeMobileMenu;

// ── Nav scroll state ──
const nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => nav.classList.toggle('scrolled', self.scroll() > 80)
});

// ── Reveal on scroll ──
document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el, start: 'top 88%',
    onEnter: () => {
      gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: (i % 4) * .08 });
      el.classList.add('is-visible');
    }
  });
});

// ── Hero entrance ──
gsap.timeline({ defaults: { ease: 'power3.out' } })
.from('.hero__title',     { opacity: 0, y: 40, duration: .9 }, .45)
  .from('.hero__body',      { opacity: 0, y: 30, duration: .8 }, .65)
  .from('.hero__actions',   { opacity: 0, y: 24, duration: .7 }, .8)
  .from('.hero__mosaic',    { opacity: 0, x: 60, duration: 1  }, .55)
  .from('.hero__scroll-hint', { opacity: 0, duration: .6 }, 1.2);

// Chart lines animate via CSS (drawLine keyframe), triggered on page load

// ── Animated counters ──
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  gsap.fromTo({ val: 0 }, { val: target }, {
    duration: 2, ease: 'power2.out',
    onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); }
  });
}
document.querySelectorAll('[data-count]').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 90%',
    onEnter: () => animateCount(el), once: true
  });
});

// ── Testimonials marquee: pause on hover handled by CSS ──
// ScrollTrigger entrance for the header
ScrollTrigger.create({
  trigger: '.testimonials', start: 'top 80%', once: true,
  onEnter: () => {
    gsap.from('.marquee-track', { opacity: 0, y: 30, stagger: .15, duration: .8, ease: 'power3.out' });
  }
});

// ── Float CTA hide on contact ──
const floatCta = document.querySelector('.float-cta');
ScrollTrigger.create({
  trigger: '#contact', start: 'top 60%', end: 'bottom bottom',
  onToggle: (self) => { floatCta.style.opacity = self.isActive ? '0' : '1'; }
});

// ── Form submit → localStorage + EmailJS (optional) ──
document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type=submit]');
  const btnLabel = btn.querySelector('.btn-label');
  btnLabel.textContent = 'Sending...';
  btn.disabled = true;

  const data = {
    id:         Math.random().toString(36).slice(2),
    name:       form.name.value.trim(),
    company:    form.company.value.trim(),
    email:      form.email.value.trim(),
    phone:      form.phone.value.trim(),
    message:    form.message.value.trim(),
    created_at: new Date().toISOString(),
  };

  // Save to localStorage
  try {
    const leads = JSON.parse(localStorage.getItem('growthon_leads') || '[]');
    leads.unshift(data);
    localStorage.setItem('growthon_leads', JSON.stringify(leads));
  } catch(e) {}

  // Send email if EmailJS is configured
  if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID') {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  data.name,
        from_email: data.email,
        company:    data.company,
        phone:      data.phone,
        message:    data.message,
        to_email:   'itzik@growthon-m.com',
      });
    } catch(e) {}
  }

  btnLabel.textContent = 'Message Sent ✓';
  btn.style.background = 'var(--mint)';
  gsap.from(btn, { scale: .95, duration: .3, ease: 'back.out' });
  form.reset();
});

// ── Hero glow parallax ──
gsap.utils.toArray('.hero__glow').forEach(el => {
  gsap.to(el, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.hero', scrub: 1 } });
});

// ── Animated beam (about section) ──
function initBeams() {
  const wrap = document.getElementById('beamWrap');
  const svg  = document.getElementById('beamSvg');
  if (!wrap || !svg) return;
  const wRect = wrap.getBoundingClientRect();
  if (!wRect.width) return;

  svg.setAttribute('viewBox', `0 0 ${wRect.width} ${wRect.height}`);
  svg.setAttribute('width',  wRect.width);
  svg.setAttribute('height', wRect.height);

  const defs = svg.querySelector('defs');

  // Glow blur filter
  const filt = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filt.id = 'bBlur';
  const feB = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  feB.setAttribute('stdDeviation', '2.5');
  filt.appendChild(feB);
  defs.appendChild(filt);

  function ctr(id) {
    const r = document.getElementById(id).getBoundingClientRect();
    return { x: r.left - wRect.left + r.width / 2, y: r.top - wRect.top + r.height / 2 };
  }

  const beams = [
    { from: 'bn-li',   to: 'bn-hub',  c1: '#05E9B4', c2: '#2300D0', rev: false, delay: 0,    dur: 3   },
    { from: 'bn-em',   to: 'bn-hub',  c1: '#05E9B4', c2: '#2300D0', rev: false, delay: 1,    dur: 3.5 },
    { from: 'bn-co',   to: 'bn-hub',  c1: '#05E9B4', c2: '#2300D0', rev: false, delay: 2,    dur: 2.8 },
    { from: 'bn-hub',  to: 'bn-lead', c1: '#2300D0', c2: '#818cf8', rev: true,  delay: 0.5,  dur: 3   },
    { from: 'bn-hub',  to: 'bn-meet', c1: '#2300D0', c2: '#818cf8', rev: true,  delay: 1.5,  dur: 3.5 },
    { from: 'bn-hub',  to: 'bn-rev',  c1: '#2300D0', c2: '#818cf8', rev: true,  delay: 2.5,  dur: 2.8 },
  ];

  beams.forEach((b, i) => {
    const f = ctr(b.from), t = ctr(b.to);
    const curvePx = [-28, 0, 28][i % 3];
    const mx = (f.x + t.x) / 2;
    const my = (f.y + t.y) / 2 - curvePx;
    const d = `M ${f.x},${f.y} Q ${mx},${my} ${t.x},${t.y}`;

    // Faint track
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    track.setAttribute('d', d);
    track.setAttribute('stroke', 'rgba(35,0,208,.18)');
    track.setAttribute('stroke-width', '1.5');
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke-linecap', 'round');
    svg.appendChild(track);

    // Gradient (objectBoundingBox default — % of path bbox)
    const gId = `bg${i}`;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    g.id = gId;
    g.setAttribute('x1', b.rev ? '90%' : '10%');
    g.setAttribute('x2', b.rev ? '100%' : '0%');
    g.setAttribute('y1', '0%'); g.setAttribute('y2', '0%');
    [[0, b.c1, 0], [.35, b.c1, 1], [.65, b.c2, 1], [1, b.c2, 0]].forEach(([off, col, op]) => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s.setAttribute('offset', off);
      s.setAttribute('stop-color', col);
      s.setAttribute('stop-opacity', op);
      g.appendChild(s);
    });
    defs.appendChild(g);

    // Glow (blurred copy)
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glow.setAttribute('d', d); glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', `url(#${gId})`); glow.setAttribute('stroke-width', '5');
    glow.setAttribute('filter', 'url(#bBlur)'); glow.style.opacity = '.55';
    svg.appendChild(glow);

    // Sharp beam
    const beam = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    beam.setAttribute('d', d); beam.setAttribute('fill', 'none');
    beam.setAttribute('stroke', `url(#${gId})`); beam.setAttribute('stroke-width', '2');
    beam.setAttribute('stroke-linecap', 'round');
    svg.appendChild(beam);

    // Animate gradient x1/x2 with GSAP (mirrors MagicUI Framer Motion logic)
    gsap.fromTo(g,
      { attr: { x1: b.rev ? '90%' : '10%', x2: b.rev ? '100%' : '0%' } },
      { attr: { x1: b.rev ? '-10%' : '110%', x2: b.rev ? '0%' : '100%' },
        duration: b.dur, ease: 'none', repeat: -1, delay: b.delay, repeatDelay: .6 }
    );
  });
}

window.addEventListener('load', () => requestAnimationFrame(initBeams));

// Rebuild on resize
let _beamTimer;
window.addEventListener('resize', () => {
  clearTimeout(_beamTimer);
  _beamTimer = setTimeout(() => {
    const svg = document.getElementById('beamSvg');
    if (svg) { svg.innerHTML = '<defs></defs>'; initBeams(); }
  }, 200);
});

// ── Section scroll-scale transitions (ported from Framer Motion reference) ──
// Hero inner shrinks + tilts as it exits viewport
gsap.to('.hero__inner', {
  scale: 0.84, rotation: -4, transformOrigin: 'center 60%',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
});
// About zooms in from rotated state
gsap.fromTo('.about__inner',
  { scale: 0.88, rotation: 4, transformOrigin: 'center 40%' },
  { scale: 1, rotation: 0, ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top top', scrub: 1.2 }
  }
);
