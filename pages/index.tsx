import { useState } from 'react';
import dynamic from 'next/dynamic';

const CodeBlock = dynamic(() => import('@/components/CodeBlock'), { ssr: false });

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToonToJson = async () => {
    setError('');
    setOutput('');
    setLoading(true);
    setCopied(false);

    try {
      const response = await fetch('/api/toon-to-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: input }),
      });

      const result = await response.json();

      if (response.ok) {
        setOutput(result.data);
      } else {
        setError(result.error || 'Conversion failed');
      }
    } catch (err: any) {
      setError('An unexpected error occurred: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleJsonToToon = async () => {
    setError('');
    setOutput('');
    setLoading(true);
    setCopied(false);

    try {
      const response = await fetch('/api/json-to-toon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: input }),
      });

      const result = await response.json();

      if (response.ok) {
        setOutput(result.data);
      } else {
        setError(result.error || 'Conversion failed');
      }
    } catch (err: any) {
      setError('An unexpected error occurred: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
            TOON ↔ JSON Converter
          </h1>
          <p className="text-gray-300 text-lg">
            Convert between Token-Oriented Object Notation (TOON) and JSON formats
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700">
          {/* Action Buttons - Top */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleToonToJson}
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none border border-blue-400/20"
            >
              {loading ? 'Converting...' : 'Convert TOON → JSON'}
            </button>
            <button
              onClick={handleJsonToToon}
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none border border-green-400/20"
            >
              {loading ? 'Converting...' : 'Convert JSON → TOON'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border-l-4 border-red-500 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-300 font-semibold">Error:</p>
              </div>
              <p className="text-red-200 text-sm mt-2 ml-7">{error}</p>
            </div>
          )}

          {/* Input/Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-200 uppercase tracking-wide">
                  Input
                </label>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">TOON or JSON</span>
              </div>
              <div className="relative flex-1 min-h-[450px] border-2 border-gray-600 rounded-xl overflow-hidden shadow-inner bg-gray-900">
                <textarea
                  className="w-full h-full p-5 border-0 rounded-xl font-mono text-sm focus:outline-none resize-none bg-transparent text-gray-100 placeholder-gray-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Paste your TOON or JSON here...'
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Output Section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-200 uppercase tracking-wide">
                  Output
                </label>
                {output && (
                  <button
                    onClick={handleCopy}
                    className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="relative flex-1 min-h-[450px] border-2 border-gray-600 rounded-xl overflow-hidden shadow-inner bg-gray-900">
                {output ? (
                  <CodeBlock code={output} language="json" />
                ) : (
                  <div className="w-full h-full p-5 bg-gray-900 text-gray-500 font-mono text-sm flex items-center justify-center">
                    <div className="text-center">
                      {loading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-2"></div>
                          <span>Converting...</span>
                        </div>
                      ) : (
                        <span>Converted output will appear here</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
          <div className="flex items-center mb-6">
            <svg className="w-6 h-6 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-200">Format Examples</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-6 border border-blue-700/50">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <h3 className="text-lg font-bold text-gray-200">TOON Format</h3>
                <span className="ml-2 text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded font-semibold">Quoted Keys</span>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono shadow-inner border border-gray-700">
{`{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" }
  ]
}`}
              </pre>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <h3 className="text-lg font-bold text-gray-200">JSON Format</h3>
                <span className="ml-2 text-xs bg-green-600 text-green-100 px-2 py-1 rounded font-semibold">Unquoted Keys</span>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono shadow-inner border border-gray-700">
{`{
  users: [
    {
      id: 1,
      name: "Alice",
      role: "admin"
    },
    {
      id: 2,
      name: "Bob",
      role: "user"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

