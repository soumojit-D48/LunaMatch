import type { Metadata } from "next";
import JobDetail from "./JobClient";

export const metadata: Metadata = {
  title: "Job detail — LunaMatch",
  description: "Match evidence, evaluation metrics and downloads for a registration job.",
};

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return <JobDetail id={jobId} />;
}
