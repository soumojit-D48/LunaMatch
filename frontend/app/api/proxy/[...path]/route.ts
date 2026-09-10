import { NextRequest, NextResponse } from "next/server";
import {
  JOB_FIXTURES,
  STAGES,
  type EvaluationReport,
  type Job,
  type JobFixture,
  type MatchPoint,
  type Transform,
} from "@/lib/mock-data";

// In-memory dummy store. Module state survives across requests in dev/prod
// single-instance; it resets on redeploy — fine for fixtures.
let store: Map<string, JobFixture> | null = null;
const polls = new Map<string, number>();

function getStore(): Map<string, JobFixture> {
  if (!store) {
    store = new Map(
      JOB_FIXTURES.map((f) => [f.job.id, JSON.parse(JSON.stringify(f)) as JobFixture]),
    );
  }
  return store;
}

function advance(job: Job): Job {
  if (job.status === "SUCCEEDED" || job.status === "FAILED") return job;
  const n = (polls.get(job.id) ?? 0) + 1;
  polls.set(job.id, n);
  const needed = job.pollsNeeded ?? 6;
  if (job.status === "PENDING" && n >= 1) {
    job.status = "RUNNING";
    job.startedAt = new Date().toISOString();
  }
  if (job.status === "RUNNING") {
    const idx = Math.min(STAGES.length - 1, Math.floor(((n - 1) / needed) * STAGES.length));
    job.currentStage = STAGES[idx];
    if (n >= needed + 1) {
      job.status = "SUCCEEDED";
      job.currentStage = "evaluation";
      job.completedAt = new Date().toISOString();
    }
  }
  return job;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const segments = (await ctx.params).path ?? [];
  const s = getStore();

  if (segments.length === 1 && segments[0] === "jobs") {
    return NextResponse.json({ jobs: [...s.values()].map((f) => f.job) });
  }
  if (segments.length === 2 && segments[0] === "jobs") {
    const f = s.get(segments[1]);
    if (!f) return NextResponse.json({ error: "job not found" }, { status: 404 });
    return NextResponse.json({ job: advance(f.job) });
  }
  if (segments.length === 3 && segments[0] === "jobs") {
    const f = s.get(segments[1]);
    if (!f) return NextResponse.json({ error: "job not found" }, { status: 404 });
    const kind = segments[2];
    if (kind === "result")
      return NextResponse.json({
        job: f.job,
        matches: f.matches,
        transform: f.transform,
        report: f.report,
      });
    if (kind === "matches") return NextResponse.json({ matches: f.matches });
    if (kind === "report") return NextResponse.json({ report: f.report });
  }
  return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const segments = (await ctx.params).path ?? [];
  if (segments.length !== 1 || segments[0] !== "jobs") {
    return NextResponse.json({ error: "unknown endpoint" }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<Job> & {
    matches?: MatchPoint[];
    transform?: Transform;
    report?: EvaluationReport;
  };
  const id = `job-${Date.now().toString(36)}`;
  const fixture: JobFixture = {
    job: {
      id,
      pairLabel: body.pairLabel ?? "OHRC ↔ LRO NAC · new upload",
      meta: body.meta ?? {
        sourceSensor: "OHRC",
        referenceSensor: "LRO NAC",
        sourceGsdM: 0.25,
        referenceGsdM: 0.6,
        sourceSunElevationDeg: 30,
        referenceSunElevationDeg: 36,
        sunDeltaDeg: 6,
      },
      status: "PENDING",
      currentStage: "queued",
      matcherType: body.matcherType ?? "superpoint-superglue",
      transformModel: body.transformModel ?? "homography",
      createdAt: new Date().toISOString(),
      pollsNeeded: 7,
    },
    matches: body.matches ?? [],
    transform: body.transform ?? { modelType: "homography", parameters: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
    report: body.report ?? {
      rmseX: 0.62, rmseY: 0.57, inlierCount: 27, inlierRatio: 0.84,
      coverageScore: 0.78, processingTimeS: 4.6, reliability: "high",
    },
  };
  // Seed plausible matches when the client doesn't supply any.
  if (fixture.matches.length === 0) {
    const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const { JOB_FIXTURES: base } = await import("@/lib/mock-data");
    fixture.matches = JSON.parse(JSON.stringify(base[0].matches)) as MatchPoint[];
    fixture.matches.forEach((m, i) => {
      m.id = `m-${seed}-${i}`;
    });
  }
  const s = getStore();
  // Newest first.
  const next = new Map<string, JobFixture>([[id, fixture], ...s]);
  store = next;
  polls.set(id, 0);
  return NextResponse.json({ jobId: id, job: fixture.job }, { status: 201 });
}

export type { Job, JobFixture };
