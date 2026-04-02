import { useState } from "react";

export default function SplashScreen({ onEnter }) {
  const [leaving, setLeaving] = useState(false);

  function handleEnter() {
    setLeaving(true);
    setTimeout(() => {
      onEnter();
    }, 900);
  }

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_25%),linear-gradient(to_bottom_right,_#020617,_#0f172a,_#172554)] transition-all duration-700 ${
        leaving ? "scale-110 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-medium tracking-[0.22em] text-slate-300 backdrop-blur">
          PERFORMANCE OPERATIONS BOARD
        </div>

        <h1 className="text-6xl font-black tracking-tight text-white md:text-8xl">
          <span className="bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
            NEXT PLAY
          </span>
        </h1>

        <p className="mt-4 text-sm tracking-[0.35em] text-slate-400 md:text-base">
          PLAN • TRAIN • REVIEW • DELIVER
        </p>

        <p className="mt-6 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
          Step into a premium sports operations workspace built to organize plays,
          execution, review, and match-ready delivery.
        </p>

        <button
          onClick={handleEnter}
          className="mt-10 rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white/15"
        >
          ENTER THE ARENA
        </button>
      </div>
    </div>
  );
}