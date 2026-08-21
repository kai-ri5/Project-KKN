const donateButtons = document.querySelectorAll('.js-donate');
const toast = document.querySelector('.toast');
const toastTitle = toast?.querySelector('.toast-title');
const toastMessage = toast?.querySelector('.toast-message');
const qrisCard = document.querySelector('.qris-card');

let toastTimer;

function showToast(type) {
  if (!toast || !toastTitle || !toastMessage) return;

  toastTitle.textContent = `${type} Masjid Noor Islam`;
  toastMessage.textContent =
    'Silakan scan QRIS di bagian atas untuk melanjutkan donasi.';

  toast.setAttribute('aria-hidden', 'false');
  toast.classList.add('is-visible');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
  }, 3200);
}

donateButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.type || 'Donasi';

    showToast(type);

    qrisCard?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  });
});