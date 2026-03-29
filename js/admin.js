let AUTH_TOKEN = localStorage.getItem('adminToken') || '';

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
        const data = await response.json();
        
        document.getElementById('char-count').innerText = `(${data.length} total)`;
        
        const list = document.getElementById('character-list');
        list.innerHTML = '';
        
        data.reverse().forEach(char => {
            const div = document.createElement('div');
            div.className = 'char-item';
            div.innerHTML = `
                <div>
                    <img src="${char.imageUrl}" style="width:30px; border-radius:15px; vertical-align:middle; margin-right: 10px;">
                    <strong>${char.name}</strong> (${char.type})
                </div>
                <button class="btn-danger" style="width:auto; padding: 0.5rem" onclick="deleteChar('${char.name}')">❌ Deletar</button>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        document.getElementById('character-list').innerText = 'Erro ao carregar dados. O BD está online?';
    }
}

document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Salvando...';

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
        dotColor: document.getElementById('dotColor').value
    };

    try {
        const res = await fetch('/api/admin-characters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(charData)
        });
        
        if (!res.ok) {
            if (res.status === 401) {
                alert("Senha Administrativa Incorreta! Fazendo logout.");
                localStorage.removeItem('adminToken');
                location.reload();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Erro desconhecido');
            }
        } else {
            document.getElementById('feedback').innerText = '✅ Adicionado com sucesso!';
            document.getElementById('feedback').style.color = '#4caf50';
            e.target.reset(); // clear form
            loadCharacters(); // reload list
        }
    } catch (err) {
        document.getElementById('feedback').innerText = '❌ Erro: ' + err.message;
        document.getElementById('feedback').style.color = '#f44336';
    } finally {
        btn.disabled = false;
        btn.innerText = 'Cadastrar Personagem';
    }
});

async function deleteChar(name) {
    if(!confirm(`Tem certeza que quer deletar ${name}?`)) return;

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
            if(res.status === 401) {
                alert("Senha Inválida.");
                localStorage.removeItem('adminToken');
                location.reload();
            }
            throw new Error('Erro ao deletar');
        }

        loadCharacters(); // reload list
    } catch (err) {
        alert('Erro ao deletar: ' + err.message);
    }
}
