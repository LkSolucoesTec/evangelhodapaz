export type PublicationCategory = 'palavra_do_dia' | 'estudo_biblico' | 'frase_reflexao';
export type PublishStatus = 'draft' | 'published';

export interface Publication {
  id: number;
  title: string;
  slug: string;
  category: PublicationCategory;
  content: string;
  bible_reference: string;
  image_url: string;
  published_date: string;
  status: PublishStatus;
  is_demo: number;
  is_highlighted?: number;
  created_at: string;
  updated_at: string;
}

export interface ChurchEvent {
  id: number;
  name: string;
  event_date: string;
  event_time: string;
  description: string;
  image_url: string;
  location: string;
  status: PublishStatus;
  is_demo: number;
  is_highlighted?: number;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  is_highlighted: number;
  expires_at: string;
  status: PublishStatus;
  created_at: string;
}

export interface PrayerRequest {
  id: number;
  name: string;
  whatsapp: string;
  request_text: string;
  is_anonymous: number;
  privacy_consent: number;
  status: 'pending' | 'prayed';
  created_at: string;
}

export interface GalleryAlbum {
  id: number; title: string; description: string; event_date: string; cover_url: string; status: PublishStatus; created_at: string; photos: GalleryPhoto[]; photo_count: number;
}

export interface GalleryPhoto {
  album_id?: number | null;
  id: number;
  title: string;
  caption: string;
  image_url: string;
  event_date: string;
  created_at: string;
}

export interface ServiceScheduleItem {
  day: string;
  time: string;
  title: string;
}

export interface SiteSettings {
  church_name: string;
  church_subtitle: string;
  presidents: string;
  motto: string;
  email: string;
  whatsapp: string;
  whatsapp_link: string;
  address_line1: string;
  address_line2: string;
  address_full: string;
  facebook_url: string;
  instagram_url: string;
  pastor_facebook_url: string;
  gallery_external_url: string;
  bible_online_url: string;
  maps_embed_url: string;
  maps_directions_url: string;
  pix_key: string;
  pix_key_type: string;
  pix_beneficiary: string;
  pix_city: string;
  schedule: ServiceScheduleItem[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface PublicSiteData {
  settings: SiteSettings;
  wordOfTheDay: Publication | null;
  publications: Publication[];
  events: ChurchEvent[];
  notices: Notice[];
  gallery: GalleryPhoto[];
  albums: GalleryAlbum[];
}
