import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Landmark,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import type { ChurchEvent, GalleryAlbum, GalleryPhoto, Publication, PublicationCategory, SiteSettings } from '../types/church.ts';

function ModalShell({
  title,
  subtitle,
  onClose,
  maxWidth = 'max-w-2xl',
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidth?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09192F]/75 p-3 sm:p-5 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-[#DFD6BE] bg-[#F8F6F0] shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#DFD6BE] bg-[#102B4E] px-5 py-4 text-white">
          <div className="min-w-0">
            <h2 className="font-serif-church text-[22px] sm:text-2xl font-bold text-white leading-snug">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-[15px] text-sky-100">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}


// ============================================================================
// 2. PUBLICATION READER MODAL
// ============================================================================
const CATEGORY_LABELS: Record<PublicationCategory, string> = {
  palavra_do_dia: 'Palavra do Dia',
  estudo_biblico: 'Estudo Bíblico',
  frase_reflexao: 'Frase e Reflexão',
};

export function PublicationReaderModal({
  publication,
  bibleOnlineUrl,
  onClose,
}: {
  publication: Publication;
  bibleOnlineUrl: string;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={publication.title}
      subtitle={`${CATEGORY_LABELS[publication.category]} · ${publication.published_date}`}
      onClose={onClose}
    >
      {publication.image_url && (
        <div className="mb-5 overflow-hidden rounded-xl border border-[#DFD6BE] bg-white">
          <img
            src={publication.image_url}
            alt={publication.title}
            referrerPolicy="no-referrer"
            className="h-56 w-full object-cover"
          />
        </div>
      )}

      {publication.bible_reference && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2.5 text-base font-semibold text-[#102B4E]">
          <BookOpen className="h-5 w-5 text-[#8A6212]" aria-hidden="true" />
          <span>Referência Bíblica: {publication.bible_reference}</span>
        </div>
      )}

      <div className="space-y-4 text-[18px] leading-[1.65] text-[#172B46] whitespace-pre-line">
        {publication.content}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DFD6BE] pt-4">
        <a
          href={bibleOnlineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-base font-semibold text-[#102B4E] underline decoration-[#8A6212] underline-offset-4 hover:text-[#1F5696]"
        >
          <span>Ler na Bíblia Online</span>
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-lg bg-[#102B4E] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#173B6B] cursor-pointer"
        >
          Voltar ao Site
        </button>
      </div>
    </ModalShell>
  );
}

// ============================================================================
// 3. BLOG / ESTUDOS BROWSER MODAL
// ============================================================================
export function BlogBrowserModal({
  publications,
  onSelectPublication,
  onClose,
}: {
  publications: Publication[];
  onSelectPublication: (pub: Publication) => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<'all' | PublicationCategory>('all');
  const [search, setSearch] = useState('');

  const filtered = publications.filter((pub) => {
    const matchesCat = filter === 'all' || pub.category === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      pub.title.toLowerCase().includes(q) ||
      pub.content.toLowerCase().includes(q) ||
      pub.bible_reference.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <ModalShell
      title="Blog da Palavra e Estudos Bíblicos"
      subtitle="Reflexões, devocionais e estudos edificantes para a igreja."
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-white p-1.5 border border-[#DFD6BE]">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'palavra_do_dia', label: 'Palavra do Dia' },
            { id: 'estudo_biblico', label: 'Estudos Bíblicos' },
            { id: 'frase_reflexao', label: 'Reflexões' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as 'all' | PublicationCategory)}
              className={`min-h-[40px] rounded-md px-3.5 py-2 text-[15px] font-semibold transition-colors cursor-pointer ${
                filter === tab.id ? 'bg-[#102B4E] text-white' : 'text-[#334155] hover:text-[#102B4E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <label htmlFor="blog-search" className="sr-only">
            Buscar estudo ou versículo
          </label>
          <Search className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-slate-600" aria-hidden="true" />
          <input
            id="blog-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar estudo ou versículo..."
            className="min-h-[44px] w-full sm:w-68 rounded-lg border border-stone-400 bg-white py-2 pr-3 pl-9 text-base text-[#102B4E] placeholder:text-slate-500 focus:border-[#102B4E] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((pub) => (
          <button
            key={pub.id}
            type="button"
            onClick={() => onSelectPublication(pub)}
            className="group flex flex-col overflow-hidden rounded-xl border border-[#DFD6BE] bg-white text-left shadow-xs hover:border-[#C9A24D] hover:shadow-md transition-all cursor-pointer"
          >
            {pub.image_url && (
              <div className="h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={pub.image_url}
                  alt={pub.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[#7A5610]">
                <span>{CATEGORY_LABELS[pub.category]}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#334155] tabular-nums">{pub.published_date}</span>
              </div>
              <h3 className="mt-1.5 font-serif-church text-[20px] font-bold text-[#102B4E] group-hover:text-[#23548E]">
                {pub.title}
              </h3>
              {pub.bible_reference && (
                <p className="mt-1 text-[15px] font-semibold text-[#102B4E]">{pub.bible_reference}</p>
              )}
              <p className="mt-2 line-clamp-2 text-base leading-[1.55] text-[#334155]">{pub.content}</p>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="sm:col-span-2 rounded-xl border border-[#DFD6BE] bg-white p-8 text-center text-[17px] text-[#334155]">
            Nenhuma publicação encontrada para este filtro.
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ============================================================================
// 4. NOSSA IGREJA MODAL
// ============================================================================
export function ChurchInfoModal({
  settings,
  onClose,
  onOpenPrayer,
}: {
  settings: SiteSettings;
  onClose: () => void;
  onOpenPrayer: () => void;
}) {
  return (
    <ModalShell
      title="Conheça Nossa Igreja"
      subtitle={`${settings.church_subtitle} — ${settings.church_name}`}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
        <div className="sm:col-span-5">
          <div className="overflow-hidden rounded-xl border border-[#DFD6BE] bg-[#102B4E] shadow-md">
            <img
              src="/assets/aistudio/Pr_Robson_69e303f9.jpg"
              alt="Pr. Robson Andrade"
              referrerPolicy="no-referrer"
              className="aspect-square w-full object-cover object-top"
            />
            <div className="bg-[#102B4E] px-4 py-3 text-white">
              <p className="font-serif-church text-base font-bold text-[#F0D284]">
                {settings.presidents}
              </p>
              <p className="text-[15px] text-sky-100">Presidentes</p>
            </div>
          </div>
        </div>

        <div className="sm:col-span-7 space-y-4 text-[17px] leading-[1.6] text-[#172B46]">
          <div className="inline-flex items-center gap-2 text-base font-semibold text-[#7A5610]">
            <Landmark className="h-5 w-5" aria-hidden="true" />
            <span>Identidade e Propósito</span>
          </div>
          <p>
            A <strong className="text-[#102B4E]">Comunidade Evangélica Pentecostal &ldquo;O Evangelho da Paz&rdquo;</strong> é uma família cristã comprometida com a pregação fiel das Escrituras, a busca pela presença do Espírito Santo, a oração intercessora e o acolhimento de cada vida.
          </p>
          <blockquote className="rounded-xl border border-[#DFD6BE] bg-white p-4 font-serif-church italic text-[17px] text-[#102B4E]">
            &ldquo;{settings.motto}&rdquo;
          </blockquote>
          <div className="space-y-2 text-base text-[#334155]">
            <p className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-[#8A6212] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{settings.address_full}</span>
            </p>
            <p className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-[#8A6212] shrink-0 mt-0.5" aria-hidden="true" />
              <span>Cultos às Terças, Quartas, Sextas e Domingos</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPrayer();
              }}
              className="min-h-[46px] rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-5 py-2.5 text-base font-semibold text-[#102B4E] shadow cursor-pointer"
            >
              Enviar Pedido de Oração
            </button>
            <a
              href={settings.maps_directions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center rounded-lg border-2 border-[#102B4E] px-5 py-2.5 text-base font-semibold text-[#102B4E] hover:bg-[#102B4E] hover:text-white transition-colors"
            >
              Ver Localização
            </a>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ============================================================================
// 5. AGENDA COMPLETA & DETALHE DE EVENTO
// ============================================================================
export function AgendaModal({
  events,
  settings,
  initialEvent,
  onClose,
}: {
  events: ChurchEvent[];
  settings: SiteSettings;
  initialEvent?: ChurchEvent | null;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={initialEvent ? initialEvent.name : 'Agenda da Igreja'}
      subtitle="Programação semanal de cultos e eventos especiais"
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      {initialEvent && (
        <div className="mb-6 rounded-xl border border-[#C9A24D] bg-white overflow-hidden shadow-sm">
          {initialEvent.image_url && (
            <img
              src={initialEvent.image_url}
              alt={initialEvent.name}
              referrerPolicy="no-referrer"
              className="h-48 w-full object-cover"
            />
          )}
          <div className="p-5 space-y-2.5">
            <div className="flex flex-wrap items-center gap-3 text-base font-semibold text-[#7A5610]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {initialEvent.event_date ? initialEvent.event_date : 'Data a confirmar'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {initialEvent.event_time}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {initialEvent.location}
              </span>
            </div>
            <p className="text-[17px] leading-[1.6] text-[#172B46]">
              {initialEvent.description || 'Venha participar deste momento especial de fé e comunhão.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-serif-church text-xl font-bold text-[#102B4E] mb-3">
            Cultos Semanais Oficiais
          </h3>
          <div className="rounded-xl bg-[#102B4E] p-4 text-white divide-y divide-white/15">
            {settings.schedule.map((item, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <p className="text-[17px] font-semibold tabular-nums">
                  {item.day} – {item.time}
                </p>
                <p className="text-base text-sky-100">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif-church text-xl font-bold text-[#102B4E] mb-3">
            Eventos Programados
          </h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-[#DFD6BE] bg-white p-4">
                <p className="font-serif-church text-lg font-bold text-[#102B4E]">{ev.name}</p>
                <p className="mt-1 text-base text-[#7A5610] font-semibold">
                  {ev.event_date ? ev.event_date : 'Evento ilustrativo · Data a confirmar'} · {ev.event_time}
                </p>
                <p className="mt-1 text-base text-[#334155]">{ev.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ============================================================================
// 6. GALERIA MODAL
// ============================================================================
export function GalleryModal({photos,albums,initialAlbumId,onClose}: {photos:GalleryPhoto[];albums:GalleryAlbum[];initialAlbumId?:number|null;externalGalleryUrl:string;onClose:()=>void}) {
  const [selected,setSelected]=useState<GalleryAlbum|null>(albums.find(a=>a.id===initialAlbumId)||null);
  const [viewIndex,setViewIndex]=useState<number|null>(null);
  const [legacy,setLegacy]=useState(false);
  const shown=selected?.photos || (legacy ? photos.filter(photo=>!photo.album_id) : []);
  const active=viewIndex===null?null:shown[viewIndex];
  return <ModalShell title={selected ? selected.title : 'Galeria de Fotos'} subtitle="Álbuns e momentos da nossa igreja" onClose={onClose} maxWidth="max-w-5xl">
    {(selected||legacy) && <button type="button" className="mb-4 rounded-lg border px-4 py-2 text-[#102B4E]" onClick={()=>{setSelected(null);setLegacy(false);setViewIndex(null)}}>← Voltar aos álbuns</button>}
    {!selected&&!legacy ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {albums.map(album=><button type="button" key={album.id} onClick={()=>setSelected(album)} className="overflow-hidden rounded-xl border bg-white text-left shadow-sm hover:shadow-md">
        <img src={album.cover_url||'/images/logo.png'} alt={album.title} className="h-44 w-full object-cover" loading="lazy"/>
        <div className="p-4"><h3 className="font-serif-church text-xl font-bold text-[#102B4E]">{album.title}</h3><p className="text-sm text-slate-600">{album.event_date} · {album.photo_count} fotos</p><p className="mt-2 text-sm">{album.description}</p></div>
      </button>)}
      {photos.some(photo=>!photo.album_id)&&<button type="button" onClick={()=>setLegacy(true)} className="rounded-xl border bg-white p-5 text-left font-semibold text-[#102B4E]">Fotos anteriores · Ver fotos avulsas</button>}
      {!albums.length&&!photos.length&&<p className="text-slate-600">Ainda não há álbuns publicados.</p>}
    </div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {shown.map((photo,index)=><button type="button" key={photo.id} onClick={()=>setViewIndex(index)} className="overflow-hidden rounded-lg border bg-white text-left"><img src={photo.image_url} alt={photo.title} loading="lazy" className="aspect-square w-full object-cover"/><span className="block p-2 text-xs text-[#102B4E]">{photo.title}</span></button>)}
      {!shown.length&&<p>Este álbum ainda não possui fotos.</p>}
    </div>}
    {active&&<div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/95 p-3" role="dialog" aria-modal="true" aria-label="Visualizar foto">
      <div className="mb-3 flex w-full max-w-5xl flex-wrap justify-between gap-2 text-white"><span>{active.title} · {(viewIndex||0)+1} de {shown.length}</span><button onClick={()=>setViewIndex(null)} className="rounded bg-white/20 px-4 py-2">Fechar ✕</button></div>
      <img src={active.image_url} alt={active.title} className="max-h-[75vh] max-w-full object-contain"/>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-white"><button className="rounded bg-white/20 px-4 py-2" onClick={()=>setViewIndex(i=>i===null?0:(i+shown.length-1)%shown.length)}>← Anterior</button><button className="rounded bg-white/20 px-4 py-2" onClick={()=>setViewIndex(i=>i===null?0:(i+1)%shown.length)}>Próxima →</button><a className="rounded bg-[#C4983B] px-4 py-2 font-bold text-[#102B4E]" href={active.image_url} download>Baixar foto</a></div>
    </div>}
  </ModalShell>;
}

// ============================================================================
// 7. LEGAL MODAL (PRIVACIDADE / TERMOS)
// ============================================================================
export function LegalModal({ tab, onClose }: { tab: 'privacidade' | 'termos'; onClose: () => void }) {
  return (
    <ModalShell
      title={tab === 'privacidade' ? 'Política de Privacidade' : 'Termos de Uso'}
      subtitle="Comunidade Evangélica Pentecostal O Evangelho da Paz"
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      {tab === 'privacidade' ? (
        <div className="space-y-3 text-[17px] leading-[1.6] text-[#172B46]">
          <p>
            A Comunidade Evangélica Pentecostal &ldquo;O Evangelho da Paz&rdquo; respeita a sua privacidade e protege todos os dados pessoais enviados através deste site, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>
          <p>
            <strong className="text-[#102B4E]">Pedidos de Oração:</strong> Os pedidos enviados pelo formulário são armazenados em ambiente restrito e acessados exclusivamente pela liderança pastoral para fins de intercessão e cuidado espiritual. Nunca divulgamos pedidos ou dados de contato publicamente.
          </p>
          <p>
            Para solicitar atualização ou remoção de informações, entre em contato pelo e-mail oevangelhodapaz@gmail.com.
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-[17px] leading-[1.6] text-[#172B46]">
          <p>
            Este portal tem caráter informativo, devocional e comunitário, divulgando cultos, estudos bíblicos, agenda e canais oficiais da Comunidade Evangélica Pentecostal &ldquo;O Evangelho da Paz&rdquo;.
          </p>
          <p>
            Os textos devocionais e estudos publicados destinam-se à edificação cristã. Links externos, como Google Maps, redes sociais e Bíblia Online, seguem os termos das respectivas plataformas.
          </p>
        </div>
      )}
    </ModalShell>
  );
}
