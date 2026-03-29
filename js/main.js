import { state } from './state.js';
import { loadSettings, saveSettingsObj } from './storage.js';
import { DOM, showStatsModal, showSettingsModal, applySettings, updateFocus } from './ui.js';
import { loadModeConfig, submitGuess, shareResult } from './game.js';

// Load initial settings
state.settings = loadSettings();
applySettings();

// Init game logic
loadModeConfig();

// Window exports for inline HTML functions
window.shareResult = shareResult;
window.pickOption = (selectedName) => {
    DOM.searchInput.value = selectedName;
    DOM.dropdownMenu.style.display = 'none';
    submitGuess();
};

// Mode Buttons Events
DOM.modeBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        if (btn.classList.contains('disabled')) return;

        DOM.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentMode = btn.dataset.mode;
        DOM.dropdownMenu.style.display = 'none';
        await loadModeConfig();
    });
});

// Search inputs and dropdowns
DOM.searchInput.addEventListener('input', () => {
    const query = DOM.searchInput.value.trim().toLowerCase();

    if (!query) {
        DOM.dropdownMenu.style.display = 'none';
        return;
    }

    const matches = state.db.filter(item =>
        item.name.toLowerCase().includes(query) &&
        !state.guesses.some(g => g.name === item.name)
    );

    if (!matches.length) {
        DOM.dropdownMenu.style.display = 'none';
        return;
    }

    state.currentFocus = -1;

    DOM.dropdownMenu.innerHTML = matches.map(item => `
        <div class="dropdown-item" onclick="pickOption('${item.name.replace(/'/g, "\\'")}')">
            <img src="${item.imageUrl}" class="chara-icon" alt="${item.name}">
            <span>${item.name}</span>
        </div>
    `).join('');

    DOM.dropdownMenu.style.display = 'block';
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        DOM.dropdownMenu.style.display = 'none';
    }
});

DOM.searchBtn.addEventListener('click', submitGuess);

DOM.searchInput.addEventListener('keydown', (e) => {
    let items = DOM.dropdownMenu.querySelectorAll('.dropdown-item');

    if (DOM.dropdownMenu.style.display === 'block' && items.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            state.currentFocus++;
            updateFocus(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            state.currentFocus--;
            updateFocus(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (state.currentFocus > -1) {
                if (items[state.currentFocus]) items[state.currentFocus].click();
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

// Modals Events
document.getElementById('stats-btn').addEventListener('click', showStatsModal);
document.getElementById('stats-close').addEventListener('click', () => {
    DOM.statsModal.style.display = 'none';
});

document.getElementById('theme-select').addEventListener('change', (e) => {
    state.settings.theme = e.target.value;
    saveSettingsObj();
    applySettings();
});
document.getElementById('lang-select').addEventListener('change', (e) => {
    state.settings.lang = e.target.value;
    saveSettingsObj();
    applySettings();
});
document.getElementById('mute-toggle').addEventListener('change', (e) => {
    state.settings.mute = e.target.checked;
    saveSettingsObj();
});

document.getElementById('settings-btn').addEventListener('click', showSettingsModal);
document.getElementById('settings-close').addEventListener('click', () => {
    DOM.settingsModal.style.display = 'none';
});

// A11y Modal Handling (ESC and Focus Trap)
const trapFocus = (e, modalDiv) => {
    if (modalDiv.style.display === 'none') return;
    const focusableElements = modalDiv.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift+Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
};

document.addEventListener('keydown', (e) => {
    // 1. ESC to close modals
    if (e.key === 'Escape') {
        if (DOM.statsModal.style.display === 'flex') {
            DOM.statsModal.style.display = 'none';
            DOM.searchInput.focus(); // Retorna foco ao jogo
        }
        if (DOM.settingsModal.style.display === 'flex') {
            DOM.settingsModal.style.display = 'none';
            DOM.searchInput.focus(); // Retorna foco ao jogo
        }
    }

    // 2. Tab trap in active modal
    if (DOM.statsModal.style.display === 'flex') {
        trapFocus(e, DOM.statsModal);
    } else if (DOM.settingsModal.style.display === 'flex') {
        trapFocus(e, DOM.settingsModal);
    }
});
