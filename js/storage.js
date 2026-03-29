import { state } from './state.js';
import { getDailySeed } from './utils.js';

export const getStorageKey = () => `umadle_guesses_${state.currentMode}_${getDailySeed()}`;

export const saveProgress = () => {
    localStorage.setItem(getStorageKey(), JSON.stringify(state.guesses));
};

export const getStatsKey = () => `umadle_stats_${state.currentMode}`;

export const loadStats = () => {
    const defaultStats = { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0} };
    const saved = localStorage.getItem(getStatsKey());
    return saved ? JSON.parse(saved) : defaultStats;
};

export const saveStatsObj = (stats) => {
    localStorage.setItem(getStatsKey(), JSON.stringify(stats));
};

export const updateStats = (isWin, numGuesses) => {
    const stats = loadStats();
    stats.played++;
    if (isWin) {
        stats.wins++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
        stats.distribution[numGuesses] = (stats.distribution[numGuesses] || 0) + 1;
    } else {
        stats.currentStreak = 0;
    }
    saveStatsObj(stats);
};

export const getSettingsKey = () => `umadle_settings`;

export const loadSettings = () => {
    const defaultSettings = { theme: 'dark', lang: 'en', mute: false };
    const saved = localStorage.getItem(getSettingsKey());
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
};

export const saveSettingsObj = () => {
    localStorage.setItem(getSettingsKey(), JSON.stringify(state.settings));
};
