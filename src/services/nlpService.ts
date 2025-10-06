import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:5001/api/nlp';

class NLPService {
  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async initializeSystem(): Promise<{ success: boolean; message: string; chunksCount?: number }> {
    try {
      const response = await fetch(`${API_URL}/initialize`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to initialize NLP system:', error);
      throw new Error('Failed to initialize NLP system');
    }
  }

  async generateMCQQuestions(topic: string, difficulty: string = 'beginner', count: number = 5) {
    try {
      const response = await fetch(`${API_URL}/generate-mcq`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ topic, difficulty, count })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to generate MCQ questions:', error);
      throw new Error('Failed to generate MCQ questions');
    }
  }

  async generateProblems(topic: string, difficulty: string = 'Easy', count: number = 3) {
    try {
      const response = await fetch(`${API_URL}/generate-problems`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ topic, difficulty, count })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to generate problems:', error);
      throw new Error('Failed to generate problems');
    }
  }

  async getRecommendations(performance: any) {
    try {
      const response = await fetch(`${API_URL}/recommendations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ performance })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async getProblems(filters?: { difficulty?: string; category?: string; limit?: number }) {
    try {
      const params = new URLSearchParams();
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await fetch(`${API_URL}/problems?${params}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get problems:', error);
      throw new Error('Failed to get problems');
    }
  }

  async getProblemById(id: string) {
    try {
      const response = await fetch(`${API_URL}/problems/${id}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get problem:', error);
      throw new Error('Failed to get problem');
    }
  }

  async getMCQQuestions(problemId?: string, count: number = 5) {
    try {
      const endpoint = problemId 
        ? `${API_URL}/problems/${problemId}/mcq?count=${count}`
        : `${API_URL}/problems/general/mcq?count=${count}`;
        
      const response = await fetch(endpoint, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get MCQ questions:', error);
      throw new Error('Failed to get MCQ questions');
    }
  }

  async getBookContent(filters?: { topic?: string; difficulty?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.topic) params.append('topic', filters.topic);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      
      const response = await fetch(`${API_URL}/book-content?${params}`, {
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get book content:', error);
      throw new Error('Failed to get book content');
    }
  }
}

export default new NLPService();