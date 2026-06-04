import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Bot, BriefcaseBusiness, GitCompare, GraduationCap, Search } from "lucide-react";
import { api, type ChatResponse, type College } from "./lib/api";
import { CollegeTable } from "./components/CollegeTable";

type Tab = "assistant" | "recommend" | "compare" | "career";

const tabs: { id: Tab; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: "assistant", label: "Assistant", icon: Bot },
  { id: "recommend", label: "Recommendations", icon: Search },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "career", label: "Career", icon: BriefcaseBusiness }
];

function App() {
  const [tab, setTab] = useState<Tab>("assistant");

  return (
    <main className="min-h-screen bg-stone-50 text-ink">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded bg-leaf text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">EduGuide AI</h1>
              <p className="text-sm text-ink/60">College recommendation and career guidance platform</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex h-10 items-center gap-2 rounded border px-3 text-sm font-medium transition ${
                    tab === item.id
                      ? "border-leaf bg-leaf text-white"
                      : "border-stone-200 bg-white text-ink hover:border-leaf/50"
                  }`}
                  title={item.label}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        {tab === "assistant" && <Assistant />}
        {tab === "recommend" && <Recommendations />}
        {tab === "compare" && <Compare />}
        {tab === "career" && <Career />}
      </section>
    </main>
  );
}

function Assistant() {
  const [message, setMessage] = useState("Recommend engineering colleges under 2 lakh with strong placements");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      setResponse(await api.chat(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <section className="rounded border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
        <textarea
          className="mt-4 h-36 w-full rounded border border-stone-300 p-3 text-sm outline-none focus:border-leaf"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button onClick={submit} className="mt-3 h-10 rounded bg-coral px-4 text-sm font-semibold text-white" disabled={loading}>
          {loading ? "Thinking..." : "Ask EduGuide"}
        </button>
      </section>
      <section className="space-y-4">
        {response && (
          <div className="rounded border border-stone-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-leaf">Route: {response.route}</div>
            <p className="mt-3 whitespace-pre-line leading-7">{response.answer}</p>
          </div>
        )}
        {response?.results?.length ? <CollegeTable colleges={response.results} /> : null}
      </section>
    </div>
  );
}

function Recommendations() {
  const [results, setResults] = useState<College[]>([]);
  const [state, setState] = useState("Karnataka");
  const [stream, setStream] = useState("Engineering");
  const [maxFee, setMaxFee] = useState("200000");
  const [priority, setPriority] = useState("placement");

  async function load() {
    const params = new URLSearchParams({ state, stream, max_fee: maxFee, priority, limit: "12" });
    const data = await api.recommend(params);
    setResults(data.results);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 rounded border border-stone-200 bg-white p-4 md:grid-cols-5">
        <input className="input" value={state} onChange={(event) => setState(event.target.value)} placeholder="State" />
        <input className="input" value={stream} onChange={(event) => setStream(event.target.value)} placeholder="Stream" />
        <input className="input" value={maxFee} onChange={(event) => setMaxFee(event.target.value)} placeholder="Max fee" />
        <select className="input" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="balanced">Balanced</option>
          <option value="placement">Placement</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="faculty">Faculty</option>
          <option value="budget">Budget</option>
        </select>
        <button className="rounded bg-leaf px-4 text-sm font-semibold text-white" onClick={load}>
          Find Colleges
        </button>
      </section>
      <CollegeTable colleges={results} />
    </div>
  );
}

function Compare() {
  const [names, setNames] = useState("Vellore Institute of Technology, SRM Institute of Science and Technology");
  const [colleges, setColleges] = useState<College[]>([]);
  const [metrics, setMetrics] = useState<Record<string, unknown[]> | null>(null);

  async function run() {
    const data = await api.compare(names);
    setColleges(data.colleges);
    setMetrics(data.metrics);
  }

  const rows = useMemo(() => Object.entries(metrics ?? {}), [metrics]);

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <section className="rounded border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Compare Colleges</h2>
        <textarea className="mt-4 h-28 w-full rounded border border-stone-300 p-3 text-sm" value={names} onChange={(event) => setNames(event.target.value)} />
        <button className="mt-3 h-10 rounded bg-gold px-4 text-sm font-semibold text-white" onClick={run}>
          Compare
        </button>
      </section>
      <section className="space-y-4">
        {rows.length > 0 && (
          <div className="overflow-x-auto rounded border border-stone-200 bg-white">
            <table className="min-w-full text-sm">
              <tbody>
                {rows.map(([metric, values]) => (
                  <tr key={metric} className="border-b border-stone-100">
                    <th className="px-4 py-3 text-left">{metric}</th>
                    {values.map((value, index) => (
                      <td key={`${metric}-${index}`} className="px-4 py-3">
                        {String(value ?? "Unavailable")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <CollegeTable colleges={colleges} />
      </section>
    </div>
  );
}

function Career() {
  const [interests, setInterests] = useState("I enjoy coding, mathematics, data analysis and building useful products.");
  const [result, setResult] = useState<{ recommended_streams: string[]; guidance: string } | null>(null);

  async function run() {
    setResult(await api.career(interests));
  }

  return (
    <div className="grid gap-5 md:grid-cols-[420px_1fr]">
      <section className="rounded border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Career Guidance</h2>
        <textarea className="mt-4 h-36 w-full rounded border border-stone-300 p-3 text-sm" value={interests} onChange={(event) => setInterests(event.target.value)} />
        <button className="mt-3 h-10 rounded bg-coral px-4 text-sm font-semibold text-white" onClick={run}>
          Suggest Streams
        </button>
      </section>
      {result && (
        <section className="rounded border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Recommended Streams</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.recommended_streams.map((stream) => (
              <span key={stream} className="rounded border border-leaf/30 bg-mist px-3 py-1 text-sm text-leaf">
                {stream}
              </span>
            ))}
          </div>
          <p className="mt-5 leading-7">{result.guidance}</p>
        </section>
      )}
    </div>
  );
}

export default App;
