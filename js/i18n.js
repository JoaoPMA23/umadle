import { state } from './state.js';

export const TRANSLATIONS = {
    'pt-br': {
        'Surface': 'Superfície', 'Distance': 'Distância', 'Strategy': 'Estratégia', 'Height': 'Altura',
        'G1 Wins': 'Vits. G1', 'Birth Year': 'Ano Nasc.', 'Release Year': 'Ano Lanç.', 'Character': 'Personagem',
        'Rarity': 'Raridade', 'Type': 'Tipo', 'Name': 'Nome',
        'subtitle': 'Adivinhe a Uma Musume!', 'placeholder': 'Digite o nome de uma Uma...',
        'legend_correct': 'Correto', 'legend_partial': 'Quase (Perto)', 'legend_wrong': 'Errado',
        'attempt': 'Tentativa', 'stats_title': 'ESTATÍSTICAS', 'stat_played': 'Jogadas', 'stat_winpct': '% Vit.',
        'stat_streak': 'Seq. Atual', 'stat_maxstreak': 'Maior Seq.', 'stat_dist': 'DISTRIBUIÇÃO',
        'settings_title': 'CONFIGURAÇÕES', 'set_theme': 'Tema', 'set_dark': 'Escuro', 'set_light': 'Claro',
        'set_lang': 'Idioma', 'set_mute': 'Sons Mutados', 'win_title': 'Vitória no modo ',
        'win_desc1': 'Você acertou em ', 'win_desc2_sg': ' tentativa!', 'win_desc2_pl': ' tentativas!',
        'share_btn': 'Compartilhar 🔗', 'next_puzzle': 'Próximos desafios à meia-noite!',
        'hint1_title': 'Dica 1 (Ano)', 'hint2_title': 'Dica 2 (Efeito Único)', 'locked_at': 'Desbloqueia na tentativa'
    },
    'en': {
        'subtitle': 'Guess the Uma Musume!', 'placeholder': "Type an Uma Musume's name...",
        'legend_correct': 'Correct', 'legend_partial': 'Partial (Close)', 'legend_wrong': 'Wrong',
        'attempt': 'Attempt', 'stats_title': 'STATISTICS', 'stat_played': 'Played', 'stat_winpct': 'Win %',
        'stat_streak': 'Current Streak', 'stat_maxstreak': 'Max Streak', 'stat_dist': 'GUESS DISTRIBUTION',
        'settings_title': 'SETTINGS', 'set_theme': 'Theme', 'set_dark': 'Dark', 'set_light': 'Light',
        'set_lang': 'Language', 'set_mute': 'Mute Sounds', 'win_title': 'Victory on ',
        'win_desc1': 'You guessed right in ', 'win_desc2_sg': ' attempt!', 'win_desc2_pl': ' attempts!',
        'share_btn': 'Share 🔗', 'next_puzzle': 'Next puzzles at midnight!',
        'hint1_title': 'Hint 1 (Year)', 'hint2_title': 'Hint 2 (Unique Effect)', 'locked_at': 'Unlocks at attempt'
    }
};

export const t = (text) => {
    const lang = state.settings.lang;
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][text]) {
        return TRANSLATIONS[lang][text];
    }
    return text;
};
