export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="w-full px-6 overflow-auto" >
      {children}
    </div>
  );
}
