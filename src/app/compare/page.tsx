import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Products | Pet and Angels",
  description:
    "Compare Pet and Angels smart pet products side by side. Find the perfect feeder, fountain, or litter box for your home.",
};

export default function ComparePage() {
  return <CompareClient />;
}
