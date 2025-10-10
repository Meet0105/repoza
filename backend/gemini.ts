import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ParsedQuery {
    technologies: string[];
    purpose: string;
    keywords: string[];
    language?: string;
}

export async function parseQuery(query: string): Promise<ParsedQuery> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are a helpful assistant that extracts structured information from project descriptions.
Extract: technologies (array), purpose (string), keywords (array for GitHub search), and primary language.
Respond ONLY with valid JSON. Example:
{"technologies":["React","Node.js","MongoDB"],"purpose":"e-commerce platform","keywords":["react","nodejs","mongodb","ecommerce","authentication"],"language":"JavaScript"}

Extract information from: "${query}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up the response (remove markdown code blocks if present)
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Gemini parsing error:', error);
        // Fallback: simple keyword extraction
        return {
            technologies: [],
            purpose: query,
            keywords: query.toLowerCase().split(' ').filter((w) => w.length > 2),
        };
    }
}

export async function generateBoilerplate(
    query: string,
    parsedQuery: ParsedQuery
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Generate a basic project structure for: "${query}"
Technologies: ${parsedQuery.technologies.join(', ')}

Provide folder structure and key files with brief descriptions.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Boilerplate generation error:', error);
        return 'Failed to generate boilerplate';
    }
}

export async function generateText(prompt: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Text generation error:', error);
        throw error;
    }
}
