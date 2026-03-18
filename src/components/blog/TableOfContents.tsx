"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: "h2" | "h3";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseHeadings(html: string): TocItem[] {
  const regex = /<(h[23])[^>]*>(.*?)<\/\1>/gi;
  const items: TocItem[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = match[1].toLowerCase() as "h2" | "h3";
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    if (text) {
      items.push({ id: slugify(text), text, level });
    }
  }

  return items;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const headings = parseHeadings(content);

  // Add IDs to headings in the DOM
  useEffect(() => {
    const article = document.querySelector(".prose-article");
    if (!article) return;

    const h2h3 = article.querySelectorAll("h2, h3");
    h2h3.forEach((el) => {
      const text = el.textContent?.trim() || "";
      const id = slugify(text);
      el.setAttribute("id", id);
    });
  }, [content]);

  // Track active heading with IntersectionObserver
  const handleObserver = useCallback(() => {
    const article = document.querySelector(".prose-article");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cleanup = handleObserver();
    return () => cleanup?.();
  }, [handleObserver]);

  if (headings.length < 2) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  const tocList = (
    <ul className="space-y-1">
      {headings.map((heading) => (
        <li key={heading.id}>
          <button
            onClick={() => handleClick(heading.id)}
            className={`block w-full text-left text-sm transition-colors duration-150 ${
              heading.level === "h3" ? "pl-4" : ""
            } ${
              activeId === heading.id
                ? "font-medium text-accent"
                : "text-muted hover:text-foreground"
            } py-1`}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop: sticky sidebar TOC */}
      <nav className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Table of Contents
        </p>
        {tocList}
      </nav>

      {/* Mobile: collapsible TOC */}
      <div className="lg:hidden mb-8 rounded-lg border border-border bg-surface-light">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between p-4 text-sm font-semibold text-foreground"
        >
          Table of Contents
          <ChevronDown
            className={`h-4 w-4 text-muted transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && <div className="px-4 pb-4">{tocList}</div>}
      </div>
    </>
  );
}
