import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";


const ADMIN_CREDENTIALS = {
    email: "admin@aromas.com",
    password: "senhaAdmin123",
    redirectPage: "admin-dashboard.html"
};


const loginForm = document.getElementById('loginForm');
const loading = document.getElementById('loading');
const adminLoginBtn = document.getElementById('adminLoginBtn');


if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('email').value = ADMIN_CREDENTIALS.email;
        document.getElementById('password').value = ADMIN_CREDENTIALS.password;
        loginForm.dispatchEvent(new Event('submit'));
    });
}


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loading.style.display = 'flex';

    try {
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem('isAdmin', 'true');
            window.location.href = ADMIN_CREDENTIALS.redirectPage;
            return;
        }

        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'cardapio.html';
    } catch (error) {
        let errorMessage = 'Erro ao fazer login.';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'E-mail inválido.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'E-mail ou senha incorretos.';
                break;
        }

        alert(errorMessage);
    } finally {
        loading.style.display = 'none';
    }
});

const forceLogin = true; // ou defina com base na página atual

if (!forceLogin) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (sessionStorage.getItem('isAdmin') === 'true') {
                window.location.href = ADMIN_CREDENTIALS.redirectPage;
            } else {
                window.location.href = 'cardapio.html';
            }
        }
    });
}

