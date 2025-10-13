import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keyType, key } = req.body;

    if (!key) {
      return res.status(400).json({ valid: false, error: 'Key is required' });
    }

    if (keyType === 'github') {
      // Test GitHub token
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${key}`,
        },
      });
      
      return res.status(200).json({ valid: response.status === 200 });
    } else if (keyType === 'gemini') {
      // Test Gemini API key
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      await model.generateContent('test');
      
      return res.status(200).json({ valid: true });
    }

    res.status(400).json({ valid: false, error: 'Invalid key type' });
  } catch (error: any) {
    console.error('Error testing API key:', error);
    res.status(200).json({ valid: false, error: error.message });
  }
}
