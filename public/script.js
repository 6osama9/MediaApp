// Haupt-JS für Musicplayer WebApp
// Auth, API-Calls, Player-Logik, UI-Handling

document.addEventListener('DOMContentLoaded', () => {
  // UI-Elemente
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const navLogout = document.getElementById('nav-logout');
  const userInfo = document.getElementById('user-info');

  // Token-Handling
  function setToken(token) {
    localStorage.setItem('token', token);
  }
  function getToken() {
    return localStorage.getItem('token');
  }
  function clearToken() {
    localStorage.removeItem('token');
  }

  // UI-Handling
  function showLoginModal() {
    loginModal.style.display = 'flex';
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    loginError.textContent = '';
    registerError.textContent = '';
  }
  function showRegisterModal() {
    loginModal.style.display = 'flex';
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    loginError.textContent = '';
    registerError.textContent = '';
  }
  function hideLoginModal() {
    loginModal.style.display = 'none';
  }
  function updateUIOnLogin(username) {
    userInfo.textContent = `Eingeloggt als ${username}`;
    navLogout.style.display = '';
  }
  function updateUIOnLogout() {
    userInfo.textContent = '';
    navLogout.style.display = 'none';
  }

  // Login-Formular
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    loginError.textContent = '';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        loginError.textContent = data.error || 'Fehler beim Login.';
        return;
      }
      setToken(data.token);
      hideLoginModal();
      updateUIOnLogin(data.user.username);
    } catch (err) {
      loginError.textContent = 'Serverfehler.';
    }
  });

  // Registrierung-Formular
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    registerError.textContent = '';
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        registerError.textContent = data.error || 'Fehler bei der Registrierung.';
        return;
      }
      // Nach erfolgreicher Registrierung direkt einloggen
      loginForm.loginUsername.value = username;
      loginForm.loginPassword.value = password;
      showLoginModal();
    } catch (err) {
      registerError.textContent = 'Serverfehler.';
    }
  });

  // Umschalten zwischen Login/Registrierung
  showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterModal();
  });
  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginModal();
  });

  // Logout
  navLogout.addEventListener('click', (e) => {
    e.preventDefault();
    clearToken();
    updateUIOnLogout();
    showLoginModal();
  });

  // Beim Laden prüfen, ob Token vorhanden ist
  function checkLogin() {
    const token = getToken();
    if (token) {
      // Token dekodieren (optional) oder Username aus localStorage holen
      // Für Demo: Username im Token speichern (unsicher, aber praktikabel für lokal)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        updateUIOnLogin(payload.username);
        hideLoginModal();
      } catch {
        updateUIOnLogout();
        showLoginModal();
      }
    } else {
      updateUIOnLogout();
      showLoginModal();
    }
  }

  checkLogin();

  // --- Medienverwaltung & Player ---
  const mediaList = document.getElementById('media-list');
  const audioPlayer = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const progress = document.getElementById('progress');
  const currentTime = document.getElementById('current-time');
  const duration = document.getElementById('duration');
  const volume = document.getElementById('volume');

  let mediaFiles = [];
  let currentMedia = null;

  async function loadMediaList() {
    try {
      const res = await fetch('/api/media');
      mediaFiles = await res.json();
      renderMediaList();
    } catch (err) {
      mediaList.innerHTML = '<p style="color:red">Fehler beim Laden der Medien.</p>';
    }
  }

  function renderMediaList() {
    if (!mediaFiles.length) {
      mediaList.innerHTML = '<p>Keine Mediendateien gefunden. Lege Musik in den media/-Ordner!</p>';
      return;
    }
    mediaList.innerHTML = mediaFiles.map((m, i) => `
      <div class="media-item" data-index="${i}">
        <div class="title">${m.title}</div>
        <button class="play-media">▶️ Abspielen</button>
      </div>
    `).join('');
    // Event-Listener für Play-Buttons
    document.querySelectorAll('.play-media').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = btn.closest('.media-item').dataset.index;
        playMedia(idx);
      });
    });
  }

  function playMedia(idx) {
    const m = mediaFiles[idx];
    if (!m) return;
    currentMedia = m;
    audioPlayer.src = m.url;
    audioPlayer.play();
    playBtn.style.display = 'none';
    pauseBtn.style.display = '';
  }

  // Player Controls
  playBtn.addEventListener('click', () => {
    if (audioPlayer.src) audioPlayer.play();
    playBtn.style.display = 'none';
    pauseBtn.style.display = '';
  });
  pauseBtn.addEventListener('click', () => {
    audioPlayer.pause();
    playBtn.style.display = '';
    pauseBtn.style.display = 'none';
  });
  audioPlayer.addEventListener('play', () => {
    playBtn.style.display = 'none';
    pauseBtn.style.display = '';
  });
  audioPlayer.addEventListener('pause', () => {
    playBtn.style.display = '';
    pauseBtn.style.display = 'none';
  });
  audioPlayer.addEventListener('timeupdate', () => {
    progress.value = audioPlayer.currentTime / audioPlayer.duration * 100 || 0;
    currentTime.textContent = formatTime(audioPlayer.currentTime);
    duration.textContent = formatTime(audioPlayer.duration);
  });
  progress.addEventListener('input', () => {
    if (audioPlayer.duration) {
      audioPlayer.currentTime = progress.value / 100 * audioPlayer.duration;
    }
  });
  volume.addEventListener('input', () => {
    audioPlayer.volume = volume.value;
  });
  function formatTime(sec) {
    if (!isFinite(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Initialisieren
  loadMediaList();
}); 