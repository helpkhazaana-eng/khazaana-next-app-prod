import Header from "@/components/common/Header";
import MobileHeader from "@/components/common/MobileHeader";
import Footer from "@/components/common/Footer";
import BottomNav from "@/components/common/BottomNav";
import FloatingCart from "@/components/cart/FloatingCart";
import AnnouncementBar from "@/components/common/AnnouncementBar";
import FestiveTheme from "@/components/common/FestiveTheme";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FestiveTheme />
      <AnnouncementBar />
      <MobileHeader />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <FloatingCart />
      <BottomNav />
      <Footer />
    </>
  );
}
