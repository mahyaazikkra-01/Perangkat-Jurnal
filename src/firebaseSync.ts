import React from "react";
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';

export function syncCollection<T extends { id: string }>(
  collectionName: string,
  setState: React.Dispatch<React.SetStateAction<T[]>>,
  seedData?: T[]
) {
  const colRef = collection(db, collectionName);
  
  // Initialize with seed data if empty
  if (seedData) {
    getDocs(colRef).then(snapshot => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        seedData.forEach(item => {
          const docRef = doc(colRef, item.id);
          batch.set(docRef, item);
        });
        batch.commit();
      }
    });
  }

  return onSnapshot(colRef, (snapshot) => {
    const data: T[] = [];
    snapshot.forEach(doc => {
      data.push(doc.data() as T);
    });
    setState(data);
  });
}

export async function addDocument<T extends { id: string }>(collectionName: string, data: T) {
  const docRef = doc(db, collectionName, data.id);
  await setDoc(docRef, data);
}

export async function deleteDocument(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function updateDocument<T extends { id: string }>(collectionName: string, data: T) {
  const docRef = doc(db, collectionName, data.id);
  await setDoc(docRef, data, { merge: true });
}

export function syncConfig<T>(
  docName: string,
  setState: React.Dispatch<React.SetStateAction<T>>,
  defaultData: T
) {
  const docRef = doc(db, 'config', docName);
  
  getDocs(collection(db, 'config')).then(snapshot => {
    if (!snapshot.docs.find(d => d.id === docName)) {
      setDoc(docRef, defaultData as any);
    }
  });

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      setState(docSnap.data() as T);
    } else {
      setState(defaultData);
    }
  });
}

export async function saveConfig<T>(docName: string, data: T) {
  const docRef = doc(db, 'config', docName);
  await setDoc(docRef, data as any, { merge: true });
}
