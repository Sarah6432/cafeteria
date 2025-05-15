import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';


jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn((auth, callback) => {
      // Simula o comportamento real que chama a callback imediatamente
      callback(null); // Inicialmente nenhum usuário logado
      return jest.fn(); // Retorna a função unsubscribe
    }),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  })),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// 2. Mock do firebase.js
jest.mock("../firebase.js", () => {
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
  };
  
  return {
    auth: mockAuth,
  };
});

// 3. Mock do sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    clear: jest.fn(() => { store = {}; }),
    removeItem: jest.fn((key) => { delete store[key]; })
  };
})();

// 4. Mock do window.location
const mockWindowLocation = (() => {
  let location = new URL('http://localhost');
  return {
    get href() { return location.href; },
    set href(value) { location = new URL(value); },
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };
})();

// Configuração antes de cada teste
beforeEach(() => {
  // Resetar todos os mocks
  jest.clearAllMocks();
  window.sessionStorage.clear();
  
  // Configurar o DOM
  document.body.innerHTML = `
    <form id="loginForm">
      <label>
        Email:
        <input id="email" type="email" />
      </label>
      <label>
        Senha:
        <input id="password" type="password" />
      </label>
      <button type="submit">Login</button>
      <button id="adminLoginBtn" type="button">Admin Login</button>
      <div id="loading" style="display: none;"></div>
    </form>
  `;

  // Mock do window.location
  delete window.location;
  window.location = mockWindowLocation;

  // Mock do window.alert
  window.alert = jest.fn();

  // Carrega o script de login
  require('../login.js');
});


describe('Login Form', () => {
  const ADMIN_CREDENTIALS = {
    email: 'admin@ex.com',
    password: 'admin123',
    redirectPage: 'admin-dashboard.html',
  };

  test('redireciona admin corretamente sem chamar Firebase', async () => {
    // Preencher credenciais de admin
    document.getElementById('email').value = ADMIN_CREDENTIALS.email;
    document.getElementById('password').value = ADMIN_CREDENTIALS.password;
    
    // Disparar submit
    fireEvent.submit(document.getElementById('loginForm'));

    // Verificar se NÃO chamou o Firebase
    expect(require('firebase/auth').signInWithEmailAndPassword).not.toHaveBeenCalled();
    
    // Verificar sessionStorage
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('isAdmin', 'true');
    
    // Verificar redirecionamento
    expect(window.location.href).toBe(ADMIN_CREDENTIALS.redirectPage);
  });

});

describe('Auth State Observer', () => {
  test('chama onAuthStateChanged no carregamento', () => {
    const auth = require('../firebase.js').auth;
    expect(auth.onAuthStateChanged).toHaveBeenCalled();
  });

  test('redireciona usuário logado para cardapio', async () => {
    const auth = require('../firebase.js').auth;
    
    const mockUser = { uid: 'user123' };
    const callback = auth.onAuthStateChanged.mock.calls[0][0];
    callback(mockUser);
    
    // Verificar redirecionamento
    expect(window.location.href).toBe('cardapio.html');
  });
});