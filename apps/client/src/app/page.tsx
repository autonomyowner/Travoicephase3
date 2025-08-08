import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="space-y-16 relative">
      {/* Landing background: light cream with gold dot grid */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: '#fff8dc',
          backgroundImage: 'radial-gradient(rgba(201,162,39,0.6) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0',
        }}
      />
      {/* Hero */}
      <section className="text-center space-y-6 text-slate-900">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Think better, together — with NeuroCanvas
        </h1>
        <p className="mx-auto max-w-3xl text-lg md:text-xl text-slate-700">
          An AI-powered mind mapping workspace for creators, founders, and teams. Capture ideas, connect thoughts, and turn clarity into action.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Go to mindmap home"
          >
            Start Mapping
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold border border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Create an account"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Who we are */}
      <section className="grid md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Who we are</h2>
          <p className="text-slate-800">
            We are <span className="font-semibold">Algerian Developers</span> — a builder-first team crafting tools that amplify human thinking. Our mission is to help people organize complex thoughts and move from ideation to execution with clarity.
          </p>
          <p className="text-slate-700">
            NeuroCanvas is born from the belief that ideas deserve structure, and collaboration should feel effortless.
          </p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6">
          <h3 className="text-lg font-semibold text-slate-900">Leadership</h3>
          <p className="mt-2 text-slate-800">
            <span className="font-semibold">Azeddine Zellag</span>, CEO
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Founder and product lead focused on delivering pragmatic AI tools that make deep work easier and faster.
          </p>
        </div>
      </section>

      {/* What is the SaaS */}
      <section className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">What is NeuroCanvas?</h2>
        <p className="text-slate-800">
          NeuroCanvas is a Software-as-a-Service mind mapping platform that combines AI drafting with a powerful visual canvas. Start with a prompt, voice, or template — then refine your map with nodes, relationships, and actions.
        </p>
        <ul className="grid md:grid-cols-3 gap-3 text-sm text-slate-800">
          <li className="rounded-lg border border-black/10 bg-white/70 p-4">
            <span className="block font-semibold">AI brainstorming</span>
            Generate structured ideas, themes, and action items from text or voice.
          </li>
          <li className="rounded-lg border border-black/10 bg-white/70 p-4">
            <span className="block font-semibold">Collaborative canvas</span>
            Map thoughts visually, keep versions, and share securely.
          </li>
          <li className="rounded-lg border border-black/10 bg-white/70 p-4">
            <span className="block font-semibold">From clarity to execution</span>
            Turn insights into plans with priorities, emotions, and connections.
          </li>
        </ul>
      </section>

      {/* What we do and aim */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">What we do</h2>
          <p className="text-slate-800">
            We help individuals and teams externalize their thinking, discover patterns, and align on decisions. From product strategy to research, NeuroCanvas is your second brain for complex work.
          </p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">What we aim to achieve</h2>
          <p className="text-slate-800">
            Our goal is to build the most intuitive thinking environment — one that respects privacy, enhances focus, and unlocks creative momentum.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center space-y-4 text-slate-900">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Ready to think in maps?</h2>
        <p className="text-slate-700">Jump into your workspace and start mapping in seconds.</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Go to mindmap home"
          >
            Go to Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold border border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Login"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  )
}
