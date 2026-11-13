document.documentElement.classList.add('js');
/**
 * PERSONALIZA LA CARTA AQUÍ.
 * Puedes cambiar los párrafos y la firma sin tocar el diseño.
 * No hace falta instalar herramientas ni servidores para usar esta página.
 */
const CARTA = {
  saludo: 'Jhelen,',
  parrafos: [
    'Quería encontrar las palabras correctas para hablarte, pero me di cuenta de que lo más importante no es que suenen bonitas, sino que sean sinceras. Por eso, antes que nada, quiero decirte algo que nace de lo más profundo de mí: perdóname.',
    'Perdón por haberte hecho sentir mal. Por esas palabras o actitudes con las que no cuidé tus sentimientos como merecías. Sé que lo que pasó no desaparece por escribir una carta, y tampoco quiero hacer como si no hubiera dolido.',
    'Me importas muchísimo, Jhelen. Y precisamente por eso quiero reconocer mis errores sin excusas. He pensado en muchas cosas que pude haber hecho de otra manera, en lo importante que era escucharte mejor y en lo mucho que necesito aprender de todo esto.',
    'No quiero quedarme en decir que voy a cambiar. Quiero trabajar en mí, ser más consciente de lo que digo y hago, y aprender a cuidar mejor a una persona tan importante para mí. Las palabras pueden ser el comienzo, pero lo que de verdad cuenta son los hechos.',
    'Si hay algo que quiero que permanezca después de leer esto, es que lo siento de corazón. No por costumbre, no porque resulte fácil decirlo, sino porque de verdad me duele haberte lastimado.',
    'Gracias por cada momento bonito que hemos compartido y por todo lo que me has hecho sentir. Te escribí esta página con mucho cariño, pensando en ti y en todo lo que me habría gustado hacer mejor.',
    'Perdóname, Jhelen. Ojalá estas palabras puedan hacerte sentir, aunque sea por un instante, el cariño y la sinceridad con que las escribí.'
  ],
  firma: 'Con todo mi corazón ♡'
};

const dialog = document.querySelector('#letter-dialog');
const envelope = document.querySelector('.envelope-button');
const body = document.querySelector('#letter-body');
const greeting = document.querySelector('#letter-greeting');
const signature = document.querySelector('#letter-signature');
const closeButton = document.querySelector('#close-letter');
const toast = document.querySelector('#toast');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Insertar el texto con textContent impide inyectar HTML accidentalmente.
greeting.textContent = CARTA.saludo;
signature.textContent = CARTA.firma;
CARTA.parrafos.forEach(text => {
  const p = document.createElement('p');
  p.textContent = text;
  body.append(p);
});

let openTimeout = null;
let previousFocus = null;
function showLetter() {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.scrollTop = 0;
  closeButton.focus();
}
function openLetter(event) {
  if (openTimeout) return;
  if (event.currentTarget === envelope && !reduceMotion.matches) {
    envelope.classList.add('is-opening');
    openTimeout = window.setTimeout(() => {
      openTimeout = null;
      showLetter();
      envelope.classList.remove('is-opening');
    }, 760);
  } else {
    showLetter();
  }
}

document.querySelectorAll('.open-letter').forEach(button => button.addEventListener('click', openLetter));
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
});

// Animaciones progresivas con alternativa sin JavaScript o movimiento reducido.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.08, rootMargin:'0px 0px -30px 0px'});
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

let scrollScheduled = false;
function updateProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const progress = available > 0 ? Math.max(0, Math.min(100, window.scrollY / available * 100)) : 0;
  document.querySelector('#reading-progress').style.width = `${progress}%`;
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(updateProgress);
  }
}, {passive:true});
updateProgress();

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
document.querySelector('#share-button').addEventListener('click', async () => {
  if (location.protocol === 'file:') {
    showToast('Cuando publiques esta página, podrás compartir su enlace ♡');
    return;
  }
  const info = {title: 'Para Jhelen ♡', text: 'Escribí unas palabras para ti.', url: location.href};
  if (navigator.share) {
    try { await navigator.share(info); return; }
    catch (error) { if (error?.name === 'AbortError') return; }
  }
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(location.href);
      showToast('Enlace copiado. Ya puedes compartirlo ♡');
      return;
    } catch (_) { /* Mostrar alternativa a continuación. */ }
  }
  showToast('Copia el enlace desde la barra de direcciones para compartirlo.');
});
