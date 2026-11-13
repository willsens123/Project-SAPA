import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db } from './config';
import { KaryawanItem } from '../types';
import { INITIAL_KARYAWAN, clearLegacyAuthLocalStorage } from '../karyawanData';

const MEMBER_ACCOUNTS_COLLECTION = 'erp_state';
const MEMBER_ACCOUNTS_DOC_ID = 'member_accounts';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface MemberAccountsCloudDoc {
  id: string;
  updatedAt: string;
  items: KaryawanItem[];
}

const AVATAR_COLORS = [
  'bg-[#14b8a6]',
  'bg-[#008d91]',
  'bg-[#2563eb]',
  'bg-[#eab308]',
  'bg-[#ea580c]',
  'bg-[#9333ea]',
  'bg-[#64748b]',
];

function normalizeAccountRecord(item: KaryawanItem, idx: number): KaryawanItem {
  const fallback = INITIAL_KARYAWAN.find((init) => init.id === item.id);
  const fullName = (item.namaLengkap || 'Anggota').trim();
  return {
    ...item,
    namaLengkap: fullName,
    namaPanggilan: item.namaPanggilan?.trim() || fullName.split(' ')[0],
    divisi: (item.divisi || 'UMM').trim().toUpperCase(),
    emailLogin: (item.emailLogin || '').trim(),
    password: item.password || '',
    avatarInitial: (item.avatarInitial || fullName.charAt(0) || 'A').toUpperCase(),
    avatarBg: item.avatarBg || fallback?.avatarBg || AVATAR_COLORS[idx % AVATAR_COLORS.length],
    tanggalBergabung:
      item.tanggalBergabung || fallback?.tanggalBergabung || `01/01/202${(idx % 3) + 1}`,
    ...(item.tanggalBerhenti ? { tanggalBerhenti: item.tanggalBerhenti } : {}),
    aktif: item.aktif !== undefined ? item.aktif : item.tanggalBerhenti ? false : true,
  };
}

/**
 * Subscribe to member accounts directly from Cloud Firestore.
 * NEVER stores credentials or accounts in localStorage.
 */
export function subscribeToMemberAccounts(
  onUpdate: (accounts: KaryawanItem[]) => void,
  onReady?: () => void,
  onError?: (errMessage: string) => void
): Unsubscribe {
  clearLegacyAuthLocalStorage();
  const path = `${MEMBER_ACCOUNTS_COLLECTION}/${MEMBER_ACCOUNTS_DOC_ID}`;
  const docRef = doc(db, MEMBER_ACCOUNTS_COLLECTION, MEMBER_ACCOUNTS_DOC_ID);
  let seededOnce = false;

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as MemberAccountsCloudDoc;
        if (Array.isArray(data?.items)) {
          const normalized = data.items.map((item, idx) => normalizeAccountRecord(item, idx));
          onUpdate(normalized);
          onReady?.();
          return;
        }
      }

      if (!seededOnce) {
        seededOnce = true;
        try {
          const payload: MemberAccountsCloudDoc = {
            id: MEMBER_ACCOUNTS_DOC_ID,
            updatedAt: new Date().toISOString(),
            items: INITIAL_KARYAWAN,
          };
          await setDoc(docRef, payload);
          onUpdate(INITIAL_KARYAWAN);
          onReady?.();
        } catch (err) {
          onUpdate(INITIAL_KARYAWAN);
          onReady?.();
          onError?.(err instanceof Error ? err.message : 'Gagal memuat data akun dari Firestore');
          try {
            handleFirestoreError(err, OperationType.WRITE, path);
          } catch {
            // Logged structured error; keep UI operational with initial in-memory seed
          }
        }
      }
    },
    (error) => {
      onError?.(error.message || 'Gagal menyinkronkan akun anggota dari Firestore');
      onReady?.();
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Logged structured FirestoreErrorInfo
      }
    }
  );
}

/**
 * Save entire member accounts list directly to Cloud Firestore (no localStorage).
 */
export async function saveMemberAccountsToFirestore(accounts: KaryawanItem[]): Promise<void> {
  clearLegacyAuthLocalStorage();
  const path = `${MEMBER_ACCOUNTS_COLLECTION}/${MEMBER_ACCOUNTS_DOC_ID}`;
  const docRef = doc(db, MEMBER_ACCOUNTS_COLLECTION, MEMBER_ACCOUNTS_DOC_ID);
  const sanitized = accounts.map((item, idx) => normalizeAccountRecord(item, idx));

  const payload: MemberAccountsCloudDoc = {
    id: MEMBER_ACCOUNTS_DOC_ID,
    updatedAt: new Date().toISOString(),
    items: sanitized,
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface RegisterMemberInput {
  namaLengkap: string;
  namaPanggilan?: string;
  namaAkun: string;
  divisi: string;
  password: string;
}

/**
 * Register a new member account into Cloud Firestore and return the created account + updated list.
 */
export async function registerMemberAccountInFirestore(
  input: RegisterMemberInput,
  currentAccounts: KaryawanItem[]
): Promise<{ created: KaryawanItem; updatedList: KaryawanItem[] }> {
  const path = `${MEMBER_ACCOUNTS_COLLECTION}/${MEMBER_ACCOUNTS_DOC_ID}`;
  const docRef = doc(db, MEMBER_ACCOUNTS_COLLECTION, MEMBER_ACCOUNTS_DOC_ID);

  // Fetch latest list from Firestore to avoid race-condition overwrites across devices
  let latestList = currentAccounts;
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as MemberAccountsCloudDoc;
      if (Array.isArray(data?.items) && data.items.length > 0) {
        latestList = data.items;
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  const trimmedAccount = input.namaAkun.trim();
  const accountLower = trimmedAccount.toLowerCase();

  const duplicate = latestList.find(
    (acc) => (acc.emailLogin || '').trim().toLowerCase() === accountLower
  );
  if (duplicate) {
    throw new Error(`Nama akun "${trimmedAccount}" sudah terdaftar. Silakan gunakan nama akun lain atau langsung login.`);
  }

  // Generate sequential member code (e.g. 00032)
  const numericCodes = latestList
    .map((k) => parseInt(String(k.kodeKaryawan || '0').replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n) && n > 0);
  const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 31;
  const nextCode = String(maxCode + 1).padStart(5, '0');

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  const fullName = input.namaLengkap.trim();
  const nickname = input.namaPanggilan?.trim() || fullName.split(' ')[0];

  const newAccount: KaryawanItem = {
    id: `karyawan-${Date.now()}`,
    kodeKaryawan: nextCode,
    namaLengkap: fullName,
    namaPanggilan: nickname,
    divisi: (input.divisi || 'UMM').trim().toUpperCase(),
    emailLogin: trimmedAccount,
    password: input.password,
    avatarInitial: fullName.charAt(0).toUpperCase() || 'A',
    avatarBg: AVATAR_COLORS[latestList.length % AVATAR_COLORS.length],
    aktif: true,
    tanggalBergabung: `${dd}/${mm}/${yyyy}`,
  };

  const updatedList = [newAccount, ...latestList];
  await saveMemberAccountsToFirestore(updatedList);

  return { created: newAccount, updatedList };
}
