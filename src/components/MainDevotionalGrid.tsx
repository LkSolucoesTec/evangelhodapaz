import { ArrowRight, BookOpen, Calendar, Clock, ExternalLink, Layers } from 'lucide-react';
import type { Publication, ServiceScheduleItem } from '../types/church.ts';

interface MainDevotionalGridProps {
  schedule: ServiceScheduleItem[];
  wordOfTheDay: Publication | null;
  studies: Publication[];
  bibleOnlineUrl: string;
  onSelectPublication: (pub: Publication) => void;
  onOpenAllStudies: () => void;
}

function formatDatePt(isoDate: string): string {
  if (!isoDate) return 'Recente';
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const [y, m, d] = parts;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${d} de ${months[(m - 1) % 12]}, ${y}`;
}

function formatWordDate(isoDate: string): string {
  if (!isoDate) return 'Palavra em Destaque';
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const [, m, d] = parts;
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${d} de ${months[(m - 1) % 12]}`;
}

function getExcerpt(content: string): string {
  const firstLine = content.split('\n').find((line) => line.trim().length > 0) || '';
  if (firstLine.length <= 135) return firstLine;
  return `${firstLine.slice(0, 132).trim()}...`;
}

export function MainDevotionalGrid({
  schedule,
  wordOfTheDay,
  studies,
  bibleOnlineUrl,
  onSelectPublication,
  onOpenAllStudies,
}: MainDevotionalGridProps) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-12 pb-6 sm:px-6">
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-stretch">
        {/* Column 1: Horários de Culto */}
        <div id="horarios" className="lg:col-span-3 flex flex-col">
          <div className="mb-4 flex items-center gap-2.5">
            <Calendar className="h-6 w-6 text-[#8A6212] shrink-0" aria-hidden="true" />
            <h2 className="font-serif-church text-[26px] lg:text-[28px] font-bold text-[#102B4E] leading-tight">
              Horários de Culto
            </h2>
          </div>

          <div className="flex-1 rounded-xl bg-[#102B4E] px-5 py-4 text-white shadow-[0_10px_28px_-10px_rgba(16,43,78,0.35)] flex flex-col justify-between divide-y divide-white/15">
            {schedule.map((item, idx) => (
              <div key={`${item.day}-${idx}`} className="flex items-start gap-3 py-3.5 first:pt-1 last:pb-1">
                <Calendar className="mt-1 h-4 w-4 text-[#F0D284] shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[17px] font-semibold text-white tabular-nums leading-snug">
                    {item.day} – {item.time}
                  </p>
                  <p className="text-[16px] text-sky-100 leading-snug mt-0.5">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Palavra do Dia */}
        <div id="palavra-do-dia" className="lg:col-span-5 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-6 w-6 text-[#8A6212] shrink-0" aria-hidden="true" />
              <h2 className="font-serif-church text-[26px] lg:text-[28px] font-bold text-[#102B4E] leading-tight">
                Palavra do Dia
              </h2>
            </div>

            <a
              href={bibleOnlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-base font-semibold text-[#102B4E] underline decoration-[#8A6212] underline-offset-4 hover:text-[#1F5696] transition-colors whitespace-nowrap"
            >
              <span>Bíblia Online</span>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          {wordOfTheDay ? (
            <div className="relative flex-1 overflow-hidden rounded-xl border border-[#DFD6BE] bg-white shadow-[0_10px_28px_-12px_rgba(16,43,78,0.18)] flex flex-col justify-between">
              {/* Background Bible photography */}
              <img
                src={wordOfTheDay.image_url || '/src/assets/images/palavra_biblia_luz_1795123820778.jpg'}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover object-right"
              />
              {/* Strong ivory scrim for WCAG AA text legibility even at 200% zoom */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-[#FAF8F2] via-[#FAF8F2]/94 to-[#FAF8F2]/55"
              />

              <div className="relative z-10 flex flex-1 flex-col justify-between p-6 sm:p-7">
                <div>
                  <p className="text-base font-semibold text-[#334155]">
                    Hoje, {formatWordDate(wordOfTheDay.published_date)}
                  </p>
                  <h3 className="mt-2 font-serif-church text-[26px] sm:text-[30px] font-bold text-[#102B4E] leading-tight">
                    {wordOfTheDay.title}
                  </h3>
                  <p className="mt-3 text-[17px] sm:text-[18px] leading-[1.6] font-normal text-[#172B46]">
                    {getExcerpt(wordOfTheDay.content)}
                  </p>
                  {wordOfTheDay.bible_reference && (
                    <p className="mt-3 font-serif-church text-[17px] font-bold text-[#102B4E]">
                      {wordOfTheDay.bible_reference}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => onSelectPublication(wordOfTheDay)}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-5 py-2.5 text-base font-semibold text-[#102B4E] shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Ler Reflexão Completa</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-xl border border-[#DFD6BE] bg-white p-6 flex flex-col items-center justify-center text-center text-[#334155]">
              <BookOpen className="h-8 w-8 text-[#8A6212] mb-2" aria-hidden="true" />
              <p className="text-[17px]">Nenhuma Palavra do Dia publicada no momento.</p>
            </div>
          )}
        </div>

        {/* Column 3: Últimos Estudos */}
        <div id="estudos-biblicos" className="lg:col-span-4 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Layers className="h-6 w-6 text-[#8A6212] shrink-0" aria-hidden="true" />
              <h2 className="font-serif-church text-[26px] lg:text-[28px] font-bold text-[#102B4E] leading-tight">
                Últimos Estudos
              </h2>
            </div>

            <button
              type="button"
              onClick={onOpenAllStudies}
              className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-base font-semibold text-[#7A5610] hover:text-[#102B4E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Ver todos</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3.5">
            {studies.slice(0, 3).map((study) => (
              <button
                key={study.id}
                type="button"
                onClick={() => onSelectPublication(study)}
                className="group flex min-h-[44px] items-center gap-3.5 rounded-xl border border-[#DFD6BE] bg-white p-3 text-left shadow-[0_6px_18px_-8px_rgba(16,43,78,0.14)] hover:border-[#C9A24D] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="h-20 w-24 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-[#102B4E]/10">
                  <img
                    src={study.image_url || '/src/assets/images/estudo_cruz_fe_1795123819357.jpg'}
                    alt={study.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif-church text-[19px] sm:text-[20px] font-bold leading-snug text-[#102B4E] group-hover:text-[#23548E] transition-colors break-words">
                    {study.title}
                  </h3>
                  <p className="mt-1 text-[15px] font-semibold text-[#7A5610]">
                    Estudos Bíblicos
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[15px] text-[#334155] tabular-nums">
                    <Clock className="h-4 w-4 text-[#8A6212] shrink-0" aria-hidden="true" />
                    <span>{formatDatePt(study.published_date)}</span>
                  </p>
                </div>
              </button>
            ))}

            {studies.length === 0 && (
              <div className="flex-1 rounded-xl border border-[#DFD6BE] bg-white p-6 flex items-center justify-center text-center text-[17px] text-[#334155]">
                Nenhum estudo publicado ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
