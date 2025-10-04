import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Database, Brain, FileText } from 'lucide-react';
import axios from 'axios';

interface SystemStatus {
  systemReady: boolean;
  customDataLoaded: boolean;
  hasUploadedModel: boolean;
  hasUploadedJson: boolean;
  questionCount: number;
  modelLoaded: boolean;
}

export default function ModelUploader() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get('/api/nlp/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    
    try {
      // Upload files
      const uploadResponse = await axios.post('/api/upload/upload-assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.data.success) {
        setMessage('Files uploaded successfully! Loading into system...');
        
        // Load custom data
        const loadResponse = await axios.post('/api/nlp/load-custom-data');
        
        if (loadResponse.data.success) {
          setMessage(`✅ System loaded successfully! ${loadResponse.data.questionCount} questions available.`);
          checkStatus();
        } else {
          setMessage(`❌ Error loading data: ${loadResponse.data.error}`);
        }
      }
    } catch (error: any) {
      setMessage(`❌ Upload error: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const loadCustomData = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/nlp/load-custom-data');
      if (response.data.success) {
        setMessage(`✅ Custom data loaded! ${response.data.questionCount} questions available.`);
        checkStatus();
      } else {
        setMessage(`❌ Error: ${response.data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Loading error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Database className="h-6 w-6 text-blue-400 mr-2" />
          Model & Data Integration
        </h2>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${
            status?.systemReady ? 'bg-green-900/20 border-green-600/30' : 'bg-red-900/20 border-red-600/30'
          }`}>
            <div className="flex items-center">
              {status?.systemReady ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              )}
              <span className="text-white font-medium">System Status</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {status?.systemReady ? 'Ready' : 'Not Ready'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${
            status?.hasUploadedJson ? 'bg-green-900/20 border-green-600/30' : 'bg-yellow-900/20 border-yellow-600/30'
          }`}>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-white font-medium">JSON Data</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {status?.hasUploadedJson ? `${status.questionCount} questions` : 'Not uploaded'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${
            status?.modelLoaded ? 'bg-green-900/20 border-green-600/30' : 'bg-yellow-900/20 border-yellow-600/30'
          }`}>
            <div className="flex items-center">
              <Brain className="h-5 w-5 text-purple-400 mr-2" />
              <span className="text-white font-medium">AI Model</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {status?.modelLoaded ? 'Loaded' : status?.hasUploadedModel ? 'Uploaded' : 'Not uploaded'}
            </p>
          </div>
        </div>

        {/* Upload Instructions */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-medium mb-2">📁 Upload Your Assets</h3>
          <p className="text-gray-300 text-sm mb-2">
            Upload your trained model and JSON data to integrate with the system:
          </p>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• <strong>Model:</strong> Your enhanced_model_20250914_211607 folder (zip it first)</li>
            <li>• <strong>JSON:</strong> Your DSA_Arrays1.json file with questions</li>
          </ul>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Model (ZIP file)
              </label>
              <input
                type="file"
                name="model"
                accept=".zip"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Zip your model folder first
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                JSON Data File
              </label>
              <input
                type="file"
                name="json"
                accept=".json"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Your DSA_Arrays1.json file
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload & Load'}
            </button>

            {status?.hasUploadedJson && (
              <button
                type="button"
                onClick={loadCustomData}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Database className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Load Data'}
              </button>
            )}
          </div>
        </form>

        {/* Status Message */}
        {message && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">🚀 How to Use</h3>
          <ol className="text-gray-300 text-sm space-y-1">
            <li>1. Zip your model folder: <code className="bg-gray-600 px-1 rounded">enhanced_model_20250914_211607.zip</code></li>
            <li>2. Upload both the model ZIP and JSON file using the form above</li>
            <li>3. The system will automatically load your data and model</li>
            <li>4. Start asking questions in the MCQ Chat interface!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}