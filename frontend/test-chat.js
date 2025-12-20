const { OpenRouter } = require('@openrouter/sdk');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local since we don't assume dotenv is installed
// and we want to be sure we are reading the file the user claims to have.
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.log('❌ .env.local file not found at:', envPath);
            return {};
        }
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                env[key] = value.trim();
            }
        });
        return env;
    } catch (err) {
        console.error('❌ Error reading .env.local:', err.message);
        return {};
    }
}

const env = loadEnv();
const apiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    console.log('❌ OPENROUTER_API_KEY not found in .env.local or process environment.');
    process.exit(1);
} else {
    console.log('✅ Found OPENROUTER_API_KEY (starts with ' + apiKey.substring(0, 8) + '...)');
}

const openRouter = new OpenRouter({
    apiKey: apiKey,
    defaultHeaders: {
        'HTTP-Referer': 'https://test.com',
        'X-Title': 'Test Script',
    },
});

async function test() {
    console.log('⏳ Attempting to send chat request to OpenRouter...');
    try {
        const completion = await openRouter.chat.send({
            model: 'openai/gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: 'Say hello',
                },
            ],
            stream: false,
        });

        console.log('✅ Response Received:', JSON.stringify(completion, null, 2));
        if (completion?.choices?.[0]?.message?.content) {
            console.log('✅ Content:', completion.choices[0].message.content);
        } else {
            console.log('⚠️ Warning: No content in response choices.');
        }

    } catch (error) {
        console.error('❌ API Call Failed:', error);
    }
}

test();
