import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sparkles, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

function App() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const [engine, setEngine] = useState('nlp');
  const [style, setStyle] = useState('professional');

  const typingTimeoutRef = useRef(null);

  // Auto-analyze debounced effect
  useEffect(() => {
    if (!text.trim()) {
      setAnalysis(null);
      return;
    }

    // Clear the previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Call analyzeText 1.5s after user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      analyzeText(text);
    }, 1500);

    return () => clearTimeout(typingTimeoutRef.current);
  }, [text, engine, style]);

  const analyzeText = async (content) => {
    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        content,
        engine,
        style
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const applyVariant = (polishedText) => {
    if (!polishedText) return;
    let cleanText = polishedText;
    if (polishedText.includes('POLISHED VERSION:')) {
      cleanText = polishedText.split('REASONING:')[0].replace('POLISHED VERSION:', '').trim();
    }
    setText(cleanText);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Sparkles size={24} strokeWidth={2.5} />
          <span>Parthi AI: Email Formation</span>
        </div>
        <div className="header-controls">
          <select
            className="dropdown"
            value={engine}
            onChange={e => setEngine(e.target.value)}
          >
            <option value="nlp">Engine: Fast NLP</option>
            <option value="ollama">Engine: Local Ollama</option>
            <option value="openai">Engine: OpenAI ChatGPT</option>
            <option value="gemini">Engine: Google Gemini</option>
          </select>

          <select
            className="dropdown"
            value={style}
            onChange={e => setStyle(e.target.value)}
          >
            <option value="professional">Tone: Professional</option>
            <option value="casual">Tone: Casual</option>
            <option value="friendly">Tone: Friendly</option>
            <option value="concise">Tone: Concise</option>
          </select>

          <button className="btn-primary" onClick={() => text.trim() && analyzeText(text)}>
            {isAnalyzing ? <RefreshCw size={18} className="spin" /> : <Sparkles size={18} />}
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </header>

      <main className="main-layout">
        <section className="editor-container">
          <div className="textarea-wrapper">
            <textarea
              className="editor-textarea"
              placeholder="Start writing your document or email here... RefineAI will automatically analyze your text and provide rich suggestions."
              value={text}
              onChange={handleTextChange}
              spellCheck="false"
            />
          </div>
        </section>

        <section className="sidebar">
          {/* Overall Performance Section */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Performance Score</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{analysis?.word_count || 0}</div>
                <div className="metric-label">Words</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{analysis?.readability?.score ? Math.round(analysis.readability.score) : '--'}</div>
                <div className="metric-label">Readability</div>
              </div>
            </div>
            {analysis?.tone && (
              <div className="metrics-grid" style={{ marginTop: '1rem', gridTemplateColumns: '1fr' }}>
                <div className="metric-card">
                  <div className="metric-value tone-value">{analysis.tone}</div>
                  <div className="metric-label">Detected Tone</div>
                </div>
              </div>
            )}
          </div>

          {/* Assistant Suggestions Section */}
          <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
            <h3 className="sidebar-title">Assistant Insights</h3>

            {isAnalyzing ? (
              <div className="empty-state">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
                Reviewing your document...
              </div>
            ) : !analysis ? (
              <div className="empty-state">
                <Sparkles size={32} color="var(--text-secondary)" opacity={0.5} />
                Start typing to get real-time content suggestions, grammar checks, and tone analysis.
              </div>
            ) : (
              <>
                {/* Full Context Rewrite Suggestion */}
                {(analysis.variants?.formal) && (
                  <div className="suggestion-card">
                    <div className="suggestion-header">
                      <Sparkles size={18} color="var(--accent)" />
                      Smart Rewrite ({analysis.variants.engine})
                    </div>

                    <div className="suggestion-body">
                      {analysis.variants.formal.includes('POLISHED VERSION:')
                        ? analysis.variants.formal.split('REASONING:')[0].replace('POLISHED VERSION:', '').trim()
                        : analysis.variants.formal}
                    </div>

                    <div className="suggestion-actions">
                      <button
                        className="btn-accept"
                        onClick={() => applyVariant(analysis.variants.formal)}
                      >
                        Apply Rewrite
                      </button>
                    </div>

                    {analysis.variants.formal.includes('REASONING:') && (
                      <div className="reasoning-text">
                        <strong>Why we suggest this:</strong><br />
                        {analysis.variants.formal.split('REASONING:')[1].trim()}
                      </div>
                    )}
                  </div>
                )}

                {/* Specific Grammar/Rule-based Issues */}
                {analysis?.suggestions?.length > 0 && analysis.suggestions.map((sug, i) => (
                  <div key={i} className="suggestion-card grammar">
                    <div className="suggestion-header" style={{ color: '#d97706' }}>
                      <AlertCircle size={18} />
                      {sug.issue}
                    </div>
                    <div className="suggestion-body" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
                      {sug.message}
                    </div>
                  </div>
                ))}

                {/* Empty State when Everything is Perfect */}
                {analysis?.suggestions?.length === 0 && (
                  <div className="suggestion-card" style={{ borderLeftColor: '#10b981' }}>
                    <div className="suggestion-header" style={{ color: '#059669' }}>
                      <CheckCircle size={18} />
                      Grammar is Perfect
                    </div>
                    <div className="suggestion-body" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}>
                      We couldn't find any explicit grammar, punctuation, or wordiness issues in your text!
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
