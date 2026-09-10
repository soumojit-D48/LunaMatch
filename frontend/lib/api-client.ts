// Typed fetch wrapper around /api/proxy (dummy backend today, FastAPI tomorrow).
import type {
  EvaluationReport,
  Job,
  JobResult,
  MatcherType,
  MatchPoint,
  TransformModel,
} from "@/lib/mock-data";

export type { EvaluationReport, Job, JobResult, MatcherType, MatchPoint, TransformModel };

const BASE = "/api/proxy";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export function listJobs() {
  return fetch(`${BASE}/jobs`).then((r) => json<{ jobs: Job[] }>(r));
}

export function getJob(id: string) {
  return fetch(`${BASE}/jobs/${id}`).then((r) => json<{ job: Job }>(r));
}

export function getResult(id: string) {
  return fetch(`${BASE}/jobs/${id}/result`).then((r) => json<JobResult>(r));
}

export function getMatches(id: string) {
  return fetch(`${BASE}/jobs/${id}/matches`).then((r) => json<{ matches: MatchPoint[] }>(r));
}

export function getReport(id: string) {
  return fetch(`${BASE}/jobs/${id}/report`).then((r) => json<{ report: EvaluationReport }>(r));
}

export function createJob(input: {
  pairLabel: string;
  matcherType: MatcherType;
  transformModel: TransformModel;
}) {
  return fetch(`${BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((r) => json<{ jobId: string; job: Job }>(r));
}
