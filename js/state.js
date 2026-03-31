export const state = {
    currentMode: 'hub',
    db: [],
    answer: null,
    guesses: [],
    isGameOver: false,
    currentFocus: -1,
    settings: { theme: 'dark', lang: 'en', mute: false },
    COLUMNS: []
};

export const MODE_CONFIGS = {
    'classic': {
        file: '/api/characters',
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
        file: '/api/support_cards',
        columns: [
            { key: 'character', label: 'Character', icon: '👱‍♀️' },
            { key: 'rarity', label: 'Rarity', icon: '✨' },
            { key: 'type', label: 'Type', icon: '🏷️' },
            { key: 'releaseYear', label: 'Release Year', icon: '📅' }
        ]
    },
    'emoji': {
        file: '/api/emojis',
        columns: []
    },
    'quote': {
        file: '/api/characters',
        answerFile: '/api/quotes',
        columns: []
    },
    'splash': {
        file: '/api/characters',
        answerFile: '/api/splash',
        columns: []
    }
};
