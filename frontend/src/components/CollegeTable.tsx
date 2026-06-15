import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X, Check } from "lucide-react";
import type { College } from "../lib/api";

const fee = (value: number | null) => (value ? `INR ${value.toLocaleString("en-IN")}` : "Unavailable");

interface FiltersState {
  state: string;
  stream: string;
  ug_fee: string;
  rating: number | null;
  placement: number | null;
  faculty: number | null;
}

interface SortState {
  key: keyof College | null;
  direction: "asc" | "desc";
}

export function CollegeTable({ colleges }: { colleges: College[] }) {
  const [filters, setFilters] = useState<FiltersState>({
    state: "All",
    stream: "All",
    ug_fee: "All",
    rating: null,
    placement: null,
    faculty: null,
  });

  const [sort, setSort] = useState<SortState>({
    key: null,
    direction: "asc",
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Compute unique values for options
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(colleges.map((c) => c.state).filter(Boolean))).sort();
  }, [colleges]);

  const uniqueStreams = useMemo(() => {
    return Array.from(new Set(colleges.map((c) => c.stream).filter(Boolean))).sort();
  }, [colleges]);

  // Filter & Sort dynamic data
  const filteredColleges = useMemo(() => {
    let result = [...colleges];

    if (filters.state !== "All") {
      result = result.filter((c) => c.state === filters.state);
    }
    if (filters.stream !== "All") {
      result = result.filter((c) => c.stream === filters.stream);
    }
    if (filters.ug_fee !== "All") {
      result = result.filter((c) => {
        if (!c.ug_fee) return false;
        if (filters.ug_fee === "Under 1 Lakh") return c.ug_fee <= 100000;
        if (filters.ug_fee === "Under 2 Lakh") return c.ug_fee <= 200000;
        if (filters.ug_fee === "Under 5 Lakh") return c.ug_fee <= 500000;
        if (filters.ug_fee === "Under 10 Lakh") return c.ug_fee <= 1000000;
        return true;
      });
    }
    if (filters.rating !== null) {
      result = result.filter((c) => c.rating >= filters.rating!);
    }
    if (filters.placement !== null) {
      result = result.filter((c) => c.placement >= filters.placement!);
    }
    if (filters.faculty !== null) {
      result = result.filter((c) => c.faculty >= filters.faculty!);
    }

    if (sort.key) {
      result.sort((a, b) => {
        const valA = a[sort.key!];
        const valB = b[sort.key!];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sort.direction === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sort.direction === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [colleges, filters, sort]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.state !== "All") count++;
    if (filters.stream !== "All") count++;
    if (filters.ug_fee !== "All") count++;
    if (filters.rating !== null) count++;
    if (filters.placement !== null) count++;
    if (filters.faculty !== null) count++;
    return count;
  }, [filters]);

  const clearFilter = (key: keyof FiltersState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "state" || key === "stream" || key === "ug_fee" ? "All" : null,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      state: "All",
      stream: "All",
      ug_fee: "All",
      rating: null,
      placement: null,
      faculty: null,
    });
    setSort({ key: null, direction: "asc" });
  };

  const handleSortClick = (key: keyof College) => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else {
          return { key: null, direction: "asc" };
        }
      }
      return { key, direction: "desc" }; // Default to desc (High to Low / Z-A)
    });
    setOpenDropdown(null);
  };

  return (
    <div className="space-y-4">
      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-stone-100/80 p-2 text-xs">
          <span className="font-semibold text-stone-600">Active Filters:</span>
          {filters.state !== "All" && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-stone-200 font-medium text-stone-700 shadow-sm">
              State: {filters.state}
              <button onClick={() => clearFilter("state")} className="text-stone-400 hover:text-stone-600">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.stream !== "All" && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-stone-200 font-medium text-stone-700 shadow-sm">
              Stream: {filters.stream}
              <button onClick={() => clearFilter("stream")} className="text-stone-400 hover:text-stone-600">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.ug_fee !== "All" && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-stone-200 font-medium text-stone-700 shadow-sm">
              Fee: {filters.ug_fee}
              <button onClick={() => clearFilter("ug_fee")} className="text-stone-400 hover:text-stone-600">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.rating !== null && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-stone-200 font-medium text-stone-700 shadow-sm">
              Rating: ≥{filters.rating}
              <button onClick={() => clearFilter("rating")} className="text-stone-400 hover:text-stone-600">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.placement !== null && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-stone-200 font-medium text-stone-700 shadow-sm">
              Placement: ≥{filters.placement}
              <button onClick={() => clearFilter("placement")} className="text-stone-400 hover:text-stone-600">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.faculty !== null && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-stone-200 font-medium text-stone-700 shadow-sm">
              Faculty: ≥{filters.faculty}
              <button onClick={() => clearFilter("faculty")} className="text-stone-400 hover:text-stone-600">
                <X size={12} />
              </button>
            </span>
          )}
          <button onClick={clearAllFilters} className="ml-auto text-leaf hover:underline font-semibold text-xs pr-1">
            Clear All
          </button>
        </div>
      )}

      {/* Main Table Wrapper */}
      <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-white/90 shadow-md">
        {openDropdown && (
          <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold uppercase text-stone-600 select-none">
              <tr>
                {/* College Name Column */}
                <th className="px-4 py-3.5 font-semibold relative">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => setOpenDropdown(openDropdown === "college_name" ? null : "college_name")}>
                    <span>College</span>
                    {sort.key === "college_name" ? (
                      sort.direction === "asc" ? <ArrowUp size={13} className="text-leaf" /> : <ArrowDown size={13} className="text-leaf" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40 hover:opacity-80" />
                    )}
                  </div>
                  {openDropdown === "college_name" && (
                    <div className="absolute left-4 top-10 z-40 w-48 rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                      <button onClick={() => handleSortClick("college_name")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort A-Z</span>
                        {sort.key === "college_name" && sort.direction === "asc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <button onClick={() => handleSortClick("college_name")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort Z-A</span>
                        {sort.key === "college_name" && sort.direction === "desc" && <Check size={12} className="text-leaf" />}
                      </button>
                    </div>
                  )}
                </th>

                {/* State Column */}
                <th className="px-4 py-3.5 font-semibold relative">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => setOpenDropdown(openDropdown === "state" ? null : "state")}>
                    <span>State</span>
                    {filters.state !== "All" ? (
                      <Filter size={13} className="text-leaf" />
                    ) : (
                      <Filter size={13} className="opacity-40 hover:opacity-80" />
                    )}
                  </div>
                  {openDropdown === "state" && (
                    <div className="absolute left-4 top-10 z-40 w-48 max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Filter State</div>
                      <button onClick={() => { setFilters(f => ({ ...f, state: "All" })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>All States</span>
                        {filters.state === "All" && <Check size={12} className="text-leaf" />}
                      </button>
                      {uniqueStates.map((s) => (
                        <button key={s} onClick={() => { setFilters(f => ({ ...f, state: s })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                          <span className="truncate">{s}</span>
                          {filters.state === s && <Check size={12} className="text-leaf" />}
                        </button>
                      ))}
                      <div className="border-t border-stone-100 my-1"></div>
                      <button onClick={() => handleSortClick("state")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort State A-Z</span>
                        {sort.key === "state" && sort.direction === "asc" && <Check size={12} className="text-leaf" />}
                      </button>
                    </div>
                  )}
                </th>

                {/* Stream Column */}
                <th className="px-4 py-3.5 font-semibold relative">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => setOpenDropdown(openDropdown === "stream" ? null : "stream")}>
                    <span>Stream</span>
                    {filters.stream !== "All" ? (
                      <Filter size={13} className="text-leaf" />
                    ) : (
                      <Filter size={13} className="opacity-40 hover:opacity-80" />
                    )}
                  </div>
                  {openDropdown === "stream" && (
                    <div className="absolute left-4 top-10 z-40 w-48 max-h-60 overflow-y-auto rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Filter Stream</div>
                      <button onClick={() => { setFilters(f => ({ ...f, stream: "All" })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>All Streams</span>
                        {filters.stream === "All" && <Check size={12} className="text-leaf" />}
                      </button>
                      {uniqueStreams.map((st) => (
                        <button key={st} onClick={() => { setFilters(f => ({ ...f, stream: st })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                          <span className="truncate">{st}</span>
                          {filters.stream === st && <Check size={12} className="text-leaf" />}
                        </button>
                      ))}
                      <div className="border-t border-stone-100 my-1"></div>
                      <button onClick={() => handleSortClick("stream")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort Stream A-Z</span>
                        {sort.key === "stream" && sort.direction === "asc" && <Check size={12} className="text-leaf" />}
                      </button>
                    </div>
                  )}
                </th>

                {/* UG Fee Column */}
                <th className="px-4 py-3.5 font-semibold relative">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => setOpenDropdown(openDropdown === "ug_fee" ? null : "ug_fee")}>
                    <span>UG Fee</span>
                    {filters.ug_fee !== "All" || sort.key === "ug_fee" ? (
                      <ArrowUpDown size={13} className="text-leaf" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40 hover:opacity-80" />
                    )}
                  </div>
                  {openDropdown === "ug_fee" && (
                    <div className="absolute left-4 top-10 z-40 w-48 rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Sort</div>
                      <button onClick={() => handleSortClick("ug_fee")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort Low-High</span>
                        {sort.key === "ug_fee" && sort.direction === "asc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <button onClick={() => handleSortClick("ug_fee")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort High-Low</span>
                        {sort.key === "ug_fee" && sort.direction === "desc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <div className="border-t border-stone-100 my-1"></div>
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Filter Range</div>
                      {["All", "Under 1 Lakh", "Under 2 Lakh", "Under 5 Lakh", "Under 10 Lakh"].map((range) => (
                        <button key={range} onClick={() => { setFilters(f => ({ ...f, ug_fee: range })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                          <span>{range}</span>
                          {filters.ug_fee === range && <Check size={12} className="text-leaf" />}
                        </button>
                      ))}
                    </div>
                  )}
                </th>

                {/* Rating Column */}
                <th className="px-4 py-3.5 font-semibold relative">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => setOpenDropdown(openDropdown === "rating" ? null : "rating")}>
                    <span>Rating</span>
                    {filters.rating !== null || sort.key === "rating" ? (
                      <ArrowUpDown size={13} className="text-leaf" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40 hover:opacity-80" />
                    )}
                  </div>
                  {openDropdown === "rating" && (
                    <div className="absolute right-4 md:left-4 top-10 z-40 w-44 rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Sort</div>
                      <button onClick={() => handleSortClick("rating")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort High-Low</span>
                        {sort.key === "rating" && sort.direction === "desc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <button onClick={() => handleSortClick("rating")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort Low-High</span>
                        {sort.key === "rating" && sort.direction === "asc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <div className="border-t border-stone-100 my-1"></div>
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Filter Threshold</div>
                      <button onClick={() => { setFilters(f => ({ ...f, rating: null })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Show All</span>
                        {filters.rating === null && <Check size={12} className="text-leaf" />}
                      </button>
                      {[9, 8, 7, 6].map((num) => (
                        <button key={num} onClick={() => { setFilters(f => ({ ...f, rating: num })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                          <span>≥ {num}.0</span>
                          {filters.rating === num && <Check size={12} className="text-leaf" />}
                        </button>
                      ))}
                    </div>
                  )}
                </th>

                {/* Placement Column */}
                <th className="px-4 py-3.5 font-semibold relative">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => setOpenDropdown(openDropdown === "placement" ? null : "placement")}>
                    <span>Placement</span>
                    {filters.placement !== null || sort.key === "placement" ? (
                      <ArrowUpDown size={13} className="text-leaf" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40 hover:opacity-80" />
                    )}
                  </div>
                  {openDropdown === "placement" && (
                    <div className="absolute right-4 top-10 z-40 w-44 rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Sort</div>
                      <button onClick={() => handleSortClick("placement")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort High-Low</span>
                        {sort.key === "placement" && sort.direction === "desc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <button onClick={() => handleSortClick("placement")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort Low-High</span>
                        {sort.key === "placement" && sort.direction === "asc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <div className="border-t border-stone-100 my-1"></div>
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Filter Threshold</div>
                      <button onClick={() => { setFilters(f => ({ ...f, placement: null })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Show All</span>
                        {filters.placement === null && <Check size={12} className="text-leaf" />}
                      </button>
                      {[9, 8, 7, 6].map((num) => (
                        <button key={num} onClick={() => { setFilters(f => ({ ...f, placement: num })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                          <span>≥ {num}.0</span>
                          {filters.placement === num && <Check size={12} className="text-leaf" />}
                        </button>
                      ))}
                    </div>
                  )}
                </th>

                {/* Faculty Column */}
                <th className="px-4 py-3.5 font-semibold relative">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900 transition-colors" onClick={() => setOpenDropdown(openDropdown === "faculty" ? null : "faculty")}>
                    <span>Faculty</span>
                    {filters.faculty !== null || sort.key === "faculty" ? (
                      <ArrowUpDown size={13} className="text-leaf" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40 hover:opacity-80" />
                    )}
                  </div>
                  {openDropdown === "faculty" && (
                    <div className="absolute right-4 top-10 z-40 w-44 rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Sort</div>
                      <button onClick={() => handleSortClick("faculty")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort High-Low</span>
                        {sort.key === "faculty" && sort.direction === "desc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <button onClick={() => handleSortClick("faculty")} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Sort Low-High</span>
                        {sort.key === "faculty" && sort.direction === "asc" && <Check size={12} className="text-leaf" />}
                      </button>
                      <div className="border-t border-stone-100 my-1"></div>
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 tracking-wider">Filter Threshold</div>
                      <button onClick={() => { setFilters(f => ({ ...f, faculty: null })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                        <span>Show All</span>
                        {filters.faculty === null && <Check size={12} className="text-leaf" />}
                      </button>
                      {[9, 8, 7, 6].map((num) => (
                        <button key={num} onClick={() => { setFilters(f => ({ ...f, faculty: num })); setOpenDropdown(null); }} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-stone-100">
                          <span>≥ {num}.0</span>
                          {filters.faculty === num && <Check size={12} className="text-leaf" />}
                        </button>
                      ))}
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredColleges.length > 0 ? (
                filteredColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-stone-50/70 transition-colors duration-150">
                    <td className="max-w-xs px-4 py-3.5 font-medium text-stone-900 leading-normal">{college.college_name}</td>
                    <td className="px-4 py-3.5 text-stone-500 font-medium">{college.state}</td>
                    <td className="px-4 py-3.5 text-stone-500 font-medium">
                      <span className="inline-flex rounded-full bg-mist px-2 py-0.5 text-xs text-leaf font-semibold">{college.stream}</span>
                    </td>
                    <td className="px-4 py-3.5 text-stone-600 font-semibold">{fee(college.ug_fee)}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200/50">
                        ⭐ {college.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-stone-700">{college.placement.toFixed(1)}</td>
                    <td className="px-4 py-3.5 font-bold text-stone-700">{college.faculty.toFixed(1)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400 font-medium bg-stone-50/20">
                    No colleges match the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
