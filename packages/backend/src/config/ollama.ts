import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llava:latest';

export const ollamaClient: AxiosInstance = axios.create({
  baseURL: OLLAMA_BASE_URL,
  timeout: 120000, // 2 minutes for LLM processing
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function testOllamaConnection(): Promise<boolean> {
  try {
    const response = await ollamaClient.get('/api/tags');
    console.log('✅ Ollama connected');
    console.log('Available models:', response.data.models?.map((m: any) => m.name).join(', '));
    return true;
  } catch (error) {
    console.error('❌ Ollama connection failed:', error);
    return false;
  }
}
