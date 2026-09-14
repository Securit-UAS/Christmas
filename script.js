const modal = document.getElementById('placeholderModal');
const modalClose = document.getElementById('modalClose');
const modalOk = document.getElementById('modalOk');

document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.placeholder-action').forEach(btn => {
  btn.addEventListener('click', () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  });
});

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}
modalClose.addEventListener('click', closeModal);
modalOk.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

const soundBtn = document.getElementById('soundBtn');
let nonsense = false;
soundBtn.addEventListener('click', () => {
  nonsense = !nonsense;
  soundBtn.innerHTML = nonsense ? '<span>♫</span>' : '<span>♪</span>';
  soundBtn.title = nonsense
    ? 'Festive nonsense armed. No audio file is actually connected.'
    : 'Festive nonsense disarmed.';
});
