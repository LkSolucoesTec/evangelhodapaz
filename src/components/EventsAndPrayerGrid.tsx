import { ArrowRight, Calendar, Clock, MapPin, Megaphone, Send } from 'lucide-react';
import type { ChurchEvent, Notice } from '../types/church.ts';

interface EventsAndPrayerGridProps {
  events: ChurchEvent[];
  notices: Notice[];
  onSelectEvent: (event: ChurchEvent) => void;
  onOpenFullAgenda: () => void;
  onOpenPrayerModal: () => void;
}

function parseEventBadge(eventDate: string, isDemo: number): { top: string; bottom: string; isPlaceholder: boolean } {
  if (!eventDate) {
    return {
      top: 'EM',
      bottom: 'BREVE',
      isPlaceholder: true,
    };
  }
  const parts = eventDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return {
      top: 'DATA',
      bottom: 'BREVE',
      isPlaceholder: true,
    };
  }
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return {
    top: String(parts[2]).padStart(2, '0'),
    bottom: months[(parts[1] - 1) % 12],
    isPlaceholder: Boolean(isDemo),
  };
}

export function EventsAndPrayerGrid({
  events,
  notices,
  onSelectEvent,
  onOpenFullAgenda,
  onOpenPrayerModal,
}: EventsAndPrayerGridProps) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      {/* Active Church Notices from Pastor Panel (only shown when published & non-expired) */}
      {notices.length > 0 && (
        <div className="mb-7 rounded-xl border border-[#C9A24D] bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-[#102B4E] shrink-0">
              <Megaphone className="h-5 w-5 text-[#8A6212]" aria-hidden="true" />
              <span className="font-serif-church font-bold text-lg">Avisos da Igreja</span>
            </div>
            <div className="flex-1 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {notices.slice(0, 2).map((notice) => (
                <div key={notice.id} className="pt-2 sm:pt-0 sm:pl-4 first:pt-0 first:pl-0">
                  <p className="text-[17px] font-semibold text-[#102B4E]">
                    {notice.title}
                    {notice.is_highlighted ? (
                      <span className="ml-2 text-base font-semibold text-[#7A5610]">· Destaque</span>
                    ) : null}
                  </p>
                  <p className="text-base text-[#172B46]">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Próximos Eventos */}
        <div id="agenda" className="lg:col-span-7 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-6 w-6 text-[#8A6212] shrink-0" aria-hidden="true" />
              <h2 className="font-serif-church text-[26px] lg:text-[28px] font-bold text-[#102B4E] leading-tight">
                Próximos Eventos
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenFullAgenda}
              className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-base font-semibold text-[#7A5610] hover:text-[#102B4E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Ver Agenda Completa</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {events.slice(0, 2).map((event) => {
              const badge = parseEventBadge(event.event_date, event.is_demo);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#DFD6BE] bg-white text-left shadow-[0_8px_22px_-10px_rgba(16,43,78,0.16)] hover:border-[#C9A24D] hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Event Thumbnail + Top-Left Date Square */}
                  <div className="relative h-40 w-full overflow-hidden bg-[#102B4E]/10">
                    <img
                      src={event.image_url || '/src/assets/images/vigilia_adoracao_maos_1795123818998.jpg'}
                      alt={event.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-lg bg-[#FAF8F2]/96 px-3 py-1.5 text-center shadow-md border border-[#DFD6BE]">
                      <span className="text-base font-bold leading-none text-[#102B4E] tabular-nums">
                        {badge.top}
                      </span>
                      <span className="mt-0.5 text-xs font-bold tracking-wider text-[#7A5610]">
                        {badge.bottom}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      <h3 className="font-serif-church text-[20px] sm:text-[21px] font-bold text-[#102B4E] leading-snug group-hover:text-[#23548E] transition-colors">
                        {event.name}
                      </h3>
                      {event.is_demo === 1 && !event.event_date && (
                        <p className="mt-1 text-[15px] font-medium text-[#7A5610]">
                          Evento ilustrativo · Data a confirmar
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-2">
                      <div className="space-y-1.5 text-[16px] text-[#172B46]">
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#8A6212] shrink-0" aria-hidden="true" />
                          <span>{event.event_time}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#8A6212] shrink-0" aria-hidden="true" />
                          <span>{event.location}</span>
                        </p>
                      </div>

                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8C97A]/50 text-[#102B4E] group-hover:bg-[#C9A24D] transition-colors"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {events.length === 0 && (
              <div className="sm:col-span-2 rounded-xl border border-[#DFD6BE] bg-white p-8 text-center text-[17px] text-[#334155]">
                Nenhum evento cadastrado no momento.
              </div>
            )}
          </div>
        </div>

        {/* Right: Pedido de Oração Card */}
        <div id="oracao" className="lg:col-span-5 flex flex-col">
          <div className="relative flex-1 overflow-hidden rounded-xl bg-[#102B4E] text-white shadow-[0_12px_30px_-10px_rgba(16,43,78,0.4)] min-h-[280px] flex items-center">
            <img
              src="/src/assets/images/pedido_oracao_maos_1795123819823.jpg"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover object-right"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#0B1F3B] via-[#102B4E]/95 to-[#102B4E]/45"
            />

            <div className="relative z-10 p-6 sm:p-8 max-w-[90%] sm:max-w-[78%]">
              <h2 className="font-serif-church text-[28px] sm:text-[32px] font-bold text-white leading-tight">
                Pedido de Oração
              </h2>
              <p className="mt-3 text-[17px] sm:text-[18px] leading-[1.6] text-white/95">
                Estamos de prontidão para orar pela sua vida, família e necessidades.
              </p>

              <a
  href="https://wa.me/5511983646182?text=Ol%C3%A1%2C%20gostaria%20de%20compartilhar%20um%20pedido%20de%20ora%C3%A7%C3%A3o."
  target="_blank"
  rel="noopener noreferrer"
  className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-5 py-3 text-base font-semibold text-[#102B4E] shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
>
  <Send className="h-4 w-4" aria-hidden="true" />
  <span>Enviar pelo WhatsApp</span>
</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
