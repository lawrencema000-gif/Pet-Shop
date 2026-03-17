import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl font-bold text-border mb-4">404</p>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
        Page Not Found
      </h1>
      <p className="text-muted max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 bg-accent text-white hover:bg-accent/90 px-8 py-4 text-base"
      >
        Go Home
      </Link>
    </div>
  );
}
