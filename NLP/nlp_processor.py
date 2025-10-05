#!/usr/bin/env python3
import sys
import json
import os
import re
import random
from typing import List, Dict, Any
import argparse

# Simplified NLP processor for Node.js integration
class DSANLPProcessor:
    def __init__(self):
        self.book_content = ""
        self.processed_chunks = []
        self.initialized = False
        
    def initialize(self):
        """Initialize the NLP processor"""
        try:
            # Load book content if it exists
            book_path = os.path.join(os.path.dirname(__file__), 'book_content.txt')
            if os.path.exists(book_path):
                with open(book_path, 'r', encoding='utf-8') as f:
                    self.book_content = f.read()
                self.process_book_content()
            
            self.initialized = True
            return {"status": "success", "message": "NLP processor initialized"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def process_book_content(self):
        """Process book content into chunks"""
        if not self.book_content:
            return
            
        # Simple chunking by chapters/sections
        chapters = re.split(r'\n\s*(Chapter|Section)\s*\d+[:\.]?\s*([^\n]+)', self.book_content)
        
        current_topic = "Introduction"
        chunk_index = 0
        
        for i in range(0, len(chapters), 3):
            if i + 2 < len(chapters):
                topic = chapters[i + 2].strip()
                content = chapters[i + 3] if i + 3 < len(chapters) else ""
            else:
                topic = current_topic
                content = chapters[i]
            
            if len(content.strip()) > 100:  # Only process substantial content
                keywords = self.extract_keywords(content)
                difficulty = self.classify_difficulty(content)
                
                chunk = {
                    "topic": topic,
                    "content": content.strip(),
                    "keywords": keywords,
                    "difficulty": difficulty,
                    "chunkIndex": chunk_index
                }
                
                self.processed_chunks.append(chunk)
                chunk_index += 1
                current_topic = topic
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text"""
        # Simple keyword extraction
        dsa_keywords = [
            'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash table',
            'algorithm', 'complexity', 'sorting', 'searching', 'recursion', 'dynamic programming',
            'binary search', 'dfs', 'bfs', 'heap', 'priority queue'
        ]
        
        text_lower = text.lower()
        found_keywords = []
        
        for keyword in dsa_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        # Add some general keywords
        words = re.findall(r'\b[A-Za-z]{4,}\b', text)
        word_freq = {}
        for word in words:
            word_lower = word.lower()
            if word_lower not in ['that', 'this', 'with', 'from', 'they', 'have', 'will', 'been']:
                word_freq[word_lower] = word_freq.get(word_lower, 0) + 1
        
        # Get top frequent words
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        found_keywords.extend([word[0] for word in top_words])
        
        return found_keywords[:10]
    
    def classify_difficulty(self, content: str) -> str:
        """Classify content difficulty"""
        content_lower = content.lower()
        
        advanced_indicators = ['optimization', 'advanced', 'complex', 'theorem', 'proof']
        intermediate_indicators = ['algorithm', 'complexity', 'analysis', 'implementation']
        beginner_indicators = ['basic', 'introduction', 'simple', 'fundamental']
        
        advanced_score = sum(1 for indicator in advanced_indicators if indicator in content_lower)
        intermediate_score = sum(1 for indicator in intermediate_indicators if indicator in content_lower)
        beginner_score = sum(1 for indicator in beginner_indicators if indicator in content_lower)
        
        if advanced_score > 0:
            return 'advanced'
        elif intermediate_score > beginner_score:
            return 'intermediate'
        else:
            return 'beginner'
    
    def generate_mcq_questions(self, topic: str, difficulty: str, count: int) -> List[Dict]:
        """Generate MCQ questions based on topic and difficulty"""
        questions = []
        
        # Find relevant chunks
        relevant_chunks = [chunk for chunk in self.processed_chunks 
                          if topic.lower() in chunk['topic'].lower() or 
                          any(keyword in chunk['keywords'] for keyword in topic.lower().split())]
        
        if not relevant_chunks:
            # Use default questions if no relevant content found
            relevant_chunks = self.processed_chunks[:3] if self.processed_chunks else []
        
        # Generate questions from chunks
        for i in range(min(count, len(relevant_chunks))):
            chunk = relevant_chunks[i]
            question = self.create_mcq_from_chunk(chunk, difficulty)
            if question:
                questions.append(question)
        
        # Fill remaining with template questions if needed
        while len(questions) < count:
            template_question = self.get_template_question(topic, difficulty)
            questions.append(template_question)
        
        return questions[:count]
    
    def create_mcq_from_chunk(self, chunk: Dict, difficulty: str) -> Dict:
        """Create MCQ question from content chunk"""
        content = chunk['content']
        topic = chunk['topic']
        
        # Extract key concepts
        sentences = content.split('.')
        key_sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        if not key_sentences:
            return None
        
        # Create question based on content
        key_sentence = random.choice(key_sentences)
        
        # Generate question
        question_templates = [
            f"What is a key characteristic of {topic}?",
            f"According to the content, what can be said about {topic}?",
            f"Which statement about {topic} is correct?"
        ]
        
        question = random.choice(question_templates)
        
        # Create options
        correct_answer = key_sentence[:100] + "..." if len(key_sentence) > 100 else key_sentence
        
        wrong_options = [
            "It has exponential time complexity",
            "It requires additional memory allocation",
            "It works only with numeric data",
            "It uses recursive approach exclusively"
        ]
        
        options = [correct_answer] + random.sample(wrong_options, 3)
        random.shuffle(options)
        correct_index = options.index(correct_answer)
        
        return {
            "question": question,
            "options": options,
            "correctAnswer": correct_index,
            "explanation": f"The content states: {key_sentence}",
            "category": "conceptual",
            "difficulty": difficulty
        }
    
    def get_template_question(self, topic: str, difficulty: str) -> Dict:
        """Get template question when content is not available"""
        templates = {
            "arrays": {
                "question": "What is the time complexity of accessing an element in an array by index?",
                "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                "correctAnswer": 0,
                "explanation": "Array elements can be accessed directly using their index."
            },
            "binary search": {
                "question": "What is a prerequisite for binary search algorithm?",
                "options": ["Array must be sorted", "Array must be unsorted", "Array must have duplicates", "Array must be empty"],
                "correctAnswer": 0,
                "explanation": "Binary search requires the array to be sorted to work correctly."
            }
        }
        
        # Find matching template
        for key, template in templates.items():
            if key in topic.lower():
                return {
                    **template,
                    "category": "algorithm",
                    "difficulty": difficulty
                }
        
        # Default template
        return {
            "question": f"What is an important concept related to {topic}?",
            "options": ["Data organization", "Memory allocation", "Algorithm efficiency", "All of the above"],
            "correctAnswer": 3,
            "explanation": f"All mentioned concepts are important when studying {topic}.",
            "category": "general",
            "difficulty": difficulty
        }
    
    def generate_problems(self, topic: str, difficulty: str, count: int) -> List[Dict]:
        """Generate coding problems based on topic"""
        problems = []
        
        # Template problems based on topic
        problem_templates = {
            "arrays": {
                "title": "Two Sum",
                "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                "inputFormat": "nums = [2,7,11,15], target = 9",
                "outputFormat": "[0,1]",
                "constraints": ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹"],
                "tags": ["Array", "Hash Table"]
            },
            "binary search": {
                "title": "Binary Search",
                "description": "Given a sorted array of integers nums and an integer target, return the index of target if it exists, otherwise return -1.",
                "inputFormat": "nums = [-1,0,3,5,9,12], target = 9",
                "outputFormat": "4",
                "constraints": ["1 ≤ nums.length ≤ 10⁴", "-10⁴ < nums[i], target < 10⁴"],
                "tags": ["Array", "Binary Search"]
            }
        }
        
        # Generate problems
        for i in range(count):
            template_key = None
            for key in problem_templates:
                if key in topic.lower():
                    template_key = key
                    break
            
            if template_key:
                template = problem_templates[template_key]
            else:
                template = problem_templates["arrays"]  # Default
            
            problem = {
                "title": template["title"],
                "difficulty": difficulty,
                "description": template["description"],
                "inputFormat": template["inputFormat"],
                "outputFormat": template["outputFormat"],
                "constraints": template["constraints"],
                "tags": template["tags"],
                "testCases": [
                    {
                        "input": template["inputFormat"],
                        "output": template["outputFormat"],
                        "explanation": "Example test case"
                    }
                ],
                "hints": [
                    "Think about the most efficient approach",
                    "Consider using appropriate data structures",
                    "Analyze the time and space complexity"
                ]
            }
            
            problems.append(problem)
        
        return problems
    
    def get_recommendations(self, user_id: str, performance: Dict) -> Dict:
        """Get personalized recommendations"""
        recommendations = {
            "recommendedTopics": [],
            "suggestedDifficulty": "beginner",
            "weakAreas": [],
            "nextSteps": []
        }
        
        # Analyze performance
        if performance.get("accuracy", 0) < 0.5:
            recommendations["suggestedDifficulty"] = "beginner"
            recommendations["nextSteps"].append("Focus on fundamental concepts")
        elif performance.get("accuracy", 0) < 0.8:
            recommendations["suggestedDifficulty"] = "intermediate"
            recommendations["nextSteps"].append("Practice more complex problems")
        else:
            recommendations["suggestedDifficulty"] = "advanced"
            recommendations["nextSteps"].append("Challenge yourself with advanced topics")
        
        # Recommend topics based on available content
        available_topics = list(set([chunk["topic"] for chunk in self.processed_chunks]))
        recommendations["recommendedTopics"] = available_topics[:5]
        
        return recommendations

def main():
    processor = DSANLPProcessor()
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--initialize', action='store_true')
    parser.add_argument('--process-book', action='store_true')
    parser.add_argument('--generate-mcq', action='store_true')
    parser.add_argument('--generate-problems', action='store_true')
    parser.add_argument('--get-recommendations', action='store_true')
    
    args = parser.parse_args()
    
    if args.initialize:
        result = processor.initialize()
        print(json.dumps(result))
        return
    
    # Read input from stdin for other operations
    try:
        input_data = sys.stdin.read()
        if input_data:
            data = json.loads(input_data)
        else:
            data = {}
    except:
        data = {}
    
    processor.initialize()  # Always initialize first
    
    if args.process_book:
        if 'content' in data:
            processor.book_content = data['content']
            processor.process_book_content()
            result = {
                "status": "success",
                "chunks": processor.processed_chunks,
                "message": f"Processed {len(processor.processed_chunks)} chunks"
            }
        else:
            result = {"status": "error", "message": "No content provided"}
        print(json.dumps(result))
    
    elif args.generate_mcq:
        topic = data.get('topic', 'general')
        difficulty = data.get('difficulty', 'beginner')
        count = data.get('count', 5)
        
        questions = processor.generate_mcq_questions(topic, difficulty, count)
        result = {
            "status": "success",
            "questions": questions
        }
        print(json.dumps(result))
    
    elif args.generate_problems:
        topic = data.get('topic', 'arrays')
        difficulty = data.get('difficulty', 'Easy')
        count = data.get('count', 3)
        
        problems = processor.generate_problems(topic, difficulty, count)
        result = {
            "status": "success",
            "problems": problems
        }
        print(json.dumps(result))
    
    elif args.get_recommendations:
        user_id = data.get('userId', '')
        performance = data.get('performance', {})
        
        recommendations = processor.get_recommendations(user_id, performance)
        result = {
            "status": "success",
            "recommendations": recommendations
        }
        print(json.dumps(result))

if __name__ == "__main__":
    main()