import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBH7TLYmt4zmLRZUDi1JsvZBVkdyd5tMuo",
    authDomain: "cafeteria-e2deb.firebaseapp.com",
    projectId: "cafeteria-e2deb",
    storageBucket: "cafeteria-e2deb.appspot.com",
    messagingSenderId: "782094081343",
    appId: "1:782094081343:web:8710947f6e7617c7bc078a"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

 
    const name = document.getElementById('name').value.trim();
    const idFuncionario = document.getElementById('id_funcionario').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;


    if (!name || !idFuncionario || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    try {
     
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;


        await setDoc(doc(db, "funcionarios", user.uid), {
            nome: name,
            id_funcionario: Number(idFuncionario), 
            email: email,
            uid: user.uid, 
            data_cadastro: new Date(),
            tipo_acesso: "funcionario", 
            ativo: true 
        });

        alert('Cadastro realizado com sucesso!\nVocê será redirecionado para o login.');
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Erro no cadastro:", error);
        let errorMessage = 'Erro ao cadastrar. Tente novamente.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este e-mail já está em uso.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'E-mail inválido.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Senha muito fraca (mínimo 6 caracteres).';
                break;
            case 'permission-denied':
                errorMessage = 'Você não tem permissão para realizar esta ação.';
                break;
        }

        alert(errorMessage);
    }
});