"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, UtensilsCrossed, Droplets, Box, HelpCircle, ArrowLeft, RotateCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/types/product";

type PetType = "dog" | "cat" | "both";
type ProductType = "feeder" | "fountain" | "litter" | "not-sure";
type PetCount = "1" | "2-3" | "4+";
type Budget = "under-75" | "75-150" | "150-300" | "300+";
type Priority = "app-control" | "easy-clean" | "large-capacity" | "quiet";

interface Answers {
  petType?: PetType;
  productType?: ProductType;
  petCount?: PetCount;
  budget?: Budget;
  priorities: Priority[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function QuizClient() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ priorities: [] });
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const startOver = () => {
    setAnswers({ priorities: [] });
    setResults(null);
    setStep(1);
    setDirection(-1);
  };

  const fetchResults = useCallback(async (a: Answers) => {
    setLoading(true);

    let query = supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*)")
      .eq("status", "active");

    // Filter by product type / category name
    if (a.productType && a.productType !== "not-sure") {
      const categoryMap: Record<string, string> = {
        feeder: "feeder",
        fountain: "fountain",
        litter: "litter",
      };
      const keyword = categoryMap[a.productType];
      if (keyword) {
        // Use name ilike on a joined categories table or filter on product name
        query = query.or(`name.ilike.%${keyword}%`);
      }
    }

    // Filter by price range
    if (a.budget) {
      const priceRanges: Record<string, [number, number]> = {
        "under-75": [0, 75],
        "75-150": [75, 150],
        "150-300": [150, 300],
        "300+": [300, 9999],
      };
      const [min, max] = priceRanges[a.budget];
      query = query.gte("base_price", min).lte("base_price", max);
    }

    query = query.limit(4);

    const { data } = await query;
    setResults((data as Product[]) || []);
    setLoading(false);
  }, []);

  const handleFinish = () => {
    fetchResults(answers);
  };

  const selectPetType = (val: PetType) => {
    setAnswers((a) => ({ ...a, petType: val }));
    goNext();
  };

  const selectProductType = (val: ProductType) => {
    setAnswers((a) => ({ ...a, productType: val }));
    goNext();
  };

  const selectPetCount = (val: PetCount) => {
    setAnswers((a) => ({ ...a, petCount: val }));
    goNext();
  };

  const selectBudget = (val: Budget) => {
    setAnswers((a) => ({ ...a, budget: val }));
    goNext();
  };

  const togglePriority = (val: Priority) => {
    setAnswers((a) => ({
      ...a,
      priorities: a.priorities.includes(val)
        ? a.priorities.filter((p) => p !== val)
        : [...a.priorities, val],
    }));
  };

  const getPrice = (product: Product) => {
    const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
    return defaultVariant?.price ?? product.base_price;
  };

  const getPrimaryImage = (product: Product) => {
    const primary = product.images?.find((img) => img.is_primary);
    return primary?.url || product.images?.[0]?.url || "/images/placeholder.jpg";
  };

  // Show results
  if (results !== null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Your Recommendations</h1>
          <p className="text-muted text-lg">
            {results.length > 0
              ? "Based on your answers, we think you'll love these products."
              : "We couldn't find an exact match, but check out our full collection!"}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group border border-border rounded-md overflow-hidden bg-background hover:shadow-sm transition-shadow"
              >
                <div className="relative aspect-square bg-surface-light">
                  <Image
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  {product.subtitle && (
                    <p className="text-sm text-muted mt-1 line-clamp-1">{product.subtitle}</p>
                  )}
                  <p className="mt-2 font-bold text-lg">${getPrice(product).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={startOver}
            className="flex items-center gap-2 px-6 py-3 rounded border border-border text-foreground hover:bg-surface-light transition-colors"
          >
            <RotateCcw size={18} />
            Start Over
          </button>
          <Link
            href="/products"
            className="flex items-center gap-2 px-6 py-3 rounded bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            <ShoppingBag size={18} />
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Help Me Choose</h1>
        <p className="text-muted text-lg">Answer a few questions and we&apos;ll find the perfect product for your pet.</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-light rounded-full mb-10 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Back button */}
      {step > 1 && (
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        {/* Step 1: Pet Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">What type of pet do you have?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { value: "dog" as PetType, label: "Dog" },
                { value: "cat" as PetType, label: "Cat" },
                { value: "both" as PetType, label: "Both" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectPetType(opt.value)}
                  className={`flex flex-col items-center gap-3 p-8 rounded-md border-2 transition-all hover:border-accent hover:shadow-md ${
                    answers.petType === opt.value ? "border-accent bg-accent/5" : "border-border bg-background"
                  }`}
                >
                  <PawPrint size={36} className="text-accent" />
                  <span className="text-lg font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Product Type */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">What are you looking for?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { value: "feeder" as ProductType, label: "Smart Feeder", Icon: UtensilsCrossed },
                { value: "fountain" as ProductType, label: "Water Fountain", Icon: Droplets },
                { value: "litter" as ProductType, label: "Litter Box", Icon: Box },
                { value: "not-sure" as ProductType, label: "Not Sure", Icon: HelpCircle },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectProductType(opt.value)}
                  className={`flex items-center gap-4 p-6 rounded-md border-2 transition-all hover:border-accent hover:shadow-md ${
                    answers.productType === opt.value ? "border-accent bg-accent/5" : "border-border bg-background"
                  }`}
                >
                  <opt.Icon size={28} className="text-accent shrink-0" />
                  <span className="text-lg font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Number of Pets */}
        {step === 3 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">How many pets do you have?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(["1", "2-3", "4+"] as PetCount[]).map((val) => (
                <button
                  key={val}
                  onClick={() => selectPetCount(val)}
                  className={`px-10 py-5 rounded-md border-2 text-lg font-medium transition-all hover:border-accent hover:shadow-md ${
                    answers.petCount === val ? "border-accent bg-accent/5" : "border-border bg-background"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <motion.div
            key="step4"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">What&apos;s your budget?</h2>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {([
                { value: "under-75" as Budget, label: "Under $75" },
                { value: "75-150" as Budget, label: "$75 - $150" },
                { value: "150-300" as Budget, label: "$150 - $300" },
                { value: "300+" as Budget, label: "$300+" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectBudget(opt.value)}
                  className={`px-6 py-5 rounded-md border-2 text-lg font-medium transition-all hover:border-accent hover:shadow-md ${
                    answers.budget === opt.value ? "border-accent bg-accent/5" : "border-border bg-background"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Priorities */}
        {step === 5 && (
          <motion.div
            key="step5"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-2 text-center">What matters most to you?</h2>
            <p className="text-sm text-muted text-center mb-6">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {([
                { value: "app-control" as Priority, label: "App Control" },
                { value: "easy-clean" as Priority, label: "Easy to Clean" },
                { value: "large-capacity" as Priority, label: "Large Capacity" },
                { value: "quiet" as Priority, label: "Quiet Operation" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => togglePriority(opt.value)}
                  className={`px-6 py-5 rounded-md border-2 text-lg font-medium transition-all hover:border-accent hover:shadow-md ${
                    answers.priorities.includes(opt.value) ? "border-accent bg-accent/5" : "border-border bg-background"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-4 rounded bg-accent text-white text-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Finding products..." : "See My Results"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
