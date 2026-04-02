export default function Header() {
    return (
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
        </div>
  
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
  
        <div className="relative">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
            Next Play Games • Performance Operations Board
          </div>
  
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Next Play Performance Board
          </h1>
  
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Plan winning plays, track execution, review progress, and move work to
            match-ready status in a premium sports-inspired workflow.
          </p>
  
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Game-Day Focus
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Live Workflow
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Team Momentum
            </span>
          </div>
        </div>
      </header>
    );
  }