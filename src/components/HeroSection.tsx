
import { Calendar, HeartHandshake, Landmark } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface HeroSectionProps {
  onOpenChurchModal: () => void;
  onScrollToSchedule: () => void;
  onOpenPrayerModal: () => void;
}

export function HeroSection({
  onOpenChurchModal,
  onScrollToSchedule,
  onOpenPrayerModal,
}: HeroSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-[#102B4E] text-white md:flex md:min-h-[clamp(540px,72vh,680px)] md:items-center"
    >
      {/* Imagens originais preservadas */}
      <div className="relative w-full md:absolute md:inset-0 md:h-full">
        <picture className="block w-full md:h-full">
          <source
            media="(min-width: 768px)"
            srcSet="/assets/aistudio/herodesktop_b2ec1b84.png"
          />

          <img
            src="/assets/aistudio/heromobile_61d61b65.png"
            alt="Comunidade Evangélica Pentecostal O Evangelho da Paz — Brasão e Pr. Robson Andrade"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            className="block h-auto w-full md:h-full md:object-cover md:object-[68%_22%]"
          />
        </picture>

        {/* Gradiente para leitura do texto */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#071B35]/95 via-[#102B4E]/70 via-[31%] to-transparent md:block"
        />

        {/* Brilho dourado suave e animado */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background:
              'radial-gradient(ellipse 32% 55% at 58% 42%, rgba(255,218,126,0.14), transparent 75%)',
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.35, 0.8, 0.35],
                  x: [-25, 25, -25],
                }
          }
          transition={{
            duration: 9,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />

        {/* Transição inferior */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#102B4E] via-[#102B4E]/30 to-transparent md:h-24 md:from-[#F8F6F0]/30 md:via-transparent"
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 mx-auto w-full max-w-[1340px] px-4 pb-9 pt-5 sm:px-6 md:pb-20 md:pt-14 lg:pb-24">
        <div className="mx-auto max-w-[440px] text-center md:mx-0 md:max-w-[370px] md:text-left lg:max-w-[415px]">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F0D284] sm:text-base"
          >
            Bem-vindo à Comunidade
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="font-serif-church mt-3 text-4xl font-bold italic leading-[1.08] tracking-tight text-white drop-shadow-[0_3px_12px_rgba(8,22,42,0.65)] sm:text-5xl lg:text-[54px]"
          >
            O Evangelho
            <span className="mt-0.5 block">da Paz</span>
          </motion.h1>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scaleX: 0.65 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-3 flex justify-center md:justify-start"
            aria-hidden="true"
          >
            <svg width="200" height="14" viewBox="0 0 200 14" fill="none">
              <path
                d="M4 10C55 2 126 1 196 7"
                stroke="#E5C16A"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto mt-5 max-w-[390px] text-[17px] leading-[1.6] text-white drop-shadow-[0_1px_4px_rgba(8,22,42,0.7)] md:mx-0 lg:text-lg"
          >
            Um lugar de fé, esperança, comunhão e transformação pela Palavra de Deus.
          </motion.p>

          {/* Botões compactos, sem invadir o brasão */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mx-auto mt-6 grid w-full max-w-[390px] grid-cols-1 gap-2.5 sm:grid-cols-2 md:mx-0"
          >
            <button
              type="button"
              onClick={onOpenChurchModal}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-3 py-2.5 text-[14px] font-semibold text-[#102B4E] shadow-[0_6px_18px_rgba(0,0,0,0.25)] transition-all hover:brightness-110 active:scale-[0.98] sm:text-[15px]"
            >
              <Landmark className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Conheça Nossa Igreja</span>
            </button>

            <button
              type="button"
              onClick={onScrollToSchedule}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/45 bg-[#0C213D]/90 px-3 py-2.5 text-[14px] font-semibold text-white transition-all hover:border-[#E5C16A] hover:bg-[#102B4E] active:scale-[0.98] sm:text-[15px]"
            >
              <Calendar
                className="h-4 w-4 shrink-0 text-[#F0D284]"
                aria-hidden="true"
              />
              <span>Horários dos Cultos</span>
            </button>

            <button
              type="button"
              onClick={onOpenPrayerModal}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-[#E5C16A]/70 bg-[#0C213D]/90 px-3 py-2.5 text-[15px] font-semibold text-white transition-all hover:border-[#E5C16A] hover:bg-[#102B4E] active:scale-[0.98] sm:col-span-2"
            >
              <HeartHandshake
                className="h-4 w-4 shrink-0 text-[#F0D284]"
                aria-hidden="true"
              />
              <span>Enviar Pedido de Oração</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
