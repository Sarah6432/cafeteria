import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Referência para a coleção de comentários
const comentariosRef = collection(db, "comentarios");

// Função para enviar comentário
export async function enviarComentario(event) {
    event.preventDefault();
    
    const form = event.target;
    const dados = {
        nome: form.nome.value,
        comentario: form.comentario.value,
        avaliacao: form.avaliacao.value,
        data: new Date().toISOString()
    };

    try {
        await addDoc(comentariosRef, dados);
        form.reset();
        await carregarComentarios();
        alert('Obrigado pelo seu comentário!');
    } catch (error) {
        console.error("Erro ao enviar:", error);
        alert('Erro ao enviar comentário');
    }
}

// Função para carregar comentários
export async function carregarComentarios() {
    const container = document.getElementById('lista-comentarios');
    container.innerHTML = '<h3>Comentários dos Clientes</h3>';

    try {
        const q = query(comentariosRef, orderBy('data', 'desc'));
        const snapshot = await getDocs(q);

        snapshot.forEach(doc => {
            const comentario = doc.data();
            container.innerHTML += `
                <div class="comentario-item">
                    <div class="comentario-cabecalho">
                        <strong>${comentario.nome}</strong>
                        <span class="avaliacao">${'⭐'.repeat(comentario.avaliacao)}</span>
                        <span class="data">${new Date(comentario.data).toLocaleString('pt-BR')}</span>
                    </div>
                    <p>${comentario.comentario}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-comentario');
    if (form) {
        form.addEventListener('submit', enviarComentario);
        carregarComentarios();
    }
});