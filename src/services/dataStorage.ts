import { CareerPageSettings, CompanyContactInfo, JobApplication, JobRole, LeadInquiry, ProductCategory, SocialLink, StoreCategory, StoreItem, StoreQaItem, StoreReviewItem, TechnicalDocument, TurnkeyProduct, UserAddress, UserOrder, UserProfile } from '../types';
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
  COMPANY_CONTACT: 'ohmveda_company_contact_v1',
  STORE_QAS: 'ohmveda_store_qas_v1',
  STORE_REVIEWS: 'ohmveda_store_reviews_v1',
  USER_ADDRESSES: 'ohmveda_user_addresses_v1',
  USER_ORDERS: 'ohmveda_user_orders_v1',
  DOCUMENT_BLOBS: 'ohmveda_doc_blobs_v1',
  LEAD_INQUIRIES: 'ohmveda_lead_inquiries_v1',
};

// Document Blob Cache Helpers for safe storage without hitting Firestore 1MB document size limit
const DOC_BLOB_STORAGE_PREFIX = 'ohmveda_doc_blob_';

export function saveDocumentBlob(docId: string, content: string): void {
  try {
    localStorage.setItem(`${DOC_BLOB_STORAGE_PREFIX}${docId}`, content);
  } catch (e) {
    console.warn('Could not save document blob to localStorage:', e);
  }
}

export function getDocumentBlob(docId: string): string | null {
  try {
    return localStorage.getItem(`${DOC_BLOB_STORAGE_PREFIX}${docId}`);
  } catch (e) {
    return null;
  }
}

export function deleteDocumentBlob(docId: string): void {
  try {
    localStorage.removeItem(`${DOC_BLOB_STORAGE_PREFIX}${docId}`);
  } catch (e) {
    // ignore
  }
}

// Sanitizes item/product documents for Firestore so large base64 attachments don't exceed 1MB limit
export function prepareItemForFirestore<T extends StoreItem | TurnkeyProduct>(item: T): T {
  if (!item.documents || !Array.isArray(item.documents)) {
    return item;
  }

  const cleanDocs = item.documents.map((doc) => {
    if (doc.url && doc.url.startsWith('data:')) {
      saveDocumentBlob(doc.id, doc.url);
      return {
        ...doc,
        url: `doc-local://${doc.id}`,
      };
    }
    return doc;
  });

  return {
    ...item,
    documents: cleanDocs,
  };
}

// Reconstitutes full document file URLs from local blob cache if stored as lightweight reference
export function resolveItemDocuments<T extends StoreItem | TurnkeyProduct>(item: T): T {
  if (!item.documents || !Array.isArray(item.documents)) {
    return item;
  }

  const resolvedDocs = item.documents.map((doc) => {
    const cached = getDocumentBlob(doc.id);
    if (cached) {
      return { ...doc, url: cached };
    }
    if (doc.url && doc.url.startsWith('doc-local://')) {
      const docId = doc.url.replace('doc-local://', '');
      const blob = getDocumentBlob(docId);
      if (blob) {
        return { ...doc, url: blob };
      }
    }
    return doc;
  });

  return {
    ...item,
    documents: resolvedDocs,
  };
}

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
        return parsed.map((p) => resolveItemDocuments(p));
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
    const productsWithFullDocs = products.map((p) => resolveItemDocuments(p));
    localStorage.setItem(STORAGE_KEYS.TURNKEY_PRODUCTS, JSON.stringify(productsWithFullDocs));
    productsWithFullDocs.forEach((p) => {
      const firestorePayload = prepareItemForFirestore(p);
      setDoc(doc(db, 'turnkey_products', p.id), sanitizeForFirestore(firestorePayload), { merge: true }).catch((err) =>
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
        return parsed.map((it) => resolveItemDocuments(it));
      }
    }
  } catch (err) {
    console.error('Error reading store items:', err);
  }
  return STORE_PRODUCTS.map((it) => resolveItemDocuments(it));
}

// Helper to save store items
export function saveStoredStoreItems(items: StoreItem[]): void {
  try {
    const itemsWithFullDocs = items.map((it) => resolveItemDocuments(it));
    localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify(itemsWithFullDocs));
    itemsWithFullDocs.forEach((item) => {
      const firestorePayload = prepareItemForFirestore(item);
      setDoc(doc(db, 'store_items', item.id), sanitizeForFirestore(firestorePayload), { merge: true }).catch((err) =>
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
  gstin?: string;
  createdAt: string;
}

export function saveRegisteredUserProfile(profile: UserProfile): void {
  const cleanEmail = profile.email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
  if (idx !== -1) {
    accounts[idx] = {
      ...accounts[idx],
      name: profile.name,
      phone: profile.phone,
      company: profile.company,
      gstin: profile.gstin,
    };
    saveRegisteredAccounts(accounts);
  }
  const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
  setDoc(doc(db, 'users', docId), sanitizeForFirestore(profile), { merge: true }).catch((err) =>
    console.error('Firestore save profile error:', err)
  );
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
  const isInit = localStorage.getItem('ohmveda_job_roles_init') === 'true';
  return isInit ? [] : INITIAL_JOB_ROLES;
}

export function saveStoredJobRoles(roles: JobRole[]): void {
  try {
    localStorage.setItem('ohmveda_job_roles_init', 'true');
    localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify(roles));
    roles.forEach((r) => {
      setDoc(doc(db, 'job_roles', r.id), sanitizeForFirestore(r), { merge: true }).catch((err) =>
        console.error('Firestore save job role error:', err)
      );
    });
    window.dispatchEvent(new Event('ohmveda_job_roles_updated'));
  } catch (err) {
    console.error('Error saving job roles:', err);
  }
}

export function deleteStoredJobRole(id: string): void {
  try {
    localStorage.setItem('ohmveda_job_roles_init', 'true');
    const current = getStoredJobRoles();
    const updated = current.filter((j) => j.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify(updated));
    deleteDoc(doc(db, 'job_roles', id)).catch((err) =>
      console.error('Firestore delete job role error:', err)
    );
    window.dispatchEvent(new Event('ohmveda_job_roles_updated'));
  } catch (err) {
    console.error('Error deleting job role:', err);
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

export function deleteStoredJobApplication(id: string): void {
  try {
    const current = getStoredJobApplications();
    const updated = current.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(updated));
    deleteDoc(doc(db, 'job_applications', id)).catch((err) =>
      console.error('Firestore delete job application error:', err)
    );
  } catch (err) {
    console.error('Error deleting job application:', err);
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

export const DEFAULT_COMPANY_CONTACT: CompanyContactInfo = {
  email: 'ohmvedatechnologies@gmail.com',
  phone: '+91 98765 43210',
  phoneSecondary: '+91 (80) 4123-8900',
  companyName: 'OhmVeda Technologies Private Limited',
  addressTitle: 'Engineering Office & R&D Lab',
  addressLine1: 'Tech Innovation Hub, Block B, Electronic City Phase 1,',
  addressLine2: 'Bengaluru, Karnataka 560100, India',
};

export function getStoredCompanyContact(): CompanyContactInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY_CONTACT);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return {
        email: parsed.email || DEFAULT_COMPANY_CONTACT.email,
        phone: parsed.phone || DEFAULT_COMPANY_CONTACT.phone,
        phoneSecondary: parsed.phoneSecondary ?? DEFAULT_COMPANY_CONTACT.phoneSecondary,
        companyName: parsed.companyName || DEFAULT_COMPANY_CONTACT.companyName,
        addressTitle: parsed.addressTitle || DEFAULT_COMPANY_CONTACT.addressTitle,
        addressLine1: parsed.addressLine1 || DEFAULT_COMPANY_CONTACT.addressLine1,
        addressLine2: parsed.addressLine2 || DEFAULT_COMPANY_CONTACT.addressLine2,
      };
    }
  } catch (err) {
    console.error('Error reading company contact info:', err);
  }
  return DEFAULT_COMPANY_CONTACT;
}

export function saveStoredCompanyContact(info: CompanyContactInfo): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY_CONTACT, JSON.stringify(info));
    setDoc(doc(db, 'app_settings', 'company_contact'), sanitizeForFirestore(info), { merge: true }).catch((err) =>
      console.error('Firestore save company contact error:', err)
    );
    window.dispatchEvent(new Event('ohmveda_contact_info_updated'));
  } catch (err) {
    console.error('Error saving company contact info:', err);
  }
}

// =========================================================================
// SOCIAL MEDIA LINKS STORAGE
// =========================================================================

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    url: 'https://linkedin.com/company/ohmveda-technologies',
    enabled: true,
    iconName: 'Linkedin',
  },
  {
    id: 'github',
    platform: 'GitHub',
    url: 'https://github.com/ohmveda-technologies',
    enabled: true,
    iconName: 'Github',
  },
  {
    id: 'youtube',
    platform: 'YouTube',
    url: 'https://youtube.com/@ohmvedatechnologies',
    enabled: true,
    iconName: 'Youtube',
  },
  {
    id: 'twitter',
    platform: 'Twitter / X',
    url: 'https://x.com/ohmveda_tech',
    enabled: true,
    iconName: 'Twitter',
  },
  {
    id: 'instagram',
    platform: 'Instagram',
    url: 'https://instagram.com/ohmveda_technologies',
    enabled: false,
    iconName: 'Instagram',
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    url: 'https://facebook.com/ohmveda',
    enabled: false,
    iconName: 'Facebook',
  },
  {
    id: 'whatsapp',
    platform: 'WhatsApp',
    url: 'https://wa.me/919876543210',
    enabled: false,
    iconName: 'MessageCircle',
  },
  {
    id: 'discord',
    platform: 'Discord',
    url: 'https://discord.gg/ohmveda',
    enabled: false,
    iconName: 'MessageSquare',
  },
  {
    id: 'telegram',
    platform: 'Telegram',
    url: 'https://t.me/ohmvedatech',
    enabled: false,
    iconName: 'Send',
  },
];

export function getStoredSocialLinks(): SocialLink[] {
  try {
    const raw = localStorage.getItem('ohmveda_social_links_v1');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading social links:', err);
  }
  return DEFAULT_SOCIAL_LINKS;
}

export function saveStoredSocialLinks(links: SocialLink[]): void {
  try {
    localStorage.setItem('ohmveda_social_links_v1', JSON.stringify(links));
    setDoc(doc(db, 'app_settings', 'social_links'), { links }, { merge: true }).catch((err) =>
      console.error('Firestore save social links error:', err)
    );
    window.dispatchEvent(new Event('ohmveda_social_links_updated'));
  } catch (err) {
    console.error('Error saving social links:', err);
  }
}


// =========================================================================
// STORE Q&A AND CUSTOMER REVIEWS STORAGE
// =========================================================================

export const INITIAL_STORE_QAS: StoreQaItem[] = [
  {
    id: 'qa-1',
    itemId: 'store-esp32-wroom',
    userName: 'Vikram Mehta',
    userEmail: 'vikram.m@techcorp.in',
    question: 'Is this ESP32 module operating on 3.3V or 5V logic level for GPIO pins?',
    askedAt: '2026-03-01',
    answer: 'All ESP32 GPIO pins operate at 3.3V digital logic level. If connecting to 5V sensors or microcontrollers, please use a bidirectional logic level shifter to protect the chip.',
    answeredBy: 'OhmVeda Technical Team',
    answeredAt: '2026-03-01',
    isAnswered: true,
  },
  {
    id: 'qa-2',
    itemId: 'store-esp32-wroom',
    userName: 'Ananya Sharma',
    userEmail: 'ananya@iotlabs.org',
    question: 'Does this come with pre-flashed AT firmware or Arduino bootloader?',
    askedAt: '2026-03-12',
    answer: 'It comes loaded with Espressif AT command firmware out of the box. You can easily flash custom Arduino C++, ESP-IDF, or MicroPython code via USB-UART bridge.',
    answeredBy: 'OhmVeda Engineering Support',
    answeredAt: '2026-03-12',
    isAnswered: true,
  },
  {
    id: 'qa-3',
    itemId: 'store-oled-display',
    userName: 'Rohan Patel',
    userEmail: 'rohan.p@embed.io',
    question: 'What is the default I2C slave address for this 0.96" OLED display?',
    askedAt: '2026-02-20',
    answer: 'The default I2C address is 0x3C. It can be changed to 0x3D by resoldering the jumper resistor on the back PCB.',
    answeredBy: 'OhmVeda Support',
    answeredAt: '2026-02-21',
    isAnswered: true,
  },
];

export const INITIAL_STORE_REVIEWS: StoreReviewItem[] = [
  {
    id: 'rev-1',
    itemId: 'store-esp32-wroom',
    userName: 'Dr. Suresh Kumar',
    userEmail: 'suresh@iit.ac.in',
    rating: 5,
    title: 'Outstanding Wi-Fi Range & Solid Bench Performance',
    comment: 'We purchased 15 units for our university IoT prototyping lab. Outstanding signal stability on 2.4GHz Wi-Fi, zero voltage drops under continuous BLE transmission. Prompt delivery and authentic Espressif chipsets!',
    createdAt: '2026-02-14',
    verifiedPurchase: true,
  },
  {
    id: 'rev-2',
    itemId: 'store-esp32-wroom',
    userName: 'Karthik Raja',
    userEmail: 'karthik@embeddedpro.in',
    rating: 5,
    title: 'Genuine Board with GST Invoice Provided',
    comment: 'Component works flawlessly with ESP-IDF and FreeRTOS tasks. Received 18% GST tax invoice for company accounting. Highly recommended for industrial hardware builds.',
    createdAt: '2026-02-28',
    verifiedPurchase: true,
  },
  {
    id: 'rev-3',
    itemId: 'store-arduino-uno',
    userName: 'Neha Verma',
    userEmail: 'neha.v@robotics.co',
    rating: 5,
    title: 'Genuine ATmega328P DIP Chip',
    comment: 'Original Microchip MCU on removable DIP socket. Perfect for testing and flashing custom bootloaders.',
    createdAt: '2026-03-02',
    verifiedPurchase: true,
  },
];

// Q&A Helpers
export function getStoredStoreQas(): StoreQaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_QAS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading store QAs:', err);
  }
  const isInit = localStorage.getItem('ohmveda_store_qas_init') === 'true';
  return isInit ? [] : INITIAL_STORE_QAS;
}

export function saveStoredStoreQas(qas: StoreQaItem[]): void {
  try {
    localStorage.setItem('ohmveda_store_qas_init', 'true');
    localStorage.setItem(STORAGE_KEYS.STORE_QAS, JSON.stringify(qas));
    qas.forEach((qa) => {
      setDoc(doc(db, 'store_qas', qa.id), sanitizeForFirestore(qa), { merge: true }).catch((err) =>
        console.error('Firestore save store QA error:', err)
      );
    });
    window.dispatchEvent(new Event('ohmveda_store_qas_updated'));
  } catch (err) {
    console.error('Error saving store QAs:', err);
  }
}

export function addStoreQuestion(itemId: string, userName: string, userEmail: string, question: string): StoreQaItem {
  const current = getStoredStoreQas();
  const newQa: StoreQaItem = {
    id: `qa-${Date.now()}`,
    itemId,
    userName: userName.trim() || 'Anonymous User',
    userEmail: userEmail.trim(),
    question: question.trim(),
    askedAt: new Date().toISOString().split('T')[0],
    isAnswered: false,
  };
  const updated = [newQa, ...current];
  saveStoredStoreQas(updated);
  return newQa;
}

export function answerStoreQuestion(qaId: string, answer: string, answeredBy: string = 'OhmVeda Technical Team'): void {
  const current = getStoredStoreQas();
  const updated = current.map((q) =>
    q.id === qaId
      ? {
          ...q,
          answer: answer.trim(),
          answeredBy,
          answeredAt: new Date().toISOString().split('T')[0],
          isAnswered: true,
        }
      : q
  );
  saveStoredStoreQas(updated);
}

export function deleteStoreQuestion(qaId: string): void {
  localStorage.setItem('ohmveda_store_qas_init', 'true');
  const current = getStoredStoreQas();
  const updated = current.filter((q) => q.id !== qaId);
  localStorage.setItem(STORAGE_KEYS.STORE_QAS, JSON.stringify(updated));
  deleteFirestoreDoc('store_qas', qaId);
  window.dispatchEvent(new Event('ohmveda_store_qas_updated'));
}

// Reviews Helpers
export function getStoredStoreReviews(): StoreReviewItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_REVIEWS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading store reviews:', err);
  }
  const isInit = localStorage.getItem('ohmveda_store_reviews_init') === 'true';
  return isInit ? [] : INITIAL_STORE_REVIEWS;
}

export function saveStoredStoreReviews(reviews: StoreReviewItem[]): void {
  try {
    localStorage.setItem('ohmveda_store_reviews_init', 'true');
    localStorage.setItem(STORAGE_KEYS.STORE_REVIEWS, JSON.stringify(reviews));
    reviews.forEach((rev) => {
      setDoc(doc(db, 'store_reviews', rev.id), sanitizeForFirestore(rev), { merge: true }).catch((err) =>
        console.error('Firestore save store review error:', err)
      );
    });
    window.dispatchEvent(new Event('ohmveda_store_reviews_updated'));
  } catch (err) {
    console.error('Error saving store reviews:', err);
  }
}

export function addStoreReview(
  itemId: string,
  userName: string,
  userEmail: string,
  rating: number,
  title: string,
  comment: string
): StoreReviewItem {
  const currentReviews = getStoredStoreReviews();
  const newReview: StoreReviewItem = {
    id: `rev-${Date.now()}`,
    itemId,
    userName: userName.trim() || 'Verified Buyer',
    userEmail: userEmail.trim(),
    rating: Math.max(1, Math.min(5, rating)),
    title: title.trim(),
    comment: comment.trim(),
    createdAt: new Date().toISOString().split('T')[0],
    verifiedPurchase: true,
  };
  const updatedReviews = [newReview, ...currentReviews];
  saveStoredStoreReviews(updatedReviews);

  // Recalculate rating & reviews count for item
  const itemReviews = updatedReviews.filter((r) => r.itemId === itemId);
  const totalRating = itemReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = itemReviews.length > 0 ? parseFloat((totalRating / itemReviews.length).toFixed(1)) : 5.0;

  const currentItems = getStoredStoreItems();
  const updatedItems = currentItems.map((item) =>
    item.id === itemId
      ? {
          ...item,
          rating: avgRating,
          reviewsCount: itemReviews.length,
        }
      : item
  );
  saveStoredStoreItems(updatedItems);

  return newReview;
}

export function deleteStoreReview(reviewId: string): void {
  localStorage.setItem('ohmveda_store_reviews_init', 'true');
  const current = getStoredStoreReviews();
  const deleted = current.find((r) => r.id === reviewId);
  const updated = current.filter((r) => r.id !== reviewId);
  localStorage.setItem(STORAGE_KEYS.STORE_REVIEWS, JSON.stringify(updated));
  deleteFirestoreDoc('store_reviews', reviewId);
  window.dispatchEvent(new Event('ohmveda_store_reviews_updated'));

  if (deleted) {
    const itemReviews = updated.filter((r) => r.itemId === deleted.itemId);
    const totalRating = itemReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = itemReviews.length > 0 ? parseFloat((totalRating / itemReviews.length).toFixed(1)) : 5.0;

    const currentItems = getStoredStoreItems();
    const updatedItems = currentItems.map((item) =>
      item.id === deleted.itemId
        ? {
            ...item,
            rating: avgRating,
            reviewsCount: itemReviews.length,
          }
        : item
    );
    saveStoredStoreItems(updatedItems);
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
  storeQas?: StoreQaItem[];
  storeReviews?: StoreReviewItem[];
  userOrders?: UserOrder[];
}) => void) {
  const unsubs: (() => void)[] = [];

  // 1. Store Items Listener
  try {
    const unsub = onSnapshot(collection(db, 'store_items'), (snapshot) => {
      if (!snapshot.empty) {
        localStorage.setItem('ohmveda_store_items_init', 'true');
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as StoreItem;
          const sellingPrice = data.price ?? 0;
          const origPrice = (data.originalPrice && data.originalPrice > sellingPrice) ? data.originalPrice : undefined;
          const rawItem: StoreItem = {
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
            documents: Array.isArray(data.documents) ? data.documents : [],
          };
          return resolveItemDocuments(rawItem);
        });
        localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify(items));
        onUpdate({ storeItems: items });
      } else {
        const isInit = localStorage.getItem('ohmveda_store_items_init') === 'true';
        if (!isInit) {
          localStorage.setItem('ohmveda_store_items_init', 'true');
          saveStoredStoreItems(STORE_PRODUCTS);
          onUpdate({ storeItems: STORE_PRODUCTS });
        } else {
          const local = getStoredStoreItems();
          onUpdate({ storeItems: local });
        }
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
        localStorage.setItem('ohmveda_turnkey_products_init', 'true');
        const products = snapshot.docs.map((docSnap) => resolveItemDocuments(docSnap.data() as TurnkeyProduct));
        localStorage.setItem(STORAGE_KEYS.TURNKEY_PRODUCTS, JSON.stringify(products));
        onUpdate({ products });
      } else {
        const isInit = localStorage.getItem('ohmveda_turnkey_products_init') === 'true';
        if (!isInit) {
          localStorage.setItem('ohmveda_turnkey_products_init', 'true');
          onUpdate({ products: [] });
        } else {
          const local = getStoredTurnkeyProducts();
          onUpdate({ products: local });
        }
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
        localStorage.setItem('ohmveda_job_roles_init', 'true');
        const roles = snapshot.docs.map((docSnap) => docSnap.data() as JobRole);
        localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify(roles));
        onUpdate({ jobRoles: roles });
      } else {
        const isInitialized = localStorage.getItem('ohmveda_job_roles_init') === 'true';
        if (!isInitialized) {
          localStorage.setItem('ohmveda_job_roles_init', 'true');
          const local = getStoredJobRoles();
          const rolesToSeed = local.length > 0 ? local : INITIAL_JOB_ROLES;
          rolesToSeed.forEach((r) => {
            setDoc(doc(db, 'job_roles', r.id), sanitizeForFirestore(r), { merge: true }).catch((err) =>
              console.error('Firestore seed job role error:', err)
            );
          });
          localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify(rolesToSeed));
          onUpdate({ jobRoles: rolesToSeed });
        } else {
          localStorage.setItem(STORAGE_KEYS.JOB_ROLES, JSON.stringify([]));
          onUpdate({ jobRoles: [] });
        }
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

  // 10. Company Contact Info Listener
  try {
    const unsub = onSnapshot(doc(db, 'app_settings', 'company_contact'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CompanyContactInfo;
        if (data && data.email) {
          localStorage.setItem(STORAGE_KEYS.COMPANY_CONTACT, JSON.stringify(data));
          window.dispatchEvent(new Event('ohmveda_contact_info_updated'));
        }
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Company contact info subscription error:', e);
  }

  // 11. Store QAs Listener
  try {
    const unsub = onSnapshot(collection(db, 'store_qas'), (snapshot) => {
      if (!snapshot.empty) {
        localStorage.setItem('ohmveda_store_qas_init', 'true');
        const qas = snapshot.docs.map((docSnap) => docSnap.data() as StoreQaItem);
        localStorage.setItem(STORAGE_KEYS.STORE_QAS, JSON.stringify(qas));
        onUpdate({ storeQas: qas });
      } else {
        const isInit = localStorage.getItem('ohmveda_store_qas_init') === 'true';
        if (!isInit) {
          localStorage.setItem('ohmveda_store_qas_init', 'true');
          const local = getStoredStoreQas();
          const qasToSeed = local.length > 0 ? local : INITIAL_STORE_QAS;
          qasToSeed.forEach((qa) => {
            setDoc(doc(db, 'store_qas', qa.id), sanitizeForFirestore(qa), { merge: true }).catch((err) =>
              console.error('Firestore seed QA error:', err)
            );
          });
          localStorage.setItem(STORAGE_KEYS.STORE_QAS, JSON.stringify(qasToSeed));
          onUpdate({ storeQas: qasToSeed });
        } else {
          localStorage.setItem(STORAGE_KEYS.STORE_QAS, JSON.stringify([]));
          onUpdate({ storeQas: [] });
        }
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Store QAs subscription error:', e);
  }

  // 12. Store Reviews Listener
  try {
    const unsub = onSnapshot(collection(db, 'store_reviews'), (snapshot) => {
      if (!snapshot.empty) {
        localStorage.setItem('ohmveda_store_reviews_init', 'true');
        const reviews = snapshot.docs.map((docSnap) => docSnap.data() as StoreReviewItem);
        localStorage.setItem(STORAGE_KEYS.STORE_REVIEWS, JSON.stringify(reviews));
        onUpdate({ storeReviews: reviews });
      } else {
        const isInit = localStorage.getItem('ohmveda_store_reviews_init') === 'true';
        if (!isInit) {
          localStorage.setItem('ohmveda_store_reviews_init', 'true');
          const local = getStoredStoreReviews();
          const reviewsToSeed = local.length > 0 ? local : INITIAL_STORE_REVIEWS;
          reviewsToSeed.forEach((rev) => {
            setDoc(doc(db, 'store_reviews', rev.id), sanitizeForFirestore(rev), { merge: true }).catch((err) =>
              console.error('Firestore seed review error:', err)
            );
          });
          localStorage.setItem(STORAGE_KEYS.STORE_REVIEWS, JSON.stringify(reviewsToSeed));
          onUpdate({ storeReviews: reviewsToSeed });
        } else {
          localStorage.setItem(STORAGE_KEYS.STORE_REVIEWS, JSON.stringify([]));
          onUpdate({ storeReviews: [] });
        }
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('Store reviews subscription error:', e);
  }

  // 13. User Orders Listener
  try {
    const unsub = onSnapshot(collection(db, 'user_orders'), (snapshot) => {
      if (!snapshot.empty) {
        const orders = snapshot.docs.map((docSnap) => docSnap.data() as UserOrder);
        localStorage.setItem(STORAGE_KEYS.USER_ORDERS, JSON.stringify(orders));
        onUpdate({ userOrders: orders });
      }
    });
    unsubs.push(unsub);
  } catch (e) {
    console.error('User orders subscription error:', e);
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}

// =========================================================================
// USER ADDRESSES & ORDERS STORAGE
// =========================================================================

export function getStoredUserAddresses(userId: string): UserAddress[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.USER_ADDRESSES}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading stored user addresses:', err);
  }
  return [];
}

export function saveStoredUserAddress(address: UserAddress): UserAddress[] {
  if (!address.userId) return [];
  const existing = getStoredUserAddresses(address.userId);
  let updated: UserAddress[];
  const isEdit = existing.some((a) => a.id === address.id);
  
  if (isEdit) {
    updated = existing.map((a) => (a.id === address.id ? address : a));
  } else {
    if (address.isDefault || existing.length === 0) {
      existing.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }
    updated = [address, ...existing];
  }

  try {
    localStorage.setItem(`${STORAGE_KEYS.USER_ADDRESSES}_${address.userId}`, JSON.stringify(updated));
    setDoc(doc(db, 'user_addresses', address.id), sanitizeForFirestore(address), { merge: true }).catch((err) =>
      console.error('Firestore save address error:', err)
    );
  } catch (err) {
    console.error('Error saving user address:', err);
  }
  return updated;
}

export function deleteStoredUserAddress(userId: string, addressId: string): UserAddress[] {
  const current = getStoredUserAddresses(userId);
  const updated = current.filter((a) => a.id !== addressId);
  if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
    updated[0].isDefault = true;
  }
  try {
    localStorage.setItem(`${STORAGE_KEYS.USER_ADDRESSES}_${userId}`, JSON.stringify(updated));
    deleteFirestoreDoc('user_addresses', addressId);
  } catch (err) {
    console.error('Error deleting user address:', err);
  }
  return updated;
}

// User Orders
export function getStoredUserOrders(userId?: string): UserOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_ORDERS);
    if (raw) {
      const parsed: UserOrder[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (userId) {
          return parsed.filter((o) => o.userId === userId);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading stored user orders:', err);
  }
  return [];
}

export function saveStoredUserOrder(order: UserOrder): UserOrder {
  const current = getStoredUserOrders();
  const updated = [order, ...current.filter((o) => o.id !== order.id)];
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ORDERS, JSON.stringify(updated));
    setDoc(doc(db, 'user_orders', order.id), sanitizeForFirestore(order), { merge: true }).catch((err) =>
      console.error('Firestore save order error:', err)
    );
    addAdminLog({
      action: 'ADD',
      target: 'STORE',
      title: `New Order Placed (#${order.id})`,
      details: `${order.userName} placed order for ${order.items.length} item(s) totaling ₹${order.totalAmount.toLocaleString()} via ${order.paymentMethod}.`,
    });
  } catch (err) {
    console.error('Error saving order:', err);
  }
  return order;
}

export function updateStoredUserOrder(order: UserOrder): UserOrder[] {
  const current = getStoredUserOrders();
  const updated = current.map((o) => (o.id === order.id ? order : o));
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ORDERS, JSON.stringify(updated));
    setDoc(doc(db, 'user_orders', order.id), sanitizeForFirestore(order), { merge: true }).catch((err) =>
      console.error('Firestore update order error:', err)
    );
    addAdminLog({
      action: 'UPDATE',
      target: 'STORE',
      title: `Order Updated (#${order.id})`,
      details: `Order #${order.id} status changed to '${order.orderStatus}'. Courier: ${order.courierPartner || 'N/A'}, AWB: ${order.trackingNumber || 'N/A'}.`,
    });
  } catch (err) {
    console.error('Error updating order:', err);
  }
  return updated;
}

// =========================================================================
// LEAD INQUIRIES & PROJECT PROPOSALS STORAGE
// =========================================================================

export const INITIAL_LEAD_INQUIRIES: LeadInquiry[] = [
  {
    id: 'lead-1001',
    source: 'project_modal',
    name: 'Pankaj Kushwaha',
    email: 'pankajkushwaha469.pk@gmail.com',
    phone: '+91 9904695383',
    company: 'Electroworld-the project maker',
    subject: 'Hardware & IoT Custom Project',
    projectCategory: 'connected_product',
    budgetRange: '₹50,000 - ₹1,50,000',
    timeline: '1 Month',
    description: 'Looking to develop a smart IoT connected controller with custom PCB, Wi-Fi telemetry, and web dashboard integration.',
    selectedModules: ['Custom PCB Hardware', 'Wi-Fi / BLE Wireless', 'Web Dashboard UI'],
    status: 'NEW',
    adminNotes: 'Direct project inquiry received via website.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'lead-1002',
    source: 'contact_form',
    name: 'Vikram Patel',
    email: 'vikram.p@electrochip.in',
    phone: '+91 98250 11223',
    company: 'ElectroChip Innovations',
    subject: 'Hardware Development',
    projectCategory: 'electronics_embedded',
    description: 'We need high-density 4-layer PCB design and MCU firmware support for our industrial automation sensor array.',
    status: 'IN_REVIEW',
    adminNotes: 'Assigned to Hardware R&D Lead for feasibility review.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

export function getStoredLeadInquiries(): LeadInquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAD_INQUIRIES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading lead inquiries:', err);
  }
  return INITIAL_LEAD_INQUIRIES;
}

export function saveStoredLeadInquiry(inquiryData: Partial<LeadInquiry> & { name: string; email: string; description: string }): LeadInquiry {
  const current = getStoredLeadInquiries();
  const id = inquiryData.id || `lead-${Date.now()}`;
  const newInquiry: LeadInquiry = {
    id,
    source: inquiryData.source || 'contact_form',
    name: inquiryData.name,
    email: inquiryData.email,
    phone: inquiryData.phone || '',
    company: inquiryData.company || '',
    subject: inquiryData.subject || 'Project Inquiry',
    projectCategory: inquiryData.projectCategory || 'connected_product',
    budgetRange: inquiryData.budgetRange || 'Not specified',
    timeline: inquiryData.timeline || 'Not specified',
    description: inquiryData.description,
    selectedModules: inquiryData.selectedModules || [],
    status: inquiryData.status || 'NEW',
    adminNotes: inquiryData.adminNotes || '',
    createdAt: inquiryData.createdAt || new Date().toISOString(),
  };

  const updated = [newInquiry, ...current.filter((i) => i.id !== id)];
  try {
    localStorage.setItem(STORAGE_KEYS.LEAD_INQUIRIES, JSON.stringify(updated));
    setDoc(doc(db, 'lead_inquiries', newInquiry.id), sanitizeForFirestore(newInquiry), { merge: true }).catch((err) =>
      console.error('Firestore save lead inquiry error:', err)
    );
    window.dispatchEvent(new Event('ohmveda_lead_inquiries_updated'));
    
    addAdminLog({
      action: 'ADD',
      target: 'BRANDING',
      title: `New Inquiry Received (#${newInquiry.id})`,
      details: `${newInquiry.name} (${newInquiry.email}) submitted a new inquiry via ${newInquiry.source.replace('_', ' ')}.`,
    });
  } catch (err) {
    console.error('Error saving lead inquiry:', err);
  }
  return newInquiry;
}

export function updateLeadInquiryStatus(id: string, status: LeadInquiry['status'], adminNotes?: string): LeadInquiry[] {
  const current = getStoredLeadInquiries();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
      };
    }
    return item;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.LEAD_INQUIRIES, JSON.stringify(updated));
    const targetItem = updated.find((i) => i.id === id);
    if (targetItem) {
      setDoc(doc(db, 'lead_inquiries', id), sanitizeForFirestore(targetItem), { merge: true }).catch((err) =>
        console.error('Firestore update lead inquiry error:', err)
      );
    }
    window.dispatchEvent(new Event('ohmveda_lead_inquiries_updated'));
  } catch (err) {
    console.error('Error updating lead inquiry:', err);
  }
  return updated;
}

export function deleteLeadInquiry(id: string): LeadInquiry[] {
  const current = getStoredLeadInquiries();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.LEAD_INQUIRIES, JSON.stringify(updated));
    deleteFirestoreDoc('lead_inquiries', id);
    window.dispatchEvent(new Event('ohmveda_lead_inquiries_updated'));
  } catch (err) {
    console.error('Error deleting lead inquiry:', err);
  }
  return updated;
}

