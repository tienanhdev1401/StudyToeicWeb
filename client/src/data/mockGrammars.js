export const mockGrammars = {
    "nouns": {
        id: 1,
        title: "NOUNS",
        content: `
            <h2>Nouns</h2>
            <p>A noun is a word that names a person, place, thing, or idea.</p>
            <h3>Types of Nouns:</h3>
            <ul>
                <li><strong>Common nouns:</strong> dog, city, book</li>
                <li><strong>Proper nouns:</strong> London, Mary, Coca-Cola</li>
                <li><strong>Countable nouns:</strong> apple/apples, car/cars</li>
                <li><strong>Uncountable nouns:</strong> water, information</li>
            </ul>
            <h3>Examples in Sentences:</h3>
            <ol>
                <li>The <em>dog</em> barked loudly.</li>
                <li>We visited <em>Paris</em> last summer.</li>
                <li>She drank a glass of <em>water</em>.</li>
            </ol>
        `
    },
    "adjectives": {
        id: 2,
        title: "ADJECTIVES",
        content: `
            <h2>Adjectives</h2>
            <p>Adjectives describe or modify nouns.</p>
            <h3>Types of Adjectives:</h3>
            <ul>
                <li><strong>Descriptive:</strong> big, blue, beautiful</li>
                <li><strong>Quantitative:</strong> some, many, few</li>
                <li><strong>Demonstrative:</strong> this, that, those</li>
                <li><strong>Comparative:</strong> bigger, more interesting</li>
            </ul>
            <h3>Examples:</h3>
            <ol>
                <li>She has a <em>beautiful</em> voice.</li>
                <li>I have <em>three</em> apples.</li>
                <li><em>This</em> book is interesting.</li>
            </ol>
        `
    },
    "pronouns": {
        id: 3,
        title: "PRONOUNS",
        content: `
            <h2>Pronouns</h2>
            <p>Pronouns replace nouns to avoid repetition.</p>
            <h3>Types of Pronouns:</h3>
            <ul>
                <li><strong>Personal:</strong> he, she, they</li>
                <li><strong>Possessive:</strong> mine, yours, ours</li>
                <li><strong>Reflexive:</strong> myself, yourself</li>
            </ul>
            <h3>Examples:</h3>
            <ol>
                <li><em>She</em> loves playing the piano.</li>
                <li><em>This</em> is <em>yours</em>, not mine.</li>
                <li>He hurt <em>himself</em> while running.</li>
            </ol>
        `
    },
    "articles": {
        id: 4,
        title: "ARTICLES",
        content: `
            <h2>Articles</h2>
            <p>Articles specify nouns.</p>
            <h3>Types:</h3>
            <ul>
                <li><strong>Definite article:</strong> the</li>
                <li><strong>Indefinite articles:</strong> a, an</li>
            </ul>
            <h3>Examples:</h3>
            <ol>
                <li><em>The</em> sun is shining.</li>
                <li>I saw <em>a</em> cat.</li>
                <li>She ate <em>an</em> apple.</li>
            </ol>
        `
    },
    "prepositions": {
        id: 5,
        title: "PREPOSITIONS",
        content: `
            <h2>Prepositions</h2>
            <p>Prepositions show relationships between words.</p>
            <h3>Examples:</h3>
            <ol>
                <li>He is <em>in</em> the room.</li>
                <li>The book is <em>on</em> the table.</li>
                <li>We walked <em>through</em> the park.</li>
            </ol>
        `
    },
    "conjunctions": {
        id: 6,
        title: "CONJUNCTIONS",
        content: `
            <h2>Conjunctions</h2>
            <p>Conjunctions join words, phrases, or sentences.</p>
            <h3>Types:</h3>
            <ul>
                <li><strong>Coordinating:</strong> and, but, or</li>
                <li><strong>Subordinating:</strong> because, although</li>
            </ul>
            <h3>Examples:</h3>
            <ol>
                <li>She likes tea <em>and</em> coffee.</li>
                <li>We stayed home <em>because</em> it was raining.</li>
            </ol>
        `
    },
    "interjections": {
        id: 7,
        title: "INTERJECTIONS",
        content: `
            <h2>Interjections</h2>
            <p>Interjections express emotions.</p>
            <h3>Examples:</h3>
            <ol>
                <li><em>Wow!</em> That’s amazing.</li>
                <li><em>Ouch!</em> That hurts.</li>
                <li><em>Oh no!</em> I forgot my keys.</li>
            </ol>
        `
    },
    "modal-verbs": {
        id: 8,
        title: "MODAL VERBS",
        content: `
            <h2>Modal Verbs</h2>
            <p>Modal verbs modify the main verb.</p>
            <h3>Examples:</h3>
            <ol>
                <li>You <em>should</em> study more.</li>
                <li>She <em>can</em> swim fast.</li>
                <li>We <em>must</em> leave now.</li>
            </ol>
        `
    },
    "phrasal-verbs": {
        id: 9,
        title: "PHRASAL VERBS",
        content: `
            <h2>Phrasal Verbs</h2>
            <p>Phrasal verbs are verbs with prepositions or adverbs.</p>
            <h3>Examples:</h3>
            <ol>
                <li>He <em>gave up</em> smoking.</li>
                <li>She <em>ran into</em> an old friend.</li>
                <li>We need to <em>put off</em> the meeting.</li>
            </ol>
        `
    },
    "conditional-sentences": {
        id: 10,
        title: "CONDITIONAL SENTENCES",
        content: `
            <h2>Conditional Sentences</h2>
            <p>Conditional sentences express conditions.</p>
            <h3>Examples:</h3>
            <ol>
                <li>If it rains, we <em>will stay</em> inside.</li>
                <li>If I were you, I <em>would go</em>.</li>
                <li>If she had studied, she <em>would have passed</em>.</li>
            </ol>
        `
    }
};

// Hàm lấy tất cả grammar
export const getAllGrammars = () => {
    return Object.values(mockGrammars);
};
