// api.js - Claude API integration for word generation

const API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey() {
    return localStorage.getItem('claude_api_key');
}

function setApiKey(key) {
    localStorage.setItem('claude_api_key', key);
}

function hasApiKey() {
    return !!getApiKey();
}

async function generateWords(moodText) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API key not configured');
    }

    const prompt = `Generate 5-7 words for a word search puzzle based on this input: "${moodText}"

Rules:
- Words must be HIGHLY RELEVANT to the input text
- Prioritize funny, witty, clever, or playful words when possible
- Each word must be 3-8 letters
- Capital letters only
- Single words (no spaces or hyphens)
- Return ONLY a JSON array of strings, nothing else

Be creative! If the input mentions something specific, include related words that might make the player smile or chuckle. Puns and wordplay are welcome.

Example: Input "I love pizza" → ["CHEESE", "CRUST", "DROOL", "HANGRY", "SLICE", "DEVOUR"]
Example: Input "Monday morning" → ["COFFEE", "ZOMBIE", "SNOOZE", "GROAN", "YAWN", "SURVIVE"]`;

    console.log('Making API request with key:', apiKey.substring(0, 10) + '...');

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.log('API Error Response:', JSON.stringify(error, null, 2));
        console.log('Response Status:', response.status);
        console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
        throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON array from response
    const words = JSON.parse(content);

    // Validate words
    return words
        .map(w => w.toUpperCase().trim())
        .filter(w => /^[A-Z]{3,8}$/.test(w))
        .slice(0, 7);
}
