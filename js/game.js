import { state, MODE_CONFIGS } from './state.js';
import { getDailyRandomNumber, checkAccuracy } from './utils.js';
import { getStorageKey, saveProgress, updateStats } from './storage.js';
import { DOM, setupTableHeaders, updateSplashZoom, updateCounter, renderRow, renderResultBox, showStatsModal, showToast, updateHints } from './ui.js';

export const loadModeConfig = async () => {
    const config = MODE_CONFIGS[state.currentMode];
    state.COLUMNS = config.columns;

    try {
        const response = await fetch(config.file);
        if (!response.ok) throw new Error("Fetch failed");
        state.db = await response.json();

        if (config.answerFile) {
            const ansResp = await fetch(config.answerFile);
            if (!ansResp.ok) throw new Error("Answer fetch failed");
            state.answerDb = await ansResp.json();
        } else {
            state.answerDb = state.db;
        }

        initGame();
    } catch (err) {
        console.error("Could not load database: ", err);
        showToast("Failed to load database. Are you running a local server?");
    }
};

export const initGame = () => {
    const dailyIndex = getDailyRandomNumber(state.answerDb.length);
    state.answer = state.answerDb[dailyIndex];
    state.guesses = [];
    state.isGameOver = false;

    setupTableHeaders();
    DOM.tableBody.innerHTML = '';
    DOM.resultBox.innerHTML = '';
    DOM.tableWrapper.style.display = 'none';

    if (state.currentMode === 'emoji') {
        DOM.modeHint.style.display = 'block';
        DOM.modeHint.textContent = state.answer.emojis;
        DOM.splashContainer.style.display = 'none';
    } else if (state.currentMode === 'splash') {
        DOM.modeHint.style.display = 'none';
        DOM.splashContainer.style.display = 'block';
        DOM.splashImg.src = state.answer.splashUrl;
        updateSplashZoom();
    } else {
        DOM.modeHint.style.display = 'none';
        DOM.modeHint.textContent = '';
        DOM.splashContainer.style.display = 'none';
    }

    DOM.searchInput.value = '';
    DOM.searchInput.disabled = false;
    DOM.searchBtn.disabled = false;
    state.currentFocus = -1;

    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
        state.guesses = JSON.parse(saved);
        if (state.guesses.length > 0) {
            DOM.tableWrapper.style.display = 'block';
            state.guesses.forEach(g => renderRow(g, true));

            if (state.currentMode === 'splash') updateSplashZoom();

            if (state.guesses.some(g => g.name === state.answer.name)) {
                endGame(true, true);
            }
        }
    }

    updateCounter();
    updateHints();
    DOM.searchInput.focus();
};

export const submitGuess = () => {
    if (state.isGameOver) return;

    const queryName = DOM.searchInput.value.trim().toLowerCase();
    const guessedItem = state.db.find(u => u.name.toLowerCase() === queryName);

    if (!guessedItem || state.guesses.some(g => g.name === guessedItem.name)) {
        DOM.searchInput.style.borderColor = '#e74c3c';
        setTimeout(() => { DOM.searchInput.style.borderColor = ''; }, 700);
        return;
    }

    state.guesses.push(guessedItem);
    saveProgress();

    if (state.currentMode === 'splash') updateSplashZoom();

    DOM.tableWrapper.style.display = 'block';
    renderRow(guessedItem, false);

    DOM.searchInput.value = '';
    updateCounter();
    updateHints();

    if (guessedItem.name === state.answer.name) {
        endGame(true, false);
    }
};

export const endGame = (isWin, instant) => {
    state.isGameOver = true;
    DOM.searchInput.disabled = true;
    DOM.searchBtn.disabled = true;

    if (!instant) {
        updateStats(isWin, state.guesses.length);
        setTimeout(showStatsModal, 1200);
    }

    if (state.currentMode === 'splash') updateSplashZoom();
    updateHints();

    renderResultBox();
};

export const shareResult = () => {
    const accuracyEmojis = { 'correct': '🟩', 'partial': '🟨', 'wrong': '🟥' };
    const isWin = state.guesses.length > 0 && state.guesses[state.guesses.length - 1].name === state.answer.name;
    const ModeName = state.currentMode.charAt(0).toUpperCase() + state.currentMode.slice(1);

    const title = `Umadle - ${ModeName} Mode - ${isWin ? state.guesses.length : 'X'} Attempts`;

    let grid = state.guesses.map(guess => {
        const nameSq = guess.name === state.answer.name ? '🟩' : '🟥';
        const colsSqs = state.COLUMNS.map(col => accuracyEmojis[checkAccuracy(guess, col.key)]).join('');
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
