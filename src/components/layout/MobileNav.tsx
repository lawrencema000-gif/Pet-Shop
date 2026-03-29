"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronDown, Package, HelpCircle, User, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/petlibro", labelKey: "footer.facebook" },
  { icon: Instagram, href: "https://instagram.com/petlibro", labelKey: "footer.instagram" },
  { icon: Twitter, href: "https://twitter.com/petlibro", labelKey: "footer.twitter" },
  { icon: Youtube, href: "https://youtube.com/@petlibro", labelKey: "footer.youtube" },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={SITE_CONFIG.name} side="left">
      <div className="flex flex-col h-full">
        {/* Main navigation */}
        <nav className="flex-1 px-4 py-5 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.children ? (
                  <div>
                    <button
                      onClick={() => toggle(link.label)}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3.5 text-[15px] font-medium rounded-lg hover:bg-surface-light transition-colors min-h-[48px]",
                        link.highlight && link.highlightColor === "red"
                          ? "text-sale"
                          : link.highlight && link.highlightColor === "accent"
                          ? "text-accent font-semibold"
                          : "text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {link.label}
                        {link.isNew && (
                          <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold text-white bg-success rounded-full leading-none">
                            {t('common.new')}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200 text-muted",
                          expanded === link.label && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {expanded === link.label && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden ml-3 border-l-2 border-border/60 pl-3"
                        >
                          <li>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="block px-4 py-3 text-[15px] font-medium text-accent hover:text-accent/70 transition-colors min-h-[44px]"
                            >
                              {t('nav.shopAll')} {link.label}
                            </Link>
                          </li>
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className="flex items-center gap-2 px-4 py-3 text-[15px] text-muted hover:text-foreground transition-colors min-h-[44px]"
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
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    {child.badge}
                                  </Badge>
                                )}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "block px-4 py-3.5 text-[15px] font-medium rounded-lg hover:bg-surface-light transition-colors min-h-[48px] flex items-center",
                      link.highlight && link.highlightColor === "red"
                        ? "text-sale font-semibold"
                        : link.highlight && link.highlightColor === "accent"
                        ? "text-accent font-semibold"
                        : "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick links section */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex flex-col gap-1">
            <Link
              href="/track-order"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 text-[15px] text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-light min-h-[48px]"
            >
              <Package size={16} />
              {t('nav.trackOrder')}
            </Link>
            <Link
              href="/support"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 text-[15px] text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-light min-h-[48px]"
            >
              <HelpCircle size={16} />
              {t('nav.helpCenter')}
            </Link>
            <Link
              href="/auth/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 text-[15px] text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-light min-h-[48px]"
            >
              <User size={16} />
              {t('common.account')}
            </Link>
          </div>
        </div>

        {/* Language switcher */}
        <div className="border-t border-border px-4 py-4">
          <LanguageSwitcher />
        </div>

        {/* Social links */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-2">
            {socialLinks.map(({ icon: Icon, href, labelKey }) => (
              <a
                key={labelKey}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-surface-light text-muted hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t(labelKey)}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
