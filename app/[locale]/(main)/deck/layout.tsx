export default function DeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override parent layout - deck needs full screen without constraints
  return (
    <div className="fixed inset-0 z-50">
      {children}
    </div>
  );
}
