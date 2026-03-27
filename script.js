/* ==================================
   UMADLE - STATE & CONSTANTS
================================== */

let currentMode = 'classic';
let db = [];
let answer;
let guesses = [];
let isGameOver = false;
let currentFocus = -1;

const MODE_CONFIGS = {
    'classic': {
        file: 'database.json',
        columns: [
            { key: 'type', label: 'Surface', icon: '⭐' },
            { key: 'distance', label: 'Distance', icon: '🐎' },
            { key: 'style', label: 'Strategy', icon: '👟' },
            { key: 'height', label: 'Height', icon: '📏' },
            { key: 'g1Wins', label: 'G1 Wins', icon: '🏆' },
            { key: 'birthYear', label: 'Birth Year', icon: '📅' },
            { key: 'releaseYear', label: 'Release Year', icon: '🎮' }
        ]
    },
    'support': {
        file: 'support_cards.json',
        columns: [
            { key: 'character', label: 'Character', icon: '👱‍♀️' },
            { key: 'rarity', label: 'Rarity', icon: '✨' },
            { key: 'type', label: 'Type', icon: '🏷️' },
            { key: 'releaseYear', label: 'Release Year', icon: '📅' }
        ]
    },
    'emoji': {
        file: 'database_emojis.json',
        columns: []
    },
    'splash': {
        file: 'database_splash.json',
        columns: []
    },
    'splash': {
        file: 'database_splash.json',
        columns: []
    }
};

let COLUMNS = [];

/* ==================================
   DOM ELEMENTS
================================== */
const searchInput = document.getElementById('search-input');
const dropdownMenu = document.getElementById('dropdown-menu');
const searchBtn = document.getElementById('search-btn');
const counterDiv = document.getElementById('counter');
const tableWrapper = document.getElementById('table-wrapper');
const tableBody = document.getElementById('table-body');
const resultBox = document.getElementById('result-box');
const toastEl = document.getElementById('toast');
const modeBtns = document.querySelectorAll('.mode-btn');
const modeHint = document.getElementById('mode-hint');
const splashContainer = document.getElementById('splash-container');
const splashImg = document.getElementById('splash-img');

/* ==================================
   PRNG & DAILY SEED
================================== */
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function getDailySeed() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0;
    }
    return hash;
}

const getDailyRandomNumber = (max) => {
    const seed = getDailySeed();
    const prng = mulberry32(seed);
    return Math.floor(prng() * max);
};

/* ==================================
   LOCAL STORAGE MANAGER
================================== */
const getStorageKey = () => `umadle_guesses_${currentMode}_${getDailySeed()}`;

const saveProgress = () => {
    localStorage.setItem(getStorageKey(), JSON.stringify(guesses));
};

/* ==================================
   INITIALIZATION & DATA LOADING
================================== */

const loadModeConfig = async () => {
    const config = MODE_CONFIGS[currentMode];
    COLUMNS = config.columns;

    try {
        const response = await fetch(config.file);
        if (!response.ok) throw new Error("Fetch failed");
        db = await response.json();

        initGame();
    } catch (err) {
        console.error("Could not load database: ", err);
        showToast("Failed to load database. Are you running a local server?");
    }
};

const setupTableHeaders = () => {
    const thead = tableWrapper.querySelector('thead tr');
    // Para modos sem colunas, só deixa o Header vazio ou oculto
    thead.innerHTML = COLUMNS.length > 0 ? `<th>Name</th>` + COLUMNS.map(c => `<th>${c.label}</th>`).join('') : '';
};

const updateSplashZoom = () => {
    if (currentMode !== 'splash' || !answer) return;
    const baseScale = 5;
    let currentScale = Math.max(1, baseScale - guesses.length);
    if (isGameOver) currentScale = 1; // Mostra tudo se perder ou ganhar

    splashImg.style.transform = `scale(${currentScale})`;
    splashImg.style.transformOrigin = `${answer.originX}% ${answer.originY}%`;
};

const initGame = () => {
    // Escolhe aposta do dia
    const dailyIndex = getDailyRandomNumber(db.length);
    answer = db[dailyIndex];
    guesses = [];
    isGameOver = false;

    // Limpa a UI
    setupTableHeaders();
    tableBody.innerHTML = '';
    resultBox.innerHTML = '';
    tableWrapper.style.display = 'none';

    // Atualiza a dica visual (No modo Emoji ela aparece gigante em cima do input)
    if (currentMode === 'emoji') {
        modeHint.style.display = 'block';
        modeHint.textContent = answer.emojis;
        splashContainer.style.display = 'none';
    } else if (currentMode === 'splash') {
        modeHint.style.display = 'none';
        splashContainer.style.display = 'block';
        splashImg.src = answer.splashUrl;
        updateSplashZoom();
    } else {
        modeHint.style.display = 'none';
        modeHint.textContent = '';
        splashContainer.style.display = 'none';
    }

    searchInput.value = '';
    searchInput.disabled = false;
    searchBtn.disabled = false;
    currentFocus = -1;

    // Check Local Storage
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
        guesses = JSON.parse(saved);
        if (guesses.length > 0) {
            tableWrapper.style.display = 'block';
            guesses.forEach(g => renderRow(g, true)); // instant render
            
            if (currentMode === 'splash') updateSplashZoom();
            
            if (guesses.some(g => g.name === answer.name)) {
                endGame(true, true);
            }
        }
    }

    updateCounter();
    searchInput.focus();
};

/* ==================================
   EVENTS & NAVIGATION
================================== */

modeBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        if (btn.classList.contains('disabled')) return;

        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentMode = btn.dataset.mode;
        dropdownMenu.style.display = 'none';
        await loadModeConfig();
    });
});

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        dropdownMenu.style.display = 'none';
        return;
    }

    const matches = db.filter(item =>
        item.name.toLowerCase().includes(query) &&
        !guesses.some(g => g.name === item.name)
    );

    if (!matches.length) {
        dropdownMenu.style.display = 'none';
        return;
    }

    currentFocus = -1;

    dropdownMenu.innerHTML = matches.map(item => `
        <div class="dropdown-item" onclick="pickOption('${item.name.replace(/'/g, "\\'")}')">
            <img src="${item.imageUrl}" class="chara-icon" alt="${item.name}">
            <span>${item.name}</span>
        </div>
    `).join('');

    dropdownMenu.style.display = 'block';
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        dropdownMenu.style.display = 'none';
    }
});

const pickOption = (selectedName) => {
    searchInput.value = selectedName;
    dropdownMenu.style.display = 'none';
    submitGuess();
};

searchBtn.addEventListener('click', submitGuess);

searchInput.addEventListener('keydown', (e) => {
    let items = dropdownMenu.querySelectorAll('.dropdown-item');

    if (dropdownMenu.style.display === 'block' && items.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            updateFocus(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            updateFocus(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1) {
                if (items[currentFocus]) items[currentFocus].click();
            } else {
                submitGuess();
            }
        }
    } else {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitGuess();
        }
    }
});

const updateFocus = (items) => {
    if (!items) return;
    items.forEach(item => item.classList.remove('active'));

    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;

    items[currentFocus].classList.add('active');
    items[currentFocus].scrollIntoView({ block: 'nearest' });
};

/* ==================================
   GAMEPLAY LOGIC
================================== */

function submitGuess() {
    if (isGameOver) return;

    const queryName = searchInput.value.trim().toLowerCase();
    const guessedItem = db.find(u => u.name.toLowerCase() === queryName);

    if (!guessedItem || guesses.some(g => g.name === guessedItem.name)) {
        searchInput.style.borderColor = '#e74c3c';
        setTimeout(() => { searchInput.style.borderColor = ''; }, 700);
        return;
    }

    guesses.push(guessedItem);
    saveProgress();
    
    if (currentMode === 'splash') updateSplashZoom();

    tableWrapper.style.display = 'block';
    renderRow(guessedItem, false);

    searchInput.value = '';
    updateCounter();

    if (guessedItem.name === answer.name) {
        endGame(true, false);
    }
}

const updateCounter = () => {
    counterDiv.innerHTML = guesses.length
        ? `Attempt <span>${guesses.length}</span>`
        : '';
};

const checkAccuracy = (guessedItem, key) => {
    const trueValue = answer[key];
    const guessedValue = guessedItem[key];

    // Numeric Ranges
    if (key === 'height') {
        if (trueValue === guessedValue) return 'correct';
        if (Math.abs(trueValue - guessedValue) <= 3) return 'partial';
        return 'wrong';
    }
    if (key === 'g1Wins') {
        if (trueValue === guessedValue) return 'correct';
        if (Math.abs(trueValue - guessedValue) <= 2) return 'partial';
        return 'wrong';
    }
    if (key === 'birthYear') {
        if (trueValue === guessedValue) return 'correct';
        if (Math.abs(trueValue - guessedValue) <= 2) return 'partial';
        return 'wrong';
    }
    if (key === 'releaseYear') {
        if (trueValue === guessedValue) return 'correct';
        if (Math.abs(trueValue - guessedValue) === 1) return 'partial';
        return 'wrong';
    }

    // Exact Matches (Strings, Types, Rarity, etc)
    return trueValue === guessedValue ? 'correct' : 'wrong';
};

const getDirectionArrow = (guessedItem, key) => {
    if (key !== 'height' && key !== 'birthYear' && key !== 'g1Wins' && key !== 'releaseYear') return '';
    const diff = guessedItem[key] - answer[key];
    return diff === 0 ? '' : diff > 0 ? ' ⬇' : ' ⬆';
};

const renderRow = (guessedItem, instant) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    const nameAccuracy = guessedItem.name === answer.name ? 'correct' : 'wrong';
    nameTd.innerHTML = `
        <div class="cell ${nameAccuracy}" style="${instant ? 'opacity:1; transform:none; animation:none;' : 'animation-delay: 0s'}">
            <img src="${guessedItem.imageUrl}" class="chara-icon" alt="${guessedItem.name}">
            <span class="val">${guessedItem.name}</span>
        </div>
    `;

    tr.appendChild(nameTd);

    COLUMNS.forEach((col, i) => {
        const accuracy = checkAccuracy(guessedItem, col.key);
        const td = document.createElement('td');
        const delay = (i + 1) * 0.08;

        td.innerHTML = `
            <div class="cell ${accuracy}" style="${instant ? 'opacity:1; transform:none; animation:none;' : `animation-delay: ${delay}s`}">
                <div class="ico">${col.icon}</div>
                <span class="val">${guessedItem[col.key]}${getDirectionArrow(guessedItem, col.key)}</span>
            </div>
        `;
        tr.appendChild(td);
    });

    tableBody.insertBefore(tr, tableBody.firstChild);

    if (!instant) {
        setTimeout(() => {
            tr.querySelectorAll('.cell').forEach(c => c.classList.add('anim'));
        }, 10);
    }
};

const endGame = (isWin, instant) => {
    isGameOver = true;
    searchInput.disabled = true;
    searchBtn.disabled = true;

    const ModeName = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);

    if (currentMode === 'splash') updateSplashZoom(); // Revela a imagem original

    if (isWin) {
        resultBox.innerHTML = `
            <div class="result-box win">
                <h2>Victory on ${ModeName} Mode!</h2>
                <p>You guessed right in <strong style="color:var(--gold)">${guesses.length}</strong> attempt${guesses.length > 1 ? 's' : ''}!</p>
                <div class="answer-reveal">${answer.name}</div>
                <div class="btn-container">
                    <button class="action-btn secondary" onclick="shareResult()">Share 🔗</button>
                    <!-- Sem botão de Play Again pois é diário agora! -->
                </div>
                <p style="margin-top: 10px; font-size:0.8rem; color:var(--text-muted)">Next puzzles at midnight!</p>
            </div>
        `;
    }
};

window.shareResult = () => {
    const accuracyEmojis = { 'correct': '🟩', 'partial': '🟨', 'wrong': '🟥' };
    const isWin = guesses.length > 0 && guesses[guesses.length - 1].name === answer.name;
    const ModeName = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);

    const title = `Umadle - ${ModeName} Mode - ${isWin ? guesses.length : 'X'} Attempts`;

    let grid = guesses.map(guess => {
        const nameSq = guess.name === answer.name ? '🟩' : '🟥';
        const colsSqs = COLUMNS.map(col => accuracyEmojis[checkAccuracy(guess, col.key)]).join('');
        return nameSq + colsSqs;
    }).join('\n');

    const resultText = `${title}\n\n${grid}\n\nPlay too!`;

    navigator.clipboard.writeText(resultText).then(() => {
        showToast("Copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy", err);
        showToast("Error copying :(");
    });
};

const showToast = (message) => {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
};

// Start
loadModeConfig();
