import type { College } from "../lib/api";

const fee = (value: number | null) => (value ? `INR ${value.toLocaleString("en-IN")}` : "Unavailable");

export function CollegeTable({ colleges }: { colleges: College[] }) {
  return (
    <div className="overflow-x-auto rounded border border-stone-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-mist text-xs uppercase text-ink/70">
          <tr>
            <th className="px-4 py-3">College</th>
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3">Stream</th>
            <th className="px-4 py-3">UG Fee</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3">Placement</th>
            <th className="px-4 py-3">Faculty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {colleges.map((college) => (
            <tr key={college.id} className="hover:bg-stone-50">
              <td className="max-w-xs px-4 py-3 font-medium text-ink">{college.college_name}</td>
              <td className="px-4 py-3">{college.state}</td>
              <td className="px-4 py-3">{college.stream}</td>
              <td className="px-4 py-3">{fee(college.ug_fee)}</td>
              <td className="px-4 py-3">{college.rating}</td>
              <td className="px-4 py-3">{college.placement}</td>
              <td className="px-4 py-3">{college.faculty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
