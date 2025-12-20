import { OpenRouter } from '@openrouter/sdk';
import { NextResponse } from 'next/server';

// Initialize OpenRouter with your API key
// Ensure OPENROUTER_API_KEY is set in your .env.local file
const openRouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://spi-smart-campus.vercel.app',
        'X-Title': 'SPI Smart Campus',
    },
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { messages } = body;

        // Validate if messages exist
        if (!messages || !Array.isArray(messages)) {
            console.error('Invalid request body:', body);
            return NextResponse.json(
                { error: 'Invalid request body. Messages array is required.' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('OPENROUTER_API_KEY is missing in environment variables.');
            return NextResponse.json(
                { error: 'Server configuration error: API key missing.' },
                { status: 500 }
            );
        }

        console.log('Sending request to OpenRouter...');

        const completion = await openRouter.chat.send({
            model: 'deepseek/deepseek-r1-0528:free', // Using a free model to ensure it works without credits
            messages: messages,
            stream: false,
        });

        // Check if we got a valid response
        if (!completion || !completion.choices || completion.choices.length === 0) {
            console.error('OpenRouter response invalid:', JSON.stringify(completion));
            throw new Error('No response from OpenRouter');
        }

        const content = completion.choices[0].message.content;

        return NextResponse.json({ content });
    } catch (error) {
        console.error('OpenRouter API Error Details:', error);
        return NextResponse.json(
            { error: `Failed to fetch response: ${error.message}` },
            { status: 500 }
        );
    }
}
