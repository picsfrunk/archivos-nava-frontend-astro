import { pocketbaseUrl } from './pocketbase';

export type Theme = 'dark' | 'light' | 'system';
export type SiteSettings = {
    site_name: string;
    site_description: string;
    logo_url: string;
    default_theme: Theme;
};
export const fallbackSettings: Readonly<SiteSettings> = Object.freeze({
    site_name: 'ARCHIVOS NAVA', site_description: '', logo_url: '', default_theme: 'dark',
});
export const settingsPath = '/api/archivos-nava/site-settings';

export async function fetchSiteSettings(): Promise<SiteSettings> {
    const response = await fetch(`${pocketbaseUrl}${settingsPath}`, {
        signal: AbortSignal.timeout(5000), cache: 'no-store',
    });
    if (!response.ok) throw new Error('No se pudo cargar la configuración del sitio.');
    const data = await response.json();
    if (!data || typeof data.site_name !== 'string' || !data.site_name.trim() ||
        typeof data.site_description !== 'string' || typeof data.logo_url !== 'string' ||
        !['dark', 'light', 'system'].includes(data.default_theme)) {
        throw new Error('La configuración recibida no es válida.');
    }
    return {
        site_name: data.site_name, site_description: data.site_description,
        logo_url: /^https:\/\//.test(data.logo_url) ? data.logo_url : '',
        default_theme: data.default_theme,
    };
}

// One promise per SSR request, shared by pages, layout and header; never a stale global cache.
const requests = new WeakMap<object, Promise<SiteSettings>>();
export function getSiteSettings(request: object): Promise<SiteSettings> {
    let pending = requests.get(request);
    if (!pending) {
        pending = fetchSiteSettings().catch(() => ({ ...fallbackSettings }));
        requests.set(request, pending);
    }
    return pending;
}

export function logoPreviewUrl(url: string) {
    if (!/^https:\/\/res\.cloudinary\.com\//.test(url)) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_480,h_160/');
}
