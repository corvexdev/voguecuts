import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { Catalog } from "@/components/site/Catalog";
import { Gallery } from "@/components/site/Gallery";
import { Team } from "@/components/site/Team";
import { Training } from "@/components/site/Training";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vogue Cutts — Premium Barbershop in Vushtrri, Kosovo" },
      {
        name: "description",
        content:
          "Vogue Cutts is a premium barbershop in Vushtrri offering professional haircuts, beard styling, and modern grooming. Book your appointment today.",
      },
      { property: "og:title", content: "Vogue Cutts — Premium Barbershop in Vushtrri" },
      {
        property: "og:description",
        content:
          "Professional haircuts, beard styling and modern grooming in Vushtrri, Kosovo. Look sharp. Feel confident.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "sq_AL" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vogue Cutts — Premium Barbershop in Vushtrri" },
      {
        name: "twitter:description",
        content: "Professional haircuts, beard styling and modern grooming in Vushtrri, Kosovo.",
      },
      { name: "theme-color", content: "#1a1612" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HairSalon",
          name: "Vogue Cutts",
          description:
            "Premium barbershop in Vushtrri offering haircuts, beard styling, and modern grooming.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Rr. Pandeli Sotiri",
            addressLocality: "Vushtrri",
            addressCountry: "XK",
          },
          telephone: "+38348421433",
          priceRange: "€€",
          image: [],
          openingHours: "Mo-Sa 09:00-21:00",
          sameAs: ["https://www.instagram.com/voguecutts"],
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <I18nProvider>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Header />
        <main>
          <Hero />
          <About />
          <Services />
          <Catalog />
          <Gallery />
          <Team />
          <Training />
          <Contact />
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
