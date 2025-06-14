// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration for elba-d9541 project (Web)
const firebaseConfig = {
    apiKey: "AIzaSyDlsTcPWc_n4W5hirj2KIah9I7L4JbVg7M",
    authDomain: "elba-d9541.firebaseapp.com",
    databaseURL: "https://elba-d9541-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "elba-d9541",
    storageBucket: "elba-d9541.firebasestorage.app",
    messagingSenderId: "291812609091",
    appId: "1:291812609091:web:73fb9d9e13fd00282958f6",
    measurementId: "G-MK16J10J8Y"
};

// Initialize Firebase
let app, database;
let currentStatus = false;

// DOM elements - declare first
const statusEl = document.getElementById('status');
const controlsEl = document.getElementById('controls');
const showBtn = document.getElementById('showBtn');
const hideBtn = document.getElementById('hideBtn');
const messageEl = document.getElementById('message');
const logoutBtn = document.getElementById('logoutBtn');

// Проверяем авторизацию при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupLogout();
});

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        
        if (!data.isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        
        // Если авторизован, инициализируем Firebase
        initializeFirebaseConnection();
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
    }
}

function initializeFirebaseConnection() {
    try {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
        initializeFirebaseApp();
    } catch (error) {
        showError("Firebase configuration error. Please check your config.");
        console.error("Firebase error:", error);
    }
}

function initializeFirebaseApp() {
    // Listen to button visibility changes
    const buttonVisibilityRef = ref(database, 'isButtonVisible');

    onValue(buttonVisibilityRef, (snapshot) => {
        const isVisible = snapshot.val() || false;
        currentStatus = isVisible;
        updateStatus(isVisible);
        controlsEl.style.display = 'block';
    }, (error) => {
        showError("Failed to connect to server. Check your connection.");
        console.error("Connection read error:", error);
    });

    // Add button event listeners
    showBtn.addEventListener('click', () => setButtonVisibility(true));
    hideBtn.addEventListener('click', () => setButtonVisibility(false));
}

function updateStatus(isVisible) {
    statusEl.innerHTML = isVisible
        ? '✅ Button is Visible'
        : '❌ Button is Hidden';

    statusEl.className = `status ${isVisible ? 'visible' : 'hidden'}`;

    // Update button states
    showBtn.disabled = isVisible;
    hideBtn.disabled = !isVisible;
}

async function setButtonVisibility(isVisible) {
    try {
        // Disable buttons during operation
        showBtn.disabled = true;
        hideBtn.disabled = true;

        // Show loading state
        statusEl.innerHTML = '⏳ Updating...';
        statusEl.className = 'status loading';

        // Update Firebase
        await set(ref(database, 'isButtonVisible'), isVisible);

        // Show success message
        showSuccess(`Button ${isVisible ? 'shown' : 'hidden'} successfully!`);

    } catch (error) {
        showError("Failed to update button visibility");
        console.error("Server write error:", error);

        // Re-enable buttons
        showBtn.disabled = currentStatus;
        hideBtn.disabled = !currentStatus;
        updateStatus(currentStatus);
    }
}

function showError(message) {
    messageEl.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    setTimeout(() => messageEl.innerHTML = '', 5000);
}

function showSuccess(message) {
    messageEl.innerHTML = `<div class="success-message">✅ ${message}</div>`;
    setTimeout(() => messageEl.innerHTML = '', 3000);
}

// Setup logout functionality
function setupLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    window.location.href = '/login';
                } else {
                    showError('Ошибка при выходе из системы');
                }
            } catch (error) {
                console.error('Logout error:', error);
                showError('Ошибка подключения к серверу');
            }
        });
    }
}

// Handle connection errors
window.addEventListener('online', () => {
    showSuccess('Connection restored');
});

window.addEventListener('offline', () => {
    showError('No internet connection');
});