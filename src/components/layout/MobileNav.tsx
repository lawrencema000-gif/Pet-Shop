"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Menu" side="left">
      <nav className="px-4 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.children ? (
                <div>
                  <button
                    onClick={() => toggle(link.label)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-foreground rounded-lg hover:bg-surface-light transition-colors",
                      link.highlight && "text-sale"
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-200",
                        expanded === link.label && "rotate-180"
                      )}
                    />
                  </button>
                  {expanded === link.label && (
                    <ul className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                      <li>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="block px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
                        >
                          View All
                        </Link>
                      </li>
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
                          >
                            <span>{child.label}</span>
                            {child.badge && (
                              <Badge
                                variant={
                                  child.badge === "New"
                                    ? "new"
                                    : child.badge === "Best Seller"
                                    ? "popular"
                                    : "default"
                                }
                              >
                                {child.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "block px-3 py-3 text-sm font-medium text-foreground rounded-lg hover:bg-surface-light transition-colors",
                    link.highlight && "text-sale"
                  )}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
