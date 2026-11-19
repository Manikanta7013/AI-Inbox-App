import { useEffect, useState, type FormEvent } from 'react';
import AnswerPanel from './components/AnswerPanel';
import Header from './components/Header';
import SourceSidebar from './components/SourceSidebar';
import type { InboxItem, QueryAnswer } from './types';
import { askQuestion, getErrorMessage, ingestItem, loadItems } from './utils';

export default function App() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [tab, setTab] = useState<'text' | 'url'>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<QueryAnswer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems()
      .then((data) => setItems(data.items))
      .catch((loadError: unknown) => setError(getErrorMessage(loadError)));
  }, []);

  async function handleIngest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = await ingestItem(tab, title, text, url);
      setItems((current) => [data.item, ...current]);
      setTitle('');
      setText('');
      setUrl('');
    } catch (ingestError: unknown) {
      setError(getErrorMessage(ingestError));
    } finally {
      setBusy(false);
    }
  }

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setBusy(true);
    setError('');

    try {
      setAnswer(await askQuestion(question.trim()));
    } catch (askError: unknown) {
      setError(getErrorMessage(askError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <Header itemCount={items.length} />

      <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8 lg:py-7">
        <SourceSidebar
          tab={tab}
          title={title}
          text={text}
          url={url}
          items={items}
          busy={busy}
          error={error}
          onTabChange={setTab}
          onTitleChange={setTitle}
          onTextChange={setText}
          onUrlChange={setUrl}
          onIngest={handleIngest}
        />

        <AnswerPanel
          question={question}
          answer={answer}
          busy={busy}
          hasItems={items.length > 0}
          onQuestionChange={setQuestion}
          onAsk={handleAsk}
        />
      </div>
    </main>
  );
}
