"""
CHATGPT-STYLE MCQ Q&A SYSTEM - Backend Integration
=================================================
Adapted for Node.js integration with simplified dependencies
"""

import json
import re
import os
import sys
from typing import List, Dict, Tuple, Optional
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import time
from collections import Counter

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Configuration settings"""
    JSON_FILE = os.path.join(os.path.dirname(__file__), "data", "DSA_Arrays1.json")
    MAX_LENGTH = 512
    
    @classmethod
    def validate_files(cls):
        if not os.path.exists(cls.JSON_FILE):
            print(f"❌ JSON file not found: {cls.JSON_FILE}")
            return False
        return True

# ============================================================================
# AUTOCOMPLETE ENGINE
# ============================================================================

class AutocompleteEngine:
    """Real-time keyword prediction from JSON database"""
    
    def __init__(self, questions_db: List[Dict]):
        self.questions_db = questions_db
        self.word_frequency = Counter()
        self.question_words = []
        self.build_autocomplete_index()
    
    def build_autocomplete_index(self):
        """Build word frequency index from all questions"""
        print("   🔨 Building autocomplete index...")
        
        for q in self.questions_db:
            # Get words from question
            words = re.findall(r'\b\w+\b', q['question'].lower())
            self.question_words.extend(words)
            self.word_frequency.update(words)
            
            # Add keywords
            for keyword in q.get('keywords', []):
                kw_words = re.findall(r'\b\w+\b', keyword.lower())
                self.question_words.extend(kw_words)
                self.word_frequency.update(kw_words)
        
        # Remove common words
        common_words = {'what', 'is', 'the', 'a', 'an', 'in', 'for', 'of', 'to', 'and', 'or'}
        for word in common_words:
            self.word_frequency.pop(word, None)
        
        print(f"   ✅ Indexed {len(self.word_frequency)} unique words")
    
    def predict_next_words(self, partial_text: str, top_k: int = 5) -> List[str]:
        """Predict next possible words based on partial input"""
        
        if not partial_text or len(partial_text) < 2:
            return []
        
        partial_lower = partial_text.lower().strip()
        words = partial_lower.split()
        
        # Get last incomplete word
        if partial_text.endswith(' '):
            # User finished a word, suggest next words
            last_word = words[-1] if words else ""
            predictions = self._get_next_word_suggestions(last_word, top_k)
        else:
            # User is typing a word, complete it
            last_word = words[-1] if words else ""
            predictions = self._get_word_completions(last_word, top_k)
        
        return predictions
    
    def _get_word_completions(self, partial_word: str, top_k: int) -> List[str]:
        """Complete the current word being typed"""
        if len(partial_word) < 2:
            return []
        
        # Find words that start with partial_word
        candidates = []
        for word, freq in self.word_frequency.most_common(200):
            if word.startswith(partial_word) and word != partial_word:
                candidates.append((word, freq))
        
        # Sort by frequency and return top_k
        candidates.sort(key=lambda x: x[1], reverse=True)
        return [word for word, _ in candidates[:top_k]]
    
    def _get_next_word_suggestions(self, previous_word: str, top_k: int) -> List[str]:
        """Suggest next words based on context"""
        # Context-aware suggestions based on previous word
        context_map = {
            'time': ['complexity', 'space', 'worst', 'best', 'average'],
            'space': ['complexity', 'worst', 'best', 'average'],
            'hash': ['table', 'function', 'collision', 'map'],
            'array': ['list', 'size', 'index', 'element', 'resizing'],
            'worst': ['case', 'time', 'complexity'],
            'best': ['case', 'time', 'complexity'],
            'binary': ['search', 'tree', 'heap'],
            'linked': ['list', 'node'],
            'merge': ['sort', 'algorithm'],
            'quick': ['sort', 'algorithm'],
        }
        
        if previous_word in context_map:
            return context_map[previous_word][:top_k]
        
        # Return most common technical words
        technical_words = [word for word, _ in self.word_frequency.most_common(50) 
                          if len(word) > 3]
        return technical_words[:top_k]
    
    def get_question_suggestions(self, partial_text: str, top_k: int = 3) -> List[str]:
        """Suggest complete questions based on partial input"""
        if not partial_text or len(partial_text) < 3:
            return []
        
        partial_lower = partial_text.lower()
        suggestions = []
        
        for q in self.questions_db:
            question_lower = q['question'].lower()
            if partial_lower in question_lower:
                suggestions.append(q['question'])
        
        return suggestions[:top_k]

# ============================================================================
# KNOWLEDGE BASE
# ============================================================================

class LocalKnowledgeBase:
    """Local knowledge base with TF-IDF search"""
    
    def __init__(self, json_path: str):
        self.json_path = json_path
        self.questions_db = []
        self.vectorizer = None
        self.question_vectors = None
        self.load_and_index()
    
    def load_and_index(self):
        print(f"\n📚 Loading knowledge base from: {self.json_path}")
        
        with open(self.json_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        
        for item in raw_data:
            self.questions_db.append({
                'question': item['question'].strip(),
                'options': item['options'],
                'correct_answer': item['correct_answer'],
                'correct_option': item['options'][item['correct_answer']],
                'explanation': item.get('explanation', 'No explanation provided.'),
                'topic': item.get('topic', 'General'),
                'difficulty': item.get('difficulty', 'Medium'),
                'keywords': item.get('keywords', [])
            })
        
        print(f"   ✅ Loaded {len(self.questions_db)} questions")
        
        print("   🔨 Building search index...")
        texts = []
        for q in self.questions_db:
            combined = f"{q['question']} {' '.join(q['keywords'])} {q['topic']}"
            texts.append(combined.lower())
        
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=1000,
            stop_words='english'
        )
        self.question_vectors = self.vectorizer.fit_transform(texts)
        print("   ✅ Search index ready")
        
        topics = set(q['topic'] for q in self.questions_db)
        print(f"   📊 Topics: {', '.join(topics)}")
    
    def find_similar_questions(self, query: str, top_k: int = 5) -> List[Dict]:
        if not query.strip():
            return []
        
        query_lower = query.lower().strip()
        for q in self.questions_db:
            if query_lower == q['question'].lower().strip():
                return [{**q, 'match_type': 'exact', 'score': 1.0}]
        
        query_vector = self.vectorizer.transform([query.lower()])
        similarities = cosine_similarity(query_vector, self.question_vectors)[0]
        
        matches = []
        for idx, score in enumerate(similarities):
            if score > 0.1:
                matches.append({
                    **self.questions_db[idx],
                    'match_type': 'semantic',
                    'score': float(score)
                })
        
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:top_k]

# ============================================================================
# QA SYSTEM
# ============================================================================

class LocalQASystem:
    """Integrated system without ML model for simplicity"""
    
    def __init__(self, kb: LocalKnowledgeBase):
        self.kb = kb
        self.query_count = 0
        self.autocomplete = AutocompleteEngine(kb.questions_db)
    
    def answer_question(self, user_query: str) -> Dict:
        self.query_count += 1
        start_time = time.time()
        
        matches = self.kb.find_similar_questions(user_query, top_k=5)
        
        if not matches:
            return {
                'status': 'no_match',
                'message': 'No matching questions found',
                'total_time': time.time() - start_time
            }
        
        best_match = matches[0]
        
        return {
            'status': 'exact_match' if best_match.get('match_type') == 'exact' else 'semantic_match',
            'question': best_match['question'],
            'answer': best_match['correct_option'],
            'answer_index': best_match['correct_answer'],
            'explanation': best_match['explanation'],
            'topic': best_match['topic'],
            'difficulty': best_match['difficulty'],
            'confidence': best_match['score'],
            'options': best_match['options'],
            'suggestions': matches[1:4],
            'total_time': time.time() - start_time
        }
    
    def get_autocomplete(self, partial_text: str) -> Dict:
        """Get autocomplete suggestions"""
        word_predictions = self.autocomplete.predict_next_words(partial_text, top_k=5)
        question_suggestions = self.autocomplete.get_question_suggestions(partial_text, top_k=3)
        
        return {
            'word_predictions': word_predictions,
            'question_suggestions': question_suggestions
        }

# ============================================================================
# MAIN FUNCTION FOR NODE.JS INTEGRATION
# ============================================================================

# Global system instance
qa_system = None

def initialize_system():
    """Initialize the QA system"""
    global qa_system
    
    if not Config.validate_files():
        return False
    
    try:
        kb = LocalKnowledgeBase(Config.JSON_FILE)
        qa_system = LocalQASystem(kb)
        print("✅ QA System initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize system: {e}")
        return False

def process_query(query: str) -> str:
    """Process a query and return JSON response"""
    global qa_system
    
    if not qa_system:
        if not initialize_system():
            return json.dumps({'error': 'System not initialized'})
    
    try:
        result = qa_system.answer_question(query)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({'error': str(e)})

def get_autocomplete_suggestions(partial_text: str) -> str:
    """Get autocomplete suggestions"""
    global qa_system
    
    if not qa_system:
        if not initialize_system():
            return json.dumps({'error': 'System not initialized'})
    
    try:
        result = qa_system.get_autocomplete(partial_text)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({'error': str(e)})

if __name__ == "__main__":
    # For testing
    if len(sys.argv) > 1:
        if sys.argv[1] == "init":
            initialize_system()
        elif sys.argv[1] == "query" and len(sys.argv) > 2:
            result = process_query(sys.argv[2])
            print(result)
        elif sys.argv[1] == "autocomplete" and len(sys.argv) > 2:
            result = get_autocomplete_suggestions(sys.argv[2])
            print(result)