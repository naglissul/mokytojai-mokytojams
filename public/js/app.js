// Firebase konfigūracija
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgr6yJwR8hSCyzP-YuSm7x0jyG6gauV48",
  authDomain: "mokytojai-mokytojams.firebaseapp.com",
  databaseURL:
    "https://mokytojai-mokytojams-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mokytojai-mokytojams",
  storageBucket: "mokytojai-mokytojams.firebasestorage.app",
  messagingSenderId: "1034426927970",
  appId: "1:1034426927970:web:19115cc4b4496dde123a3b",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Funkcija skaičiaus padidinimui (atsisiuntimams ir peržiūroms)
window.incrementCounter = function (id, field) {
  const fieldRef = ref(db, `counters/${id}/${field}`);
  runTransaction(fieldRef, (current) => (current || 0) + 1);
};

// Atnaujina DOM elementus su skaitliukų reikšmėmis
function updateDOM(id, field, value) {
  const el = document.getElementById(
    `${id}-${field === "downloads" ? 1 : 2}`
  );
  if (el) el.textContent = value;
}

// Klausosi skaitliukų reikšmių pasikeitimų
function listenToCounter(id) {
  const counterRef = ref(db, `counters/${id}`);
  onValue(counterRef, (snap) => {
    const data = snap.val();
    if (!data) return;
    if (data.downloads !== undefined)
      updateDOM(id, "downloads", data.downloads);
    if (data.views !== undefined) updateDOM(id, "views", data.views);
  });
}

// Inicializuoja skaitliuką, jei jis dar neegzistuoja
function initializeCounter(id) {
  const counterRef = ref(db, `counters/${id}`);
  get(counterRef).then((snap) => {
    if (!snap.exists()) {
      set(counterRef, { downloads: 0, views: 0 });
    }
  });
}

// Skaičiavimo API
export const countAPI = {
  init: function(ids) {
    if (!Array.isArray(ids)) return;
    ids.forEach((id) => {
      initializeCounter(id);
      listenToCounter(id);
    });
  },
  increment: incrementCounter
};

// Turinio rodymo funkcionalumas
export function setupContentToggle() {
  // Gauti dabartinį puslapį iš URL
  const currentPage = window.location.hash || "#konspektai";
  
  // Rodyti atitinkamą turinį
  showContent(currentPage.replace('#', ''));
  
  // Pridėti klausytojus navigacijos mygtukams
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const page = link.getAttribute('href').replace('#', '');
        history.pushState(null, null, `#${page}`);
        showContent(page);
      }
    });
  });
  
  // Hash pakeitimo klausytojas
  window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '') || 'konspektai';
    showContent(page);
  });
}

// Rodoma tik pasirinkto tipo turinys
function showContent(page) {
  console.log("Rodyti turinį:", page);
  
  // Nuimti active klasę nuo visų navigacijos elementų
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Aktyvuoti atitinkamą navigacijos elementą
  const activeLink = document.querySelector(`.nav-link[href="#${page}"]`) || 
                     document.querySelector(`.nav-link[href="${page}.html"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Paslėpti visus turinio blokus
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Parodyti tik reikiamą turinį
  const activeSection = document.getElementById(`${page}-section`);
  console.log("Ieškoma sekcija:", `${page}-section`, "Rasta:", activeSection);
  if (activeSection) {
    activeSection.style.display = 'block';
  }
  
  // Pakeisti puslapio pavadinimą
  document.title = `${page.charAt(0).toUpperCase() + page.slice(1)} - Mokytojai mokytojams`;
} 