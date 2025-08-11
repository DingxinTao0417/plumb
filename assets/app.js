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
  if(!payload.name || !payload.phone){
    statusEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--error');
    statusEl.textContent = 'Please provide your name and phone.';
    return;
  }
  try{
    const res = await fetch('/api/bookings/', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('Network');
    const json = await res.json();
    statusEl.style.color = 'var(--accent)';
    statusEl.textContent = 'Thanks! Your request was received. Ref: #' + json.id;
    form.reset();
  }catch(err){
    statusEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--error');
    statusEl.textContent = 'Submit failed. Please try again or call us.';
  }
});