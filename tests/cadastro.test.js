import { initializeTestApp, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { getApps, deleteApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

let db;

describe('Cadastro de Funcionários', () => {
    beforeAll(async () => {
        const apps = getApps();
        for (const app of apps) {
            await deleteApp(app);
        }

        const testApp = initializeTestApp({
            projectId: "cafeteria-e2deb",
            auth: { uid: "test-user" },
        });

        db = getFirestore(testApp);
        connectFirestoreEmulator(db, 'localhost', 8080);  // Configura o emulador
    });

    afterAll(async () => {
        const apps = getApps();
        for (const app of apps) {
            await deleteApp(app);
        }
    });

    test('Deve criar um novo usuário e adicionar no Firestore', async () => {
        const userData = {
            nome: "João Silva",
            email: "joao@example.com",
            cargo: "Atendente"
        };

        const userRef = db.collection('usuarios').doc();
        await assertSucceeds(userRef.set(userData));

        const savedUser = await userRef.get();
        expect(savedUser.exists).toBe(true);
        expect(savedUser.data()).toEqual(userData);
    });

    test('Deve falhar ao tentar criar um usuário com e-mail já registrado', async () => {
        const userData = {
            nome: "Maria Souza",
            email: "maria@example.com",
            cargo: "Gerente"
        };

        const userRef1 = db.collection('usuarios').doc();
        await assertSucceeds(userRef1.set(userData));

        const userRef2 = db.collection('usuarios').doc();
        try {
            await userRef2.set(userData);
            throw new Error("Cadastro duplicado não detectado");
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });
});

