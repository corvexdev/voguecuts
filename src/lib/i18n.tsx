import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "sq" | "en";

type Dict = Record<string, { sq: string; en: string }>;

export const dict = {
  "nav.home": { sq: "Ballina", en: "Home" },
  "nav.about": { sq: "Rreth Nesh", en: "About" },
  "nav.services": { sq: "Sherbimet", en: "Services" },
  "nav.catalog": { sq: "Katalogu", en: "Catalog" },
  "nav.gallery": { sq: "Galeria", en: "Gallery" },
  "nav.team": { sq: "Ekipi", en: "Team" },
  "nav.training": { sq: "Praktika", en: "Training" },
  "nav.contact": { sq: "Kontakti", en: "Contact" },
  "nav.book": { sq: "Rezervo", en: "Book" },

  "hero.eyebrow": { sq: "Vushtrri · Kosovë", en: "Vushtrri · Kosovo" },
  "hero.title": { sq: "Përvojë Premium Berberi në Vushtrri", en: "Premium Barber Experience in Vushtrri" },
  "hero.sub": {
    sq: "Prerje profesionale të flokëve, stilim mjekrre dhe grooming modern.",
    en: "Professional haircuts, beard styling and modern grooming.",
  },
  "hero.book": { sq: "Rezervo Termin", en: "Book Appointment" },
  "hero.whatsapp": { sq: "Na shkruaj në WhatsApp", en: "Contact on WhatsApp" },

  "about.eyebrow": { sq: "Rreth Vogue Cutts", en: "About Vogue Cutts" },
  "about.title": { sq: "Arti i detajit. Standardi i luksit.", en: "The art of detail. The standard of luxury." },
  "about.body": {
    sq: "Vogue Cutts është një sallon premium berberi në Vushtrri, ku ambienti modern, pajisjet bashkëkohore dhe berberët me përvojë bashkohen për të krijuar një përvojë të papërsëritshme grooming-u për burrat që kërkojnë më të mirën.",
    en: "Vogue Cutts is a premium barbershop in Vushtrri, where a modern environment, contemporary equipment and experienced barbers come together to create an unparalleled grooming experience for men who demand the best.",
  },
  "about.f1.t": { sq: "Ambient modern", en: "Modern environment" },
  "about.f1.d": { sq: "Hapësirë e dizajnuar me shije, dritë profesionale dhe atmosferë premium.", en: "A space designed with taste, professional lighting and a premium atmosphere." },
  "about.f2.t": { sq: "Berberë me përvojë", en: "Experienced barbers" },
  "about.f2.d": { sq: "Ekip profesional me vite eksperiencë në teknikat më të reja.", en: "A professional team with years of experience in the latest techniques." },
  "about.f3.t": { sq: "Pajisje cilësore", en: "Quality equipment" },
  "about.f3.d": { sq: "Vetëm vegla dhe produkte të nivelit më të lartë.", en: "Only top-tier tools and products." },
  "about.f4.t": { sq: "Kënaqësi e garantuar", en: "Guaranteed satisfaction" },
  "about.f4.d": { sq: "Çdo klient del me besimin dhe pamjen më të mirë të vetes.", en: "Every client leaves with the best version of themselves." },

  "services.eyebrow": { sq: "Lista Çmimore", en: "Price List" },
  "services.title": { sq: "Shërbimet tona", en: "Our Services" },
  "services.duration": { sq: "min", en: "min" },
  "services.book": { sq: "Rezervo", en: "Book" },

  "catalog.eyebrow": { sq: "Inspirim", en: "Inspiration" },
  "catalog.title": { sq: "Katalogu i Stileve", en: "Hairstyle Catalog" },
  "catalog.all": { sq: "Të gjitha", en: "All" },

  "gallery.eyebrow": { sq: "Brenda Sallonit", en: "Inside the Shop" },
  "gallery.title": { sq: "Galeria", en: "Gallery" },

  "team.eyebrow": { sq: "Mjeshtrit", en: "The Masters" },
  "team.title": { sq: "Njihuni me Ekipin", en: "Meet Our Team" },
  "team.book": { sq: "Rezervo me të", en: "Book with him" },
  "team.whatsapp": { sq: "WhatsApp", en: "WhatsApp" },
  "team.role": { sq: "Berber Profesional", en: "Professional Barber" },

  "training.eyebrow": { sq: "Mundësi Karriere", en: "Career Opportunity" },
  "training.title": { sq: "Njoftim për Praktikë Profesionale në Frizeri", en: "Professional Barber Training Program" },
  "training.body": {
    sq: "Salloni i flokëve Vogue Cutts, me adresë në rrugën Pandeli Sotiri, Vushtrri, ofron mundësi për praktikë profesionale në fushën e frizerisë.",
    en: "Vogue Cutts barbershop, located on Pandeli Sotiri street in Vushtrri, offers opportunities for professional training in barbering.",
  },
  "training.c1": { sq: "Kohëzgjatja maksimale: 3 muaj", en: "Maximum duration: 3 months" },
  "training.c2": { sq: "Pagesa mujore: 150€", en: "Monthly compensation: €150" },
  "training.c3": { sq: "Trajnim praktik me staf profesional", en: "Hands-on training with a professional team" },
  "training.c4": { sq: "Përvojë reale pune", en: "Real work experience" },
  "training.c5": { sq: "Respektimi i rregullave dhe standardeve profesionale", en: "Adherence to professional rules and standards" },
  "training.note": {
    sq: "Pas përfundimit me sukses të praktikës, salloni mund të shqyrtojë mundësinë e punësimit.",
    en: "After successful completion, the salon may consider an employment opportunity.",
  },
  "training.apply": { sq: "Apliko Tani", en: "Apply Now" },

  "contact.eyebrow": { sq: "Na Kontaktoni", en: "Get in Touch" },
  "contact.title": { sq: "Vizitoni Sallonin", en: "Visit the Shop" },
  "contact.address": { sq: "Rr. Pandeli Sotiri, Vushtrri, Kosovë", en: "Pandeli Sotiri St., Vushtrri, Kosovo" },
  "contact.hours": { sq: "Orari i Punës", en: "Opening Hours" },
  "contact.monsat": { sq: "Hënë – Shtunë", en: "Mon – Sat" },
  "contact.sun": { sq: "E Diel", en: "Sunday" },
  "contact.closed": { sq: "Mbyllur", en: "Closed" },
  "contact.team": { sq: "Stafi ynë", en: "Our team" },
  "contact.call": { sq: "Telefono", en: "Call" },

  "footer.tag": { sq: "Look sharp. Feel confident.", en: "Look sharp. Feel confident." },
  "footer.rights": { sq: "Të gjitha të drejtat e rezervuara.", en: "All rights reserved." },
} satisfies Dict;

type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "sq",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("sq");
  const t = (k: Key) => dict[k][lang];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
