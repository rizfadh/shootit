import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAL47yzy8Y7peWw6QipfIv9V5j-2_mFfEg",
  authDomain: "test-730a6.firebaseapp.com",
  projectId: "test-730a6",
  storageBucket: "test-730a6.appspot.com",
  messagingSenderId: "451780457848",
  appId: "1:451780457848:web:a282dfd64d06eea6e9c48d",
  measurementId: "G-DEDZBEHG7S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const collRef = collection(db, 'highscore');
const q = query(collRef, orderBy('score', 'desc'));

const getHighScore = async () => {
  const snapshot = await getDocs(q);
  const highscore = (snapshot.docs.map(doc => {
    return { id: doc.id, ...doc.data() };
  }));
  return highscore;
};

const addHighScore = async (name, score) => {
  await addDoc(collRef, { name, score, createdAt: serverTimestamp() });
};

export {
  getHighScore,
  addHighScore
};