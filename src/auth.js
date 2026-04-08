/**
 * Flippy Auth — Logic Module
 * localStorage tabanlı mock authentication ile tam validations
 */

// ── Kullanıcı Deposu (localStorage) ─────────────────────────────────────────
const USERS_KEY = 'flippy_users';
const SESSION_KEY = 'flippy_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function createSession(user) {
  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Redirect Logic ────────────────────────────────────────────────────────────
export function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = '/login.html';
    return null;
  }
  return session;
}

export function requireNoAuth() {
  const session = getSession();
  if (session) {
    window.location.href = '/launcher.html';
  }
}

export function logout() {
  clearSession();
  window.location.href = '/login.html';
}

// ── Validation Helpers ────────────────────────────────────────────────────────
export const Validators = {
  name: {
    validate(val) {
      if (!val || val.trim().length === 0)
        return { ok: false, msg: 'Name is required.' };
      if (val.trim().length < 2)
        return { ok: false, msg: 'Name must be at least 2 characters.' };
      if (val.trim().length > 50)
        return { ok: false, msg: 'Name is too long.' };
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(val.trim()))
        return { ok: false, msg: 'Name can only contain letters and spaces.' };
      return { ok: true, msg: '✓ Looks good!' };
    }
  },

  email: {
    validate(val) {
      if (!val || val.trim().length === 0)
        return { ok: false, msg: 'Email address is required.' };
      const emailRe = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
      if (!emailRe.test(val.trim()))
        return { ok: false, msg: 'Please enter a valid email address.' };
      return { ok: true, msg: '✓ Valid email address.' };
    }
  },

  password: {
    validate(val, mode = 'signin') {
      if (!val || val.length === 0)
        return { ok: false, msg: 'Password is required.', strength: 0 };
      if (mode === 'signin') {
        if (val.length < 1)
          return { ok: false, msg: 'Password is required.', strength: 0 };
        return { ok: true, msg: '', strength: this.calcStrength(val) };
      }
      // Signup strict mode
      if (val.length < 8)
        return { ok: false, msg: 'Password must be at least 8 characters.', strength: this.calcStrength(val) };
      if (val.length < 6)
        return { ok: false, msg: 'Password is too short.', strength: 1 };
      const strength = this.calcStrength(val);
      if (strength < 2)
        return { ok: false, msg: 'Password is too weak. Add numbers or symbols.', strength };
      return { ok: true, msg: '✓ Strong password!', strength };
    },

    calcStrength(val) {
      let score = 0;
      if (val.length >= 8) score++;
      if (val.length >= 12) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^a-zA-Z0-9]/.test(val)) score++;
      return Math.min(4, score);
    }
  },

  confirmPassword: {
    validate(val, original) {
      if (!val || val.length === 0)
        return { ok: false, msg: 'Please confirm your password.' };
      if (val !== original)
        return { ok: false, msg: 'Passwords do not match.' };
      return { ok: true, msg: '✓ Passwords match!' };
    }
  }
};

// ── Auth Actions ──────────────────────────────────────────────────────────────
export function signUp({ name, email, password }) {
  const users = getUsers();

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, field: 'email', msg: 'An account with this email already exists.' };
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: btoa(password), // base64 (demo purposes only)
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    createdAt: Date.now()
  };

  users.push(user);
  saveUsers(users);
  createSession(user);

  return { success: true, user };
}

export function signIn({ email, password }) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return { success: false, field: 'email', msg: 'No account found with this email address.' };
  }

  if (user.password !== btoa(password)) {
    return { success: false, field: 'password', msg: 'Incorrect password. Please try again.' };
  }

  createSession(user);
  return { success: true, user };
}

export function devLogin() {
  // Ensure dev account exists
  const users = getUsers();
  let devUser = users.find(u => u.email === 'dev@flippy.studio');
  if (!devUser) {
    devUser = {
      id: 'dev-user-001',
      name: 'Developer',
      email: 'dev@flippy.studio',
      password: btoa('dev1234'),
      avatar: null,
      createdAt: Date.now()
    };
    users.push(devUser);
    saveUsers(users);
  }
  createSession(devUser);
  return devUser;
}
