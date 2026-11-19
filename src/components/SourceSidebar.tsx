import type { FormEvent } from 'react';
import type { InboxItem } from '../types';

interface SourceSidebarProps {
  tab: 'text' | 'url';
  title: string;
  text: string;
  url: string;
  items: InboxItem[];
  busy: boolean;
  error: string;
  onTabChange: (tab: 'text' | 'url') => void;
  onTitleChange: (title: string) => void;
  onTextChange: (text: string) => void;
  onUrlChange: (url: string) => void;
  onIngest: (event: FormEvent<HTMLFormElement>) => void;
}

const fieldClassName = 'w-full rounded-xl border border-[#dde3ec] bg-white px-3.5 py-3 text-sm text-[#252d3d] outline-none transition placeholder:text-[#adb4c0] focus:border-[#6975e8] focus:ring-4 focus:ring-[#6975e8]/10';

export default function SourceSidebar(props: SourceSidebarProps) {
  const { tab, title, text, url, items, busy, error, onTabChange, onTitleChange, onTextChange, onUrlChange, onIngest } = props;

  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border border-[#e3e7ed] bg-white shadow-[0_12px_40px_rgba(31,42,68,0.05)] lg:h-[calc(100vh-120px)] lg:min-h-[620px]">
      <div className="shrink-0 border-b border-[#edf0f4] p-4">
        <div className="grid grid-cols-2 rounded-xl bg-[#f1f3f7] p-1" aria-label="Source type">
          {(['text', 'url'] as const).map((sourceTab) => (
            <button
              key={sourceTab}
              type="button"
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${tab === sourceTab ? 'bg-white text-[#344052] shadow-sm' : 'text-[#7d8697] hover:text-[#4d5668]'}`}
              onClick={() => onTabChange(sourceTab)}
              aria-pressed={tab === sourceTab}
            >
              {sourceTab === 'text' ? 'Text note' : 'Web URL'}
            </button>
          ))}
        </div>

        <form className="mt-4" onSubmit={onIngest}>
          <label className="grid gap-2 text-xs font-bold text-[#596174]">
            Title <span className="font-normal text-[#a1a7b3]">(optional)</span>
            <input
              className={fieldClassName}
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Give this source a name"
            />
          </label>

          {tab === 'text' ? (
            <label className="mt-3 grid gap-2 text-xs font-bold text-[#596174]">
              Content
              <textarea
                className={`${fieldClassName} min-h-36 resize-y leading-6`}
                value={text}
                onChange={(event) => onTextChange(event.target.value)}
                placeholder="Paste a note or document excerpt…"
                rows={6}
              />
            </label>
          ) : (
            <label className="mt-3 grid gap-2 text-xs font-bold text-[#596174]">
              Web address
              <input
                className={fieldClassName}
                value={url}
                onChange={(event) => onUrlChange(event.target.value)}
                placeholder="https://example.com/article"
                type="url"
              />
            </label>
          )}

          <button
            className="mt-4 w-full rounded-xl bg-[#5965df] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(89,101,223,0.18)] transition hover:bg-[#4d58ce] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Save to inbox'}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-3 rounded-xl border border-[#f4d9d9] bg-[#fff6f6] px-3 py-2.5 text-sm text-[#a34444]">
            {error}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold text-[#2f3748]">Saved sources</h2>
        <span className="rounded-full bg-[#eef0f5] px-2.5 py-1 text-xs font-bold text-[#7d8697]">{items.length}</span>
      </div>

      <div
        aria-label="Saved sources"
        className="saved-sources-scroll min-h-0 max-h-72 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 pb-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#6975e8] lg:max-h-none"
        tabIndex={0}
      >
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-[#edf0f4] p-3 transition hover:border-[#dfe4ec] hover:bg-[#fafbfc]">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6975e8]">{item.sourceType}</span>
              <time className="text-[10px] text-[#a1a7b3]">{new Date(item.createdAt).toLocaleDateString()}</time>
            </div>
            <h3 className="truncate text-sm font-bold text-[#343d4e]">{item.title}</h3>

            {item.sourceUrl ? (
              <a className="mt-1 block truncate text-xs text-[#5965df] hover:underline" href={item.sourceUrl} target="_blank" rel="noreferrer">
                {item.sourceUrl}
              </a>
            ) : (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7d8697]">{item.preview}</p>
            )}
          </article>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#dde2ea] px-4 py-6 text-center text-xs text-[#98a0ae]">
            Saved sources will appear here
          </div>
        )}
      </div>
    </aside>
  );
}
