document.addEventListener('DOMContentLoaded', function() {
  const whatsappBtn = document.getElementById('whatsappBtn');
  const whatsappQr = document.getElementById('whatsappQr');
  if (whatsappBtn && whatsappQr) {
    whatsappBtn.addEventListener('mouseenter', function() {
      whatsappQr.style.display = 'flex';
    });
    whatsappBtn.addEventListener('mouseleave', function() {
      whatsappQr.style.display = 'none';
    });
  }
});
