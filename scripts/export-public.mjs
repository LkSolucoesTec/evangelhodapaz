// Run with: node --experimental-strip-types scripts/export-public.mjs
// Never exports users, sessions, passwords or private prayer requests.
import fs from 'node:fs';
import path from 'node:path';
import { db, getSettings, initDatabase, uploadsDirectory } from '../server/db.ts';
initDatabase();
const published = db.prepare("SELECT * FROM publications WHERE status = 'published' ORDER BY published_date DESC, id DESC").all();
const events = db.prepare("SELECT * FROM events WHERE status = 'published' AND (event_date = '' OR event_date >= ?) ORDER BY is_highlighted DESC, CASE WHEN event_date = '' THEN 1 ELSE 0 END, event_date ASC, id DESC").all(new Date().toISOString().slice(0,10));
const today = new Date().toISOString().slice(0,10);
const notices = db.prepare("SELECT * FROM notices WHERE status = 'published' AND (expires_at = '' OR expires_at >= ?) ORDER BY is_highlighted DESC, id DESC").all(today);
const gallery = db.prepare("SELECT p.* FROM gallery_photos p LEFT JOIN gallery_albums a ON a.id=p.album_id WHERE p.album_id IS NULL OR a.status='published' ORDER BY p.id DESC").all();
const albumRows=db.prepare("SELECT * FROM gallery_albums WHERE status = 'published' ORDER BY id DESC").all();
const albums=albumRows.map(album=>{const photos=gallery.filter(photo=>photo.album_id===album.id).reverse();return {...album,photos,photo_count:photos.length,cover_url:album.cover_url||photos[0]?.image_url||''};});
const data = { settings: getSettings(), wordOfTheDay: db.prepare("SELECT * FROM publications WHERE category = 'palavra_do_dia' AND status = 'published' ORDER BY id DESC LIMIT 1").get() || null, publications:published, events, notices, gallery, albums };
const publicDir = path.resolve('public');
fs.mkdirSync(publicDir,{recursive:true});
fs.writeFileSync(path.join(publicDir,'site-data.json'), JSON.stringify(data,null,2));
// Copy only referenced public uploads, not the entire private upload directory.
const referenced = [...published,...events,...gallery].map(item=>item.image_url).filter(url=>typeof url==='string' && /^\/uploads\/[\w.-]+$/.test(url));
for (const url of new Set(referenced)) {
 const name=path.basename(url); const source=path.join(uploadsDirectory,name); const destination=path.join(publicDir,'uploads',name);
 if (!fs.existsSync(source)) { console.warn(`Missing uploaded image: ${name}`); continue; }
 fs.mkdirSync(path.dirname(destination),{recursive:true}); fs.copyFileSync(source,destination);
}
console.log(`Exported public content: ${published.length} publications, ${events.length} events, ${gallery.length} photos.`);
