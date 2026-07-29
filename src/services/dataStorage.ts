import { CareerPageSettings, JobApplication, JobRole, ProductCategory, StoreCategory, StoreItem, TurnkeyProduct } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { INITIAL_TURNKEY_PRODUCTS } from '../data/turnkeyProducts';
import { INITIAL_JOB_ROLES } from '../data/careersData';
import { 
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword 
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';

const STORAGE_KEYS = {
  TURNKEY_PRODUCTS: 'ohmveda_admin_products_v1',
  STORE_ITEMS: 'ohmveda_admin_store_v1',
  PRODUCT_CATEGORIES: 'ohmveda_admin_prod_categories_v1',
  STORE_CATEGORIES: 'ohmveda_admin_store_categories_v1',
  AUTHORIZED_ADMIN_EMAILS: 'ohmveda_authorized_admin_emails_v1',
  REGISTERED_USERS: 'ohmveda_registered_users_v1',
  ADMIN_LOGS: 'ohmveda_admin_logs_v1',
  JOB_ROLES: 'ohmveda_job_roles_v1',
  JOB_APPLICATIONS: 'ohmveda_job_applications_v1',
  CUSTOM_LOGO: 'ohmveda_custom_logo_v1',
};

export const DEFAULT_AUTHORIZED_ADMIN_EMAILS: string[] = [
  'ohmvedatechnologies@gmail.com',
  'admin@ohmveda.com',
];

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [];

export const DEFAULT_STORE_CATEGORIES: StoreCategory[] = [];

// Helper to remove undefined properties before sending to Firestore
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  });
  return clean;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  action: 'ADD' | 'UPDATE' | 'DELETE' | 'RESET';
  target: 'PRODUCT' | 'STORE' | 'CATEGORY' | 'BRANDING' | 'ACCESS' | 'CAREERS';
  title: string;
  details: string;
}

// Delete helper for Firestore
export async function deleteFirestoreDoc(collectionName: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (err) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, err);
  }
}

// Helper to get product categories
export function getStoredProductCategories(): ProductCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCT_CATEGORIES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading product categories:', err);
  }
  return [];
}

export function saveStoredProductCategories(categories: ProductCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories));
    categories.forEach((cat) => {
      setDoc(doc(db, 'product_categories', cat.id), sanitizeForFirestore(cat), { merge: true }).catch((err) =>
        console.error('Firestore save product category error:', err)
      );
    });
  } catch (err) {
    console.error('Error saving product categories:', err);
  }
}

// Helper to get store categories
export function getStoredStoreCategories(): StoreCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_CATEGORIES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading store categories:', err);
  }
  return [];
}

export function saveStoredStoreCategories(categories: StoreCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STORE_CATEGORIES, JSON.stringify(categories));
    categories.forEach((cat) => {
      setDoc(doc(db, 'store_categories', cat.id), sanitizeForFirestore(cat), { merge: true }).catch((err) =>
        console.error('Firestore save store category error:', err)
      );
    });
  } catch (err) {
    console.error('Error saving store categories:', err);
  }
}

// Custom Logo Helper Functions
export function getStoredCustomLogo(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_LOGO);
  } catch (err) {
    console.error('Error reading custom logo:', err);
    return null;
  }
}

export function saveStoredCustomLogo(logoUrl: string | null): void {
  try {
    if (logoUrl) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, logoUrl);
      setDoc(doc(db, 'app_settings', 'branding'), { customLogo: logoUrl }, { merge: true }).catch((err) =>
        console.error('Firestore save custom logo error:', err)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_LOGO);
      setDoc(doc(db, 'app_settings', 'branding'), { customLogo: null }, { merge: true }).catch((err) =>
        console.error('Firestore clear custom logo error:', err)
      );
    }
    window.dispatchEvent(new Event('ohmveda_logo_updated'));
  } catch (err) {
    console.error('Error saving custom logo:', err);
  }
}

// Helper to get initial products from localStorage or default
export function getStoredTurnkeyProducts(): TurnkeyProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TURNKEY_PRODUCTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading stored products:', err);
  }
  return [];
}

// Helper to save turnkey products
export function saveStoredTurnkeyProducts(products: TurnkeyProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TURNKEY_PRODUCTS, JSON.stringify(products));
    products.forEach((p) => {
      setDoc(doc(db, 'turnkey_products', p.id), sanitizeForFirestore(p), { merge: true }).catch((err) =>
        console.error('Firestore save turnkey product error:', err)
      );
    });
  } catch (err) {
    console.error('Error saving turnkey products:', err);
  }
}

// Helper to get store items
export function getStoredStoreItems(): StoreItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_ITEMS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading store items:', err);
  }
  return [];
}

// Helper to save store items
export function saveStoredStoreItems(items: StoreItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify(items));
    items.forEach((item) => {
      setDoc(doc(db, 'store_items', item.id), sanitizeForFirestore(item), { merge: true }).catch((err) =>
        console.error('Firestore save store item error:', err)
      );
    });
  } catch (err) {
    console.error('Error saving store items:', err);
  }
}

// Admin Audit Logs
export function getAdminLogs(): AdminLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading admin logs:', err);
  }
  return [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleString(),
      action: 'RESET',
      target: 'PRODUCT',
      title: 'System Initialized',
      details: 'Admin inventory & telemetry portal ready with cloud synchronization.'
    }
  ];
}

export function addAdminLog(log: Omit<AdminLog, 'id' | 'timestamp'>): void {
  const current = getAdminLogs();
  const newLog: AdminLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
  };
  const updated = [newLog, ...current].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(updated));
    setDoc(doc(db, 'admin_logs', newLog.id), newLog, { merge: true }).catch((err) =>
      console.error('Firestore save log error:', err)
    );
  } catch (err) {
    console.error('Error saving log:', err);
  }
}

// Helper to get authorized admin emails
export function getStoredAuthorizedAdminEmails(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTHORIZED_ADMIN_EMAILS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((e: string) => e.trim().toLowerCase());
      }
    }
  } catch (err) {
    console.error('Error reading authorized admin emails:', err);
  }
  return DEFAULT_AUTHORIZED_ADMIN_EMAILS.map((e) => e.trim().toLowerCase());
}

export function saveStoredAuthorizedAdminEmails(emails: string[]): void {
  try {
    const clean = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ADMIN_EMAILS, JSON.stringify(clean));
    clean.forEach((email) => {
      const id = email.replace(/[^a-zA-Z0-9]/g, '_');
      setDoc(doc(db, 'authorized_admin_emails', id), { email }, { merge: true }).catch((err) =>
        console.error('Firestore save admin email error:', err)
      );
    });
  } catch (err) {
    console.error('Error saving authorized admin emails:', err);
  }
}

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const authorized = getStoredAuthorizedAdminEmails();
  return authorized.includes(email.trim().toLowerCase());
}

// User Accounts Storage & Authentication
export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  createdAt: string;
}

export function getRegisteredAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading registered users:', err);
  }
  return [];
}

export function saveRegisteredAccounts(accounts: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving registered users:', err);
  }
}

export function registerUser(accountData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
}): { success: boolean; message?: string; account?: StoredUserAccount } {
  const cleanEmail = accountData.email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    return {
      success: false,
      message: 'An account with this email address already exists. Please switch to Login.',
    };
  }

  const newAccount: StoredUserAccount = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: accountData.name.trim(),
    email: cleanEmail,
    password: accountData.password,
    phone: accountData.phone?.trim() || '',
    company: accountData.company?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveRegisteredAccounts(accounts);

  // Async save to Firestore & Auth
  const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
  setDoc(doc(db, 'users', docId), newAccount, { merge: true }).catch((err) =>
    console.error('Firestore save user error:', err)
  );
  createUserWithEmailAndPassword(auth, cleanEmail, accountData.password).catch((err) =>
    console.warn('Firebase Auth user creation notice:', err)
  );

  return { success: true, account: newAccount };
}

export async function registerUserAsync(accountData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
}): Promise<{ success: boolean; message?: string; account?: StoredUserAccount }> {
  const cleanEmail = accountData.email.trim().toLowerCase();
  const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

  try {
    // Check Firestore doc first
    const userSnap = await getDoc(doc(db, 'users', docId));
    if (userSnap.exists()) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please switch to Login.',
      };
    }

    const newAccount: StoredUserAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: accountData.name.trim(),
      email: cleanEmail,
      password: accountData.password,
      phone: accountData.phone?.trim() || '',
      company: accountData.company?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, accountData.password);
    } catch (authErr) {
      console.warn('Firebase Auth creation notice:', authErr);
    }

    await setDoc(doc(db, 'users', docId), newAccount, { merge: true });

    const accounts = getRegisteredAccounts();
    const updated = [...accounts.filter((a) => a.email.toLowerCase() !== cleanEmail), newAccount];
    saveRegisteredAccounts(updated);

    return { success: true, account: newAccount };
  } catch (err) {
    console.error('Firestore registerUserAsync error:', err);
    return registerUser(accountData);
  }
}

export function authenticateUser(
  email: string,
  passwordInput: string
): { success: boolean; message?: string; account?: StoredUserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!account) {
    return {
      success: false,
      message: 'No registered account found with this email address. Please sign up first.',
    };
  }

  if (account.password !== passwordInput) {
    return {
      success: false,
      message: 'Incorrect password. Please enter the exact password created during sign up.',
    };
  }

  return { success: true, account };
}

export async function authenticateUserAsync(
  email: string,
  passwordInput: string
): Promise<{ success: boolean; message?: string; account?: StoredUserAccount }> {
  const cleanEmail = email.trim().toLowerCase();
  const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

  try {
    const userSnap = await getDoc(doc(db, 'users', docId));
    if (userSnap.exists()) {
      const account = userSnap.data() as StoredUserAccount;
      if (account.password !== passwordInput) {
        return {
          success: false,
          message: 'Incorrect password. Please enter the exact password created during sign up.',
        };
      }
      const accounts = getRegisteredAccounts();
      if (!accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
        saveRegisteredAccounts([...accounts, account]);
      }
      return { success: true, account };
    }

    // Attempt Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
    } catch (authErr) {
      console.warn('Firebase Auth sign in notice:', authErr);
    }

    // Fallback to local accounts
    return authenticateUser(email, passwordInput);
  } catch (err) {
    console.error('Firestore login error:', err);
    return authenticateUser(email, passwordInput);
  }
}

// Helper to wipe a Firestore collection completely
export async function wipeFirestoreCollection(collectionName: string): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, collectionName, docSnap.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error(`Error wiping Firestore collection ${collectionName}:`, err);
  }
}

// Reset data back to clean state synchronously (for local fallback)
export function resetAllDataToDefault(): { 
  products: TurnkeyProduct[]; 
  storeItems: StoreItem[];
  productCategories: ProductCategory[];
  storeCategories: StoreCategory[];
} {
  localStorage.setItem(STORAGE_KEYS.TURNKEY_PRODUCTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PRODUCT_CATEGORIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.STORE_CATEGORIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify([]));
  // Note: Custom logo & Job applications are explicitly preserved and NOT reset
  addAdminLog({
    action: 'RESET',
    target: 'PRODUCT',
    title: 'Factory Reset (Cleared Data)',
    details: 'Cleared all catalog hardware, store components, categories, and job postings. Job applications & branding preserved.'
  });
  return {
    products: [],
    storeItems: [],
    productCategories: [],
    storeCategories: [],
  };
}

// Async full Factory Reset across Cloud Firestore & All Synced Devices
export async function resetAllDataToDefaultAsync(): Promise<{
  products: TurnkeyProduct[];
  storeItems: StoreItem[];
  productCategories: ProductCategory[];
  storeCategories: StoreCategory[];
  jobRoles: JobRole[];
  jobApplications: JobApplication[];
}> {
  const existingJobApps = getStoredJobApplications();

  try {
    // 1. Wipe cloud collections completely (Except job_applications & branding settings)
    await wipeFirestoreCollection('turnkey_products');
    await wipeFirestoreCollection('store_items');
    await wipeFirestoreCollection('product_categories');
    await wipeFirestoreCollection('store_categories');
    await wipeFirestoreCollection('job_roles');
    // Note: We DO NOT touch 'job_applications', 'app_settings/branding' or CUSTOM_LOGO.

    // 2. Update local storage caches to empty (Preserving job applications & logo)
    localStorage.setItem(STORAGE_KEYS.TURNKEY_PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PRODUCT_CATEGORIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STORE_CATEGORIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify([]));

    addAdminLog({
      action: 'RESET',
      target: 'PRODUCT',
      title: 'Factory Reset (Cloud Synced & Cleared)',
      details: 'Pushed factory reset to Firestore. Connected devices cleared in real-time. Logo & job applications preserved.'
    });
  } catch (err) {
    console.error('Error during cloud factory reset:', err);
  }

  return {
    products: [],
    storeItems: [],
    productCategories: [],
    storeCategories: [],
    jobRoles: [],
    jobApplications: existingJobApps,
  };
}

// Job Roles Storage
export function getStoredJobRoles(): JobRole[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOB_ROLES);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading job roles:', err);
  }
  return INITIAL_JOB_ROLES;
}

export function saveStoredJobRoles(roles: JobRole[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify(roles));
    roles.forEach((r) => {
      setDoc(doc(db, 'job_roles', r.id), sanitizeForFirestore(r), { merge: true }).catch((err) =>
        console.error('Firestore save job role error:', err)
      );
    });
  } catch (err) {
    console.error('Error saving job roles:', err);
  }
}

// Job Applications Storage
export function getStoredJobApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOB_APPLICATIONS);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading job applications:', err);
  }
  return [];
}

export function saveStoredJobApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(apps));
    apps.forEach((a) => {
      setDoc(doc(db, 'job_applications', a.id), sanitizeForFirestore(a), { merge: true }).catch((err) =>
        console.error('Firestore save job application error:', err)
      );
    });
  } catch (err) {
    console.error('Error saving job applications:', err);
  }
}

export function addJobApplication(appData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>): JobApplication {
  const current = getStoredJobApplications();
  const newApp: JobApplication = {
    ...appData,
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    appliedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'New',
  };
  const updated = [newApp, ...current];
  saveStoredJobApplications(updated);
  return newApp;
}

export const DEFAULT_CAREER_SETTINGS: CareerPageSettings = {
  enabled: true,
  contactEmail: 'careers@ohmveda.com',
  headline: 'Build the Future of Hardware & Embedded Intelligence',
  subheadline: 'Join our multidisciplinary engineering team in Vadodara and Ahmedabad to build connected edge systems, custom PCBs, and high-performance software.',
  instructions: 'Submit your candidate application directly through our portal or reach out to our talent acquisition lead.',
};

export function getStoredCareerSettings(): CareerPageSettings {
  try {
    const raw = localStorage.getItem('ohmveda_career_settings_v1');
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading career settings:', err);
  }
  return DEFAULT_CAREER_SETTINGS;
}

export function saveStoredCareerSettings(settings: CareerPageSettings): void {
  try {
    localStorage.setItem('ohmveda_career_settings_v1', JSON.stringify(settings));
    setDoc(doc(db, 'app_settings', 'careers'), sanitizeForFirestore(settings), { merge: true }).catch((err) =>
      console.error('Firestore save career settings error:', err)
    );
  } catch (err) {
    console.error('Error saving career settings:', err);
  }
}

// =========================================================================
// REAL-TIME FIRESTORE DATA SYNCHRONIZATION Across All Devices
// =========================================================================
export function subscribeToFirestoreData(onUpdate: (data: {
  products?: TurnkeyProduct[];
  storeItems?: StoreItem[];
  productCategories?: ProductCategory[];
  storeCategories?: StoreCategory[];
  jobRoles?: JobRole[];
  jobApplications?: JobApplication[];
  adminEmails?: string[];
  customLogo?: string | null;
}) => void) {
  const unsubs: (() => void)[] = [];

  // 1. Store Items Listener
  try {
    const unsub = onSnapshot(collection(db, 'store_items'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as StoreItem;
          const sellingPrice = data.price ?? 0;
          const origPrice = (data.originalPrice && data.originalPrice > sellingPrice) ? data.originalPrice : undefined;
          return {
            ...data,
            id: docSnap.id || data.id,
            name: data.name || 'Unnamed Component',
            price: sellingPrice,
            originalPrice: origPrice,
            discountPercent: data.discountPercent,
            stock: data.stock ?? 0,
            inStock: data.inStock ?? ((data.stock ?? 0) > 0),
            rating: data.rating ?? 5.0,
            reviewsCount: data.reviewsCount ?? 0,
            image: data.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
            images: data.images && Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.image ? [data.image] : []),
            shortDesc: data.shortDesc || '',
            specs: Array.isArray(data.specs) ? data.specs : [],
            sku: data.sku || 'OV-CMP-ITEM',
            category: data.category || '',
            badge: data.badge,
          };
        });
        localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify(items));
        onUpdate({ storeItems: items });
      } else {
        localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify([]));
        onUpdate({ storeItems: [] });
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Store items subscription error:', e);
  }

  // 2. Turnkey Products Listener
  try {
    const unsub = onSnapshot(collection(db, 'turnkey_products'), (snapshot) => {
      if (!snapshot.empty) {
        const products = snapshot.docs.map((docSnap) => docSnap.data() as TurnkeyProduct);
        localStorage.setItem(STORAGE_KEYS.TURNKEY_PRODUCTS, JSON.stringify(products));
        onUpdate({ products });
      } else {
        localStorage.setItem(STORAGE_KEYS.TURNKEY_PRODUCTS, JSON.stringify([]));
        onUpdate({ products: [] });
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Turnkey products subscription error:', e);
  }

  // 3. Product Categories Listener
  try {
    const unsub = onSnapshot(collection(db, 'product_categories'), (snapshot) => {
      if (!snapshot.empty) {
        const categories = snapshot.docs.map((docSnap) => docSnap.data() as ProductCategory);
        localStorage.setItem(STORAGE_KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories));
        onUpdate({ productCategories: categories });
      } else {
        localStorage.setItem(STORAGE_KEYS.PRODUCT_CATEGORIES, JSON.stringify([]));
        onUpdate({ productCategories: [] });
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Product categories subscription error:', e);
  }

  // 4. Store Categories Listener
  try {
    const unsub = onSnapshot(collection(db, 'store_categories'), (snapshot) => {
      if (!snapshot.empty) {
        const categories = snapshot.docs.map((docSnap) => docSnap.data() as StoreCategory);
        localStorage.setItem(STORAGE_KEYS.STORE_CATEGORIES, JSON.stringify(categories));
        onUpdate({ storeCategories: categories });
      } else {
        localStorage.setItem(STORAGE_KEYS.STORE_CATEGORIES, JSON.stringify([]));
        onUpdate({ storeCategories: [] });
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Store categories subscription error:', e);
  }

  // 5. Job Roles Listener
  try {
    const unsub = onSnapshot(collection(db, 'job_roles'), (snapshot) => {
      if (!snapshot.empty) {
        const roles = snapshot.docs.map((docSnap) => docSnap.data() as JobRole);
        localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify(roles));
        onUpdate({ jobRoles: roles });
      } else {
        const local = getStoredJobRoles();
        const rolesToSeed = local.length > 0 ? local : INITIAL_JOB_ROLES;
        rolesToSeed.forEach((r) => {
          setDoc(doc(db, 'job_roles', r.id), r, { merge: true }).catch((err) =>
            console.error('Firestore seed job role error:', err)
          );
        });
        localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify(rolesToSeed));
        onUpdate({ jobRoles: rolesToSeed });
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Job roles subscription error:', e);
  }

  // 6. Job Applications Listener
  try {
    const unsub = onSnapshot(collection(db, 'job_applications'), (snapshot) => {
      const apps = snapshot.docs.map((doc) => doc.data() as JobApplication);
      localStorage.setItem(STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(apps));
      onUpdate({ jobApplications: apps });
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Job applications subscription error:', e);
  }

  // 7. Users Listener (Syncs registered user accounts to local storage cache)
  try {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data() as StoredUserAccount);
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Users subscription error:', e);
  }

  // 8. Authorized Admin Emails Listener
  try {
    const unsub = onSnapshot(collection(db, 'authorized_admin_emails'), (snapshot) => {
      if (!snapshot.empty) {
        const emails = snapshot.docs.map((doc) => (doc.data() as { email: string }).email);
        localStorage.setItem(STORAGE_KEYS.AUTHORIZED_ADMIN_EMAILS, JSON.stringify(emails));
        onUpdate({ adminEmails: emails });
      } else {
        DEFAULT_AUTHORIZED_ADMIN_EMAILS.forEach((email) => {
          const id = email.replace(/[^a-zA-Z0-9]/g, '_');
          setDoc(doc(db, 'authorized_admin_emails', id), { email }, { merge: true });
        });
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Admin emails subscription error:', e);
  }

  // 9. Custom Branding Logo Listener
  try {
    const unsub = onSnapshot(doc(db, 'app_settings', 'branding'), (docSnap) => {
      if (docSnap.exists()) {
        const logoUrl = docSnap.data().customLogo || null;
        if (logoUrl) {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, logoUrl);
        } else {
          localStorage.removeItem(STORAGE_KEYS.CUSTOM_LOGO);
        }
        onUpdate({ customLogo: logoUrl });
        window.dispatchEvent(new Event('ohmveda_logo_updated'));
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Custom logo subscription error:', e);
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}
