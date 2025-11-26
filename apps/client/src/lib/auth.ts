// Matcha Mock Authentication System (localStorage-based)

const STORAGE_KEY = 'matcha_session';
const USERS_KEY = 'matcha_users';

export type UserPlan = 'gratuit' | 'pro';

export interface User {
  id: string;
  email: string;
  prenom: string;
  plan: UserPlan;
  createdAt: string;
  analysesThisMonth: number;
  lastAnalysisDate: string | null;
}

export interface Session {
  user: User;
  expiresAt: string;
}

interface StoredUser {
  id: string;
  email: string;
  password: string;
  prenom: string;
  plan: UserPlan;
  createdAt: string;
  analysesThisMonth: number;
  lastAnalysisDate: string | null;
}

// Generate a simple unique ID
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get all stored users
function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Save users to storage
function saveUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Create session from user
function createSession(user: StoredUser): Session {
  const { password: _password, ...userWithoutPassword } = user;
  void _password; // Intentionally unused
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  return {
    user: userWithoutPassword,
    expiresAt,
  };
}

// Save session to storage
function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

// Login
export async function login(email: string, password: string): Promise<User> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new Error('Aucun compte trouvé avec cet email');
  }

  if (user.password !== password) {
    throw new Error('Mot de passe incorrect');
  }

  const session = createSession(user);
  saveSession(session);

  return session.user;
}

// Signup
export async function signup(
  email: string,
  password: string,
  prenom: string
): Promise<User> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getStoredUsers();

  // Check if email already exists
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Un compte existe déjà avec cet email');
  }

  // Validate inputs
  if (!email.includes('@')) {
    throw new Error('Adresse email invalide');
  }

  if (password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (prenom.trim().length < 2) {
    throw new Error('Prénom trop court');
  }

  // Create new user
  const newUser: StoredUser = {
    id: generateId(),
    email: email.toLowerCase(),
    password,
    prenom: prenom.trim(),
    plan: 'gratuit',
    createdAt: new Date().toISOString(),
    analysesThisMonth: 0,
    lastAnalysisDate: null,
  };

  users.push(newUser);
  saveUsers(users);

  const session = createSession(newUser);
  saveSession(session);

  return session.user;
}

// Logout
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Get current session
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  const sessionStr = localStorage.getItem(STORAGE_KEY);
  if (!sessionStr) return null;

  const session: Session = JSON.parse(sessionStr);

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    logout();
    return null;
  }

  return session;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// Get current user
export function getCurrentUser(): User | null {
  const session = getSession();
  return session?.user ?? null;
}

// Update user plan (mock upgrade)
export async function upgradeToPro(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const session = getSession();
  if (!session) {
    throw new Error('Non connecté');
  }

  const users = getStoredUsers();
  const userIndex = users.findIndex((u) => u.id === session.user.id);

  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }

  users[userIndex].plan = 'pro';
  saveUsers(users);

  const updatedSession = createSession(users[userIndex]);
  saveSession(updatedSession);

  return updatedSession.user;
}

// Increment analysis count (for usage tracking)
export function incrementAnalysisCount(): boolean {
  const session = getSession();
  if (!session) return false;

  const users = getStoredUsers();
  const userIndex = users.findIndex((u) => u.id === session.user.id);

  if (userIndex === -1) return false;

  const user = users[userIndex];

  // Reset count if it's a new month
  const lastAnalysis = user.lastAnalysisDate
    ? new Date(user.lastAnalysisDate)
    : null;
  const now = new Date();

  if (
    !lastAnalysis ||
    lastAnalysis.getMonth() !== now.getMonth() ||
    lastAnalysis.getFullYear() !== now.getFullYear()
  ) {
    user.analysesThisMonth = 0;
  }

  // Check limits for free users
  if (user.plan === 'gratuit' && user.analysesThisMonth >= 3) {
    return false; // Limit reached
  }

  user.analysesThisMonth += 1;
  user.lastAnalysisDate = now.toISOString();

  saveUsers(users);

  const updatedSession = createSession(user);
  saveSession(updatedSession);

  return true;
}

// Get remaining analyses for free users
export function getRemainingAnalyses(): number {
  const session = getSession();
  if (!session) return 0;

  if (session.user.plan === 'pro') return Infinity;

  return Math.max(0, 3 - session.user.analysesThisMonth);
}
