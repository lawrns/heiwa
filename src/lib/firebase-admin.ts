// Firebase Admin SDK for server-side operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './schemas';
import type { Client, SurfCamp, Room, AddOn, Booking } from './schemas';

// Helper function to convert Firestore document to typed object
export function docToData<T>(doc: QueryDocumentSnapshot<DocumentData>): T & { id: string } {
  return { id: doc.id, ...doc.data() } as T & { id: string };
}

// Client operations
export const clientsAPI = {
  async getAll(): Promise<(Client & { id: string })[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CLIENTS));
    return querySnapshot.docs.map(doc => docToData<Client>(doc));
  },

  async getById(id: string): Promise<(Client & { id: string }) | null> {
    const docRef = doc(db, COLLECTIONS.CLIENTS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Client & { id: string } : null;
  },

  async create(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.CLIENTS), {
      ...clientData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CLIENTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CLIENTS, id);
    await deleteDoc(docRef);
  },

  async findByEmail(email: string): Promise<(Client & { id: string }) | null> {
    const q = query(collection(db, COLLECTIONS.CLIENTS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : docToData<Client>(querySnapshot.docs[0]);
  },
};

// Surf Camps operations
export const surfCampsAPI = {
  async getAll(): Promise<(SurfCamp & { id: string })[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.SURF_CAMPS), orderBy('startDate', 'desc'))
    );
    return querySnapshot.docs.map(doc => docToData<SurfCamp>(doc));
  },

  async getById(id: string): Promise<(SurfCamp & { id: string }) | null> {
    const docRef = doc(db, COLLECTIONS.SURF_CAMPS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as SurfCamp & { id: string } : null;
  },

  async getByCategory(category: 'FR' | 'HH'): Promise<(SurfCamp & { id: string })[]> {
    const q = query(
      collection(db, COLLECTIONS.SURF_CAMPS),
      where('category', '==', category),
      orderBy('startDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToData<SurfCamp>(doc));
  },

  async create(campData: Omit<SurfCamp, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.SURF_CAMPS), {
      ...campData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Omit<SurfCamp, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SURF_CAMPS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SURF_CAMPS, id);
    await deleteDoc(docRef);
  },
};

// Rooms operations
export const roomsAPI = {
  async getAll(): Promise<(Room & { id: string })[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ROOMS));
    return querySnapshot.docs.map(doc => docToData<Room>(doc));
  },

  async getById(id: string): Promise<(Room & { id: string }) | null> {
    const docRef = doc(db, COLLECTIONS.ROOMS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Room & { id: string } : null;
  },

  async create(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.ROOMS), {
      ...roomData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Omit<Room, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ROOMS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ROOMS, id);
    await deleteDoc(docRef);
  },
};

// Add-ons operations
export const addOnsAPI = {
  async getAll(): Promise<(AddOn & { id: string })[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ADD_ONS));
    return querySnapshot.docs.map(doc => docToData<AddOn>(doc));
  },

  async getById(id: string): Promise<(AddOn & { id: string }) | null> {
    const docRef = doc(db, COLLECTIONS.ADD_ONS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as AddOn & { id: string } : null;
  },

  async create(addOnData: Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.ADD_ONS), {
      ...addOnData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Omit<AddOn, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ADD_ONS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ADD_ONS, id);
    await deleteDoc(docRef);
  },
};

// Bookings operations
export const bookingsAPI = {
  async getAll(): Promise<(Booking & { id: string })[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => docToData<Booking>(doc));
  },

  async getById(id: string): Promise<(Booking & { id: string }) | null> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Booking & { id: string } : null;
  },

  async getByClientId(clientId: string): Promise<(Booking & { id: string })[]> {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('clientIds', 'array-contains', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToData<Booking>(doc));
  },

  async getByStatus(status: 'pending' | 'confirmed' | 'cancelled'): Promise<(Booking & { id: string })[]> {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('paymentStatus', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToData<Booking>(doc));
  },

  async create(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), {
      ...bookingData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Omit<Booking, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, id);
    await deleteDoc(docRef);
  },
};
