import { useEffect, useState, useMemo } from "react";
import {
  HiViewGrid,
  HiViewList,
  HiSearch,
  HiPhone,
  HiMail,
  HiCalendar,
  HiUser,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPatients } from "../../store/slices/patientsSlice";
import type { Patient } from "../../lib/mockApi";
import PatientDialog from "../../components/PatientDialog";

type ViewMode = "grid" | "list";
type StatusFilter = "All" | "Active" | "Critical" | "Stable";

const STATUS_FILTERS: StatusFilter[] = ["All", "Active", "Critical", "Stable"];

const statusStyles: Record<Patient["status"], string> = {
  Active: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Stable: "bg-green-50 text-green-700 ring-1 ring-green-200",
};

const statusDot: Record<Patient["status"], string> = {
  Active: "bg-blue-500",
  Critical: "bg-red-500",
  Stable: "bg-emerald-500",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string) {
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

/* ─── Skeletons ──────────────────────────────────────────────────── */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-3 bg-gray-100 rounded w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-11 bg-gray-50 border-b border-gray-100" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
          {Array.from({ length: 4 }).map((_, j) => (
            <div
              key={j}
              className="hidden md:block h-3.5 bg-gray-100 rounded w-24"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Patient Card (Grid) ────────────────────────────────────────── */
function PatientCard({ p, onClick }: { p: Patient; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-full ${avatarColor(p.name)} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
        >
          {initials(p.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {p.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {p.age} yrs · {p.gender} · {p.bloodType}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyles[p.status]}`}
        >
          {p.status}
        </span>
      </div>

      {/* Condition */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-0.5">Condition</p>
        <p className="text-sm font-medium text-gray-800">{p.condition}</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs mb-4">
        <div>
          <p className="text-gray-400">Doctor</p>
          <p className="text-gray-700 font-medium truncate">{p.doctor}</p>
        </div>
        <div>
          <p className="text-gray-400">Appointment</p>
          <p className="text-gray-700 font-medium">{p.time}</p>
        </div>
        <div>
          <p className="text-gray-400">Last Visit</p>
          <p className="text-gray-700">{p.lastVisit}</p>
        </div>
        <div>
          <p className="text-gray-400">Next Appt</p>
          <p className="text-gray-700">{p.nextAppointment}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-400 min-w-0">
          <HiPhone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{p.phone}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <span>View details</span>
          <HiOutlineChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Patient Row (List) ─────────────────────────────────────────── */
function PatientRow({ p, onClick }: { p: Patient; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${avatarColor(p.name)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
          >
            {initials(p.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {p.name}
            </p>
            <p className="text-xs text-gray-400">
              {p.age} yrs · {p.gender} · {p.bloodType}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700">{p.condition}</td>
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[p.status]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[p.status]}`} />
          {p.status}
        </span>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600 hidden md:table-cell">
        {p.doctor}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
        {p.lastVisit}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
        {p.nextAppointment}
      </td>
      <td className="px-4 py-3.5 hidden xl:table-cell">
        <div
          className="flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={`tel:${p.phone}`}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <HiPhone className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${p.email}`}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <HiMail className="w-4 h-4" />
          </a>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <HiOutlineChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
      </td>
    </tr>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Patients() {
  const dispatch = useAppDispatch();
  const { list, status, error } = useAppSelector((s) => s.patients);

  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [selected, setSelected] = useState<Patient | null>(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchPatients());
  }, [status, dispatch]);

  const filtered = useMemo(() => {
    return list.filter((p) => {
      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q) ||
        p.doctor.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [list, search, statusFilter]);

  const isLoading = status === "loading" || status === "idle";

  const statusCount = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: list.length,
      Active: 0,
      Critical: 0,
      Stable: 0,
    };
    list.forEach((p) => {
      counts[p.status]++;
    });
    return counts;
  }, [list]);

  return (
    <>
      {selected && (
        <PatientDialog patient={selected} onClose={() => setSelected(null)} />
      )}

      <div className="space-y-5">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Patient Details
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isLoading
                ? "Loading patients…"
                : `${filtered.length} of ${list.length} patients`}
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <HiViewGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <HiViewList className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, condition, doctor…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === f
                    ? f === "Critical"
                      ? "bg-red-600 text-white shadow-sm"
                      : f === "Active"
                        ? "bg-blue-600 text-white shadow-sm"
                        : f === "Stable"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-gray-900 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {f}
                {!isLoading && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      statusFilter === f
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {statusCount[f]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          view === "grid" ? (
            <GridSkeleton />
          ) : (
            <ListSkeleton />
          )
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HiUser className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No patients found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <PatientCard key={p.id} p={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Condition
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                      Last Visit
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-3.5 h-3.5" /> Next Appt
                      </div>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">
                      Contact
                    </th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => (
                    <PatientRow
                      key={p.id}
                      p={p}
                      onClick={() => setSelected(p)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-600">
                  {filtered.length}
                </span>{" "}
                patients
              </p>
              <p className="text-xs text-gray-400 hidden sm:block">
                {statusCount.Critical > 0 && (
                  <span className="text-red-500 font-medium">
                    {statusCount.Critical} critical
                  </span>
                )}
                {statusCount.Critical > 0 && statusCount.Active > 0 && " · "}
                {statusCount.Active > 0 && (
                  <span className="text-blue-500 font-medium">
                    {statusCount.Active} active
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
