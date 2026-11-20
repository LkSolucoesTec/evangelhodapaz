import { ArrowUp, ChevronRight, Mail, MapPin, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '../types/church.ts';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (target: string) => void;
  onOpenLegal: (tab: 'privacidade' | 'termos') => void;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.03 2a9.94 9.94 0 0 0-8.48 15.16L2.2 22l4.98-1.31A9.95 9.95 0 1 0 12.03 2Zm5.78 14.12c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.26-4.8-4.18-4.95-4.38-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.58.83 2.02.9 2.17.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.13.59.17.29.75 1.24 1.61 2 1.11.99 2.04 1.3 2.33 1.45.29.14.46.12.63-.07.17-.2.73-.85.92-1.14.19-.29.39-.24.65-.14.27.1 1.69.8 1.98.94.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14c-.3-.04-1.31-.13-2.49-.13-2.46 0-4.15 1.5-4.15 4.26v2.33H7.37v3.2h2.78V22h3.35Z" />
    </svg>
  );
}

export function Footer({ settings, onNavigate, onOpenLegal }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden bg-[#102B4E] text-white">
      {/* Subtle sky & cloud atmospheric footer accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
      >
        <img
          src="/src/assets/images/hero_sky_clouds_1795123819266.jpg"
          alt=""
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-bottom"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#102B4E] via-[#102B4E]/92 to-[#0A1C35]/96"
      />

      <div className="relative mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#C9A24D]/80 bg-[#102B4E]">
                <img
                  src="/assets/aistudio/logo_igreja_d51804f0.jpg"
                  alt="Brasão O Evangelho da Paz"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover scale-110"
                />
              </div>
              <div>
                <p className="text-sm text-sky-100">{settings.church_subtitle}</p>
                <h3 className="font-serif-church text-xl font-bold text-white">
                  {settings.church_name}
                </h3>
              </div>
            </div>
            <p className="text-base leading-[1.6] text-slate-100 max-w-xs">
              {settings.motto}
            </p>
            <p className="text-base font-medium text-[#F0D284]">
              Presidentes: {settings.presidents}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-serif-church text-lg font-bold text-white mb-3">
              Links Rápidos
            </h4>
            <ul className="space-y-1 text-base text-slate-100">
              {[
                { id: 'nossa-igreja', label: 'Nossa Igreja' },
                { id: 'palavra-do-dia', label: 'Palavra do Dia' },
                { id: 'estudos-biblicos', label: 'Estudos Bíblicos' },
                { id: 'agenda', label: 'Agenda' },
                { id: 'galeria', label: 'Galeria' },
                { id: 'onde-estamos', label: 'Contato' },
              ].map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.id);
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1.5 hover:text-[#F0D284] transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-[#E5C16A]" aria-hidden="true" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={settings.bible_online_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[36px] items-center gap-1.5 hover:text-[#F0D284] transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-[#E5C16A]" aria-hidden="true" />
                  <span>Bíblia Online</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-serif-church text-lg font-bold text-white mb-3">
              Contato
            </h4>
            <ul className="space-y-3 text-base text-slate-100">
              <li>
                <a
                  href={settings.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[36px] items-center gap-2.5 hover:text-[#F0D284] transition-colors tabular-nums"
                >
                  <MessageCircle className="h-5 w-5 text-[#E5C16A] shrink-0" aria-hidden="true" />
                  <span>{settings.whatsapp}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex min-h-[36px] items-center gap-2.5 hover:text-[#F0D284] transition-colors break-all"
                >
                  <Mail className="h-5 w-5 text-[#E5C16A] shrink-0" aria-hidden="true" />
                  <span>{settings.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 leading-[1.55]">
                <MapPin className="h-5 w-5 text-[#E5C16A] shrink-0 mt-1" aria-hidden="true" />
                <span>
                  {settings.address_line1}
                  <br />
                  {settings.address_line2}
                </span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="lg:col-span-3">
            <h4 className="font-serif-church text-lg font-bold text-white mb-3">
              Siga-nos
            </h4>
            <p className="text-base leading-[1.5] text-slate-200 mb-3.5">
              Acompanhe mensagens, transmissões e comunicados da igreja.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={settings.whatsapp_link || 'https://wa.me/5511983646182'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da Comunidade O Evangelho da Paz"
                title="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white hover:border-[#C9A24D] hover:bg-[#C9A24D] hover:text-[#102B4E] hover:-translate-y-0.5 transition-all duration-200"
              >
                <WhatsAppIcon className="h-6 w-6" />
              </a>

              <a
                href={settings.instagram_url || 'https://www.instagram.com/oevangelhodapaz'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram oficial @oevangelhodapaz"
                title="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white hover:border-[#C9A24D] hover:bg-[#C9A24D] hover:text-[#102B4E] hover:-translate-y-0.5 transition-all duration-200"
              >
                <InstagramIcon className="h-6 w-6" />
              </a>

              <a
                href={settings.facebook_url || 'https://www.facebook.com/oevangelhodapaz'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook oficial /oevangelhodapaz"
                title="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white hover:border-[#C9A24D] hover:bg-[#C9A24D] hover:text-[#102B4E] hover:-translate-y-0.5 transition-all duration-200"
              >
                <FacebookIcon className="h-6 w-6" />
              </a>
            </div>
            <a
              href={settings.pastor_facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 inline-flex min-h-[44px] items-center text-base font-medium text-sky-100 hover:text-[#F0D284] transition-colors"
            >
              Página do Pr. Robson Andrade →
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Developer Credit Bar */}
      <div className="relative border-t border-white/15 bg-[#09192F]/95">
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[15px] sm:text-base text-slate-100">
            <p className="text-center sm:text-left">
              © 2026 – Comunidade Evangélica Pentecostal &ldquo;O Evangelho da Paz&rdquo;. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenLegal('privacidade')}
                className="inline-flex min-h-[44px] items-center px-1.5 hover:text-[#F0D284] transition-colors cursor-pointer"
              >
                Política de Privacidade
              </button>
              <span aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() => onOpenLegal('termos')}
                className="inline-flex min-h-[44px] items-center px-1.5 hover:text-[#F0D284] transition-colors cursor-pointer"
              >
                Termos de Uso
              </button>
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Voltar ao topo da página"
                className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#102B4E] shadow hover:bg-[#E8C97A] transition-colors cursor-pointer"
              >
                <ArrowUp className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 text-center text-[15px] sm:text-base text-sky-100/90">
            Desenvolvido por{' '}
            <a
              href="https://www.lkssoltech.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:text-[#E8C97A] hover:decoration-[#E8C97A] transition-colors"
            >
              LKS Studio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
