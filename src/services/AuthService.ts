export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: number;
}

const USERS_KEY = 'flippy_users';
const SESSION_KEY = 'flippy_session';

export class AuthService {
  static getUsers(): any[] {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static saveUsers(users: any[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static getSession(): User | null {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  static createSession(user: any): User {
    const session: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  static clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  static signUp({ name, email, password }: any): { success: boolean; field?: string; msg?: string; user?: User } {
    const users = this.getUsers();

    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, field: 'email', msg: 'An account with this email already exists.' };
    }

    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: btoa(password),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: Date.now(),
    };

    users.push(user);
    this.saveUsers(users);
    const session = this.createSession(user);

    return { success: true, user: session };
  }

  static signIn({ email, password }: any): { success: boolean; field?: string; msg?: string; user?: User } {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return { success: false, field: 'email', msg: 'No account found with this email address.' };
    }

    if (user.password !== btoa(password)) {
      return { success: false, field: 'password', msg: 'Incorrect password. Please try again.' };
    }

    const session = this.createSession(user);
    return { success: true, user: session };
  }

  static logout() {
    this.clearSession();
  }
}
