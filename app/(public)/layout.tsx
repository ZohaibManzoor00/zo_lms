import { Navbar } from "./_components/navbar";
import NavbarComponent from "@/components/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Navbar /> */}
      <NavbarComponent />
      <main className="container mx-auto px-4 md:px-6 lg-px-8 mb-32">{children}</main>
    </>
  );
}
