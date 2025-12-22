// app.js
(function () {
  /* ===============================
     MOBILE MENU
  =============================== */
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () =>
      mobileMenu.classList.toggle('hidden')
    );
  }

  /* ===============================
     COUNTDOWN
  =============================== */
  function updateTimer() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay - now;
    const h = Math.max(0, Math.floor(diff / 3600000));
    const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
    const s = Math.max(0, Math.floor((diff % 60000) / 1000));

    const el = document.getElementById('countdown');
    if (el) {
      el.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(
        2,
        '0'
      )}:${String(s).padStart(2, '0')}`;
    }
  }
  setInterval(updateTimer, 1000);
  updateTimer();

  /* ===============================
     TIMELINE
  =============================== */
  (function () {
    const timeline = document.getElementById('timeline');
    const progress = document.getElementById('timelineProgress');
    const items = document.querySelectorAll('.timeline-item');
    if (!timeline || !progress || !items.length) return;

    const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

    function updateTimeline() {
      const timelineRect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      let progressPx = 0;

      items.forEach(item => {
        const icon = item.querySelector('.timeline-icon');
        if (!icon) return;

        const iconRect = icon.getBoundingClientRect();
        const iconCenter =
          iconRect.top + iconRect.height / 2 - timelineRect.top;

        if (iconRect.top < vh * 0.5) progressPx = iconCenter;
        icon.classList.toggle('is-passed', progressPx >= iconCenter);
      });

      const maxHeight = timeline.offsetHeight - 40;
      progress.style.height = `${
        clamp(progressPx / maxHeight, 0, 1) * 100
      }%`;
    }

    window.addEventListener('scroll', updateTimeline, { passive: true });
    window.addEventListener('resize', updateTimeline);
    updateTimeline();

    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(
          e => e.isIntersecting && e.target.classList.add('active')
        ),
      { threshold: 0.35 }
    );
    items.forEach(i => observer.observe(i));
  })();

  /* ===============================
     UPSELLS
  =============================== */
  const PRICES = { main: 27, videos: 47, planner: 27 };
  const totalPriceEl = document.getElementById('totalPrice');

  function formatBRL(v) {
    return `R$${v},00`;
  }

  function updateTotal() {
    let total = PRICES.main;
    document
      .querySelectorAll('input[data-upsell]:checked')
      .forEach(chk => {
        total += PRICES[chk.dataset.upsell] || 0;
      });
    if (totalPriceEl) totalPriceEl.textContent = formatBRL(total);
  }

  document.addEventListener('change', e => {
    if (e.target.matches('input[data-upsell]')) updateTotal();
  });
  updateTotal();

  /* ===============================
     FORM (DEMO)
  =============================== */
  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('Aqui você redireciona para Hotmart / Kiwify');
    });
  }

  /* ======================================================
       QUIZ — CONTROLE TOTAL (FIX DEFINITIVO)
  ====================================================== */

  const QUIZ_KEY = 'smart21_quiz_done_v1';
  const QUIZ_ANSWERS_KEY = 'smart21_quiz_answers_v1';

  const quizOverlay = document.getElementById('quizOverlay');
  const quizForm = document.getElementById('quizForm');
  const quizBar = document.getElementById('quizBar');
  const quizStepLabel = document.getElementById('quizStepLabel');
  const quizBack = document.getElementById('quizBack');
  const quizNext = document.getElementById('quizNext');
  const quizFinish = document.getElementById('quizFinish');
  const quizClose = document.getElementById('quizClose');
  const quizSkip = document.getElementById('quizSkip');

  let step = 1;
  const maxStep = 3;

  /* ===============================
     BASE
  =============================== */

  function showQuiz() {
    if (!quizOverlay) return;
    quizOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    step = 1;
    renderStep();
  }

  function hideQuiz(done = false) {
    if (!quizOverlay) return;
    quizOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    if (done) localStorage.setItem(QUIZ_KEY, '1');
  }

  function renderStep() {
    document.querySelectorAll('.quiz-step').forEach(el => {
      el.classList.toggle('hidden', Number(el.dataset.step) !== step);
    });

    if (quizBar) quizBar.style.width = `${(step / maxStep) * 100}%`;
    if (quizStepLabel) quizStepLabel.textContent = step;

    quizBack.classList.toggle('hidden', step === 1);
    quizNext.classList.toggle('hidden', step === maxStep);
    quizFinish.classList.toggle('hidden', step !== maxStep);
  }

  /* ===============================
     VALIDAÇÃO ROBUSTA (FIX)
  =============================== */

  function validateStep() {
    const current = document.querySelector(
      `.quiz-step[data-step="${step}"]`
    );
    if (!current) return true;

    const requiredRadios = current.querySelectorAll(
      'input[type="radio"][required]'
    );

    if (!requiredRadios.length) return true;

    const groups = [...new Set([...requiredRadios].map(r => r.name))];

    return groups.every(name =>
      current.querySelector(`input[name="${name}"]:checked`)
    );
  }

  /* ===============================
     NAVEGAÇÃO
  =============================== */

  quizNext.addEventListener('click', () => {
    if (!validateStep()) {
      alert('Escolha uma opção para continuar 😉');
      return;
    }
    step++;
    renderStep();
  });

  quizBack.addEventListener('click', () => {
    step--;
    renderStep();
  });

  quizClose.addEventListener('click', () => hideQuiz(false));
  quizSkip.addEventListener('click', () => hideQuiz(false));

  /* ===============================
     SUBMIT FINAL
  =============================== */

  quizForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep()) return;

    const data = Object.fromEntries(new FormData(quizForm).entries());
    localStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(data));

    hideQuiz(true);

    // 🔥 REDIRECIONA PARA O CHECKOUT
    setTimeout(() => {
      const checkout = document.querySelector('#checkout');
      if (checkout) {
        checkout.scrollIntoView({ behavior: 'smooth' });
      } else {
        location.hash = '#checkout';
      }
    }, 300);
  });
  /* ===============================
     OPEN MANUAL
  =============================== */

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-open-quiz]');
    if (!trigger) return;
    if (localStorage.getItem(QUIZ_KEY)) return;

    e.preventDefault();
    showQuiz();
  });

  /* ===============================
     ICONS
  =============================== */

  window.requestAnimationFrame(() => {
    if (window.lucide) lucide.createIcons();
  });
})();
