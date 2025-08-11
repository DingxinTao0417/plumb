// API
const API = '/api/bookings/';

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn?.addEventListener('click', () => {
  const open = mobileMenu.style.display === 'block';
  mobileMenu.style.display = open ? 'none' : 'block';
});

// Back to top
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.style.display = window.scrollY > 500 ? 'grid' : 'none';
});
if (toTop) toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// Reveal on view
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
}, {threshold:.15});
revealEls.forEach(el=>io.observe(el));

// Booking form -> Django
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

form?.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  statusEl.textContent = '';

  const fd = new FormData(form);
  const payload = {
    name: (fd.get('name')||'').toString().trim(),
    phone: (fd.get('phone')||'').toString().trim(),
    email: (fd.get('email')||'').toString().trim(),
    service: (fd.get('service')||'').toString().trim(),
    message: (fd.get('message')||fd.get('msg')||'').toString().trim()
  };

  if (!payload.name || !payload.phone) {
    statusEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--error');
    statusEl.textContent = 'Please provide your name and phone.';
    return;
  }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(()=>'');
      throw new Error(`HTTP ${res.status}: ${text || 'No response body'}`);
    }

    const json = await res.json().catch(()=>({}));
    statusEl.style.color = 'var(--accent)';
    statusEl.textContent = 'Thanks! Your request was received. Ref: #' + (json.id ?? 'N/A');
    form.reset();
  } catch (err) {
    statusEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--error');
    statusEl.textContent = `Network error: ${err.message}. Please try again.`;
    console.error(err);
  }
});

// --- Hero carousel ---
(function(){
  const car = document.getElementById('heroCarousel');
  if(!car) return;

  if (car.dataset.carouselInit === '1') return;
  car.dataset.carouselInit = '1';

  const track = car.querySelector('.car-track');
  const slides = Array.from(track.children);
  const prevBtn = car.querySelector('.prev');
  const nextBtn = car.querySelector('.next');
  const dotsWrap = car.querySelector('.car-dots');

  let index = 0;
  let timer = null;
  let resumeTimer = null;

  const AUTOPLAY_MS = Number(car.dataset.interval || 6000);
  const USER_PAUSE_MS = Number(car.dataset.userPause || 8000);

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'car-dot' + (i === 0 ? ' active' : '');
    b.setAttribute('aria-label', `Go to slide ${i+1}`);
    b.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function update(){
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
  function go(i, user=false){
    index = (i + slides.length) % slides.length;
    update();
    if (user) pauseThenResume();
  }
  function next(){ go(index + 1); }
  function prev(){ go(index - 1); }

  prevBtn.addEventListener('click', () => go(index - 1, true));
  nextBtn.addEventListener('click', () => go(index + 1, true));

  function start(){
    if (reduceMotion || AUTOPLAY_MS <= 0) return;
    stop();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stop(){
    if (timer) { clearInterval(timer); timer = null; }
  }
  function pauseThenResume(){
    stop();
    if (resumeTimer) { clearTimeout(resumeTimer); }
    resumeTimer = setTimeout(start, USER_PAUSE_MS);
  }

  car.addEventListener('mouseenter', stop);
  car.addEventListener('mouseleave', start);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  let startX = 0, dx = 0, dragging = false;
  function onDown(e){ dragging = true; startX = ('touches' in e ? e.touches[0].clientX : e.clientX); dx = 0; stop(); }
  function onMove(e){
    if(!dragging) return;
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX);
    dx = x - startX;
    track.style.transform = `translateX(calc(-${index*100}% + ${dx}px))`;
  }
  function onUp(){
    if(!dragging) return;
    dragging = false;
    const threshold = car.clientWidth / 4;
    if (dx > threshold) go(index - 1, true);
    else if (dx < -threshold) go(index + 1, true);
    else update();
    pauseThenResume();
  }
  car.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  car.addEventListener('touchstart', onDown, {passive:true});
  car.addEventListener('touchmove', onMove, {passive:true});
  car.addEventListener('touchend', onUp);

  update();
  start();
  window.addEventListener('resize', update);
})();