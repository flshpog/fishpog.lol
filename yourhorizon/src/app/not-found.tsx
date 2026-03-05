import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-4xl font-bold text-text mb-2">404</h1>
      <p className="text-text-secondary mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
