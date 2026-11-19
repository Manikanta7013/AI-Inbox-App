interface HeaderProps {
  itemCount: number;
}

export default function Header({ itemCount }: HeaderProps) {
  return (
    <header className="border-b border-[#e6e9ef] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5b67e8] text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(91,103,232,0.24)]">
            KI
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-[-0.02em] text-[#1c2435]">Knowledge Inbox</h1>
            <p className="hidden text-xs text-[#8992a3] sm:block">Your private research workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#e5e8ef] bg-[#fafbfc] px-3 py-2 text-xs font-semibold text-[#697287]">
          <span className="h-2 w-2 rounded-full bg-[#5dbe82] shadow-[0_0_0_3px_rgba(93,190,130,0.12)]" />
          <span>{itemCount} sources</span>
        </div>
      </div>
    </header>
  );
}
