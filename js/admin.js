let AUTH_TOKEN = localStorage.getItem('adminToken') || '';
let isEditMode = false;
let globalCharacters = [];

document.addEventListener('DOMContentLoaded', () => {
    if (AUTH_TOKEN) {
        showAdmin();
    } else {
        document.getElementById('auth-section').style.display = 'block';
    }
});

function login() {
    const pwd = document.getElementById('admin-secret').value;
    if (pwd) {
        AUTH_TOKEN = pwd;
        localStorage.setItem('adminToken', AUTH_TOKEN);
        showAdmin();
    }
}

function showAdmin() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
    loadCharacters();
}

async function loadCharacters() {
    try {
        const response = await fetch('/api/characters');
        if (!response.ok) throw new Error('Falha ao carregar');
        globalCharacters = await response.json();

        document.getElementById('char-count').innerText = `${globalCharacters.length}`;

        const list = document.getElementById('character-list');
        list.innerHTML = '';

        // Reverse so newest additions appear usually at the top/bottom depending on DB insertion
        const sorted = [...globalCharacters].reverse();

        sorted.forEach(char => {
            const div = document.createElement('div');
            div.className = 'char-card';
            div.innerHTML = `
                <div class="char-header">
                    <img src="${char.imageUrl}" class="char-avatar" alt="${char.name}" onerror="this.src='https://via.placeholder.com/50?text=IMG'">
                    <div class="char-info">
                        <h3>${char.name}</h3>
                        <p>⭐ ${char.type} | 🐎 ${char.distance}</p>
                    </div>
                </div>
                <div class="char-actions">
                    <button class="btn-edit" onclick="startEdit('${char.name.replace(/'/g, "\\'")}')">✏️ Editar</button>
                    <button class="btn-danger" onclick="deleteChar('${char.name.replace(/'/g, "\\'")}')">❌</button>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        document.getElementById('character-list').innerHTML = '<div style="color:#f87171; grid-column:1/-1; padding:2rem; text-align:center;">Erro ao carregar do Turso. Você rodou a Vercel direito?</div>';
    }
}

function startEdit(name) {
    const char = globalCharacters.find(c => c.name === name);
    if (!char) return;

    isEditMode = true;
    document.getElementById('originalName').value = char.name;
    document.getElementById('name').value = char.name;
    document.getElementById('imageUrl').value = char.imageUrl;
    document.getElementById('type').value = char.type;
    document.getElementById('distance').value = char.distance.replace(/,/g, ' /');
    document.getElementById('style').value = char.style.replace(/,/g, ' /');
    document.getElementById('height').value = char.height;
    document.getElementById('g1Wins').value = char.g1Wins;
    document.getElementById('birthYear').value = char.birthYear;
    document.getElementById('releaseYear').value = char.releaseYear;
    document.getElementById('dotColor').value = char.dotColor;

    document.getElementById('submit-btn').innerHTML = '💾 Salvar Alterações';
    document.getElementById('submit-btn').style.background = '#f59e0b'; // Amber
    document.getElementById('cancel-btn').style.display = 'block';

    document.getElementById('edit-mode-badge').style.display = 'inline-block';

    // Smooth scroll to top form
    document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    isEditMode = false;
    document.getElementById('originalName').value = '';
    document.getElementById('add-form').reset();

    document.getElementById('submit-btn').innerHTML = '✨ Adicionar ao Jogo';
    document.getElementById('submit-btn').style.background = '#4caf50';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('edit-mode-badge').style.display = 'none';
    showFeedback('', '');
}

function showFeedback(msg, color) {
    const fb = document.getElementById('feedback');
    fb.innerText = msg;
    fb.style.color = color;
}

document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerText = '⏳ Processando...';

    const charData = {
        name: document.getElementById('name').value,
        imageUrl: document.getElementById('imageUrl').value,
        type: document.getElementById('type').value,
        distance: document.getElementById('distance').value,
        style: document.getElementById('style').value,
        height: parseInt(document.getElementById('height').value),
        g1Wins: parseInt(document.getElementById('g1Wins').value),
        birthYear: parseInt(document.getElementById('birthYear').value),
        releaseYear: parseInt(document.getElementById('releaseYear').value),
        dotColor: document.getElementById('dotColor').value,
        originalName: document.getElementById('originalName').value // Utilizado apenas no PUT
    };

    const method = isEditMode ? 'PUT' : 'POST';

    try {
        const res = await fetch('/api/admin-characters', {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(charData)
        });

        if (!res.ok) {
            if (res.status === 401) {
                alert("Sessão Expirada ou Sem Acesso.");
                localStorage.removeItem('adminToken');
                location.reload();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Erro no banco');
            }
        } else {
            showFeedback(isEditMode ? '✅ Alterações Salvas!' : '✨ Personagem Adicionada!', '#4caf50');
            cancelEdit();
            loadCharacters();

            setTimeout(() => { showFeedback('', ''); }, 3000);
        }
    } catch (err) {
        showFeedback('❌ Erro: ' + err.message, '#f87171');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

async function deleteChar(name) {
    if (!confirm(`Excluir as informações da ${name}?`)) return;

    try {
        const res = await fetch('/api/admin-characters', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({ name })
        });

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                location.reload();
            }
            throw new Error('Falha ao deletar do Turso');
        }
        loadCharacters();
    } catch (err) {
        alert('Erro: ' + err.message);
    }
}
