import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadItems() {
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error('Could not load saved items');
    setItems((await response.json()).items);
  }
  useEffect(() => { loadItems().catch((e) => setError(e.message)); }, []);

  async function ingest(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const body = tab === 'text' ? { type: 'text', title, text } : { type: 'url', title, url };
      const response = await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not ingest content');
      setItems((current) => [data.item, ...current]); setTitle(''); setText(''); setUrl('');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function ask(event) {
    event.preventDefault(); if (!question.trim()) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not answer question');
      setAnswer(data);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return <main>
    <header><div className="brandmark">KI</div><div><h1>Knowledge Inbox</h1><p>Save sources. Ask better questions.</p></div></header>
    <section className="grid">
      <aside>
        <div className="tabs"><button className={tab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>Text note</button><button className={tab === 'url' ? 'active' : ''} onClick={() => setTab('url')}>URL</button></div>
        <form onSubmit={ingest}>
          <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" /></label>
          {tab === 'text' ? <label>Content <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a note or document excerpt…" rows="8" /></label> : <label>Web address <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" /></label>}
          <button className="primary" disabled={busy}>{busy ? 'Working…' : 'Save to inbox'}</button>
        </form>
        {error && <div className="error">{error}</div>}
        <h2>Saved sources <span>{items.length}</span></h2>
        <div className="items">{items.map((item) => <article key={item.id}><div className="itemtype">{item.sourceType}</div><h3>{item.title}</h3>{item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceUrl}</a> : <p>{item.preview}</p>}<time>{new Date(item.createdAt).toLocaleString()}</time></article>)}</div>
      </aside>
      <section className="answer-panel">
        <form className="question" onSubmit={ask}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question about your saved content…" /><button disabled={busy || !items.length}>Ask</button></form>
        {answer ? <div className="answer"><div className="status">Answer</div><p>{answer.answer}</p>{answer.sources?.length > 0 && <><h2>Sources</h2><div className="sources">{answer.sources.map((source, i) => <article key={source.chunkId}><div><b>[{i + 1}] {source.title}</b><span>relevance {source.score}</span></div><p>{source.text}</p>{source.sourceUrl && <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source</a>}</article>)}</div></>}</div> : <div className="empty"><div>✦</div><h2>Your answer will appear here</h2><p>{items.length ? 'Ask a question to search across all saved items.' : 'Add a text note or URL first.'}</p></div>}
      </section>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
