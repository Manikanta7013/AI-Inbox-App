import type { FormEvent } from 'react';
import type { QueryAnswer } from '../types';

interface AnswerPanelProps {
  question: string;
  answer: QueryAnswer | null;
  busy: boolean;
  hasItems: boolean;
  onQuestionChange: (question: string) => void;
  onAsk: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AnswerPanel({ question, answer, busy, hasItems, onQuestionChange, onAsk }: AnswerPanelProps) {
  return (
    <section className="min-w-0">
      <form className="flex gap-2 rounded-2xl border border-[#e3e7ed] bg-white p-2 shadow-[0_12px_40px_rgba(31,42,68,0.05)]" onSubmit={onAsk}>
        <label className="sr-only" htmlFor="knowledge-question">Ask a question</label>
        <input
          id="knowledge-question"
          className="min-w-0 flex-1 rounded-xl border-0 px-3 py-3 text-sm text-[#252d3d] outline-none placeholder:text-[#a1a7b3] focus:ring-4 focus:ring-[#6975e8]/10"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Ask a question about your saved content…"
        />
        <button
          className="min-w-20 rounded-xl bg-[#20283a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#30394d] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-24"
          disabled={busy || !hasItems || !question.trim()}
        >
          {busy ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      {answer ? (
        <div className="mt-5 rounded-2xl border border-[#e3e7ed] bg-white p-5 shadow-[0_12px_40px_rgba(31,42,68,0.05)] sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#edf7ef] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#477c55]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#56a86c]" />
            Answer
          </div>

          <p className="mt-5 text-base leading-8 text-[#30394b] sm:text-lg">{answer.answer}</p>

          {answer.sources?.length > 0 && (
            <>
              <div className="mt-7 flex items-center justify-between border-t border-[#edf0f4] pt-5">
                <h2 className="text-sm font-bold text-[#343d4e]">Sources</h2>
                <span className="text-xs text-[#9aa1ad]">{answer.sources.length} referenced</span>
              </div>

              <div className="mt-3 grid gap-3">
                {answer.sources.map((source, index) => (
                  <article key={source.chunkId} className="rounded-xl border border-[#e8ebf1] bg-[#fbfcfd] p-4">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                      <b className="text-sm text-[#3a4354]">[{index + 1}] {source.title}</b>
                      <span className="text-[11px] font-medium text-[#969dac]">relevance {source.score}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#697287]">{source.text}</p>
                    {source.sourceUrl && (
                      <a className="mt-3 inline-block text-xs font-bold text-[#5965df] hover:underline" href={source.sourceUrl} target="_blank" rel="noreferrer">
                        Open source ?
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-5 flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dde3ec] bg-white/60 px-6 text-center lg:min-h-[calc(100vh-220px)]">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef0ff] text-2xl text-[#6975e8] shadow-[0_12px_30px_rgba(105,117,232,0.12)]">?</div>
          <h2 className="mt-5 text-lg font-bold text-[#4a5262]">Your answer will appear here</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#969dac]">
            {hasItems ? 'Ask a question to search across all saved items.' : 'Add a text note or URL to begin.'}
          </p>
        </div>
      )}
    </section>
  );
}
