// Removed animation wrapper to improve LCP - animations were delaying content paint
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
