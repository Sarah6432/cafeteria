import { db } from "./firebase.js";
import { auth, signOut } from "./firebase.js";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


const container = document.getElementById("employeesContainer");

async function carregarFuncionarios() {
    try {
        const querySnapshot = await getDocs(collection(db, "funcionarios"));

        if (querySnapshot.empty) {
            container.innerHTML = "<p>Nenhum funcionário encontrado.</p>";
            return;
        }

        container.innerHTML = "";  
        querySnapshot.forEach((doc) => {
            const funcionario = doc.data();
            const card = criarCardFuncionario(funcionario, doc.id);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
        container.innerHTML = "<p>Erro ao carregar funcionários.</p>";
    }
}

function criarCardFuncionario(func, id) {
    const card = document.createElement('div');
    card.className = 'card-funcionario';
    card.innerHTML = `
        <div class="card-content">
            <h3>${func.nome}</h3>
            <p><strong>ID:</strong> ${func.id_funcionario}</p>
            <p><strong>Email:</strong> ${func.email}</p>
            <button class="edit-button" onclick="editarFuncionario('${id}')">Editar</button>
            <button class="delete-button" onclick="deletarFuncionario('${id}')">Excluir</button>
        </div>
    `;
    return card;
}


window.editarFuncionario = async function (id) {
    const snapshot = await getDocs(collection(db, "funcionarios"));
    let funcionarioSelecionado;

    snapshot.forEach(docSnap => {
        if (docSnap.id === id) {
            funcionarioSelecionado = docSnap.data();
        }
    });

    if (funcionarioSelecionado) {
        document.getElementById("employeeUid").value = id;
        document.getElementById("modalName").value = funcionarioSelecionado.nome;
        document.getElementById("modalId").value = funcionarioSelecionado.id_funcionario;
        document.getElementById("modalEmail").value = funcionarioSelecionado.email;

        document.getElementById("employeeModal").style.display = "block";
    }
};


document.getElementById("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("employeeUid").value;
    const nome = document.getElementById("modalName").value;
    const idFuncionario = document.getElementById("modalId").value;
    const email = document.getElementById("modalEmail").value;

    try {
        await updateDoc(doc(db, "funcionarios", id), {
            nome: nome,
            id_funcionario: idFuncionario,
            email: email
        });

        document.getElementById("employeeModal").style.display = "none";
        carregarFuncionarios();

    } catch (error) {
        console.error("Erro ao atualizar funcionário:", error);
    }
});


window.deletarFuncionario = async function (id) {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
        try {
            await deleteDoc(doc(db, "funcionarios", id));
            carregarFuncionarios();
        } catch (error) {
            console.error("Erro ao excluir funcionário:", error);
        }
    }
};

document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("employeeModal").style.display = "none";
});


document.addEventListener("DOMContentLoaded", () => {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.admin-section');

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionToShow = btn.getAttribute('data-section');

            sections.forEach(section => {
                section.style.display = 'none';
            });

            const selectedSection = document.getElementById(`section-${sectionToShow}`);
            if (selectedSection) {
                selectedSection.style.display = 'block';
            }
        });
    });

    carregarFuncionarios();

    document.getElementById("section-funcionarios").style.display = "block";
    document.getElementById("section-pratos").style.display = "none";

    
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
           
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Erro ao sair:", error);
            alert("Ocorreu um erro ao tentar sair. Tente novamente.");
        });
});
