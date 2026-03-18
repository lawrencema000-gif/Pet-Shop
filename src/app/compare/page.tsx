import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Products | PETLIBRO",
  description:
    "Compare PETLIBRO smart pet products side by side. Find the perfect feeder, fountain, or litter box for your home.",
};

export default function ComparePage() {
  return <CompareClient />;
}
