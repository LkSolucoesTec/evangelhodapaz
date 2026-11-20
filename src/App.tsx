import { useCallback, useEffect, useState } from 'react';
import { EventsAndPrayerGrid } from './components/EventsAndPrayerGrid.tsx';
import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { MainDevotionalGrid } from './components/MainDevotionalGrid.tsx';
import { PastorAdmin } from './components/PastorAdmin.tsx';
import {
  AgendaModal,
  BlogBrowserModal,
  ChurchInfoModal,
  GalleryModal,
  LegalModal,
  PrayerRequestModal,
  PublicationReaderModal,
} from './components/PublicModals.tsx';
import { QuickAccessStrip } from './components/QuickAccessStrip.tsx';
import { GalleryHighlights } from './components/GalleryHighlights.tsx';
import { TithesAndLocationGrid } from './components/TithesAndLocationGrid.tsx';
import type { ChurchEvent, PublicSiteData, Publication, SiteSettings } from './types/church.ts';

const INITIAL_SETTINGS: SiteSettings = {
  church_name: 'O Evangelho da Paz',
  church_subtitle: 'A Comunidade Evangélica Pentecostal',
  presidents: 'Pr. Robson Andrade e Pra. Simone Andrade',
  motto: 'Ide por todo mundo e pregai o evangelho a toda criatura. (Marcos 16:15)',
  email: 'oevangelhodapaz@gmail.com',
  whatsapp: '+55 11 98364-6182',
  whatsapp_link: 'https://wa.me/5511983646182',
  address_line1: 'R. Profa. Nina Stocco, 529',
  address_line2: 'Jardim Catanduva · São Paulo – SP',
  address_full: 'R. Profa. Nina Stocco, 529 - Jardim Catanduva, São Paulo - SP',
  facebook_url: 'https://www.facebook.com/oevangelhodapaz',
  instagram_url: 'https://www.instagram.com/oevangelhodapaz',
  pastor_facebook_url: 'https://www.facebook.com/Pr.RobsonAndrade',
  gallery_external_url: 'https://www.facebook.com/oevangelhodapaz/photos',
  bible_online_url: 'https://www.bibliaonline.com.br/acf',
  maps_embed_url:
    'https://www.google.com/maps/embed?pb=!4v1795122116910!6m8!1m7!1ssOJ51AxXSOTjxm7gYwuXVQ!2m2!1d-23.62867155246288!2d-46.76040549956484!3f61.27!4f0!5f0.7820865974627469',
  maps_directions_url:
    'https://www.google.com/maps/search/?api=1&query=R.+Profa.+Nina+Stocco,+529+-+Jardim+Catanduva,+S%C3%A3o+Paulo+-+SP',
  pix_key: '',
  pix_key_type: 'CNPJ',
  pix_beneficiary: 'Comunidade Evangélica Pentecostal O Evangelho da Paz',
  pix_city: 'SAO PAULO',
  schedule: [
    { day: 'Terça-feira', time: '20:00h', title: 'Oração' },
    { day: 'Quarta-feira', time: '19:30h', title: 'Ensinamento Bíblico' },
    { day: 'Sexta-feira', time: '19:30h', title: 'Campanhas' },
    { day: 'Domingo', time: '09:00h', title: 'E.B.D. (Escola Bíblica Dominical)' },
    { day: 'Domingo', time: '10:00h', title: 'Culto da Família' },
  ],
};

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    !import.meta.env.VITE_STATIC_SITE && window.location.pathname.startsWith('/admin')
  );
  const [siteData, setSiteData] = useState<PublicSiteData>({
    settings: INITIAL_SETTINGS,
    wordOfTheDay: null,
    publications: [],
    events: [],
    notices: [],
    gallery: [],
    albums: [],
  });
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const openPrayerWhatsApp = () => {
  const message = encodeURIComponent(
    'Olá, gostaria de compartilhar um pedido de oração.'
  );

  window.open(
    `https://wa.me/5511983646182?text=${message}`,
    '_blank',
    'noopener,noreferrer'
  );
};

  // Interactive modals state
  const [churchInfoOpen, setChurchInfoOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryAlbumId, setGalleryAlbumId] = useState<number | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [legalTab, setLegalTab] = useState<'privacidade' | 'termos' | null>(null);

  const loadSiteData = useCallback(async () => {
    try {
      const res = await fetch(import.meta.env.VITE_STATIC_SITE ? '/site-data.json' : '/api/public/site');
      if (res.ok) {
        const data: PublicSiteData = await res.json();
        setSiteData(data);
      }
    } catch {
      // keep existing state cleanly
    }
  }, []);

  useEffect(() => {
    loadSiteData();
  }, [loadSiteData]);

  useEffect(() => {
    const onPopState = () => {
      setIsAdminRoute(!import.meta.env.VITE_STATIC_SITE && window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateToAdmin = () => {
    if (import.meta.env.VITE_STATIC_SITE) return;
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
    window.scrollTo({ top: 0 });
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo({ top: 0 });
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigate = (target: string) => {
    setActiveSection(target);
    if (target === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target === 'nossa-igreja') {
      setChurchInfoOpen(true);
      return;
    }
    if (target === 'galeria') {
      setGalleryAlbumId(null);
      setGalleryOpen(true);
      return;
    }
    if (target === 'oracao') {
      scrollToElement('oracao');
      return;
    }
    scrollToElement(target);
  };

  const handleQuickCard = (target: string) => {
    setActiveSection(target);
    if (target === 'oracao') {
  openPrayerWhatsApp();
  return;
}
    if (target === 'estudos-biblicos') {
      scrollToElement('estudos-biblicos');
      return;
    }
    scrollToElement(target);
  };

  if (isAdminRoute) {
    return (
      <PastorAdmin
        onBackToSite={navigateToHome}
        onSiteDataChanged={loadSiteData}
      />
    );
  }

  const studies = siteData.publications.filter((p) => p.category === 'estudo_biblico');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0] text-[#102B4E]">
      <Header
        settings={siteData.settings}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={navigateToAdmin}
      />

      <main className="flex-1">
        <HeroSection
          onOpenChurchModal={() => setChurchInfoOpen(true)}
          onScrollToSchedule={() => scrollToElement('horarios')}
          onOpenPrayerModal={openPrayerWhatsApp}
        />

        <QuickAccessStrip onSelectCard={handleQuickCard} />

        <MainDevotionalGrid
          schedule={siteData.settings.schedule}
          wordOfTheDay={siteData.wordOfTheDay}
          studies={studies}
          bibleOnlineUrl={siteData.settings.bible_online_url}
          onSelectPublication={(pub) => setSelectedPublication(pub)}
          onOpenAllStudies={() => setBlogOpen(true)}
        />

        <EventsAndPrayerGrid
          events={siteData.events}
          notices={siteData.notices}
          onSelectEvent={(ev) => {
            setSelectedEvent(ev);
            setAgendaOpen(true);
          }}
          onOpenFullAgenda={() => {
            setSelectedEvent(null);
            setAgendaOpen(true);
          }}
          onOpenPrayerModal={openPrayerWhatsApp}
        />

        <GalleryHighlights albums={siteData.albums || []} onOpen={(albumId) => { setGalleryAlbumId(albumId ?? null); setGalleryOpen(true); }} />
        <TithesAndLocationGrid settings={siteData.settings} />
      </main>

      <Footer
        settings={siteData.settings}
        onNavigate={handleNavigate}
        onOpenLegal={(tab) => setLegalTab(tab)}
      />

      

      {selectedPublication && (
        <PublicationReaderModal
          publication={selectedPublication}
          bibleOnlineUrl={siteData.settings.bible_online_url}
          onClose={() => setSelectedPublication(null)}
        />
      )}

      {blogOpen && (
        <BlogBrowserModal
          publications={siteData.publications}
          onSelectPublication={(pub) => {
            setBlogOpen(false);
            setSelectedPublication(pub);
          }}
          onClose={() => setBlogOpen(false)}
        />
      )}

      {churchInfoOpen && (
        <ChurchInfoModal
          settings={siteData.settings}
          onClose={() => setChurchInfoOpen(false)}
          onOpenPrayerModal={openPrayerWhatsApp}
        />
      )}

      {agendaOpen && (
        <AgendaModal
          events={siteData.events}
          settings={siteData.settings}
          initialEvent={selectedEvent}
          onClose={() => {
            setAgendaOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {galleryOpen && (
        <GalleryModal
          photos={siteData.gallery}
          albums={siteData.albums || []}
          initialAlbumId={galleryAlbumId}
          externalGalleryUrl={siteData.settings.gallery_external_url}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {legalTab && <LegalModal tab={legalTab} onClose={() => setLegalTab(null)} />}
    </div>
  );
}
