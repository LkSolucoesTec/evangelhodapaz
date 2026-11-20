import { Lock, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useScrollDirection } from '../hooks/useScrollDirection.ts';
import type { SiteSettings } from '../types/church.ts';

interface HeaderProps {
  settings: SiteSettings;
  activeSection: string;
  onNavigate: (target: string) => void;
  onOpenAdmin: () => void;
}

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início' },
  { id: 'nossa-igreja', label: 'Nossa Igreja' },
  { id: 'palavra-do-dia', label: 'Palavra do Dia' },
  { id: 'estudos-biblicos', label: 'Estudos Bíblicos' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'dizimos', label: 'Dízimos e Ofertas' },
  { id: 'onde-estamos', label: 'Contato' },
];

export function Header({ settings, activeSection, onNavigate, onOpenAdmin }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isPointerInside, setIsPointerInside] = useState(false);

  const shouldLockVisible = mobileOpen || isFocusWithin || isPointerInside;

  const { isVisible, isScrolled } = useScrollDirection({
    topThreshold: 96,
    deltaThreshold: 8,
    idleDelayMs: 700,
    isLocked: shouldLockVisible,
  });

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header
      onFocus={() => setIsFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
      onMouseEnter={() => setIsPointerInside(true)}
      onMouseLeave={() => setIsPointerInside(false)}
      className={`sticky top-0 z-40 w-full text-white transition-transform duration-300 ease-out will-change-transform ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'navbar-glass border-b border-white/15 shadow-[0_8px_24px_rgba(8,22,42,0.28)]'
          : 'bg-[#102B4E] border-b border-white/10'
      }`}
    >
      {/* Compact Brand & Pastor Action Row */}
      <div className="mx-auto flex max-w-[1340px] items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('inicio');
          }}
          className="flex min-h-[44px] items-center gap-3 min-w-0 group rounded-lg pr-2"
        >
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#C9A24D]/80 bg-[#102B4E]">
            <img
              src="/assets/aistudio/logo_igreja_d51804f0.jpg"
              alt="Brasão O Evangelho da Paz"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover scale-110"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs sm:text-sm font-medium tracking-wide text-sky-100">
              {settings.church_subtitle}
            </p>
            <p className="truncate font-serif-church text-base sm:text-xl font-bold tracking-tight text-white leading-tight">
              {settings.church_name}
            </p>
          </div>
        </a>

        {/* Desktop Pastor Button */}
        <div className="hidden lg:flex items-center shrink-0">
          {!import.meta.env.VITE_STATIC_SITE && <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-4 py-2 text-[15px] font-semibold text-[#102B4E] shadow-sm hover:brightness-105 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
          >
            <Lock className="h-4 w-4 shrink-0" />
            <span>Área do Pastor</span>
          </button>}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          {!import.meta.env.VITE_STATIC_SITE && <button
            type="button"
            onClick={onOpenAdmin}
            aria-label="Acessar Área do Pastor"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-3 py-2 text-sm font-semibold text-[#102B4E] shadow-sm active:scale-95 transition-transform whitespace-nowrap cursor-pointer"
          >
            <Lock className="h-4 w-4 shrink-0" />
            <span>Pastor</span>
          </button>}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Row */}
      <div className="hidden lg:block border-t border-white/12 bg-[#0B1F3A]/60">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-[1340px] items-center justify-center gap-5 xl:gap-7 px-6 py-1.5 text-[16px] font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`relative inline-flex min-h-[44px] items-center px-1 whitespace-nowrap shrink-0 transition-colors ${
                  isActive ? 'text-[#F0D284] font-semibold' : 'text-white hover:text-[#F0D284]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-1 bottom-0.5 h-[2.5px] rounded-full bg-[#C9A24D]" />
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/15 bg-[#0C213D] px-4 py-4 shadow-xl">
          <nav aria-label="Menu móvel" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`flex min-h-[44px] items-center rounded-lg border px-4 py-2.5 text-base font-medium transition-colors ${
                    isActive
                      ? 'border-[#C9A24D] bg-white/12 text-[#F0D284] font-semibold'
                      : 'border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-[#F0D284]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
