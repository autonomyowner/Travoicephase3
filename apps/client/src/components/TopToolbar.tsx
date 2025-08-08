"use client"

export default function TopToolbar() {
  const fire = (name: string) => () => window.dispatchEvent(new CustomEvent(name))
  const fireDetail = <T,>(name: string, detail: T) => () => window.dispatchEvent(new CustomEvent(name, { detail }))

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur px-3 py-1.5 shadow-xl">
        <button onClick={fire('nc-fit-view')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Fit</button>
        <button onClick={fire('nc-center-root')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Center</button>
        <div className="w-px h-5 bg-white/20" />
        <button onClick={fire('nc-add-node')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Add</button>
        <button onClick={fire('nc-delete-selection')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Delete</button>
        <div className="w-px h-5 bg-white/20" />
        <button onClick={fire('nc-clear-board')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Clear</button>

        {/* Extended type/style controls */}
        <div className="w-px h-5 bg-white/20" />
        <span className="text-[11px] text-white/80">Type:</span>
        <button onClick={fireDetail('nc-convert-type', 'thought')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Thought</button>
        <button onClick={fireDetail('nc-convert-type', 'action')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Action</button>
        <button onClick={fireDetail('nc-convert-type', 'emotion')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Emotion</button>
        <button onClick={fireDetail('nc-convert-type', 'root')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Root</button>

        <div className="w-px h-5 bg-white/20" />
        <span className="text-[11px] text-white/80">Edge:</span>
        <button onClick={fireDetail('nc-edges-curve', 'flexible')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Flexible</button>
        <button onClick={fireDetail('nc-edges-curve', 'straight')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Straight</button>
        <button onClick={fireDetail('nc-edges-line', 'solid')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Solid</button>
        <button onClick={fireDetail('nc-edges-line', 'dashed')} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-white hover:bg-white/10">Dashed</button>
      </div>
    </div>
  )
}


