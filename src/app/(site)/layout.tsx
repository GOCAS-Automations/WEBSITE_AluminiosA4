import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { getConfig } from "@/lib/config";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getConfig();

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer cfg={cfg} />
      <WhatsAppFloat cfg={cfg} />
    </>
  );
}
