import type { Metadata } from "next";
import GiftCardsClient from "./GiftCardsClient";

export const metadata: Metadata = {
  title: "Gift Cards | PETLIBRO",
  description:
    "Give the gift of happy, healthy pets. PETLIBRO gift cards are the perfect present for any pet lover — available in $25, $50, $75, and $100.",
};

export default function GiftCardsPage() {
  return <GiftCardsClient />;
}
