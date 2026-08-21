import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Gift, Music2, Pause, X } from "lucide-react";
import churchAsset from "@/assets/church-watercolor.png";
import sprigAsset from "@/assets/sprig.png";
import monogramAsset from "@/assets/monogram.png";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  CONFIGURAÇÃO EDITÁVEL                                              */
/* ------------------------------------------------------------------ */
const weddingConfig = {
  bride: "Layanne",
  groom: "João Pedro",

  date: "2027-09-11",
  ceremonyTime: "18:00",

  church: {
    name: "Santuário Eucarístico Nossa Senhora do Bom Despacho",

    mapsLink: "https://maps.app.goo.gl/drDR9TGgPeAVv1bs7",
  },

  reception: {
    name: "Buffet Sônia Bittencourt",

    time: "21:00",
    mapsLink: "https://maps.app.goo.gl/KSg2is6D5jmmMUet8",
  },

  gifts: {
    havan: "[EDITAR LINK]",
    magazineLuiza: "[EDITAR LINK]",
  },

  pix: {
    receiverName: "[EDITAR]",
    key: "[EDITAR]",
    qrCode: "", // [ADICIONAR POSTERIORMENTE] — url da imagem do QR Code
  },

  musicFile: "/musica.mp3",
};

const TARGET = new Date("2027-09-11T18:00:00-03:00").getTime();

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Layanne & João Pedro · 11.09.2027" },
      {
        name: "description",
        content:
          "Convite digital do casamento de Layanne e João Pedro. Sábado, 11 de setembro de 2027, às 18h, no Santuário Eucarístico Nossa Senhora do Bom Despacho.",
      },
      { property: "og:title", content: "Layanne & João Pedro · 11.09.2027" },
      {
        property: "og:description",
        content: "Com alegria, convidamos você para celebrar o nosso casamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Invite,
});

/* ---------------------------- helpers ----------------------------- */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Monogram({ className = "" }: { className?: string }) {
  return (
    <img
      src={monogramAsset}
      alt="Monograma L & J"
      width={547}
      height={785}
      className={`mx-auto h-auto max-w-full object-contain ${className}`}
    />
  );
}

function Rule({ className = "" }: { className?: string }) {
  return <div className={`hairline mx-auto w-24 ${className}`} />;
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn("font-serif text-[0.68rem] tracking-[0.42em] text-steel uppercase sm:text-xs", className)}
    >
      {children}
    </p>
  );
}

/* ---------------------------- sections ---------------------------- */

function MusicButton() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [playing]);

  return (
    <>
      <audio ref={audioRef} src={weddingConfig.musicFile} loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pausar música" : "Tocar música"}
        className="fixed top-4 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-serenity/60 bg-ivory/80 text-steel backdrop-blur-sm transition-all duration-500 hover:border-steel hover:text-deep sm:top-6 sm:right-6"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
        {playing && (
          <span className="absolute inset-0 animate-ping rounded-full border border-serenity/50" />
        )}
      </button>
    </>
  );
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <div className="h-24" />;

  const diff = TARGET - now;

  if (diff <= 0) {
    return (
      <p className="font-script text-4xl text-deep sm:text-5xl">O grande dia chegou.</p>
    );
  }

  const s = Math.floor(diff / 1000);
  const parts = [
    { v: Math.floor(s / 86400), l: "dias" },
    { v: Math.floor((s % 86400) / 3600), l: "horas" },
    { v: Math.floor((s % 3600) / 60), l: "minutos" },
    { v: s % 60, l: "segundos" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-10">
      {parts.map((p) => (
        <div key={p.l} className="flex flex-col items-center gap-2">
          <span className="font-serif text-3xl font-light text-deep tabular-nums sm:text-5xl">
            {String(p.v).padStart(2, "0")}
          </span>
          <span className="font-serif text-[0.6rem] tracking-[0.25em] text-steel uppercase sm:text-[0.68rem]">
            {p.l}
          </span>
        </div>
      ))}
    </div>
  );
}

function Place({
  label,
  name,
  time,
  address,
  mapsLink,
}: {
  label: string;
  name: string;
  time: string;
  address: string;
  mapsLink: string;
}) {
  return (
    <Reveal className="flex flex-col items-center gap-5 px-2 text-center">
      <Label className="font-bold text-base sm:text-base">{label}</Label>
      <h3 className="max-w-sm font-serif text-2xl leading-snug font-ligth text-deep sm:text-3xl">
        {name}
      </h3>
      <p className="font-serif text-lg font-bold tracking-[0.3em] text-steel">{time}</p>
      <p className="max-w-xs font-serif text-sm leading-relaxed text-steel">{address}</p>
      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex min-h-11 items-center justify-center border border-serenity px-8 font-serif text-[0.7rem] tracking-[0.32em] text-deep uppercase transition-all duration-500 hover:border-deep hover:bg-mist/60"
      >
        Como chegar
      </a>
    </Reveal>
  );
}

function PixModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = setTimeout(() => setShown(true), 20);
      return () => clearTimeout(t);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 450);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(weddingConfig.pix.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-deep/20 px-5 backdrop-blur-[2px] transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm border border-serenity/50 bg-ivory px-7 py-12 text-center shadow-[0_30px_60px_-30px_rgba(39,68,92,0.35)] transition-all duration-500 ${shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-steel transition-colors hover:text-deep"
        >
          <X className="h-4 w-4" />
        </button>

        <Label>Presente via Pix</Label>
        <Rule className="my-7" />

        <p className="font-serif text-[0.62rem] tracking-[0.3em] text-steel uppercase">
          Nome do recebedor
        </p>
        <p className="mt-2 font-serif text-lg text-deep">{weddingConfig.pix.receiverName}</p>

        <p className="mt-7 font-serif text-[0.62rem] tracking-[0.3em] text-steel uppercase">
          Chave Pix
        </p>
        <p className="mt-2 font-serif text-base break-all text-deep">{weddingConfig.pix.key}</p>

        {weddingConfig.pix.qrCode ? (
          <img
            src={weddingConfig.pix.qrCode}
            alt="QR Code Pix"
            loading="lazy"
            className="mx-auto mt-7 w-40"
          />
        ) : null}

        <button
          onClick={copy}
          className="mt-9 inline-flex min-h-11 w-full items-center justify-center border border-serenity px-6 font-serif text-[0.7rem] tracking-[0.3em] text-deep uppercase transition-all duration-500 hover:border-deep hover:bg-mist/60"
        >
          Copiar chave Pix
        </button>

        <p
          className={`mt-4 font-serif text-xs tracking-[0.2em] text-steel transition-opacity duration-500 ${copied ? "opacity-100" : "opacity-0"}`}
        >
          Chave Pix copiada!
        </p>
      </div>
    </div>
  );
}

/* ----------------------------- page ------------------------------- */

function Invite() {
  const [pixOpen, setPixOpen] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-ivory font-serif text-deep">
      <MusicButton />

      {/* CAPA */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-mist/70 to-transparent" />

        <Reveal className="relative" delay={100}>
          <Monogram className="w-[80px] sm:w-[90px]" />
        </Reveal>

        <Reveal delay={500} className="relative mt-10">
          <Rule />
        </Reveal>

        <Reveal delay={700} className="relative mt-10">
          <h1 className="font-script mx-auto  text-[2.4rem] leading-[1.18] text-deep sm:text-[3.6rem]">
            {weddingConfig.bride}
            <span className="mx-3 font-serif text-2xl font-light text-steel italic sm:text-3xl">
              &
            </span>{" "}
            {weddingConfig.groom}
          </h1>
        </Reveal>

        <Reveal delay={1000} className="relative mt-12 w-full max-w-3xl">
          <img
            src={churchAsset}
            alt="Ilustração em aquarela do Santuário Eucarístico Nossa Senhora do Bom Despacho"
            width={1400}
            height={1100}
            className="mx-auto w-full max-w-2xl opacity-95 mix-blend-multiply"
            style={{ transform: `translateY(${offset * -0.04}px)` }}
          />
        </Reveal>

        <Reveal delay={1200} className="relative mt-6">
          <Label>Convidam para o seu casamento</Label>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed font-light text-steel italic sm:text-xl">
            “Dois caminhos, uma só história e um amor para toda a vida.”
          </p>
        </Reveal>
      </section>

      {/* DATA */}
      <section className="px-6 py-28 text-center sm:py-36">
        <Reveal>
          <div className="mx-auto flex max-w-xl items-center justify-center gap-6 sm:gap-12">
            <div className="flex-1">
              <div className="hairline" />
              <p className="mt-4 text-[1.5rem]">Sábado</p>
            </div>
            <div className="flex flex-col items-center text-[1.5rem]">
              <span className="...">Setembro</span>
              <span className="my-1 text-5xl leading-none font-light text-deep sm:text-8xl" style={{ fontFamily: "'Playfair Display', serif" }}>11</span>
              <span className="...">2027</span>
            </div>
            <div className="flex-1">
              <div className="hairline" />
              <p className="mt-4 text-[1.5rem]">Às 18h</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200} className="mt-24">
          <Label className="text-[1.7rem] sm:text-base">Faltam</Label>
          <div className="mx-auto mt-8 max-w-md">
            <Countdown />
          </div>
        </Reveal>
      </section>

      {/* MENSAGEM */}
      <section className="relative overflow-hidden bg-mist/40 px-6 py-28 text-center sm:py-36">
        <img
          src={sprigAsset}
          alt=""
          aria-hidden
          loading="lazy"
          width={900}
          height={900}
          className="pointer-events-none absolute -top-10 -left-16 w-44 opacity-40 mix-blend-multiply sm:w-56"
          style={{ transform: `translateY(${offset * 0.02}px)` }}
        />
        <img
          src={sprigAsset}
          alt=""
          aria-hidden
          loading="lazy"
          width={900}
          height={900}
          className="pointer-events-none absolute -right-16 -bottom-10 w-44 rotate-180 opacity-40 mix-blend-multiply sm:w-56"
          style={{ transform: `rotate(180deg) translateY(${offset * 0.02}px)` }}
        />
        <Reveal className="relative mx-auto max-w-xl">
          <h2 className="text-[1.5rem] tracking-[0.4em] text-steel uppercase sm:text-[1.5rem]">
            Um dia para celebrar o amor
          </h2>
          <Rule className="my-10" />
          <p className="text-lg leading-loose font-light text-deep/80 sm:text-xl">
            Alguns encontros transformam caminhos em uma só história. Com amor, gratidão e alegria,
            Layanne e João Pedro celebram o início de uma nova caminhada ao lado daqueles que fazem
            parte de suas vidas.
          </p>
        </Reveal>
      </section>

      {/* CERIMÔNIA E RECEPÇÃO */}
      <section className="px-6 py-28 sm:py-36">
        <div className="mx-auto grid max-w-5xl gap-24 md:grid-cols-2 md:gap-16">
          <Place
            label="Onde vamos celebrar"
            name={weddingConfig.church.name}
            time="18h30"
            address={weddingConfig.church.address}
            mapsLink={weddingConfig.church.mapsLink}
          />
          <Place
            label="E depois, vamos festejar"
            name={weddingConfig.reception.name}
            time="21h"
            address={weddingConfig.reception.address}
            mapsLink={weddingConfig.reception.mapsLink}
          />
        </div>
      </section>

      {/* PRESENTES */}
      <section className="bg-mist/40 px-6 py-28 sm:py-36">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="text-[1.3rem] tracking-[0.4em] text-steel uppercase sm:text-[1.3rem]">
            Um presente para nossa nova história
          </h2>
          <Rule className="my-10" />
          <p className="text-[1rem] leading-relaxed font-light text-deep/80 sm:text-[1.8rem]">
            Se desejar nos presentear, disponibilizamos algumas opções de lista para facilitar sua
            escolha.
          </p>
        </Reveal>

        <div className="mx-auto mt-20 grid max-w-5xl gap-8 md:grid-cols-3">
          {[
            { label: "Lista de Presentes", title: "Havan", href: weddingConfig.gifts.havan },
            {
              label: "Lista de Presentes",
              title: "Magazine Luiza",
              href: weddingConfig.gifts.magazineLuiza,
            },
          ].map((card) => (
            <Reveal key={card.title}>
              <article className="flex h-full flex-col items-center border border-serenity/50 bg-ivory px-8 py-14 text-center">
                <Gift className="h-5 w-5 text-serenity" strokeWidth={1} />
                <p className="mt-8 text-[1rem] tracking-[0.3em] text-steel uppercase">
                  {card.label}
                </p>
                <h3 className="mt-3 text-2xl font-light text-deep">{card.title}</h3>
                <a
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-12 inline-flex min-h-11 items-center justify-center border border-serenity px-8 text-[0.7rem] tracking-[0.3em] text-deep uppercase transition-all duration-500 hover:border-deep hover:bg-mist/60"
                >
                  Acessar lista
                </a>
              </article>
            </Reveal>
          ))}

          <Reveal>
            <article className="flex h-full flex-col items-center border border-serenity/50 bg-ivory px-8 py-14 text-center">
              <Gift className="h-5 w-5 text-serenity" strokeWidth={1} />
              <p className="mt-8 text-[1rem] tracking-[0.3em] text-steel uppercase">Presente</p>
              <h3 className="mt-3 text-2xl font-light text-deep">via Pix</h3>
              <p className="mt-5 max-w-[15rem] text-sm leading-relaxed text-steel">
                Se preferir, você também pode nos presentear através do Pix.
              </p>
              <button
                onClick={() => setPixOpen(true)}
                className="mt-12 inline-flex min-h-11 items-center justify-center border border-serenity px-8 text-[0.7rem] tracking-[0.3em] text-deep uppercase transition-all duration-500 hover:border-deep hover:bg-mist/60"
              >
                Ver Pix
              </button>
            </article>
          </Reveal>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="px-6 py-32 text-center sm:py-40">
        <Reveal>
          <p className="font-script mx-auto max-w-[16ch] text-3xl leading-[1.2] text-deep sm:text-4xl">
            {weddingConfig.bride}
            <span className="mx-3 font-serif text-2xl font-light text-steel italic">&</span>
            {weddingConfig.groom}
          </p>
          <p className="mt-6 text-[1.2rem] tracking-[0.45em] text-steel">11.09.2027</p>
          <Rule className="my-14" />
          <Monogram className="w-[80px] sm:w-[90px]" />
          <p className="mx-auto mt-14 max-w-xs text-[1rem] leading-relaxed font-light text-steel italic">
            “Que Deus abençoe nosso amor e nossa caminhada.”
          </p>
        </Reveal>
      </footer>

      <PixModal open={pixOpen} onClose={() => setPixOpen(false)} />
    </main>
  );
}
