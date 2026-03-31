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
        'share_btn': 'Compartilhar 🔗', 'next_puzzle': 'Próximo desafio em:',
        'hint1_title': 'Dica 1 (Ano)', 'hint2_title': 'Dica 2 (Efeito Único)', 'locked_at': 'Desbloqueia na tentativa',
        'hub_title': 'ESCOLHA SEU DESAFIO', 'hub_sub': 'Teste seus conhecimentos de Uma Musume de várias formas!',
        'soon_badge': 'Em Breve',
        'm_classic_t': 'Clássico', 'm_classic_d': 'Descubra a Uma Musume encontrando os atributos corretos.',
        'm_splash_t': 'Arte', 'm_splash_d': 'Adivinhe a personagem através da arte que afasta gradualmente.',
        'm_support_t': 'Cartas de Suporte', 'm_support_d': 'Adivinhe a carta pela sua raridade, tipo e personagem.',
        'm_quote_t': 'Falas', 'm_quote_d': 'Descubra a garota baseando-se em sua frase marcante.',
        'm_emoji_t': 'Emojis', 'm_emoji_d': 'Decodifique uma sequência de emojis para achar a personagem certa.'
    },
    'en': {
        'subtitle': 'Guess the Uma Musume!', 'placeholder': "Type an Uma Musume's name...",
        'legend_correct': 'Correct', 'legend_partial': 'Partial (Close)', 'legend_wrong': 'Wrong',
        'attempt': 'Attempt', 'stats_title': 'STATISTICS', 'stat_played': 'Played', 'stat_winpct': 'Win %',
        'stat_streak': 'Current Streak', 'stat_maxstreak': 'Max Streak', 'stat_dist': 'GUESS DISTRIBUTION',
        'settings_title': 'SETTINGS', 'set_theme': 'Theme', 'set_dark': 'Dark', 'set_light': 'Light',
        'set_lang': 'Language', 'set_mute': 'Mute Sounds', 'win_title': 'Victory on ',
        'win_desc1': 'You guessed right in ', 'win_desc2_sg': ' attempt!', 'win_desc2_pl': ' attempts!',
        'share_btn': 'Share 🔗', 'next_puzzle': 'Next puzzle in:',
        'hint1_title': 'Hint 1 (Year)', 'hint2_title': 'Hint 2 (Unique Effect)', 'locked_at': 'Unlocks at attempt',
        'hub_title': 'CHOOSE YOUR CHALLENGE', 'hub_sub': 'Test your Uma Musume knowledge in different ways!',
        'soon_badge': 'Soon',
        'm_classic_t': 'Classic', 'm_classic_d': 'Guess the Uma Musume by finding the correct attributes.',
        'm_splash_t': 'Splash', 'm_splash_d': 'Guess the character from a gradually zooming out splash art.',
        'm_support_t': 'Support Card', 'm_support_d': 'Guess the support card by its rarity, type, and character.',
        'm_quote_t': 'Quote', 'm_quote_d': 'Guess who said the famous voice line or catchphrase.',
        'm_emoji_t': 'Emoji', 'm_emoji_d': 'Decode a sequence of emojis to find the right character.'
    }
};

export const t = (text) => {
    const lang = state.settings.lang;
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][text]) {
        return TRANSLATIONS[lang][text];
    }
    return text;
};
