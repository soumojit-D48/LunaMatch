import type { Metadata } from "next";
import JobsPage from "./JobsClient";

export const metadata: Metadata = {
  title: "Jobs — LunarSync",
  description: "Registration job history and new pair submission.",
};

export default function Page() {
  return <JobsPage />;
}
