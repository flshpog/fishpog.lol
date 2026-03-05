"use client";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main id="main-content" className="flex-1 overflow-y-auto p-6 animate-page" tabIndex={-1}>
      {children}
    </main>
  );
}
