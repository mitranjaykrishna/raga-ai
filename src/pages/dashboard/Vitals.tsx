import { useEffect, useState, useMemo, useCallback } from "react";
import {
  HiOutlineHeart,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineBell,
  HiOutlineVolumeOff,
  HiOutlineRefresh,
  HiSearch,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineMinus,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchVitals } from "../../store/slices/vitalsSlice";
import { fetchPatients } from "../../store/slices/patientsSlice";
import {
  getPermission,
  requestPermission,
  notify,
} from "../../lib/notifications";
import type { Vitals } from "../../lib/mockApi";
import PatientDialog from "../../components/PatientDialog";
import type { Patient } from "../../lib/mockApi";

/* ─── Vital thresholds ───────────────────────────────────────────── */
const RANGES = {
  heartRate: { low: 60, high: 100, critLow: 50, critHigh: 120 },
  systolic: { low: 90, high: 120, critLow: 80, critHigh: 160 },
  diastolic: { low: 60, high: 80, critLow: 50, critHigh: 100 },
  spO2: { low: 95, high: 100, critLow: 90, critHigh: 101 },
  temperature: { low: 97, high: 99, critLow: 96, critHigh: 101 },
  respiratoryRate: { low: 12, high: 20, critLow: 10, critHigh: 25 },
};

type VitalKey = keyof typeof RANGES;

function vitalLevel(
  key: VitalKey,
  val: number,
): "normal" | "warning" | "critical" {
  const r = RANGES[key];
  if (val <= r.critLow || val >= r.critHigh) return "critical";
  if (val < r.low || val > r.high) return "warning";
  return "normal";
}

function overallStatus(v: Vitals): "Critical" | "Warning" | "Normal" {
  const keys: VitalKey[] = [
    "heartRate",
    "systolic",
    "diastolic",
    "spO2",
    "temperature",
    "respiratoryRate",
  ];
  const levels = keys.map((k) => vitalLevel(k, v[k]));
  if (levels.includes("critical")) return "Critical";
  if (levels.includes("warning")) return "Warning";
  return "Normal";
}

const levelColor = {
  normal: "text-gray-700",
  warning: "text-amber-600",
  critical: "text-red-600 font-semibold",
};

const levelBg = {
  normal: "bg-gray-100",
  warning: "bg-amber-100",
  critical: "bg-red-100",
};

const statusBadge: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Normal: "bg-green-50 text-green-700 ring-1 ring-green-200",
};

const statusDot: Record<string, string> = {
  Critical: "bg-red-500",
  Warning: "bg-amber-400",
  Normal: "bg-emerald-500",
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

/* ─── Vital cell ─────────────────────────────────────────────────── */
function VCell({
  label,
  value,
  unit,
  level,
}: {
  label: string;
  value: number | string;
  unit: string;
  level: "normal" | "warning" | "critical";
}) {
  const TrendIcon =
    level === "critical"
      ? HiOutlineChevronUp
      : level === "warning"
        ? HiOutlineMinus
        : HiOutlineChevronDown;
  return (
    <div className={`rounded-lg px-3 py-2 ${levelBg[level]}`}>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-bold ${levelColor[level]}`}>
          {value}
        </span>
        <span className="text-[10px] text-gray-400">{unit}</span>
        <TrendIcon
          className={`w-3 h-3 ml-auto ${level === "critical" ? "text-red-500" : level === "warning" ? "text-amber-500" : "text-emerald-500"}`}
        />
      </div>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/* ─── Notification banner ────────────────────────────────────────── */
function NotificationBanner({ onEnable }: { onEnable: () => void }) {
  const perm = getPermission();
  if (perm === "granted") return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <HiOutlineBell className="w-5 h-5 text-blue-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-800">
          Enable critical alerts
        </p>
        <p className="text-xs text-blue-600 mt-0.5">
          Get notified when patient vitals reach critical levels, even when the
          tab is in the background.
        </p>
      </div>
      {perm === "denied" ? (
        <span className="text-xs text-blue-400 shrink-0">
          Blocked in browser settings
        </span>
      ) : (
        <button
          onClick={onEnable}
          className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Enable
        </button>
      )}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function VitalsPage() {
  const dispatch = useAppDispatch();
  const { list: vitals, status, error } = useAppSelector((s) => s.vitals);
  const { list: patients, status: pStatus } = useAppSelector((s) => s.patients);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Critical" | "Warning" | "Normal"
  >("All");
  const [perm, setPerm] = useState<NotificationPermission>(getPermission);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchVitals());
    if (pStatus === "idle") dispatch(fetchPatients());
  }, [status, pStatus, dispatch]);

  const handleEnable = useCallback(async () => {
    const result = await requestPermission();
    setPerm(result);
    if (result === "granted") {
      await notify(
        "✅ RagaHealth Alerts Active",
        "You will now receive critical patient alerts.",
        "welcome",
      );
    }
  }, []);

  const handleTestAlert = useCallback(() => {
    notify(
      "🔔 Test Alert",
      "Notification system is working correctly.",
      "test",
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchVitals());
    setRefreshing(false);
  }, [dispatch]);

  /* Patient lookup map */
  const patientMap = useMemo(() => {
    const m: Record<string, Patient> = {};
    patients.forEach((p) => {
      m[p.id] = p;
    });
    return m;
  }, [patients]);

  /* Rows joined + filtered */
  const rows = useMemo(() => {
    return vitals
      .map((v) => ({ v, p: patientMap[v.patientId], status: overallStatus(v) }))
      .filter(({ p, status: s }) => {
        if (filter !== "All" && s !== filter) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          p?.name.toLowerCase().includes(q) ||
          p?.condition.toLowerCase().includes(q) ||
          false
        );
      })
      .sort((a, b) => {
        const order = { Critical: 0, Warning: 1, Normal: 2 };
        return order[a.status] - order[b.status];
      });
  }, [vitals, patientMap, filter, search]);

  const counts = useMemo(() => {
    const c = { All: vitals.length, Critical: 0, Warning: 0, Normal: 0 };
    vitals.forEach((v) => {
      c[overallStatus(v)]++;
    });
    return c;
  }, [vitals]);

  const isLoading = status === "idle" || status === "loading";

  return (
    <>
      {selected && (
        <PatientDialog patient={selected} onClose={() => setSelected(null)} />
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Vitals</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isLoading
                ? "Loading vitals…"
                : `${rows.length} of ${vitals.length} patients · Live monitoring`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {perm === "granted" && (
              <button
                onClick={handleTestAlert}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <HiOutlineBell className="w-4 h-4" />
                Test Alert
              </button>
            )}
            {perm !== "granted" && perm !== "denied" && (
              <button
                onClick={handleEnable}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <HiOutlineBell className="w-4 h-4" />
                Enable Alerts
              </button>
            )}
            {perm === "denied" && (
              <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg">
                <HiOutlineVolumeOff className="w-4 h-4" />
                Notifications blocked
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <HiOutlineRefresh
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Notification banner */}
        <NotificationBanner onEnable={handleEnable} />

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              {
                key: "All",
                label: "Total",
                icon: HiOutlineHeart,
                bg: "bg-blue-600",
              },
              {
                key: "Critical",
                label: "Critical",
                icon: HiOutlineExclamationCircle,
                bg: "bg-red-600",
              },
              {
                key: "Warning",
                label: "Warning",
                icon: HiOutlineExclamationCircle,
                bg: "bg-amber-500",
              },
              {
                key: "Normal",
                label: "Normal",
                icon: HiOutlineCheckCircle,
                bg: "bg-emerald-600",
              },
            ] as const
          ).map(({ key, label, icon: Icon, bg }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`bg-white rounded-xl border p-4 text-left transition-all ${
                filter === key
                  ? "border-blue-300 ring-2 ring-blue-100 shadow-sm"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "–" : counts[key]}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient or condition…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex gap-1">
            {(["All", "Critical", "Warning", "Normal"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  filter === f
                    ? f === "Critical"
                      ? "bg-red-600 text-white"
                      : f === "Warning"
                        ? "bg-amber-500 text-white"
                        : f === "Normal"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {f}
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

        {/* Vitals cards */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HiOutlineHeart className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">
                No patients match this filter
              </p>
            </div>
          ) : (
            rows.map(({ v, p, status: s }) => (
              <div
                key={v.patientId}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  s === "Critical"
                    ? "border-red-200 shadow-sm shadow-red-50"
                    : s === "Warning"
                      ? "border-amber-200"
                      : "border-gray-100"
                }`}
              >
                {/* Row header */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => p && setSelected(p)}
                    disabled={!p}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left group"
                  >
                    <div
                      className={`w-9 h-9 rounded-full ${p ? avatarColor(p.name) : "bg-gray-300"} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
                    >
                      {p ? initials(p.name) : "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {p?.name ?? v.patientId}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p?.condition ?? "–"} · {p?.doctor ?? "–"}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[s]}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${s === "Critical" ? "animate-pulse" : ""} ${statusDot[s]}`}
                      />
                      {s}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {v.recordedAt}
                    </span>
                  </div>
                </div>

                {/* Vital cells */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <VCell
                    label="Heart Rate"
                    value={v.heartRate}
                    unit="bpm"
                    level={vitalLevel("heartRate", v.heartRate)}
                  />
                  <VCell
                    label="BP Systolic"
                    value={v.systolic}
                    unit="mmHg"
                    level={vitalLevel("systolic", v.systolic)}
                  />
                  <VCell
                    label="BP Diastolic"
                    value={v.diastolic}
                    unit="mmHg"
                    level={vitalLevel("diastolic", v.diastolic)}
                  />
                  <VCell
                    label="SpO₂"
                    value={v.spO2}
                    unit="%"
                    level={vitalLevel("spO2", v.spO2)}
                  />
                  <VCell
                    label="Temp"
                    value={v.temperature}
                    unit="°F"
                    level={vitalLevel("temperature", v.temperature)}
                  />
                  <VCell
                    label="Resp Rate"
                    value={v.respiratoryRate}
                    unit="/min"
                    level={vitalLevel("respiratoryRate", v.respiratoryRate)}
                  />
                </div>

                {/* Critical warning strip */}
                {s === "Critical" && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                    <HiOutlineExclamationCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 font-medium">
                      Critical vitals detected — immediate clinical review
                      required
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        {!isLoading && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Legend
            </p>
            {(
              [
                {
                  label: "Normal range",
                  bg: "bg-gray-100",
                  text: "text-gray-700",
                },
                {
                  label: "Warning — outside normal",
                  bg: "bg-amber-100",
                  text: "text-amber-600",
                },
                {
                  label: "Critical — immediate attention",
                  bg: "bg-red-100",
                  text: "text-red-600 font-semibold",
                },
              ] as const
            ).map(({ label, bg, text }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-6 h-4 rounded ${bg}`} />
                <span className={`text-xs ${text}`}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
