export const BUSINESS = {
  name: "Vogue Cutts",
  tagline: "Look sharp. Feel confident.",
  address: "Rr. Pandeli Sotiri, Vushtrri, Kosovo",
  mapsEmbed:
    "https://www.google.com/maps?q=Pandeli+Sotiri+Vushtrri+Kosovo&output=embed",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Pandeli+Sotiri+Vushtrri+Kosovo",
  instagram: "https://www.instagram.com/voguecutts",
  tiktok: "https://www.tiktok.com/@voguecutts",
};

export type Barber = {
  name: string;
  phone: string; // E.164 without +
  whatsapp: string;
};

export const BARBERS: Barber[] = [
  { name: "Bleart Muhaxheri", phone: "+38348421433", whatsapp: "38348421433" },
  { name: "Ardian Hajziri", phone: "+38349835691", whatsapp: "38349835691" },
  { name: "Gentrit Syla", phone: "+38349638422", whatsapp: "38349638422" },
  { name: "Nysret Feka", phone: "+38344920585", whatsapp: "38344920585" },
];

export const PRIMARY_WHATSAPP = BARBERS[0].whatsapp;

export const waLink = (number: string, msg: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

export type Service = {
  key: string;
  sq: string;
  en: string;
  price: number;
  duration: number; // minutes
  desc: { sq: string; en: string };
};

export const SERVICES: Service[] = [
  {
    key: "haircut",
    sq: "Prerja e flokëve",
    en: "Haircut",
    price: 5,
    duration: 30,
    desc: {
      sq: "Prerje moderne ose klasike sipas formës së fytyrës dhe stilit tuaj.",
      en: "Modern or classic cut tailored to your face shape and style.",
    },
  },
  {
    key: "haircut-beard",
    sq: "Prerja e flokëve + rregullimi i mjekrrës",
    en: "Haircut + Beard Trim",
    price: 7,
    duration: 45,
    desc: {
      sq: "Kombinimi më i kërkuar: prerje e plotë plus stilim mjekrre.",
      en: "Our most requested combo: full cut plus beard styling.",
    },
  },
  {
    key: "beard",
    sq: "Rregullimi i mjekrrës",
    en: "Beard Trim",
    price: 2,
    duration: 15,
    desc: { sq: "Konturim dhe stilim profesional i mjekrrës.", en: "Professional beard shaping and styling." },
  },
  {
    key: "trim",
    sq: "Rregullimi i flokëve",
    en: "Hair Touch-up",
    price: 1,
    duration: 10,
    desc: { sq: "Rregullim i shpejtë mes prerjeve.", en: "A quick touch-up between cuts." },
  },
  {
    key: "wash",
    sq: "Larja e flokëve",
    en: "Hair Wash",
    price: 1,
    duration: 10,
    desc: { sq: "Larje freskuese me produkte premium.", en: "Refreshing wash with premium products." },
  },
  {
    key: "beard-color",
    sq: "Ngjyrosja e mjekrrës",
    en: "Beard Coloring",
    price: 5,
    duration: 30,
    desc: { sq: "Ngjyrosje profesionale për një pamje uniforme.", en: "Professional coloring for a uniform look." },
  },
  {
    key: "black-mask",
    sq: "Maska e zezë",
    en: "Black Mask",
    price: 5,
    duration: 20,
    desc: { sq: "Pastrim i thellë i poreve dhe lëkurës.", en: "Deep pore and skin cleansing." },
  },
  {
    key: "face-wax",
    sq: "Depilimi i fytyrës",
    en: "Face Waxing",
    price: 5,
    duration: 15,
    desc: { sq: "Heqje e qetë dhe e saktë e qimeve të fytyrës.", en: "Smooth, precise facial hair removal." },
  },
  {
    key: "facial",
    sq: "Tretmani i fytyrës",
    en: "Facial Treatment",
    price: 25,
    duration: 60,
    desc: { sq: "Tretman premium për lëkurë të rigjeneruar dhe të shëndetshme.", en: "Premium treatment for renewed, healthy skin." },
  },
];
