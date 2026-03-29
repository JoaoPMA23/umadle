import { state } from './state.js';
import { t } from './i18n.js';
import { checkAccuracy, getDirectionArrow } from './utils.js';
import { loadStats } from './storage.js';

export const DOM = {
    searchInput: document.getElementById('search-input'),
    dropdownMenu: document.getElementById('dropdown-menu'),
    searchBtn: document.getElementById('search-btn'),
    counterDiv: document.getElementById('counter'),
    tableWrapper: document.getElementById('table-wrapper'),
    tableBody: document.getElementById('table-body'),
    resultBox: document.getElementById('result-box'),
    toastEl: document.getElementById('toast'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    modeHint: document.getElementById('mode-hint'),
    splashContainer: document.getElementById('splash-container'),
    splashImg: document.getElementById('splash-img'),
    statsModal: document.getElementById('stats-modal'),
    settingsModal: document.getElementById('settings-modal'),
    themeSelect: document.getElementById('theme-select'),
    langSelect: document.getElementById('lang-select'),
    muteToggle: document.getElementById('mute-toggle'),
    hintsContainer: document.getElementById('hints-container'),
    hint1: document.getElementById('hint-1'),
    hint2: document.getElementById('hint-2')
};

export const updateCounter = () => {
    DOM.counterDiv.innerHTML = state.guesses.length
        ? `${t('attempt')} <span>${state.guesses.length}</span>`
        : '';
};

export const setupTableHeaders = () => {
    const thead = DOM.tableWrapper.querySelector('thead tr');
    thead.innerHTML = state.COLUMNS.length > 0 ? `<th>${t('Name')}</th>` + state.COLUMNS.map(c => `<th>${t(c.label)}</th>`).join('') : '';
};

export const updateSplashZoom = () => {
    if (state.currentMode !== 'splash' || !state.answer) return;
    const baseScale = 5;
    let currentScale = Math.max(1, baseScale - state.guesses.length);
    if (state.isGameOver) currentScale = 1;

    DOM.splashImg.style.transform = `scale(${currentScale})`;
    DOM.splashImg.style.transformOrigin = `${state.answer.originX}% ${state.answer.originY}%`;
};

export const updateHints = () => {
    if (state.currentMode === 'support') {
        DOM.hintsContainer.style.display = 'flex';
        
        if (state.guesses.length >= 3 || state.isGameOver) {
            DOM.hint1.innerHTML = `<span class="lock-icon">🔓</span> ${t('hint1_title')}: <strong style="color:var(--gold)">${state.answer.releaseYear}</strong>`;
            DOM.hint1.classList.add('unlocked');
        } else {
            DOM.hint1.innerHTML = `<span class="lock-icon">🔒</span> ${t('hint1_title')} - ${t('locked_at')} 3`;
            DOM.hint1.classList.remove('unlocked');
        }

        if (state.guesses.length >= 5 || state.isGameOver) {
            DOM.hint2.innerHTML = `<span class="lock-icon">🔓</span> ${t('hint2_title')}:\n<span style="color:var(--text-main)">${state.answer.uniqueEffect}</span>`;
            DOM.hint2.classList.add('unlocked');
        } else {
            DOM.hint2.innerHTML = `<span class="lock-icon">🔒</span> ${t('hint2_title')} - ${t('locked_at')} 5`;
            DOM.hint2.classList.remove('unlocked');
        }
    } else {
        DOM.hintsContainer.style.display = 'none';
    }
};

export const showStatsModal = () => {
    const stats = loadStats();
    document.getElementById('stats-mode-name').textContent = state.currentMode.toUpperCase();
    document.getElementById('stat-played').textContent = stats.played;
    document.getElementById('stat-winpct').textContent = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-maxstreak').textContent = stats.maxStreak;

    let maxDist = 0;
    Object.values(stats.distribution).forEach(v => { if(v > maxDist) maxDist = v; });

    let distHTML = '';
    let maxShown = 6;
    Object.keys(stats.distribution).forEach(k => {
        if (parseInt(k) > maxShown && stats.distribution[k] > 0) maxShown = parseInt(k);
    });

    for(let i=1; i<=maxShown; i++) {
        const val = stats.distribution[i] || 0;
        const wPct = maxDist > 0 ? Math.max(8, Math.round((val / maxDist) * 100)) : 8; 
        const isLastWin = (state.isGameOver && val > 0 && state.guesses.length === i && state.guesses[state.guesses.length-1]?.name === state.answer?.name);
        
        distHTML += `
            <div class="dist-row">
                <div class="dist-num">${i}</div>
                <div class="dist-bar-container">
                    <div class="dist-bar ${isLastWin ? 'active' : ''}" style="width: ${wPct}%">${val}</div>
                </div>
            </div>
        `;
    }
    document.getElementById('stats-dist').innerHTML = distHTML;
    DOM.statsModal.style.display = 'flex';
    setTimeout(() => {
        const closeBtn = DOM.statsModal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }, 10);
};

export const showSettingsModal = () => {
    DOM.themeSelect.value = state.settings.theme;
    DOM.langSelect.value = state.settings.lang;
    DOM.muteToggle.checked = state.settings.mute;
    DOM.settingsModal.style.display = 'flex';
    setTimeout(() => {
        const closeBtn = DOM.settingsModal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }, 10);
};

export const showToast = (message) => {
    DOM.toastEl.textContent = message;
    DOM.toastEl.classList.add('show');
    setTimeout(() => {
        DOM.toastEl.classList.remove('show');
    }, 3000);
};

export const renderResultBox = () => {
    if (!state.isGameOver) return;
    
    const isWin = state.guesses.length > 0 && state.guesses[state.guesses.length - 1].name === state.answer.name;
    const ModeName = state.currentMode.charAt(0).toUpperCase() + state.currentMode.slice(1);

    if (isWin) {
        // Dispara a chuva de confetes se a lib estiver disponível
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f5c842', '#ff85b3', '#e8a800', '#7c3fa8', '#e0447a']
            });
        }

        DOM.resultBox.innerHTML = `
            <div class="result-box win">
                <h2>${t('win_title')}${ModeName}!</h2>
                <img src="https://media.tenor.com/-lfKiysaO2oAAAAj/uma-musume-chibi.gif" alt="Uma Musume Chibi Dance" style="width: 140px; margin: 0 auto 10px; display: block; border-radius: 8px;">
                <p>${t('win_desc1')}<strong style="color:var(--gold)">${state.guesses.length}</strong>${state.guesses.length > 1 ? t('win_desc2_pl') : t('win_desc2_sg')}</p>
                <div class="answer-reveal">${state.answer.name}</div>
                <div class="btn-container">
                    <button class="action-btn secondary" onclick="shareResult()">${t('share_btn')}</button>
                </div>
                <p style="margin-top: 10px; font-size:0.8rem; color:var(--text-muted)">${t('next_puzzle')}</p>
            </div>
        `;
    }
};

export const applyTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.setAttribute('placeholder', t(key));
    });
    updateCounter();
    updateHints();
    if (state.isGameOver) renderResultBox();
};

export const applySettings = () => {
    document.body.classList.toggle('light-theme', state.settings.theme === 'light');
    setupTableHeaders(); 
    applyTranslations();
};

export const renderRow = (guessedItem, instant) => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    const nameAccuracy = guessedItem.name === state.answer.name ? 'correct' : 'wrong';
    nameTd.innerHTML = `
        <div class="cell ${nameAccuracy}" style="${instant ? 'opacity:1; transform:none; animation:none;' : 'animation-delay: 0s'}">
            <img src="${guessedItem.imageUrl}" class="chara-icon" alt="${guessedItem.name}">
            <span class="val">${guessedItem.name}</span>
        </div>
    `;
    tr.appendChild(nameTd);

    state.COLUMNS.forEach((col, i) => {
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

    DOM.tableBody.insertBefore(tr, DOM.tableBody.firstChild);

    if (!instant) {
        setTimeout(() => {
            tr.querySelectorAll('.cell').forEach(c => c.classList.add('anim'));
        }, 10);
    }
};

export const updateFocus = (items) => {
    if (!items) return;
    items.forEach(item => item.classList.remove('active'));

    if (state.currentFocus >= items.length) state.currentFocus = 0;
    if (state.currentFocus < 0) state.currentFocus = items.length - 1;

    items[state.currentFocus].classList.add('active');
    items[state.currentFocus].scrollIntoView({ block: 'nearest' });
};
