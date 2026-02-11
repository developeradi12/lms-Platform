export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="w-full px-6" >
      {children}
    </div>
  );
}
