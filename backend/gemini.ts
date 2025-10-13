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

export interface RepoRelevanceScore {
    repoName: string;
    relevanceScore: number; // 0-1
    reasoning?: string;
}

export async function calculateRepoRelevance(
    searchQuery: string,
    repoName: string,
    repoDescription: string,
    repoTopics: string[] = []
): Promise<number> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are an AI that calculates semantic relevance between a search query and a GitHub repository.

Search Query: "${searchQuery}"

Repository Information:
- Name: ${repoName}
- Description: ${repoDescription || 'No description'}
- Topics: ${repoTopics.join(', ') || 'None'}

Task: Calculate how relevant this repository is to the search query on a scale of 0.0 to 1.0.
- 1.0 = Perfect match (exactly what the user is looking for)
- 0.7-0.9 = Very relevant (closely matches intent)
- 0.4-0.6 = Somewhat relevant (related but not exact)
- 0.1-0.3 = Barely relevant (tangentially related)
- 0.0 = Not relevant at all

Consider:
1. Does the repo name/description match the search intent?
2. Do the technologies align?
3. Does the purpose match?
4. Are the topics relevant?

Respond ONLY with a JSON object:
{"score": 0.85, "reasoning": "Brief explanation"}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up the response
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanText);

        // Ensure score is between 0 and 1
        const score = Math.max(0, Math.min(1, parsed.score || 0));
        
        return score;
    } catch (error) {
        console.error('Relevance calculation error:', error);
        // Fallback: simple keyword matching
        const queryLower = searchQuery.toLowerCase();
        const repoLower = `${repoName} ${repoDescription} ${repoTopics.join(' ')}`.toLowerCase();
        
        const queryWords = queryLower.split(' ').filter(w => w.length > 2);
        const matches = queryWords.filter(word => repoLower.includes(word)).length;
        
        return Math.min(1, matches / Math.max(queryWords.length, 1));
    }
}

export async function batchCalculateRelevance(
    searchQuery: string,
    repos: Array<{ name: string; description: string; topics: string[] }>
): Promise<Map<string, number>> {
    const relevanceMap = new Map<string, number>();
    
    // Process repos in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);
        
        const promises = batch.map(repo =>
            calculateRepoRelevance(searchQuery, repo.name, repo.description, repo.topics)
                .then(score => ({ name: repo.name, score }))
        );
        
        const results = await Promise.all(promises);
        results.forEach(({ name, score }) => relevanceMap.set(name, score));
        
        // Small delay between batches
        if (i + batchSize < repos.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    return relevanceMap;
}

// Embedding functions for Q&A
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        
        return embedding.values;
    } catch (error) {
        console.error('Embedding generation error:', error);
        throw error;
    }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const batchEmbeddings = await Promise.all(
            batch.map(text => generateEmbedding(text))
        );
        
        embeddings.push(...batchEmbeddings);
        
        // Small delay between batches
        if (i + batchSize < texts.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    return embeddings;
}

export async function answerQuestionWithContext(
    question: string,
    contextChunks: Array<{ content: string; file: string; score: number }>
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const contextText = contextChunks
            .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.file}]\n${chunk.content}`)
            .join('\n\n---\n\n');

        const prompt = `You are an AI assistant analyzing a GitHub repository. Based on the following code and documentation excerpts, answer the user's question clearly and concisely.

Context from repository:
${contextText}

User Question: ${question}

Instructions:
- Provide a clear, direct answer based on the context provided
- Reference specific files when relevant (e.g., "In src/auth.ts...")
- If the context doesn't contain enough information, say so honestly
- Keep the answer concise but informative
- Use code snippets if helpful

Answer:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Question answering error:', error);
        throw error;
    }
}

// Chunk text into smaller pieces for embedding
export function chunkText(text: string, maxChunkSize = 500): string[] {
    const chunks: string[] = [];
    const lines = text.split('\n');
    let currentChunk = '';
    
    for (const line of lines) {
        if ((currentChunk + line).length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }
    
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}
