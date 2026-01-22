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

    const prompt = `Given the user's mood: "${moodText}"
Generate 5-7 positive words related to this feeling.
Rules:
- Each word 3-8 letters
- Capital letters only
- Single words (no spaces)
- Return ONLY a JSON array of strings, nothing else

Example output: ["HAPPY", "JOY", "BRIGHT", "SMILE", "GLOW"]`;

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
