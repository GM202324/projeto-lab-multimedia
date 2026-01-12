// --- FUNÇÕES DE UTILIDADE (MODAIS E ALERTAS) ---
const alertOverlay = document.getElementById('custom-alert-overlay');
const alertTitle = document.getElementById('alert-title');
const alertMsg = document.getElementById('alert-message');
const alertClose = document.getElementById('alert-close-btn');

function showAlert(title, message) {
    if(alertTitle) alertTitle.textContent = title;
    if(alertMsg) alertMsg.textContent = message;
    if(alertOverlay) alertOverlay.classList.add('active');
}
if(alertClose) alertClose.addEventListener('click', () => alertOverlay.classList.remove('active'));

// --- SISTEMA DE LOGIN / REGISTO ---
const navLoginBtn = document.getElementById('nav-login-btn');
const authModal = document.getElementById('auth-modal-overlay');
const authCloseX = document.getElementById('auth-close-x');
const authForm = document.getElementById('auth-form');
const authNameInput = document.getElementById('auth-name');
const authSwitchText = document.getElementById('auth-switch-text');
const authTitle = document.getElementById('auth-title');

let isLoginMode = true;
let currentUser = null;

if(navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
        if (currentUser) {
            currentUser = null;
            navLoginBtn.textContent = "Login";
            showAlert("Logout", "Sessão terminada com sucesso.");
            // Limpa campos se existirem
            const contactName = document.getElementById('contact-name');
            const contactEmail = document.getElementById('contact-email');
            if(contactName) contactName.value = '';
            if(contactEmail) contactEmail.value = '';
        } else {
            authModal.classList.add('active');
        }
    });
}

if(authCloseX) authCloseX.addEventListener('click', () => authModal.classList.remove('active'));

if(authSwitchText) {
    authSwitchText.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = "Login";
            authNameInput.style.display = "none";
            authNameInput.required = false;
            authForm.querySelector('button').textContent = "Entrar";
            authSwitchText.textContent = "Não tem conta? Registar";
        } else {
            authTitle.textContent = "Registar";
            authNameInput.style.display = "block";
            authNameInput.required = true;
            authForm.querySelector('button').textContent = "Criar Conta";
            authSwitchText.textContent = "Já tem conta? Entrar";
        }
    });
}

if(authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const name = authNameInput.value;

        const endpoint = isLoginMode ? '/api/login' : '/api/register';
        const body = isLoginMode ? { email, password } : { name, email, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await response.json();

            if (result.success) {
                showAlert("Sucesso", result.message);
                authModal.classList.remove('active');
                if (isLoginMode) {
                    currentUser = result.user;
                    navLoginBtn.textContent = `Olá, ${currentUser.name.split(' ')[0]}`;
                    
                    // Auto-preencher formulário de contacto se existir nesta página
                    const contactName = document.getElementById('contact-name');
                    const contactEmail = document.getElementById('contact-email');
                    if(contactName) contactName.value = currentUser.name;
                    if(contactEmail) contactEmail.value = currentUser.email;

                } else {
                    // Se foi registo, muda para login para a pessoa entrar
                    authSwitchText.click();
                }
            } else {
                showAlert("Erro", result.message);
            }
        } catch (err) {
            console.error(err);
            showAlert("Erro", "Falha na comunicação com o servidor.");
        }
    });
}

// --- FORMULÁRIO DE CONTACTO (NOVO) ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            subject: document.getElementById('contact-subject').value,
            message: document.getElementById('contact-message').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (result.success) {
                showAlert("Enviado", result.message);
                contactForm.reset();
                if(currentUser) {
                    document.getElementById('contact-name').value = currentUser.name;
                    document.getElementById('contact-email').value = currentUser.email;
                }
            }
        } catch(err) {
            showAlert("Erro", "Não foi possível enviar a mensagem.");
        }
    });
}

// --- SUBSCRIÇÃO ---
const subForm = document.getElementById('sub-form');
if(subForm) {
    subForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = subForm.querySelector('.subscribe-input').value;
        try {
            await fetch('/api/subscribe', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            showAlert("Subscrição", "Obrigado! Email guardado com sucesso.");
            subForm.reset();
        } catch (err) { showAlert("Erro", "Não foi possível subscrever."); }
    });
}

// --- TRACKING DE CLIQUES ---
document.querySelectorAll('.track-click').forEach(btn => {
    btn.addEventListener('click', () => {
        const productName = btn.getAttribute('href').split('produto=')[1]?.split('&')[0] || 'Item';
        fetch('/api/track', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'Clique Compra', details: decodeURIComponent(productName) })
        });
    });
});

// --- HELPER: FORMATAR TEMPO ---
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// --- SLIDESHOW (HERO) ---
const container = document.getElementById('slideshow-box');
if(container) {
    for (let i = 1; i <= 30; i++) {
        const img = document.createElement('img');
        img.src = `imagens/${i}.jpg`;
        img.className = 'slide';
        if (i === 1) img.classList.add('active');
        container.appendChild(img);
    }
    let slideIndex = 0;
    function showSlides() {
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => slide.classList.remove('active'));
        slideIndex++;
        if (slideIndex > slides.length) slideIndex = 1;
        slides[slideIndex - 1].classList.add('active');
        setTimeout(showSlides, 4000); 
    }
    showSlides();
}

// --- NAVEGAÇÃO SUAVE ---
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href').startsWith("#")) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if(section) section.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- PLAYERS DE ÁUDIO E VÍDEO (COM CORREÇÃO DE DURAÇÃO) ---
function setupPlayer(mediaId, playBtnId, playIconId, pauseIconId, progressId, barId, timeId, durId) {
    const media = document.getElementById(mediaId);
    const playBtn = document.getElementById(playBtnId);
    const playIcon = document.getElementById(playIconId);
    const pauseIcon = document.getElementById(pauseIconId);
    const progress = document.getElementById(progressId);
    const bar = document.getElementById(barId);
    const timeEl = document.getElementById(timeId);
    const durEl = document.getElementById(durId);

    if(!media) return;

    // Função robusta para atualizar a duração
    const updateDuration = () => {
        if(media.duration && !isNaN(media.duration) && media.duration !== Infinity) {
            durEl.textContent = formatTime(media.duration);
        }
    };

    playBtn.addEventListener('click', () => {
        if (media.paused) { 
            media.play(); 
            playIcon.classList.add('hidden'); 
            pauseIcon.classList.remove('hidden'); 
        } else { 
            media.pause(); 
            playIcon.classList.remove('hidden'); 
            pauseIcon.classList.add('hidden'); 
        }
    });

    media.addEventListener('timeupdate', () => {
        if(media.duration) {
            bar.style.width = `${(media.currentTime / media.duration) * 100}%`;
            timeEl.textContent = formatTime(media.currentTime);
        }
    });
    
    // Tenta atualizar a duração em vários momentos para garantir que não falha
    media.addEventListener('loadedmetadata', updateDuration);
    media.addEventListener('durationchange', updateDuration);
    media.addEventListener('canplay', updateDuration);

    // Se o ficheiro já estiver carregado quando o JS corre (cache), força a atualização
    if (media.readyState >= 1) {
        updateDuration();
    }
    
    progress.addEventListener('click', (e) => {
        if(media.duration) {
            media.currentTime = (e.offsetX / progress.clientWidth) * media.duration;
        }
    });

    media.addEventListener('ended', () => {
        playIcon.classList.remove('hidden'); 
        pauseIcon.classList.add('hidden'); 
        bar.style.width = '0%';
    });
}

// Inicializar Players
setupPlayer('main-audio', 'play-pause-btn', 'play-icon', 'pause-icon', 'progress-container', 'progress-bar', 'current-time', 'duration');
setupPlayer('main-video', 'video-play-btn', 'video-play-icon', 'video-pause-icon', 'video-progress-container', 'video-progress-bar', 'video-current-time', 'video-duration');

// --- CARROSSEL DA LOJA ---
const storeTrack = document.getElementById('store-track');
const storeNext = document.getElementById('store-next');
const storePrev = document.getElementById('store-prev');

if(storeTrack) {
    const originalProducts = document.querySelectorAll('.product');
    const originalCount = originalProducts.length; 
    const cloneCount = 3; 

    // Clones para efeito infinito
    for (let i = 0; i < cloneCount; i++) storeTrack.appendChild(originalProducts[i].cloneNode(true));
    for (let i = originalCount - 1; i >= originalCount - cloneCount; i--) storeTrack.insertBefore(originalProducts[i].cloneNode(true), storeTrack.firstChild);

    let currentIndex = cloneCount; 
    function getStep() { return window.innerWidth <= 768 ? 100 : (100 / 3); }
    function setInitialPosition() { storeTrack.style.transition = 'none'; storeTrack.style.transform = `translateX(-${currentIndex * getStep()}%)`; }
    setInitialPosition();

    function slideStore() { storeTrack.style.transition = 'transform 0.5s ease-in-out'; storeTrack.style.transform = `translateX(-${currentIndex * getStep()}%)`; }

    storeTrack.addEventListener('transitionend', () => {
        if (currentIndex >= originalCount + cloneCount) { storeTrack.style.transition = 'none'; currentIndex = cloneCount; storeTrack.style.transform = `translateX(-${currentIndex * getStep()}%)`; }
        if (currentIndex <= 0) { storeTrack.style.transition = 'none'; currentIndex = originalCount + cloneCount - cloneCount; storeTrack.style.transform = `translateX(-${currentIndex * getStep()}%)`; }
    });

    storeNext.addEventListener('click', () => { currentIndex++; slideStore(); });
    storePrev.addEventListener('click', () => { currentIndex--; slideStore(); });
    window.addEventListener('resize', () => { storeTrack.style.transition = 'none'; storeTrack.style.transform = `translateX(-${currentIndex * getStep()}%)`; });
}
