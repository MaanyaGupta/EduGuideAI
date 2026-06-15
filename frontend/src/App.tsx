import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Bot, BriefcaseBusiness, GitCompare, GraduationCap, Search, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type ChatResponse, type College } from "./lib/api";
import { CollegeTable } from "./components/CollegeTable";

type Tab = "assistant" | "recommend" | "compare" | "career";

const tabs: { id: Tab; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: "assistant", label: "Assistant", icon: Bot },
  { id: "recommend", label: "Recommendations", icon: Search },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "career", label: "Career Guidance", icon: BriefcaseBusiness }
];

const SUGGESTIONS = [
  "Recommend engineering colleges in Karnataka under 2 lakh with strong placements",
  "Compare Gurugram University, Gurgaon and Amity University, Gurgaon",
  "I enjoy mathematics and coding, suggest some career streams for me",
  "Top medical colleges in Delhi with budget under 1.5 Lakh"
];

function App() {
  const [tab, setTab] = useState<Tab>("assistant");

  return (
    <div className="min-h-screen bg-stone-50/50 text-ink">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-leaf to-teal-600 text-white shadow-md shadow-leaf/10">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900">EduGuide AI</h1>
              <p className="text-xs text-stone-400 font-medium">College recommendation & career guidance assistant</p>
            </div>
          </div>
          <nav className="flex gap-1.5 rounded-xl bg-stone-100 p-1 border border-stone-200/50">
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
                    isActive
                      ? "bg-white text-leaf shadow-sm border border-stone-200/30"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/30"
                  }`}
                  title={item.label}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "assistant" && <Assistant />}
        {tab === "recommend" && <Recommendations />}
        {tab === "compare" && <Compare />}
        {tab === "career" && <Career />}
      </main>
    </div>
  );
}

function ShimmerLoader() {
  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-6 w-24 rounded shimmer-loader"></div>
        <div className="h-4 w-32 rounded shimmer-loader"></div>
      </div>
      <div className="space-y-2.5">
        <div className="h-4 w-full rounded shimmer-loader"></div>
        <div className="h-4 w-[92%] rounded shimmer-loader"></div>
        <div className="h-4 w-[85%] rounded shimmer-loader"></div>
      </div>
    </div>
  );
}

function Assistant() {
  const [message, setMessage] = useState("Recommend engineering colleges under 2 lakh with strong placements");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(promptStr?: string) {
    const activePrompt = promptStr || message;
    if (promptStr) setMessage(promptStr);
    setLoading(true);
    try {
      setResponse(await api.chat(activePrompt));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm h-fit">
        <h2 className="text-base font-bold text-stone-800">AI Chat Assistant</h2>
        <p className="text-xs text-stone-400 mt-1 leading-normal">Ask recommendations, details, or comparison between colleges based on the dataset.</p>
        <textarea
          className="mt-4 h-32 w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 transition resize-none text-stone-800"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button 
          onClick={() => submit()} 
          className="mt-3 flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-coral text-sm font-semibold text-white transition hover:bg-coral/95 active:scale-[0.98] disabled:opacity-50" 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Thinking...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Ask Assistant
            </>
          )}
        </button>

        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Suggestions</h3>
          <div className="mt-2.5 space-y-2">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => submit(s)}
                className="w-full text-left rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-600 hover:border-leaf/30 hover:bg-mist hover:text-leaf transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        {loading && <ShimmerLoader />}

        {!loading && response && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-leaf">
                <Bot size={13} />
                Route: {response.route}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">Answered by EduGuide AI</span>
            </div>
            <div className="prose max-w-none">
              <MarkdownRenderer content={response.answer} />
            </div>
          </div>
        )}

        {!loading && !response && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/40 py-16 px-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-stone-400">
              <Bot size={24} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-stone-800">Your AI Assistant is ready</h3>
            <p className="mt-1 text-xs text-stone-400 max-w-sm">Enter a prompt on the left or select a suggestion to inspect recommendation flows.</p>
          </div>
        )}

        {!loading && response?.results?.length ? (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Colleges List</h3>
            <CollegeTable colleges={response.results} />
          </div>
        ) : null}
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
  const [loading, setLoading] = useState(false);

  const STATES = [
    "Karnataka", "Tamil Nadu", "Maharashtra", "Delhi", "Uttar Pradesh", 
    "Telangana", "Haryana", "Gujarat", "Kerala", "Punjab", "West Bengal", 
    "Rajasthan", "Madhya Pradesh", "Bihar", "Odisha"
  ];
  
  const STREAMS = [
    "Engineering", "Management", "Medical", "Science", "Commerce", 
    "Arts", "Law", "Design", "Pharmacy"
  ];

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ state, stream, max_fee: maxFee, priority, limit: "12" });
      const data = await api.recommend(params);
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-5 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">State</label>
          <select className="input text-stone-700 font-medium cursor-pointer" value={state} onChange={(event) => setState(event.target.value)}>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Stream</label>
          <select className="input text-stone-700 font-medium cursor-pointer" value={stream} onChange={(event) => setStream(event.target.value)}>
            {STREAMS.map(str => <option key={str} value={str}>{str}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Max Fee (INR)</label>
          <input className="input text-stone-700 font-semibold" type="number" value={maxFee} onChange={(event) => setMaxFee(event.target.value)} placeholder="Max fee" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Priority Preference</label>
          <select className="input text-stone-700 font-medium cursor-pointer" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="balanced">Balanced Options</option>
            <option value="placement">Placement priority</option>
            <option value="infrastructure">Infrastructure priority</option>
            <option value="faculty">Faculty priority</option>
            <option value="budget">Lower budget</option>
          </select>
        </div>
        <button 
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-leaf text-sm font-semibold text-white transition hover:bg-leaf/90 active:scale-[0.98] disabled:opacity-50" 
          onClick={load}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Finding...
            </>
          ) : (
            <>
              <Search size={15} />
              Find Colleges
            </>
          )}
        </button>
      </section>

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 w-full rounded shimmer-loader"></div>
          <div className="h-64 w-full rounded shimmer-loader"></div>
        </div>
      ) : (
        <CollegeTable colleges={results} />
      )}
    </div>
  );
}

function Compare() {
  const [names, setNames] = useState("Vellore Institute of Technology, SRM Institute of Science and Technology");
  const [colleges, setColleges] = useState<College[]>([]);
  const [metrics, setMetrics] = useState<Record<string, unknown[]> | null>(null);
  const [clarifications, setClarifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const data = await api.compare(names);
      setColleges(data.colleges);
      setMetrics(data.metrics);
      setClarifications(data.clarifications || []);
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => Object.entries(metrics ?? {}), [metrics]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm h-fit">
        <h2 className="text-base font-bold text-stone-800">Compare Colleges</h2>
        <p className="text-xs text-stone-400 mt-1 leading-normal">Type college names separated by commas (e.g. SRM, VIT) to compare metrics.</p>
        <textarea 
          className="mt-4 h-24 w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 transition resize-none text-stone-800" 
          value={names} 
          onChange={(event) => setNames(event.target.value)} 
        />
        <button 
          className="mt-3 flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-gold text-sm font-semibold text-white transition hover:bg-gold/95 active:scale-[0.98]" 
          onClick={run}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Comparing...
            </>
          ) : (
            <>
              <GitCompare size={15} />
              Compare
            </>
          )}
        </button>
      </section>

      <section className="space-y-5">
        {clarifications.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-amber-900 shadow-sm">
            <h3 className="font-bold text-sm">Clarification Needed</h3>
            <ul className="mt-2 list-disc pl-5 text-xs space-y-1 leading-relaxed">
              {clarifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="h-40 w-full rounded shimmer-loader"></div>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100 text-xs font-bold uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-left">Metrics</th>
                  {colleges.map((col, idx) => (
                    <th key={idx} className="px-4 py-3 text-left font-semibold text-stone-850">{col.college_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-750">
                {rows.map(([metric, values]) => (
                  <tr key={metric} className="hover:bg-stone-50/50 transition-colors">
                    <th className="px-4 py-3 text-left font-bold text-stone-500 bg-stone-50/30 text-xs tracking-wider uppercase">{metric}</th>
                    {values.map((value, index) => (
                      <td key={`${metric}-${index}`} className="px-4 py-3 text-xs leading-normal">
                        {typeof value === "number" ? (
                          <span className="font-bold text-stone-850">{value.toFixed(1)}</span>
                        ) : (
                          String(value ?? "Unavailable")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && colleges.length === 0 && clarifications.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/40 py-16 px-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-stone-400">
              <GitCompare size={24} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-stone-800">Compare colleges side-by-side</h3>
            <p className="mt-1 text-xs text-stone-400 max-w-sm">Input multiple universities on the left to review metrics side-by-side.</p>
          </div>
        )}

        {!loading && colleges.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Detailed College List</h3>
            <CollegeTable colleges={colleges} />
          </div>
        )}
      </section>
    </div>
  );
}

function Career() {
  const [interests, setInterests] = useState("I enjoy coding, mathematics, data analysis and building useful products.");
  const [result, setResult] = useState<{ recommended_streams: string[]; guidance: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      setResult(await api.career(interests));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[380px_1fr]">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm h-fit">
        <h2 className="text-base font-bold text-stone-800">Career Guidance</h2>
        <p className="text-xs text-stone-400 mt-1 leading-normal">Share your hobbies, favorite subjects, or skills, and get personalized guidance recommendations.</p>
        <textarea className="mt-4 h-36 w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 transition resize-none text-stone-800" value={interests} onChange={(event) => setInterests(event.target.value)} />
        <button 
          className="mt-3 flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-coral text-sm font-semibold text-white transition hover:bg-coral/95 active:scale-[0.98]" 
          onClick={run}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Matching...
            </>
          ) : (
            <>
              <BriefcaseBusiness size={15} />
              Suggest Streams
            </>
          )}
        </button>
      </section>

      <section>
        {loading && <ShimmerLoader />}

        {!loading && result && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-sm text-stone-800">Recommended Streams</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.recommended_streams.map((stream) => (
                  <span key={stream} className="rounded-full border border-leaf/20 bg-mist px-3.5 py-1 text-xs text-leaf font-bold shadow-sm">
                    {stream}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-stone-100 pt-4">
              <h3 className="font-bold text-sm text-stone-850">Guidance Analysis</h3>
              <div className="mt-3 text-stone-700">
                <MarkdownRenderer content={result.guidance} />
              </div>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/40 py-16 px-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-stone-400">
              <BriefcaseBusiness size={24} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-stone-800">Map your skills to fields</h3>
            <p className="mt-1 text-xs text-stone-400 max-w-sm">Type in your interests on the left to get a direct profile matching analysis report.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        strong: ({ node, ...props }) => <strong className="font-bold text-stone-900" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2.5 space-y-1.5 text-stone-800" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2.5 space-y-1.5 text-stone-800" {...props} />,
        li: ({ node, ...props }) => <li className="my-1 text-stone-800" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3.5 last:mb-0 text-stone-700 leading-relaxed text-sm" {...props} />,
        a: ({ node, ...props }) => <a className="text-leaf underline hover:text-leaf/80" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-4 text-stone-900" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-3 text-stone-900" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold my-2 text-stone-900" {...props} />,
        table: ({ node, ...props }) => (
          <div className="my-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
            <table className="min-w-full text-left text-xs bg-white" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase text-stone-500" {...props} />,
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-stone-100 text-stone-700" {...props} />,
        tr: ({ node, ...props }) => <tr className="hover:bg-stone-50/50 transition-colors" {...props} />,
        th: ({ node, ...props }) => <th className="px-3 py-2.5 font-semibold text-stone-800" {...props} />,
        td: ({ node, ...props }) => <td className="px-3 py-2.5 leading-normal" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default App;
