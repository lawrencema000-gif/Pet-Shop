"use client";

import { useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import { useTranslation } from "react-i18next";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const postUrl = `${SITE_CONFIG.url}/blog/${slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
      <span className="text-sm font-medium text-foreground">{t('shareButtons.share')}</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-border p-2 text-muted transition-colors hover:border-accent hover:text-foreground"
        aria-label={t('shareButtons.shareOnTwitter')}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-border p-2 text-muted transition-colors hover:border-accent hover:text-foreground"
        aria-label={t('shareButtons.shareOnFacebook')}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.07 1.373.14v3.34c-.149-.016-.408-.024-.601-.024-1.7 0-2.36.645-2.36 2.325v1.777h3.32l-.57 3.667h-2.75v8.353C19.396 23.187 24 18.134 24 12.011 24 5.384 18.627 0 12 0S0 5.384 0 12.011c0 5.234 3.406 9.717 8.131 11.28.349.077.727.119 .97.4z" />
        </svg>
      </a>
      <button
        onClick={handleCopyLink}
        className="rounded-full border border-border p-2 text-muted transition-colors hover:border-accent hover:text-foreground"
        aria-label={t('shareButtons.copyLink')}
        title={copied ? t('shareButtons.linkCopied') : t('shareButtons.copyLinkToClipboard')}
      >
        {copied ? (
          <svg
            className="h-4 w-4 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
