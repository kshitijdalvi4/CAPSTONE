import fs from 'fs';
import path from 'path';
import ModelLoader from './model_loader.js';

class AutocompleteEngine {
    constructor(questionsDb) {
        this.questionsDb = questionsDb;
        this.wordFrequency = new Map();
        this.questionWords = [];
        this.buildAutocompleteIndex();
    }

    buildAutocompleteIndex() {
        console.log('   🔨 Building autocomplete index...');
        
        for (const q of this.questionsDb) {
            // Get words from question
            const words = q.question.toLowerCase().match(/\b\w+\b/g) || [];
            this.questionWords.push(...words);
            
            // Update word frequency
            words.forEach(word => {
                this.wordFrequency.set(word, (this.wordFrequency.get(word) || 0) + 1);
            });
            
            // Add keywords
            if (q.keywords) {
                q.keywords.forEach(keyword => {
                    const kwWords = keyword.toLowerCase().match(/\b\w+\b/g) || [];
                    this.questionWords.push(...kwWords);
                    kwWords.forEach(word => {
                        this.wordFrequency.set(word, (this.wordFrequency.get(word) || 0) + 1);
                    });
                });
            }
        }
        
        // Remove common words
        const commonWords = ['what', 'is', 'the', 'a', 'an', 'in', 'for', 'of', 'to', 'and', 'or'];
        commonWords.forEach(word => this.wordFrequency.delete(word));
        
        console.log(`   ✅ Indexed ${this.wordFrequency.size} unique words`);
    }

    predictNextWords(partialText, topK = 5) {
        if (!partialText || partialText.length < 2) {
            return [];
        }

        const partialLower = partialText.toLowerCase().trim();
        const words = partialLower.split(' ');
        
        if (partialText.endsWith(' ')) {
            const lastWord = words[words.length - 1] || '';
            return this.getNextWordSuggestions(lastWord, topK);
        } else {
            const lastWord = words[words.length - 1] || '';
            return this.getWordCompletions(lastWord, topK);
        }
    }

    getWordCompletions(partialWord, topK) {
        if (partialWord.length < 2) {
            return [];
        }

        const candidates = [];
        for (const [word, freq] of this.wordFrequency.entries()) {
            if (word.startsWith(partialWord) && word !== partialWord) {
                candidates.push({ word, freq });
            }
        }

        candidates.sort((a, b) => b.freq - a.freq);
        return candidates.slice(0, topK).map(c => c.word);
    }

    getNextWordSuggestions(previousWord, topK) {
        const contextMap = {
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
        };

        if (contextMap[previousWord]) {
            return contextMap[previousWord].slice(0, topK);
        }

        // Return most common technical words
        const sortedWords = Array.from(this.wordFrequency.entries())
            .filter(([word]) => word.length > 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([word]) => word);
        
        return sortedWords.slice(0, topK);
    }

    getQuestionSuggestions(partialText, topK = 3) {
        if (!partialText || partialText.length < 3) {
            return [];
        }

        const partialLower = partialText.toLowerCase();
        const suggestions = [];

        for (const q of this.questionsDb) {
            const questionLower = q.question.toLowerCase();
            if (questionLower.includes(partialLower)) {
                suggestions.push(q.question);
            }
        }

        return suggestions.slice(0, topK);
    }
}

class LocalKnowledgeBase {
    constructor(jsonPath) {
        this.jsonPath = jsonPath;
        this.questionsDb = [];
        this.loadAndIndex();
    }

    loadAndIndex() {
        console.log(`📚 Loading knowledge base from: ${this.jsonPath}`);
        
        try {
            const rawData = JSON.parse(fs.readFileSync(this.jsonPath, 'utf-8'));
            
            for (const item of rawData) {
                this.questionsDb.push({
                    question: item.question.trim(),
                    options: item.options,
                    correct_answer: item.correct_answer,
                    correct_option: item.options[item.correct_answer],
                    explanation: item.explanation || 'No explanation provided.',
                    topic: item.topic || 'General',
                    difficulty: item.difficulty || 'Medium',
                    keywords: item.keywords || []
                });
            }
            
            console.log(`   ✅ Loaded ${this.questionsDb.length} questions`);
            
            const topics = [...new Set(this.questionsDb.map(q => q.topic))];
            console.log(`   📊 Topics: ${topics.join(', ')}`);
        } catch (error) {
            console.error(`❌ Error loading knowledge base: ${error.message}`);
            throw error;
        }
    }

    // Simple text similarity using word overlap
    calculateSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
        const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    findSimilarQuestions(query, topK = 5) {
        if (!query.trim()) {
            return [];
        }

        const queryLower = query.toLowerCase().trim();
        
        // Check for exact match first
        for (const q of this.questionsDb) {
            if (queryLower === q.question.toLowerCase().trim()) {
                return [{ ...q, match_type: 'exact', score: 1.0 }];
            }
        }

        // Calculate similarities
        const matches = [];
        for (const q of this.questionsDb) {
            const combined = `${q.question} ${q.keywords.join(' ')} ${q.topic}`;
            const score = this.calculateSimilarity(query, combined);
            
            if (score > 0.1) {
                matches.push({
                    ...q,
                    match_type: 'semantic',
                    score: score
                });
            }
        }

        matches.sort((a, b) => b.score - a.score);
        return matches.slice(0, topK);
    }
}

class LocalQASystem {
    constructor(kb, modelLoader = null) {
        this.kb = kb;
        this.modelLoader = modelLoader;
        this.queryCount = 0;
    }

    async answerQuestion(userQuery) {
        this.queryCount++;
        const startTime = Date.now();

        const matches = this.kb.findSimilarQuestions(userQuery, 5);

        if (matches.length === 0) {
            return {
                status: 'no_match',
                message: 'No matching questions found',
                total_time: (Date.now() - startTime) / 1000
            };
        }

        const bestMatch = matches[0];

        if (bestMatch.match_type === 'exact') {
            return {
                status: 'exact_match',
                question: bestMatch.question,
                answer: bestMatch.correct_option,
                answer_index: bestMatch.correct_answer,
                explanation: bestMatch.explanation,
                topic: bestMatch.topic,
                difficulty: bestMatch.difficulty,
                confidence: 1.0,
                suggestions: matches.slice(1, 4),
                total_time: (Date.now() - startTime) / 1000
            };
        }

        // Try to use the loaded model if available
        if (this.modelLoader && this.modelLoader.isReady()) {
            try {
                const prediction = await this.modelLoader.predict(userQuery, bestMatch.options);
                
                return {
                    status: 'model_prediction',
                    original_query: userQuery,
                    matched_question: bestMatch.question,
                    match_score: bestMatch.score,
                    answer: prediction.predicted_answer,
                    answer_index: prediction.predicted_idx,
                    confidence: prediction.confidence,
                    all_probabilities: prediction.all_probabilities,
                    options: bestMatch.options,
                    explanation: bestMatch.explanation,
                    topic: bestMatch.topic,
                    difficulty: bestMatch.difficulty,
                    inference_time: prediction.inference_time,
                    suggestions: matches.slice(1, 4),
                    total_time: (Date.now() - startTime) / 1000
                };
            } catch (error) {
                console.error('Model prediction error:', error);
                // Fall back to semantic matching
            }
        }

        // For semantic matches, return the best match with confidence based on similarity
        return {
            status: 'semantic_match',
            original_query: userQuery,
            matched_question: bestMatch.question,
            match_score: bestMatch.score,
            answer: bestMatch.correct_option,
            answer_index: bestMatch.correct_answer,
            confidence: bestMatch.score,
            options: bestMatch.options,
            explanation: bestMatch.explanation,
            topic: bestMatch.topic,
            difficulty: bestMatch.difficulty,
            suggestions: matches.slice(1, 4),
            total_time: (Date.now() - startTime) / 1000
        };
    }
}

// Initialize the system
function initializeMCQSystem(customJsonPath = null, modelPath = null) {
    try {
        const jsonPath = customJsonPath || path.join(path.dirname(new URL(import.meta.url).pathname), 'data', 'DSA_Arrays1.json');
        const kb = new LocalKnowledgeBase(jsonPath);
        const autocomplete = new AutocompleteEngine(kb.questionsDb);
        
        let modelLoader = null;
        if (modelPath) {
            modelLoader = new ModelLoader();
            // Model loading will be done separately via API call
        }
        
        const qaSystem = new LocalQASystem(kb, modelLoader);
        
        console.log('✅ MCQ System initialized successfully');
        
        return {
            kb,
            autocomplete,
            qaSystem,
            modelLoader
        };
    } catch (error) {
        console.error('❌ Failed to initialize MCQ system:', error.message);
        throw error;
    }
}

export {
    AutocompleteEngine,
    LocalKnowledgeBase,
    LocalQASystem,
    ModelLoader,
    initializeMCQSystem
};