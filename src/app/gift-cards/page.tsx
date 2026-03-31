import type { Metadata } from "next";
import GiftCardsClient from "./GiftCardsClient";

export const metadata: Metadata = {
  title: "Gift Cards | Pet and Angels",
  description:
    "Give the gift of happy, healthy pets. Pet and Angels gift cards are the perfect present for any pet lover — available in $25, $50, $75, and $100.",
};

export default function GiftCardsPage() {
  return <GiftCardsClient />;
}
