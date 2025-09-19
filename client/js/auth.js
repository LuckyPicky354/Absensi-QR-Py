// Auth & RBAC sederhana (client-side only)
// Penyimpanan sesi di localStorage: key 'authUser' => { username, role }

window.Auth = (function() {
  const STORAGE_KEY = 'authUser';

  function getUsers() {
    return Array.isArray(window.AUTH_USERS) ? window.AUTH_USERS : [];
  }

  function getRoleHome(role) {
    const map = window.ROLE_HOME || {};
    return map[role] || 'index.html';
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  function login(username, password) {
    const found = getUsers().find(u => u.username === username && u.password === password);
    if (!found) return { ok: false, message: 'Username atau password salah' };
    const session = { username: found.username, role: found.role, loginAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { ok: true, role: found.role, redirect: getRoleHome(found.role) };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function requireAuth(allowedRoles) {
    const user = getCurrentUser();
    if (!user) {
      window.location.replace('index.html');
      return false;
    }
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Jika tidak berhak, arahkan ke halaman sesuai role
        window.location.replace(getRoleHome(user.role));
        return false;
      }
    }
    return true;
  }

  function renderAuthBar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const user = getCurrentUser();
    if (!user) {
      container.innerHTML = '<a href="index.html">Login</a>';
      return;
    }
    const username = user.username;
    const role = user.role;
    container.innerHTML = `
      <div style="display:flex; gap:12px; align-items:center; justify-content:center; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:10px; background:#f7f8fa; border:1px solid #e3e8ef; padding:6px 12px; border-radius:999px;">
          <span style="font-weight:600;color:#1f2937;">${username}</span>
          <span style="font-size:12px; padding:2px 8px; border-radius:999px; background:#eef2ff; color:#3730a3; border:1px solid #c7d2fe; text-transform:uppercase;">${role}</span>
        </div>
        <button id="btn-logout" title="Logout" style="display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border:none; border-radius:8px; background:#e53935; color:#fff; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,0.06);">
          <img src="icon/log-out.svg" alt="Logout" style="width:16px;height:16px; filter: invert(1);">
          <span style="font-weight:600;">Logout</span>
        </button>
      </div>
    `;
    const btn = document.getElementById('btn-logout');
    if (btn) {
      btn.addEventListener('click', function() {
        logout();
        window.location.replace('index.html');
      });
    }
  }

  return { login, logout, isLoggedIn, getCurrentUser, requireAuth, renderAuthBar };
})();


