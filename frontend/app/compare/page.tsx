import type { Metadata } from "next";
import ComparePage from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare — LunaMatch",
  description: "Learned vs classical matcher comparison on the same tile.",
};

export default function Page() {
  return <ComparePage />;
}
