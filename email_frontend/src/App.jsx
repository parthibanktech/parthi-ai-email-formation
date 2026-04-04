import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sparkles, CheckCircle, AlertCircle, RefreshCw, Settings, X, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

function App() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const [engine, setEngine] = useState('nlp');
  const [style, setStyle] = useState('professional');

  // API Key state
  const [showSettings, setShowSettings] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  const typingTimeoutRef = useRef(null);

  // Show settings panel automatically when a cloud engine is selected and no key is set
  useEffect(() => {
    if ((engine === 'gemini' && !geminiKey) || (engine === 'openai' && !openaiKey)) {
      setShowSettings(true);
    }
  }, [engine]);

  // Auto-analyze debounced effect
  useEffect(() => {
    if (!text.trim()) {
      setAnalysis(null);
      setError(null);
      return;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      analyzeText(text);
    }, 1500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [text, engine, style]);

  const analyzeText = async (content) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        content,
        engine,
        style,
        gemini_api_key: geminiKey,
        openai_api_key: openaiKey,
      });
      setAnalysis(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Analysis failed. Please try again.';
      setError(detail);
      setAnalysis(null);
      // Auto-open settings if it's an API key error
      if (detail.toLowerCase().includes('api key')) {
        setShowSettings(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextChange = (e) => setText(e.target.value);

  const applyVariant = (polishedText) => {
    if (!polishedText) return;
    let cleanText = polishedText;
    if (polishedText.includes('POLISHED VERSION:')) {
      cleanText = polishedText.split('REASONING:')[0].replace('POLISHED VERSION:', '').trim();
    }
    setText(cleanText);
  };

  const needsApiKey = engine === 'gemini' || engine === 'openai';
  const hasKeyForEngine =
    (engine === 'gemini' && geminiKey.trim()) ||
    (engine === 'openai' && openaiKey.trim()) ||
    engine === 'nlp' || engine === 'ollama';

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Sparkles size={24} strokeWidth={2.5} />
          <span>Parthi AI: Email Formation</span>
        </div>
        <div className="header-controls">
          <select className="dropdown" value={engine} onChange={e => setEngine(e.target.value)}>
            <option value="nlp">Engine: Fast NLP</option>
            <option value="ollama">Engine: Local Ollama</option>
            <option value="openai">Engine: OpenAI ChatGPT</option>
            <option value="gemini">Engine: Google Gemini</option>
          </select>

          <select className="dropdown" value={style} onChange={e => setStyle(e.target.value)}>
            <option value="professional">Tone: Professional</option>
            <option value="casual">Tone: Casual</option>
            <option value="friendly">Tone: Friendly</option>
            <option value="concise">Tone: Concise</option>
          </select>

          {/* Settings button — shows badge if cloud engine needs a key */}
          <button
            className={`btn-settings ${needsApiKey && !hasKeyForEngine ? 'btn-settings--warn' : ''}`}
            onClick={() => setShowSettings(s => !s)}
            title="API Key Settings"
          >
            <Settings size={18} />
            {needsApiKey && !hasKeyForEngine && <span className="key-badge">!</span>}
          </button>

          <button className="btn-primary" onClick={() => text.trim() && analyzeText(text)}>
            {isAnalyzing ? <RefreshCw size={18} className="spin" /> : <Sparkles size={18} />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </header>

      {/* ── API Key Settings Panel ─────────────────────────────── */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <span>🔑 API Key Settings</span>
            <button className="settings-close" onClick={() => setShowSettings(false)}>
              <X size={16} />
            </button>
          </div>
          <p className="settings-hint">
            Keys entered here take priority over your <code>.env</code> file.
            Leave blank to use the server's environment variable.
          </p>
          <div className="settings-fields">
            {/* OpenAI Key */}
            <div className="key-field">
              <label className="key-label">
                🟡 OpenAI API Key
                {engine === 'openai' && !openaiKey && <span className="key-required"> (required for selected engine)</span>}
              </label>
              <div className="key-input-wrapper">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  className="key-input"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                />
                <button className="key-toggle" onClick={() => setShowOpenaiKey(v => !v)}>
                  {showOpenaiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Gemini Key */}
            <div className="key-field">
              <label className="key-label">
                🔵 Gemini API Key
                {engine === 'gemini' && !geminiKey && <span className="key-required"> (required for selected engine)</span>}
              </label>
              <div className="key-input-wrapper">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  className="key-input"
                  placeholder="AIza..."
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                />
                <button className="key-toggle" onClick={() => setShowGeminiKey(v => !v)}>
                  {showGeminiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="settings-priority">
            <strong>Priority:</strong> UI Input → Server <code>.env</code> → ❌ Error
          </div>
        </div>
      )}

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
          {/* Performance Score */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Performance Score</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{analysis?.word_count || 0}</div>
                <div className="metric-label">Words</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {analysis?.readability?.score ? Math.round(analysis.readability.score) : '--'}
                </div>
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

          {/* Assistant Suggestions */}
          <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
            <h3 className="sidebar-title">Assistant Insights</h3>

            {/* ── Error Banner ── */}
            {error && (
              <div className="error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {isAnalyzing ? (
              <div className="empty-state">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
                Reviewing your document...
              </div>
            ) : !analysis && !error ? (
              <div className="empty-state">
                <Sparkles size={32} color="var(--text-secondary)" opacity={0.5} />
                Start typing to get real-time content suggestions, grammar checks, and tone analysis.
              </div>
            ) : (
              <>
                {analysis?.variants?.formal && (
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
                      <button className="btn-accept" onClick={() => applyVariant(analysis.variants.formal)}>
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
