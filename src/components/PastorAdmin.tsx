import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Database,
  Edit3,
  HeartHandshake,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Quote,
  Save,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type {
  AdminUser,
  ChurchEvent,
  GalleryAlbum,
  GalleryPhoto,
  Notice,
  PrayerRequest,
  Publication,
  PublicationCategory,
  ServiceScheduleItem,
  SiteSettings,
} from '../types/church.ts';

type AdminTab =
  | 'overview'
  | 'palavra_do_dia'
  | 'estudo_biblico'
  | 'frase_reflexao'
  | 'avisos'
  | 'agenda'
  | 'oracoes'
  | 'galeria'
  | 'configuracoes'
  | 'usuarios';

interface OverviewStats {
  publications: { total: number; published: number };
  events: { total: number };
  prayers: { total: number; pending: number };
  notices: { total: number };
  gallery: { total: number };
}

interface PastorAdminProps {
  onBackToSite: () => void;
  onSiteDataChanged: () => void;
}

const MENU_ITEMS: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'palavra_do_dia', label: 'Palavra do Dia', icon: BookOpen },
  { id: 'estudo_biblico', label: 'Estudos Bíblicos', icon: Layers },
  { id: 'frase_reflexao', label: 'Frases e Reflexões', icon: Quote },
  { id: 'avisos', label: 'Avisos e Lembretes', icon: Megaphone },
  { id: 'agenda', label: 'Agenda de Cultos', icon: Calendar },
  { id: 'oracoes', label: 'Pedidos de Oração', icon: HeartHandshake },
  { id: 'galeria', label: 'Galeria', icon: ImageIcon },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
  { id: 'usuarios', label: 'Usuários', icon: Lock },
];

async function uploadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl: reader.result }),
        });
        const data = await res.json();
        if (!res.ok) reject(new Error(data.error || 'Erro ao enviar imagem'));
        else resolve(data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

export function PastorAdmin({ onBackToSite, onSiteDataChanged }: PastorAdminProps) {
  const [authLoading, setAuthLoading] = useState(true);
  const [initialized, setInitialized] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);

  // Login / First-time setup form state
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const loadAuthStatus = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setInitialized(Boolean(data.initialized));
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const loadAllAdminData = useCallback(async () => {
    try {
      const [ovRes, pubRes, evRes, notRes, prRes, galRes, siteRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/publications'),
        fetch('/api/admin/events'),
        fetch('/api/admin/notices'),
        fetch('/api/admin/prayers'),
        fetch('/api/admin/gallery'),
        fetch('/api/public/site'),
      ]);
      if (ovRes.ok) setOverview(await ovRes.json());
      if (pubRes.ok) setPublications(await pubRes.json());
      if (evRes.ok) setEvents(await evRes.json());
      if (notRes.ok) setNotices(await notRes.json());
      if (prRes.ok) setPrayers(await prRes.json());
      if (galRes.ok) setGallery(await galRes.json());
      const albRes=await fetch('/api/admin/albums');
      if(albRes.ok) setAlbums(await albRes.json());
      if (siteRes.ok) {
        const siteData = await siteRes.json();
        setSettings(siteData.settings);
      }
    } catch {
      // handled gracefully
    }
  }, []);

  useEffect(() => {
    loadAuthStatus();
  }, [loadAuthStatus]);

  useEffect(() => {
    if (user) {
      loadAllAdminData();
    }
  }, [user, loadAllAdminData]);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const endpoint = initialized ? '/api/auth/login' : '/api/auth/setup';
      const payload = initialized
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Falha na autenticação.');
      } else {
        setUser(data.user);
        setInitialized(true);
        setAuthPassword('');
      }
    } catch {
      setAuthError('Erro de conexão com o servidor.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#102B4E] flex items-center justify-center text-white">
        <p className="text-sm text-sky-100">Verificando acesso pastoral...</p>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATION GATE (REAL LOGIN OR INITIAL PASTOR ACCOUNT CREATION)
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#102B4E] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,126,174,0.35),transparent_65%)]"
        />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#C9A24D]/40 bg-[#F8F6F0] p-6 sm:p-8 shadow-2xl">
          <button
            type="button"
            onClick={onBackToSite}
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#102B4E] hover:text-[#397EAE] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao site da igreja</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <img
              src="/assets/aistudio/logo_igreja_d51804f0.jpg"
              alt="Brasão O Evangelho da Paz"
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-full border-2 border-[#C9A24D] object-cover"
            />
            <div>
              <p className="text-xs font-semibold text-[#B5892E] uppercase tracking-wider">
                Área do Pastor
              </p>
              <h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">
                {initialized ? 'Acesso Administrativo' : 'Configurar Primeiro Acesso'}
              </h1>
            </div>
          </div>

          {!initialized && (
            <div className="mb-4 rounded-xl border border-[#C9A24D]/40 bg-white p-3.5 text-xs leading-relaxed text-slate-700">
              Nenhuma conta pastoral cadastrada ainda. Crie o acesso principal com seu e-mail e uma senha segura (mínimo 8 caracteres). As credenciais são criptografadas no servidor.
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!initialized && (
              <div>
                <label className="block text-xs font-semibold text-[#102B4E] mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Pr. Robson Andrade"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-[#102B4E] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">
                E-mail Pastoral
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="oevangelhodapaz@gmail.com"
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-[#102B4E] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-[#102B4E] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            {authError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-5 py-3 text-sm font-semibold text-[#102B4E] shadow-md hover:brightness-105 disabled:opacity-60 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>
                {authSubmitting
                  ? 'Autenticando...'
                  : initialized
                  ? 'Entrar no Painel'
                  : 'Criar Acesso do Pastor'}
              </span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED PASTOR DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#102B4E] flex flex-col lg:flex-row">
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-[#102B4E] px-4 py-3 text-xs font-semibold text-white shadow-xl border border-[#C9A24D]/50">
          <CheckCircle2 className="h-4 w-4 text-[#E8C97A]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-[#102B4E] px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/assets/aistudio/logo_igreja_d51804f0.jpg"
            alt="Logo"
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full border border-[#C9A24D] object-cover"
          />
          <div className="min-w-0">
            <p className="text-[10px] text-[#E8C97A] font-semibold uppercase tracking-wider">Área do Pastor</p>
            <p className="truncate font-serif-church text-sm font-bold">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToSite}
            className="rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-medium text-white"
          >
            Site
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu do painel"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D2340] text-white px-4 py-3 space-y-1 border-b border-white/15">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? 'bg-[#C9A24D] text-[#102B4E] font-semibold' : 'text-sky-100 hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sair da Conta</span>
          </button>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-68 lg:flex-col lg:justify-between bg-[#102B4E] text-white p-5 shrink-0">
        <div>
          <div className="flex items-center gap-3 pb-5 border-b border-white/15">
            <img
              src="/assets/aistudio/logo_igreja_d51804f0.jpg"
              alt="Brasão"
              referrerPolicy="no-referrer"
              className="h-11 w-11 rounded-full border-2 border-[#C9A24D] object-cover"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#E8C97A] uppercase tracking-wider">
                Área do Pastor
              </p>
              <p className="truncate font-serif-church text-base font-bold">{user.name}</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#E5C16A] to-[#C4983B] text-[#102B4E] font-semibold shadow-sm'
                      : 'text-sky-100/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'oracoes' && overview && overview.prayers.pending > 0 && (
                    <span className="ml-auto text-xs font-bold tabular-nums opacity-85">
                      {overview.prayers.pending}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-5 border-t border-white/15">
          <button
            type="button"
            onClick={onBackToSite}
            className="flex w-full items-center gap-2.5 rounded-lg border border-white/20 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#E8C97A]" />
            <span>Ver Site Público</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-medium text-sky-200 hover:bg-white/10 hover:text-red-300 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
        {activeTab === 'overview' && (
          <OverviewPanel
            overview={overview}
            onNavigateTab={setActiveTab}
            user={user}
          />
        )}

        {(activeTab === 'palavra_do_dia' ||
          activeTab === 'estudo_biblico' ||
          activeTab === 'frase_reflexao') && (
          <PublicationsPanel
            category={activeTab}
            publications={publications.filter((p) => p.category === activeTab)}
            onRefresh={async () => {
              await loadAllAdminData();
              onSiteDataChanged();
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'avisos' && (
          <NoticesPanel
            notices={notices}
            onRefresh={async () => {
              await loadAllAdminData();
              onSiteDataChanged();
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'agenda' && (
          <EventsPanel
            events={events}
            onRefresh={async () => {
              await loadAllAdminData();
              onSiteDataChanged();
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'oracoes' && (
          <PrayersPanel
            prayers={prayers}
            onRefresh={loadAllAdminData}
            onNotify={showToast}
          />
        )}

        {activeTab === 'galeria' && (
          <GalleryPanel
            photos={gallery}
            albums={albums}
            onRefresh={async () => {
              await loadAllAdminData();
              onSiteDataChanged();
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'usuarios' && user?.role === 'pastor' && <UsersPanel onNotify={showToast} />}
        {activeTab === 'configuracoes' && settings && (
          <SettingsPanel
            settings={settings}
            onRefresh={async () => {
              await loadAllAdminData();
              onSiteDataChanged();
            }}
            onNotify={showToast}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// SUB-PANELS
// ============================================================================
function OverviewPanel({
  overview,
  onNavigateTab,
  user,
}: {
  overview: OverviewStats | null;
  onNavigateTab: (tab: AdminTab) => void;
  user: AdminUser;
}) {
  const stats = [
    {
      label: 'Publicações Ativas',
      value: overview?.publications.published ?? 0,
      sub: `${overview?.publications.total ?? 0} no total`,
      tab: 'palavra_do_dia' as AdminTab,
    },
    {
      label: 'Eventos na Agenda',
      value: overview?.events.total ?? 0,
      sub: 'Cultos e eventos especiais',
      tab: 'agenda' as AdminTab,
    },
    {
      label: 'Pedidos de Oração',
      value: overview?.prayers.pending ?? 0,
      sub: `${overview?.prayers.total ?? 0} recebidos com sigilo`,
      tab: 'oracoes' as AdminTab,
    },
    {
      label: 'Avisos & Galeria',
      value: (overview?.notices.total ?? 0) + (overview?.gallery.total ?? 0),
      sub: `${overview?.notices.total ?? 0} avisos · ${overview?.gallery.total ?? 0} fotos`,
      tab: 'avisos' as AdminTab,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-church text-2xl sm:text-3xl font-bold text-[#102B4E]">
          Paz do Senhor, {user.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Gerencie publicações, estudos bíblicos, agenda de cultos, pedidos de oração e configurações da igreja.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onNavigateTab(s.tab)}
            className="rounded-xl border border-[#E5DEC9] bg-white p-5 text-left shadow-xs hover:border-[#C9A24D] transition-colors cursor-pointer"
          >
            <p className="text-xs font-semibold text-[#B5892E]">{s.label}</p>
            <p className="mt-2 font-serif-church text-3xl font-bold text-[#102B4E] tabular-nums">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#E5DEC9] bg-white p-5 sm:p-6">
        <h2 className="font-serif-church text-lg font-bold text-[#102B4E] mb-3">
          Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('palavra_do_dia')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#102B4E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#193F70] cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#E8C97A]" />
            <span>Publicar Palavra do Dia</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('estudo_biblico')}
            className="inline-flex items-center gap-2 rounded-lg border border-[#102B4E] bg-white px-4 py-2.5 text-xs font-semibold text-[#102B4E] hover:bg-[#F8F6F0] cursor-pointer"
          >
            <Layers className="h-4 w-4 text-[#C9A24D]" />
            <span>Novo Estudo Bíblico</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('oracoes')}
            className="inline-flex items-center gap-2 rounded-lg border border-[#C9A24D] bg-[#FAF8F2] px-4 py-2.5 text-xs font-semibold text-[#102B4E] hover:bg-[#E8C97A]/20 cursor-pointer"
          >
            <HeartHandshake className="h-4 w-4 text-[#C9A24D]" />
            <span>Ver Pedidos de Oração</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicationsPanel({
  category,
  publications,
  onRefresh,
  onNotify,
}: {
  category: PublicationCategory;
  publications: Publication[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}) {
  const titles: Record<PublicationCategory, string> = {
    palavra_do_dia: 'Palavra do Dia',
    estudo_biblico: 'Estudos Bíblicos',
    frase_reflexao: 'Frases e Reflexões',
  };

  const [editing, setEditing] = useState<Publication | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [bibleRef, setBibleRef] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pubDate, setPubDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setBibleRef('');
    setContent('');
    setImageUrl('');
    setPubDate(new Date().toISOString().slice(0, 10));
    setStatus('published');
    setShowForm(true);
  };

  const openEdit = (pub: Publication) => {
    setEditing(pub);
    setTitle(pub.title);
    setBibleRef(pub.bible_reference);
    setContent(pub.content);
    setImageUrl(pub.image_url);
    setPubDate(pub.published_date);
    setStatus(pub.status);
    setShowForm(true);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      setImageUrl(url);
      onNotify('Imagem enviada com sucesso.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Erro no upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/publications/${editing.id}` : '/api/admin/publications';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          content,
          bible_reference: bibleRef,
          image_url: imageUrl,
          published_date: pubDate,
          status,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        await onRefresh();
        onNotify(editing ? 'Publicação atualizada!' : 'Publicação criada!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/publications/${id}`, { method: 'DELETE' });
    await onRefresh();
    onNotify('Publicação removida.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">
            {titles[category]}
          </h1>
          <p className="text-xs text-slate-600">
            Crie, edite, salve rascunhos ou publique diretamente no site.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-4 py-2.5 text-xs font-semibold text-[#102B4E] shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Publicação</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-xl border border-[#C9A24D] bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-church text-lg font-bold text-[#102B4E]">
              {editing ? 'Editar Publicação' : `Nova em ${titles[category]}`}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-[#102B4E]">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Título *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Referência Bíblica</label>
              <input
                type="text"
                value={bibleRef}
                onChange={(e) => setBibleRef(e.target.value)}
                placeholder="Ex.: Salmos 37:5"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Data de Publicação</label>
              <input
                type="date"
                value={pubDate}
                onChange={(e) => setPubDate(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#C9A24D] focus:outline-none"
              >
                <option value="published">Publicado no Site</option>
                <option value="draft">Rascunho (Oculto)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102B4E] mb-1">Imagem de Capa</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL da imagem ou envie um arquivo"
                className="flex-1 min-w-[200px] rounded-lg border border-stone-300 px-3 py-2 text-xs focus:border-[#C9A24D] focus:outline-none"
              />
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-[#102B4E] bg-[#F8F6F0] px-3.5 py-2 text-xs font-semibold text-[#102B4E] cursor-pointer hover:bg-[#E8C97A]/20">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploading ? 'Enviando...' : 'Enviar Foto'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#102B4E]">Texto / Mensagem *</label>
              <button
                type="button"
                onClick={() => setContent((c) => `${c}${c ? '\n\n' : ''}“Insira o versículo aqui.”`)}
                className="text-[11px] font-semibold text-[#397EAE] hover:underline cursor-pointer"
              >
                + Inserir citação bíblica
              </button>
            </div>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva a reflexão ou estudo bíblico..."
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm leading-relaxed focus:border-[#C9A24D] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#102B4E] px-5 py-2 text-xs font-semibold text-white hover:bg-[#193F70] cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-[#E8C97A]" />
              <span>{saving ? 'Salvando...' : 'Salvar Publicação'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {publications.map((pub) => (
          <div
            key={pub.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#E5DEC9] bg-white p-4 shadow-xs"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              {pub.image_url && (
                <img
                  src={pub.image_url}
                  alt={pub.title}
                  referrerPolicy="no-referrer"
                  className="h-16 w-20 rounded-lg object-cover shrink-0 bg-slate-100"
                />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={pub.status === 'published' ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
                    {pub.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500 tabular-nums">{pub.published_date}</span>
                  {pub.bible_reference && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#B5892E] font-medium">{pub.bible_reference}</span>
                    </>
                  )}
                </div>
                <h3 className="mt-1 font-serif-church text-base font-bold text-[#102B4E] truncate">
                  {pub.title}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{pub.content}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(pub)}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-[#102B4E] hover:bg-[#F8F6F0] cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pub.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticesPanel({
  notices,
  onRefresh,
  onNotify,
}: {
  notices: Notice[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          expires_at: expiresAt,
          is_highlighted: isHighlighted,
          status: 'published',
        }),
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setExpiresAt('');
        await onRefresh();
        onNotify('Aviso publicado no site!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' });
    await onRefresh();
    onNotify('Aviso excluído.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">Avisos e Lembretes</h1>
        <p className="text-xs text-slate-600">
          Avisos publicados aparecem em destaque na página inicial até a data de expiração.
        </p>
      </div>

      <form onSubmit={handleCreate} className="rounded-xl border border-[#E5DEC9] bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#102B4E] mb-1">Título do Aviso *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Ensaio de Louvor / Santa Ceia"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#C9A24D] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#102B4E] mb-1">Expira em (opcional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#C9A24D] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#102B4E] mb-1">Mensagem *</label>
          <textarea
            required
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Detalhes do aviso para os membros..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#C9A24D] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#102B4E] cursor-pointer">
            <input
              type="checkbox"
              checked={isHighlighted}
              onChange={(e) => setIsHighlighted(e.target.checked)}
              className="h-4 w-4 accent-[#102B4E]"
            />
            <span>Marcar como aviso em destaque</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#102B4E] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#E8C97A]" />
            <span>{saving ? 'Publicando...' : 'Adicionar Aviso'}</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#E5DEC9] bg-white p-4">
            <div>
              <p className="font-serif-church text-base font-bold text-[#102B4E]">
                {n.title}{' '}
                {n.is_highlighted ? <span className="text-xs font-sans-church text-[#B5892E]">· Destaque</span> : null}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{n.content}</p>
              {n.expires_at && <p className="text-[11px] text-slate-400 mt-1">Expira em: {n.expires_at}</p>}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(n.id)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
            >
              Excluir
            </button>
          </div>
        ))}
        {notices.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum aviso cadastrado.</p>
        )}
      </div>
    </div>
  );
}

function EventsPanel({
  events,
  onRefresh,
  onNotify,
}: {
  events: ChurchEvent[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}) {
  const [editing, setEditing] = useState<ChurchEvent | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [location, setLocation] = useState('Templo Sede');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const openNew = () => {
    setEditing(null);
    setName('');
    setEventDate('');
    setEventTime('');
    setHighlight(false);
    setLocation('Templo Sede');
    setDescription('');
    setImageUrl('');
    setStatus('published');
    setShowForm(true);
  };

  const openEdit = (ev: ChurchEvent) => {
    setEditing(ev);
    setName(ev.name);
    setEventDate(ev.event_date);
    setEventTime(ev.event_time);
    setHighlight(Boolean(ev.is_highlighted));
    setLocation(ev.location);
    setDescription(ev.description);
    setImageUrl(ev.image_url);
    setStatus(ev.status);
    setShowForm(true);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file);
      setImageUrl(url);
      onNotify('Imagem enviada.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Erro no upload.');
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/events/${editing.id}` : '/api/admin/events';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        event_date: eventDate,
        event_time: eventTime,
        is_highlighted: highlight,
        location,
        description,
        image_url: imageUrl,
        status,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      await onRefresh();
      onNotify(editing ? 'Evento atualizado!' : 'Evento criado!');
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    await onRefresh();
    onNotify('Evento excluído.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">Agenda de Cultos e Eventos</h1>
          <p className="text-xs text-slate-600">
            Cadastre cultos especiais, vigílias e campanhas (os horários fixos semanais ficam em Configurações).
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-4 py-2.5 text-xs font-semibold text-[#102B4E] shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Evento</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-xl border border-[#C9A24D] bg-white p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Nome do Evento *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Data</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Horário *</label>
              <input
                type="text"
                required
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="Ex.: Sexta-feira, às 22:00h"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Local</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Imagem do Evento</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs"
                />
                <label className="rounded-lg border border-[#102B4E] px-3 py-2 text-xs font-semibold cursor-pointer">
                  Enviar
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#102B4E] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white"
              >
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102B4E] mb-1">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-xs">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-[#102B4E] px-4 py-2 text-xs font-semibold text-white">
              Salvar Evento
            </button>
          </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#102B4E]"><input type="checkbox" checked={highlight} onChange={e=>setHighlight(e.target.checked)}/>Destacar este evento até a data marcada (ou até despublicar)</label>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-xl border border-[#E5DEC9] bg-white p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-xs text-[#B5892E] font-semibold">
                <span>{ev.event_date || 'Data a definir'} · {ev.event_time}</span>
                <span>{ev.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
              </div>
              <h3 className="mt-1 font-serif-church text-lg font-bold text-[#102B4E]">{ev.name}</h3>
              <p className="text-xs text-slate-600 mt-1">{ev.location}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(ev)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-[#102B4E] cursor-pointer"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(ev.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrayersPanel({
  prayers,
  onRefresh,
  onNotify,
}: {
  prayers: PrayerRequest[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'prayed'>('all');

  const toggleStatus = async (p: PrayerRequest) => {
    const next = p.status === 'pending' ? 'prayed' : 'pending';
    await fetch(`/api/admin/prayers/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    await onRefresh();
    onNotify(next === 'prayed' ? 'Pedido marcado como orado!' : 'Pedido retornado para pendente.');
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/prayers/${id}`, { method: 'DELETE' });
    await onRefresh();
    onNotify('Pedido removido.');
  };

  const filtered = prayers.filter((p) => filter === 'all' || p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">
            Pedidos de Oração (Privado)
          </h1>
          <p className="text-xs text-slate-600">
            Somente o pastor autenticado tem acesso a estes pedidos.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[#E5DEC9] bg-white p-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'prayed', label: 'Orados' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as 'all' | 'pending' | 'prayed')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                filter === tab.id ? 'bg-[#102B4E] text-white' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#E5DEC9] bg-white p-4 shadow-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs">
                <span className="font-bold text-[#102B4E]">
                  {p.is_anonymous ? 'Anônimo' : p.name || 'Sem nome informado'}
                </span>
                {p.whatsapp && !p.is_anonymous && (
                  <span className="ml-2 text-slate-500 tabular-nums">· WhatsApp: {p.whatsapp}</span>
                )}
                <span className="ml-2 text-slate-400 tabular-nums">· {p.created_at}</span>
              </div>
              <span
                className={`text-xs font-semibold ${
                  p.status === 'prayed' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {p.status === 'prayed' ? 'Já orado' : 'Aguardando oração'}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{p.request_text}</p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => toggleStatus(p)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#102B4E] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#E8C97A]" />
                <span>{p.status === 'pending' ? 'Marcar como Orado' : 'Marcar como Pendente'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-[#E5DEC9] bg-white p-8 text-center text-sm text-slate-500">
            Nenhum pedido de oração encontrado neste filtro.
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryPanel({albums,photos,onRefresh,onNotify}:{albums:GalleryAlbum[];photos:GalleryPhoto[];onRefresh:()=>Promise<void>;onNotify:(msg:string)=>void}) {
 const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [date,setDate]=useState('');const [status,setStatus]=useState<'draft'|'published'>('published');
 const [selected,setSelected]=useState<number|null>(null);const [busy,setBusy]=useState(false);const [edit,setEdit]=useState<GalleryAlbum|null>(null);
 const create=async(e:FormEvent)=>{e.preventDefault();const res=await fetch(edit?`/api/admin/albums/${edit.id}`:'/api/admin/albums',{method:edit?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description,event_date:date,status,cover_url:edit?.cover_url||''})});if(!res.ok){onNotify((await res.json()).error||'Erro');return;}setTitle('');setDescription('');setDate('');setEdit(null);await onRefresh();onNotify('Álbum salvo!');};
 const upload=async(e:ChangeEvent<HTMLInputElement>,albumId:number)=>{const files=Array.from(e.target.files||[]);if(!files.length)return;setBusy(true);let count=0;try{for(const file of files){if(!file.type.startsWith('image/'))continue;const url=await uploadImageFile(file);const res=await fetch(`/api/admin/albums/${albumId}/photos`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({photos:[{title:file.name.replace(/\.[^.]+$/,''),image_url:url}]})});if(!res.ok)throw Error((await res.json()).error||'Falha ao adicionar foto');count++;}await onRefresh();onNotify(`${count} fotos adicionadas.`);}catch(err){onNotify(err instanceof Error?err.message:'Erro ao enviar fotos');}finally{setBusy(false);e.target.value='';}};
 const remove=async(id:number)=>{if(!window.confirm('Excluir este álbum? As fotos permanecerão na lista de fotos antigas.'))return;const res=await fetch(`/api/admin/albums/${id}`,{method:'DELETE'});if(res.ok){await onRefresh();onNotify('Álbum removido.');}};
 const removePhoto=async(id:number)=>{if(!window.confirm('Remover esta foto?'))return;await fetch(`/api/admin/gallery/${id}`,{method:'DELETE'});await onRefresh();};
 return <div className="space-y-5"><div><h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">Álbuns de Fotos</h1><p className="text-sm text-slate-600">Crie pastas por culto ou evento e envie várias fotos de uma vez. Sem comentários públicos.</p></div>
 <form onSubmit={create} className="space-y-3 rounded-xl border bg-white p-5"><h2 className="font-bold text-[#102B4E]">{edit?'Editar álbum':'Criar novo álbum'}</h2><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nome do álbum (ex.: Culto das Crianças)" className="w-full rounded border p-2"/><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded border p-2"/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição do evento" className="w-full rounded border p-2"/><select value={status} onChange={e=>setStatus(e.target.value as 'draft'|'published')} className="rounded border p-2"><option value="published">Publicado</option><option value="draft">Rascunho</option></select><div><button type="submit" className="rounded bg-[#102B4E] px-4 py-2 text-white">{edit?'Salvar alterações':'Criar álbum'}</button>{edit&&<button type="button" onClick={()=>{setEdit(null);setTitle('');setDescription('');setDate('')}} className="ml-3">Cancelar</button>}</div></form>
 <div className="space-y-4">{albums.map(a=><div key={a.id} className="rounded-xl border bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-serif-church text-lg font-bold text-[#102B4E]">{a.title}</h3><p className="text-sm text-slate-500">{a.event_date} · {a.photos.length} fotos · {a.status==='draft'?'Rascunho':'Publicado'}</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>setSelected(selected===a.id?null:a.id)} className="rounded border px-3 py-2 text-sm">{selected===a.id?'Recolher':'Ver fotos'}</button><button onClick={()=>{setEdit(a);setTitle(a.title);setDescription(a.description);setDate(a.event_date);setStatus(a.status)}} className="rounded border px-3 py-2 text-sm">Editar</button><button onClick={()=>remove(a.id)} className="rounded border border-red-300 px-3 py-2 text-sm text-red-700">Excluir</button></div></div><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded bg-[#C4983B] px-4 py-2 text-sm font-bold text-[#102B4E]">{busy?'Enviando fotos...':'Adicionar fotos em lote'}<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>upload(e,a.id)} className="hidden"/></label>{selected===a.id&&<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{a.photos.map(photo=><div key={photo.id}><img src={photo.image_url} alt={photo.title} className="aspect-square w-full rounded object-cover"/><button onClick={()=>removePhoto(photo.id)} className="text-xs text-red-700">Remover foto</button></div>)}</div>}</div>)}</div>
 {photos.some(photo=>!photo.album_id)&&<p className="text-sm text-slate-600">As fotos avulsas antigas foram preservadas e continuam acessíveis no site na seção “Fotos anteriores”.</p>}
 </div>;
}

function UsersPanel({onNotify}:{onNotify:(msg:string)=>void}) {
 const [users,setUsers]=useState<AdminUser[]>([]);const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');
 const load=async()=>{const r=await fetch('/api/admin/users');if(r.ok)setUsers(await r.json());};
 useEffect(()=>{void load()},[]);
 const add=async(e:FormEvent)=>{e.preventDefault();const r=await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});if(!r.ok){onNotify((await r.json()).error||'Erro ao criar usuário');return;}setName('');setEmail('');setPassword('');await load();onNotify('Usuário criado.');};
 const del=async(id:number)=>{if(!window.confirm('Excluir usuário e encerrar todas as sessões dele?'))return;const r=await fetch(`/api/admin/users/${id}`,{method:'DELETE'});if(r.ok){await load();onNotify('Usuário excluído.');}else onNotify((await r.json()).error);};
 return <div className="space-y-5"><h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">Usuários Autorizados</h1><p className="text-sm text-slate-600">Somente o pastor administrador pode criar e remover contas. Contas auxiliares podem editar conteúdo, mas não gerenciar usuários.</p><form onSubmit={add} className="space-y-3 rounded-xl border bg-white p-5"><input required minLength={3} value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo" className="w-full rounded border p-2"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded border p-2"/><input required type="password" minLength={10} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha (mínimo 10 caracteres)" className="w-full rounded border p-2"/><button className="rounded bg-[#102B4E] px-4 py-2 text-white">Criar usuário</button></form><div className="space-y-2">{users.map(u=><div key={u.id} className="flex flex-wrap items-center justify-between rounded-lg border bg-white p-3"><div><b>{u.name}</b><p className="text-sm text-slate-600">{u.email} · {u.role==='pastor'?'Administrador principal':'Editor'}</p></div>{u.role!=='pastor'&&<button onClick={()=>del(u.id)} className="text-sm font-bold text-red-700">Excluir usuário</button>}</div>)}</div></div>;
}

function SettingsPanel({
  settings,
  onRefresh,
  onNotify,
}: {
  settings: SiteSettings;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await onRefresh();
        onNotify('Configurações atualizadas no site!');
      }
    } finally {
      setSaving(false);
    }
  };

  const updateScheduleRow = (idx: number, field: keyof ServiceScheduleItem, val: string) => {
    const next = [...form.schedule];
    next[idx] = { ...next[idx], [field]: val };
    setForm({ ...form, schedule: next });
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentPassword('');
      setNewPassword('');
      onNotify('Senha alterada com sucesso!');
    } else {
      onNotify(data.error || 'Erro ao alterar senha.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-church text-2xl font-bold text-[#102B4E]">
          Configurações da Igreja e Contribuições
        </h1>
        <p className="text-xs text-slate-600">
          Atualize contatos, horários de culto, dados oficiais Pix e segurança da conta.
        </p>
      </div>

     
{/* Backend / Database Status Info */}
<div className="rounded-xl border border-[#C9A24D]/50 bg-white p-4 flex items-start gap-3">
  <Database
    className="h-5 w-5 text-[#C9A24D] shrink-0 mt-0.5"
    aria-hidden="true"
  />

  <div className="text-xs leading-relaxed text-slate-700">
    <p className="font-semibold text-[#102B4E]">
      Persistência Ativa: Banco SQLite Local (/data/evangelho_da_paz.db)
    </p>

    <p className="mt-0.5">
      O sistema utiliza atualmente um banco SQLite local.
      A futura Central da Igreja permitirá administrar
      publicações e arquivos diretamente pelo computador.
    </p>
  </div>
</div>


      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Dados Gerais */}
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-5 space-y-4">
          <h2 className="font-serif-church text-lg font-bold text-[#102B4E]">
            Informações Oficiais e Contatos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Nome da Igreja</label>
              <input
                type="text"
                value={form.church_name}
                onChange={(e) => setForm({ ...form, church_name: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Presidentes</label>
              <input
                type="text"
                value={form.presidents}
                onChange={(e) => setForm({ ...form, presidents: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">WhatsApp</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Endereço Completo</label>
              <input
                type="text"
                value={form.address_full}
                onChange={(e) => setForm({ ...form, address_full: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Dízimos e Ofertas (Pix) */}
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-5 space-y-4">
          <h2 className="font-serif-church text-lg font-bold text-[#102B4E]">
            Dízimos e Ofertas (Dados Pix Oficiais)
          </h2>
          <p className="text-xs text-slate-600">
            Enquanto a Chave Pix estiver vazia, o site exibirá &ldquo;Dados Pix em breve&rdquo;. Ao preencher, o QR Code oficial será gerado automaticamente.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Tipo da Chave</label>
              <select
                value={form.pix_key_type}
                onChange={(e) => setForm({ ...form, pix_key_type: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white"
              >
                <option value="CNPJ">CNPJ</option>
                <option value="E-mail">E-mail</option>
                <option value="Telefone">Telefone</option>
                <option value="Chave Aleatória">Chave Aleatória</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Chave Pix</label>
              <input
                type="text"
                value={form.pix_key}
                onChange={(e) => setForm({ ...form, pix_key: e.target.value })}
                placeholder="Ex.: 00.000.000/0001-00 ou e-mail"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Nome do Favorecido</label>
              <input
                type="text"
                value={form.pix_beneficiary}
                onChange={(e) => setForm({ ...form, pix_beneficiary: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Cidade do Recebedor</label>
              <input
                type="text"
                value={form.pix_city}
                onChange={(e) => setForm({ ...form, pix_city: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Horários Oficiais */}
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-5 space-y-3">
          <h2 className="font-serif-church text-lg font-bold text-[#102B4E]">
            Horários Semanais de Culto
          </h2>
          {form.schedule.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                type="text"
                value={item.day}
                onChange={(e) => updateScheduleRow(idx, 'day', e.target.value)}
                placeholder="Dia"
                className="rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={item.time}
                onChange={(e) => updateScheduleRow(idx, 'time', e.target.value)}
                placeholder="Horário"
                className="rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateScheduleRow(idx, 'title', e.target.value)}
                placeholder="Culto / Atividade"
                className="rounded-lg border border-stone-300 px-3 py-2 text-xs"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#E5C16A] to-[#C4983B] px-6 py-2.5 text-sm font-semibold text-[#102B4E] shadow-md cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Todas as Configurações'}</span>
          </button>
        </div>
      </form>

      {/* Segurança da Conta */}
      <form onSubmit={handleChangePassword} className="rounded-xl border border-[#E5DEC9] bg-white p-5 space-y-4">
        <h2 className="font-serif-church text-lg font-bold text-[#102B4E]">Alterar Senha Pastoral</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Senha atual"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nova senha (mín. 8 caracteres)"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#102B4E] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
        >
          Atualizar Senha
        </button>
      </form>
    </div>
  );
}
