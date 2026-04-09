const API_URL = 'https://stunning-spoon-7vqw9rrg47962jvp-8000.app.github.dev';

// --- CADASTRO ---
async function registrar() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!name || !email || !password) {
        Swal.fire('Ops!', 'Preencha todos os campos', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Cadastro realizado!',
                confirmButtonColor: '#3a7bd5'
            }).then(() => { window.location.href = 'index.html'; });
        } else {
            const erro = await response.json();
            Swal.fire('Erro', erro.detail || 'Falha no cadastro', 'error');
        }
    } catch (e) {
        Swal.fire('Erro', 'Falha na conexão com o servidor', 'error');
    }
}

// --- LOGIN ---
async function fazerLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            window.location.href = 'tasks.html';
        } else {
            Swal.fire('Falha no Login', 'E-mail ou senha incorretos', 'error');
        }
    } catch (e) {
        Swal.fire('Erro', 'Servidor offline', 'error');
    }
}

// --- BUSCAR TAREFAS ---
async function buscarTarefas() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const lista = document.getElementById('lista-tarefas');
            if (!lista) return;

            lista.innerHTML = '';
            const tarefas = data.tasks || []; 

            if (tarefas.length === 0) {
                lista.innerHTML = '<p style="text-align:center; color:#888;">Nenhuma tarefa encontrada.</p>';
                return;
            }

            tarefas.forEach(t => {
                lista.innerHTML += `
                    <div class="task-item">
                        <span class="task-text ${t.completed ? 'completed' : ''}">${t.title}</span>
                        <button class="btn-delete" onclick="deletarTarefa(${t.id})"><i class="fas fa-trash-alt"></i>
                    </div>`;
            });
        }
    } catch (e) {
        console.error("Erro ao buscar:", e);
    }
}

// --- CRIAR TAREFA ---
async function criarTarefa() {
    const input = document.getElementById('task-title');
    const title = input.value;
    const token = localStorage.getItem('token');

    if (!title) return;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ title: title, completed: false })
        });

        if (response.ok) {
            input.value = '';
            buscarTarefas();
        }
    } catch (e) {
        console.error("Erro ao criar:", e);
    }
}

// --- DELETAR TAREFA ---
async function deletarTarefa(id) {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        buscarTarefas();
    } catch (e) {
        console.error("Erro ao deletar:", e);
    }
}

// --- LOGOUT ---
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}