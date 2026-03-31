import type { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "Help Me Choose | Pet and Angels",
  description: "Find the perfect smart pet product with our personalized quiz.",
};

export default function HelpMeChoosePage() {
  return <QuizClient />;
}
