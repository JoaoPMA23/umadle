let AUTH_TOKEN = localStorage.getItem('adminToken') || '';
let isEditMode = false;
let globalCharacters = [];

// Custom Dropdown Logic
class CustomSelect {
    constructor(id) {
        this.id = id;
        this.box = document.getElementById(id + '-box');
        this.menu = document.getElementById(id + '-menu');
        this.tagsContainer = document.getElementById(id + '-tags');
        this.hiddenInput = document.getElementById(id);
        this.options = Array.from(this.menu.querySelectorAll('.option'));
        this.selected = [];

        this.box.addEventListener('click', (e) => {
            if (!e.target.closest('.tag-remove')) {
                this.menu.classList.toggle('show');
            }
        });

        this.options.forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.getAttribute('data-val');
                this.toggleValue(val);
            });
        });

        document.addEventListener('click', (e) => {
            if (!this.box.contains(e.target) && !this.menu.contains(e.target)) {
                this.menu.classList.remove('show');
            }
        });
    }

    toggleValue(val) {
        if (this.selected.includes(val)) {
            this.selected = this.selected.filter(v => v !== val);
        } else {
            this.selected.push(val);
        }
        this.updateUI();
    }

    removeValue(val) {
        this.selected = this.selected.filter(v => v !== val);
        this.updateUI();
    }

    setValueFromString(str) {
        if (!str) {
            this.selected = [];
        } else {
            this.selected = str.split(/[\/,]+/).map(s => s.trim()).filter(Boolean);
        }
        this.updateUI();
    }

    updateUI() {
        this.hiddenInput.value = this.selected.join(' / ');

        if (this.selected.length === 0) {
            this.tagsContainer.innerHTML = '<span class="placeholder">Selecione...</span>';
        } else {
            this.tagsContainer.innerHTML = this.selected.map(val =>
                `<span class="tag">${val} <span class="tag-remove" onclick="window.${this.id}Select.removeValue('${val}'); event.stopPropagation();">×</span></span>`
            ).join('');
        }

        this.options.forEach(opt => {
            if (this.selected.includes(opt.getAttribute('data-val'))) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa Dropdowns 
    window.typeSelect = new CustomSelect('type');
    window.distanceSelect = new CustomSelect('distance');
    window.styleSelect = new CustomSelect('style');

    // Inicializa Abas
    initTabs();

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
                    <button class="btn-edit" onclick="startEdit('${char.name.replace(/'/g, "\\\'")}')">✏️ Editar</button>
                    <button class="btn-danger" onclick="deleteChar('${char.name.replace(/'/g, "\\\'")}')">❌</button>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        document.getElementById('character-list').innerHTML = '<div style="color:#f87171; grid-column:1/-1; padding:2rem; text-align:center;">Erro ao carregar do Turso.</div>';
    }
}

function startEdit(name) {
    const char = globalCharacters.find(c => c.name === name);
    if (!char) return;

    isEditMode = true;
    document.getElementById('originalName').value = char.name;
    document.getElementById('name').value = char.name;
    document.getElementById('imageUrl').value = char.imageUrl;
    window.typeSelect.setValueFromString(char.type);
    window.distanceSelect.setValueFromString(char.distance);
    window.styleSelect.setValueFromString(char.style);
    document.getElementById('height').value = char.height;
    document.getElementById('g1Wins').value = char.g1Wins;
    document.getElementById('birthYear').value = char.birthYear;
    document.getElementById('releaseYear').value = char.releaseYear;
    document.getElementById('dotColor').value = char.dotColor;

    document.getElementById('submit-btn').innerHTML = '💾 Salvar Alterações';
    document.getElementById('submit-btn').style.background = '#f59e0b';
    document.getElementById('cancel-btn').style.display = 'block';
    document.getElementById('edit-mode-badge').style.display = 'inline-block';
    document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    isEditMode = false;
    document.getElementById('originalName').value = '';
    document.getElementById('add-form').reset();
    window.typeSelect.setValueFromString('');
    window.distanceSelect.setValueFromString('');
    window.styleSelect.setValueFromString('');

    document.getElementById('submit-btn').innerHTML = '✨ Adicionar Personagem';
    document.getElementById('submit-btn').style.background = '#10b981';
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
        originalName: document.getElementById('originalName').value
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

// ══════════════════════════════════════════
// SISTEMA DE ABAS E CRUD GENÉRICO DE MODOS
// ══════════════════════════════════════════

let currentTab = 'characters';
const modeEditState = {};

const MODE_CONFIG = {
    emojis: {
        prefix: 'emoji',
        formId: 'emoji-form',
        identityCol: 'name',
        renderCard: (item) => `
            <div class="mode-item-card">
                <div class="mode-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.emojis}</p>
                </div>
                <div class="mode-item-actions">
                    <button onclick='startModeEdit("emojis", ${JSON.stringify(item).replace(/'/g, "&#39;")})'>✏️</button>
                    <button class="btn-danger" onclick="deleteModeItem('emojis', '${item.name.replace(/'/g, "\\'")}')">❌</button>
                </div>
            </div>
        `,
        fillForm: (item) => {
            document.getElementById('emoji-name').value = item.name;
            document.getElementById('emoji-emojis').value = item.emojis;
        },
        getData: () => ({
            name: document.getElementById('emoji-name').value,
            emojis: document.getElementById('emoji-emojis').value
        })
    },
    quotes: {
        prefix: 'quote',
        formId: 'quote-form',
        identityCol: 'id',
        renderCard: (item) => `
            <div class="mode-item-card">
                <div class="mode-item-info">
                    <h3>${item.name}</h3>
                    <p>"${item.quote}"</p>
                </div>
                <div class="mode-item-actions">
                    <button onclick='startModeEdit("quotes", ${JSON.stringify(item).replace(/'/g, "&#39;")})'>✏️</button>
                    <button class="btn-danger" onclick="deleteModeItem('quotes', '${item.id}')">❌</button>
                </div>
            </div>
        `,
        fillForm: (item) => {
            document.getElementById('quote-name').value = item.name;
            document.getElementById('quote-quote').value = item.quote;
        },
        getData: () => ({
            name: document.getElementById('quote-name').value,
            quote: document.getElementById('quote-quote').value
        })
    },
    splash: {
        prefix: 'splash',
        formId: 'splash-form',
        identityCol: 'name',
        renderCard: (item) => `
            <div class="mode-item-card">
                <div class="mode-item-info">
                    <h3>${item.name}</h3>
                    <p>🖼️ Focal: ${item.originX || 50}%, ${item.originY || 50}%</p>
                </div>
                <div class="mode-item-actions">
                    <button onclick='startModeEdit("splash", ${JSON.stringify(item).replace(/'/g, "&#39;")})'>✏️</button>
                    <button class="btn-danger" onclick="deleteModeItem('splash', '${item.name.replace(/'/g, "\\'")}')">❌</button>
                </div>
            </div>
        `,
        fillForm: (item) => {
            document.getElementById('splash-name').value = item.name;
            document.getElementById('splash-splashUrl').value = item.splashUrl;
            document.getElementById('splash-originX').value = item.originX || 50;
            document.getElementById('splash-originY').value = item.originY || 50;
            document.getElementById('splash-imageUrl').value = item.imageUrl || '';
        },
        getData: () => ({
            name: document.getElementById('splash-name').value,
            splashUrl: document.getElementById('splash-splashUrl').value,
            originX: parseInt(document.getElementById('splash-originX').value) || 50,
            originY: parseInt(document.getElementById('splash-originY').value) || 50,
            imageUrl: document.getElementById('splash-imageUrl').value
        })
    },
    support_cards: {
        prefix: 'support',
        formId: 'support-form',
        identityCol: 'name',
        renderCard: (item) => `
            <div class="mode-item-card">
                <div class="mode-item-info">
                    <h3>${item.name}</h3>
                    <p>✨ ${item.rarity} | ${item.type} | ${item.character}</p>
                </div>
                <div class="mode-item-actions">
                    <button onclick='startModeEdit("support_cards", ${JSON.stringify(item).replace(/'/g, "&#39;")})'>✏️</button>
                    <button class="btn-danger" onclick="deleteModeItem('support_cards', '${item.name.replace(/'/g, "\\'")}')">❌</button>
                </div>
            </div>
        `,
        fillForm: (item) => {
            document.getElementById('support-name').value = item.name;
            document.getElementById('support-imageUrl').value = item.imageUrl;
            document.getElementById('support-character').value = item.character;
            document.getElementById('support-rarity').value = item.rarity;
            document.getElementById('support-type').value = item.type;
            document.getElementById('support-releaseYear').value = item.releaseYear;
            document.getElementById('support-uniqueEffect').value = item.uniqueEffect;
        },
        getData: () => ({
            name: document.getElementById('support-name').value,
            imageUrl: document.getElementById('support-imageUrl').value,
            character: document.getElementById('support-character').value,
            rarity: document.getElementById('support-rarity').value,
            type: document.getElementById('support-type').value,
            releaseYear: parseInt(document.getElementById('support-releaseYear').value),
            uniqueEffect: document.getElementById('support-uniqueEffect').value
        })
    }
};

function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Bind mode forms
    Object.keys(MODE_CONFIG).forEach(mode => {
        const config = MODE_CONFIG[mode];
        document.getElementById(config.formId).addEventListener('submit', (e) => {
            e.preventDefault();
            submitModeForm(mode);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    document.querySelector(`.admin-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName !== 'characters') {
        loadModeItems(tabName);
    }
}

async function loadModeItems(mode) {
    const config = MODE_CONFIG[mode];
    const listEl = document.getElementById(`${mode}-list`);
    const countEl = document.getElementById(`${mode}-count`);

    listEl.innerHTML = '<div style="color: var(--text-muted); padding: 1rem; text-align: center;">Carregando...</div>';

    try {
        const res = await fetch(`/api/admin-modes?table=${mode}`, {
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });
        if (!res.ok) throw new Error('Falha ao carregar');
        const items = await res.json();

        countEl.textContent = items.length;

        if (items.length === 0) {
            listEl.innerHTML = '<div style="color: var(--text-muted); padding: 1rem; text-align: center;">Nenhum registro encontrado. Adicione o primeiro!</div>';
            return;
        }

        listEl.innerHTML = items.map(item => config.renderCard(item)).join('');
    } catch (err) {
        listEl.innerHTML = `<div style="color: #f87171; padding: 1rem; text-align: center;">Erro: ${err.message}</div>`;
    }
}

function startModeEdit(mode, item) {
    const config = MODE_CONFIG[mode];
    modeEditState[mode] = { editing: true, identityValue: item[config.identityCol] };

    config.fillForm(item);

    const submitBtn = document.getElementById(`${config.prefix}-submit-btn`);
    const cancelBtn = document.getElementById(`${config.prefix}-cancel-btn`);
    submitBtn.innerHTML = '💾 Salvar Alterações';
    submitBtn.style.background = '#f59e0b';
    cancelBtn.style.display = 'block';
}

function cancelModeEdit(mode) {
    const config = MODE_CONFIG[mode];
    modeEditState[mode] = { editing: false, identityValue: null };

    document.getElementById(config.formId).reset();

    const submitBtn = document.getElementById(`${config.prefix}-submit-btn`);
    const cancelBtn = document.getElementById(`${config.prefix}-cancel-btn`);
    const feedbackEl = document.getElementById(`${config.prefix}-feedback`);

    submitBtn.innerHTML = '✨ Adicionar';
    submitBtn.style.background = '#10b981';
    cancelBtn.style.display = 'none';
    feedbackEl.textContent = '';
}

async function submitModeForm(mode) {
    const config = MODE_CONFIG[mode];
    const state = modeEditState[mode] || { editing: false };
    const isEdit = state.editing;
    const submitBtn = document.getElementById(`${config.prefix}-submit-btn`);
    const feedbackEl = document.getElementById(`${config.prefix}-feedback`);
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Processando...';

    const data = config.getData();
    if (isEdit) {
        data._identityValue = state.identityValue;
    }

    try {
        const res = await fetch(`/api/admin-modes?table=${mode}`, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            if (res.status === 401) {
                alert("Sessão Expirada.");
                localStorage.removeItem('adminToken');
                location.reload();
                return;
            }
            const err = await res.json();
            throw new Error(err.details || err.error || 'Erro no banco');
        }

        feedbackEl.textContent = isEdit ? '✅ Alterações salvas!' : '✨ Registro adicionado!';
        feedbackEl.style.color = '#4caf50';

        cancelModeEdit(mode);
        loadModeItems(mode);

        setTimeout(() => { feedbackEl.textContent = ''; }, 3000);
    } catch (err) {
        feedbackEl.textContent = '❌ Erro: ' + err.message;
        feedbackEl.style.color = '#f87171';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteModeItem(mode, identityValue) {
    if (!confirm('Excluir este registro?')) return;

    try {
        const res = await fetch(`/api/admin-modes?table=${mode}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({ identityValue })
        });

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                location.reload();
            }
            throw new Error('Falha ao deletar');
        }

        loadModeItems(mode);
    } catch (err) {
        alert('Erro: ' + err.message);
    }
}
