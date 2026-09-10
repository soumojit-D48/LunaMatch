import type { Metadata } from "next";
import JobsPage from "./JobsClient";

export const metadata: Metadata = {
  title: "Jobs — LunaMatch",
  description: "Registration job history and new pair submission.",
};

export default function Page() {
  return <JobsPage />;
}
