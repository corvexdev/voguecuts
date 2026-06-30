import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, MessageCircle, Calendar, AlertCircle } from "lucide-react";
// Sigurohu që ky path përputhet me vendndodhjen e klientit tënd Supabase
import { supabase } from "@/lib/supabase"; 
import trisoftai from "@/assets/trisoftai.png";

const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

import { useI18n } from "@/lib/i18n";
import { BARBERS, BUSINESS, PRIMARY_WHATSAPP, waLink } from "@/lib/business";

interface AppointmentRow {
  date: string;
  time: string;
  barber: string;
}

export function Contact() {
  const { t, lang } = useI18n();
  
  const [today, setToday] = useState("");
  const [bookedAppointments, setBookedAppointments] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Inside Contact component state:
const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", body: "" });
const [contactLoading, setContactLoading] = useState(false);



const handleContactSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setContactLoading(true);

  const { error } = await supabase.from("messages").insert([contactForm]);

  if (error) {
    alert("Error sending message: " + error.message);
  } else {
    alert("Message sent successfully!");
    setContactForm({ name: "", email: "", subject: "", body: "" });
  }
  setContactLoading(false);
};
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    barber: "",
    date: "",
    time: "",
  });

  // 1. Caktimi i datës minimale (Sot)
  useEffect(() => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setToday(`${yyyy}-${mm}-${dd}`);
  }, []);

  // 2. Ngarkimi i terminëve të zënë nga Supabase për datën e përzgjedhur
  useEffect(() => {
    async function fetchBookings() {
      if (!formData.date) return;

      const { data, error } = await supabase
        .from("appointments")
        .select("date, time, barber")
        .eq("date", formData.date);

      if (error) {
        console.error("Gabim gjatë marrjes së të dhënave:", error.message);
        return;
      }

      if (data) {
        const formattedSlots = (data as AppointmentRow[]).map(
          (app) => `${app.date}_${app.time}_${app.barber}`
        );
        setBookedAppointments(formattedSlots);
      }
    }

    fetchBookings();
  }, [formData.date]);

  // 3. Gjenerimi i fashave orare çdo 15 minuta (09:00 - 20:45)
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 9;
    let minutes = 0;

    while (hour < 21) {
      const hStr = String(hour).padStart(2, "0");
      const mStr = String(minutes).padStart(2, "0");
      
      slots.push(`${hStr}:${mStr}`);
      minutes += 15;
      if (minutes === 60) {
        minutes = 0;
        hour += 1;
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // 4. Kontrollon nëse ky slot është i zënë (Vetëm nëse përdoruesi po plotëson emrin/formën aktive)
  useEffect(() => {
    if (formData.name && formData.date && formData.time && formData.barber) {
      const slotKey = `${formData.date}_${formData.time}_${formData.barber}`;
      if (bookedAppointments.includes(slotKey)) {
        setErrorMsg(
          lang === "sq" 
            ? "Ky termin është i zënë në këtë datë dhe orë për këtë berber!" 
            : "This slot is already booked for this barber at this time!"
        );
      } else {
        setErrorMsg("");
      }
    } else {
      setErrorMsg("");
    }
  }, [formData.name, formData.date, formData.time, formData.barber, bookedAppointments, lang]);

  const msg =
    lang === "sq"
      ? "Përshëndetje Vogue Cutts! Dua të rezervoj një termin."
      : "Hello Vogue Cutts! I'd like to book an appointment.";

  // 5. Ruajtja e terminit në Supabase, pastrimi i formës dhe hapja e WhatsApp
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errorMsg || isSubmitting) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from("appointments")
      .insert([
        {
          name: formData.name,
          barber: formData.barber,
          date: formData.date,
          time: formData.time,
        }
      ]);

    if (error) {
      setErrorMsg(
        lang === "sq"
          ? "Ndodhi një gabim gjatë rezervimit. Ju lutem provoni përsëri!"
          : "An error occurred during booking. Please try again!"
      );
      setIsSubmitting(false);
      return;
    }

    // Përditëso listën që të bllokohet menjëherë në UI pa bërë reload
    const slotKey = `${formData.date}_${formData.time}_${formData.barber}`;
    setBookedAppointments((prev) => [...prev, slotKey]);

    // Ruaj të dhënat për mesazhin para se të pastrojmë formën
    const targetBarber = BARBERS.find(b => b.name === formData.barber);
    const destinationPhone = targetBarber ? targetBarber.whatsapp : PRIMARY_WHATSAPP;
    const displayDate = formData.date.split("-").reverse().join(".");

    const formattedMessage = lang === "sq"
      ? `Përshëndetje! Dua të rezervoj një termin:\n\n👤 Emri: ${formData.name}\n💈 Berber: ${formData.barber}\n📅 Data: ${displayDate}\n🕒 Ora: ${formData.time}`
      : `Hello! I would like to book an appointment:\n\n👤 Name: ${formData.name}\n💈 Barber: ${formData.barber}\n📅 Date: ${displayDate}\n🕒 Time: ${formData.time}`;

    // RESET i formës që të mos shfaqet mesazhi i gabimit kur kthehen në website
    setFormData({
      name: "",
      barber: "",
      date: "",
      time: "",
    });
    
    setErrorMsg("");
    setIsSubmitting(false);

    // Hap dritaren e WhatsApp
    window.open(waLink(destinationPhone, formattedMessage), "_blank", "noopener,noreferrer");
  };

  return (
    <section id="contact" className="py-28 lg:py-36 bg-[color:var(--surface)]/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center mb-14">
          <div className="text-xs tracking-[0.3em] uppercase text-[color:var(--gold)] mb-4">
            {t("contact.eyebrow")}
          </div>
          <h2 className="font-display text-4xl lg:text-5xl">{t("contact.title")}</h2>
          <div className="hairline w-32 mx-auto mt-6" />
        </div>

        <div className="grid lg:grid-cols-5 gap-8 mb-8">
          
          {/* Left Side: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-5"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[color:var(--gold)] mb-3">
                <MapPin className="h-4 w-4" />
                <span className="text-xs tracking-[0.25em] uppercase">Adresa</span>
              </div>
              <p className="text-foreground">{t("contact.address")}</p>
              <a
                href={BUSINESS.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-[color:var(--gold)] hover:underline"
              >
                Google Maps →
              </a>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[color:var(--gold)] mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-xs tracking-[0.25em] uppercase">{t("contact.hours")}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("contact.monsat")}</span>
                  <span className="text-foreground">09:00 — 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("contact.sun")}</span>
                  <span className="text-foreground">{t("contact.closed")}</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[color:var(--gold)] mb-4">
                <Phone className="h-4 w-4" />
                <span className="text-xs tracking-[0.25em] uppercase">{t("contact.team")}</span>
              </div>
              <ul className="space-y-3">
                {BARBERS.map((b) => (
                  <li key={b.name} className="flex items-center justify-between gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
                    <div>
                      <div className="text-sm text-foreground">{b.name}</div>
                      <a href={`tel:${b.phone}`} className="text-xs text-muted-foreground hover:text-[color:var(--gold)]">
                        {b.phone}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${b.phone}`}
                        className="p-2 rounded-full border border-border hover:border-[color:var(--gold)]/50 hover:text-[color:var(--gold)] text-muted-foreground"
                        aria-label={`Call ${b.name}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={waLink(b.whatsapp, msg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-[color:var(--gold)]/15 text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--primary-foreground)]"
                        aria-label={`WhatsApp ${b.name}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <a
                href={waLink(PRIMARY_WHATSAPP, msg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-gold rounded-full px-5 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold rounded-full px-5 py-3 text-sm inline-flex items-center gap-2"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </div>
          </motion.div>

          {/* Right Side: Appointment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 glass rounded-2xl p-6 lg:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-[color:var(--gold)] mb-6">
                <Calendar className="h-5 w-5" />
                <span className="text-xs tracking-[0.25em] uppercase">
                  {lang === "sq" ? "Rezervo Terminin" : "Book Your Appointment"}
                </span>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {lang === "sq" ? "Emri i plotë" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === "sq" ? "Filan Fisteku" : "John Doe"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background/50 border border-border focus:border-[color:var(--gold)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {lang === "sq" ? "Zgjedh Berberin" : "Choose Barber"}
                  </label>
                  <select
                    required
                    value={formData.barber}
                    onChange={(e) => setFormData({ ...formData, barber: e.target.value })}
                    className="w-full bg-background/50 border border-border focus:border-[color:var(--gold)] rounded-xl px-4 py-3 text-sm text-foreground outline-none transition appearance-none"
                  >
                    <option value="" disabled className="bg-[color:var(--surface)]">
                      {lang === "sq" ? "Zgjedh një opsion" : "Select an option"}
                    </option>
                    {BARBERS.map((b) => (
                      <option key={b.name} value={b.name} className="bg-[color:var(--surface)] text-foreground">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {lang === "sq" ? "Data" : "Date"}
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-background/50 border border-border focus:border-[color:var(--gold)] rounded-xl px-4 py-3 text-sm text-foreground outline-none transition scheme-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {lang === "sq" ? "Ora" : "Time"}
                    </label>
                    <select
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-background/50 border border-border focus:border-[color:var(--gold)] rounded-xl px-4 py-3 text-sm text-foreground outline-none transition appearance-none"
                    >
                      <option value="" disabled className="bg-[color:var(--surface)]">
                        -- : --
                      </option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot} className="bg-[color:var(--surface)] text-foreground">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!!errorMsg || isSubmitting}
                  className={`w-full btn-gold rounded-xl py-3.5 text-sm font-medium tracking-wide flex items-center justify-center gap-2 mt-4 cursor-pointer transition ${
                    errorMsg || isSubmitting ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  {isSubmitting 
                    ? (lang === "sq" ? "Duke procesuar..." : "Processing...") 
                    : (lang === "sq" ? "Dërgo Kërkesën në WhatsApp" : "Send Request via WhatsApp")}
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Map Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden border border-border min-h-[380px] relative w-full"
        >
          <iframe
            src={BUSINESS.mapsEmbed}
            className="w-full h-full absolute inset-0"
            style={{ border: 0, filter: "grayscale(0.6) contrast(1.1) invert(0.92) hue-rotate(180deg)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Vogue Cutts location"
          />
        </motion.div>
      </div>


    <div className="mt-8 pt-8 border-t border-border w-full max-w-sm mx-auto">
  {/* Centered Button */}
  <button 
    onClick={() => setIsMessageOpen(!isMessageOpen)}
    className="flex items-center justify-center w-full gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--gold)] hover:opacity-70 transition-all duration-300"
  >
    <MessageCircle size={14} className={isMessageOpen ? "rotate-180 transition-transform" : "transition-transform"} /> 
    {isMessageOpen ? "Close Form" : "Have a question?"}
  </button>

  {/* Form Container */}
  {isMessageOpen && (
    <motion.form 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      onSubmit={handleContactSubmit} 
      className="space-y-3 mt-6 overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-3">
        <input 
          placeholder="Name" required
          className="bg-background/50 border border-border rounded-lg p-3 text-xs outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)]/20 transition-all"
          value={contactForm.name}
          onChange={e => setContactForm({...contactForm, name: e.target.value})}
        />
        <input 
          type="email" placeholder="Email" required
          className="bg-background/50 border border-border rounded-lg p-3 text-xs outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)]/20 transition-all"
          value={contactForm.email}
          onChange={e => setContactForm({...contactForm, email: e.target.value})}
        />
      </div>
      <textarea 
        placeholder="How can we help you?" required
        className="w-full bg-background/50 border border-border rounded-lg p-3 text-xs outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)]/20 transition-all h-24 resize-none"
        value={contactForm.body}
        onChange={e => setContactForm({...contactForm, body: e.target.value})}
      />
      <button 
        disabled={contactLoading}
        className="w-full bg-[color:var(--gold)] text-black py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {contactLoading ? "Sending..." : "Send Message"}
      </button>
    </motion.form>
  )}
</div>

      {/* Made by TriSoft AI */}
<div className="mt-20 flex flex-col items-center justify-center gap-2 text-center align-center">
  <a
    href="https://trisoftai.com"
    target="_blank"
    rel="noopener noreferrer"
    className="group inline-flex items-center gap-3 transition-all duration-300"
  >
    <img
      src={trisoftai}
      alt="TriSoft AI"
      className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
    />

    <span className="text-sm text-muted-foreground">
      Made by{" "}
      <span className="font-semibold text-[color:var(--gold)]">
        TriSoft AI
      </span>
    </span>
  </a>

  <a
    href="https://trisoftai.com"
    target="_blank"
    rel="noopener noreferrer"
    className=" ml-6 w-full text-center text-xs tracking-[0.25em] uppercase text-muted-foreground/70 hover:text-[color:var(--gold)] transition"
  >
    Visit trisoftai.com →
  </a>
</div>
    </section>
  );
}