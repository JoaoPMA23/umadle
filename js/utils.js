import { state } from './state.js';

export function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function getDailySeed() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0;
    }
    return hash;
}

export const getDailyRandomNumber = (max) => {
    const seed = getDailySeed();
    const prng = mulberry32(seed);
    return Math.floor(prng() * max);
};

export const checkAccuracy = (guessedItem, key) => {
    const trueValue = state.answer[key];
    const guessedValue = guessedItem[key];

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
    return trueValue === guessedValue ? 'correct' : 'wrong';
};

export const getDirectionArrow = (guessedItem, key) => {
    if (key !== 'height' && key !== 'birthYear' && key !== 'g1Wins' && key !== 'releaseYear') return '';
    const diff = guessedItem[key] - state.answer[key];
    return diff === 0 ? '' : diff > 0 ? ' ⬇' : ' ⬆';
};
