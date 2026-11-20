import { ArrowRight, Images } from 'lucide-react';
import type { GalleryAlbum } from '../types/church.ts';
export function GalleryHighlights({albums,onOpen}:{albums:GalleryAlbum[];onOpen:(albumId?:number)=>void}) {
 const recent=albums.filter(a=>a.photo_count>0).slice(0,3);
 return <section id="galeria" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
 <div className="mb-5 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-serif-church text-2xl font-bold text-[#102B4E]"><Images className="text-[#8A6212]"/>Momentos da Nossa Igreja</h2><button type="button" onClick={()=>onOpen()} className="flex items-center gap-1 font-semibold text-[#8A6212]">Ver todos os álbuns <ArrowRight size={18}/></button></div>
 {recent.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{recent.map(a=><button type="button" key={a.id} onClick={()=>onOpen(a.id)} className="overflow-hidden rounded-xl border border-[#DFD6BE] bg-white text-left shadow-sm hover:shadow-lg"><img src={a.cover_url} alt={a.title} loading="lazy" className="aspect-[4/3] w-full object-cover"/><div className="p-4"><h3 className="font-serif-church text-xl font-bold text-[#102B4E]">{a.title}</h3><p className="text-sm text-slate-600">{a.event_date} · {a.photo_count} fotos</p></div></button>)}</div> : <div className="rounded-xl border border-[#DFD6BE] bg-white p-6 text-center text-slate-600">Novos álbuns da igreja serão publicados aqui em breve.</div>}
 </section>;
}
