import { pb, pocketbaseUrl } from './pocketbase';

export type CategoryOption = {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
	sort_order?: number;
	cover_photo?: string;
	active?: boolean;
	isTechnical?: boolean;
};

export function redirectToLogin(options?: { expired?: boolean; redirectUrl?: string }) {
	pb.authStore.clear();
	if (typeof window === 'undefined') return;

	let currentPath = options?.redirectUrl;
	if (!currentPath) {
		const pathname = window.location.pathname;
		const search = window.location.search;
		if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
			currentPath = `${pathname}${search}`;
		}
	}

	const params = new URLSearchParams();
	if (options?.expired) {
		params.set('expired', '1');
	}
	if (currentPath) {
		params.set('redirect', currentPath);
	}

	const query = params.toString();
	window.location.href = query ? `/admin/login?${query}` : '/admin/login';
}

export function isAdminSession() {
	return pb.authStore.model?.collectionName === 'admins';
}

export async function requireAdminSession() {
	if (!pb.authStore.isValid || !isAdminSession()) {
		redirectToLogin();
		return false;
	}

	try {
		await pb.collection('admins').authRefresh();
		return true;
	} catch {
		redirectToLogin({ expired: true });
		return false;
	}
}

export function resolveError(error: unknown) {
	if (typeof error === 'object' && error !== null) {
		const data = 'data' in error ? error.data : undefined;
		if (typeof data === 'object' && data !== null) {
			if ('error' in data && typeof data.error === 'string') return data.error;
			if ('message' in data && typeof data.message === 'string') return data.message;
		}

		if ('error' in error && typeof error.error === 'string') return error.error;
		if ('message' in error && typeof error.message === 'string') return error.message;
	}

	return 'No se pudo completar la operación.';
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	headers.set('Authorization', `Bearer ${pb.authStore.token}`);

	if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	const response = await fetch(`${pocketbaseUrl}${path}`, {
		...init,
		headers,
	});

	let result: unknown = {};
	try {
		result = await response.json();
	} catch {
		result = {};
	}

	if (response.status === 401 || response.status === 403) {
		redirectToLogin({ expired: true });
		throw { authError: true };
	}

	if (!response.ok || (typeof result === 'object' && result !== null && 'success' in result && result.success === false)) {
		throw result;
	}

	return result as T;
}

export async function loadActiveCategories() {
	const categories = await pb.collection('categories').getFullList<CategoryOption>({
		filter: 'active = true',
		sort: 'sort_order,name',
	});

	return categories.filter((category) => category.slug !== 'sin-categoria');
}

export async function loadAdminCategories() {
	const result = await adminFetch<{ items: CategoryOption[] }>('/api/archivos-nava/admin/categories');
	return result.items || [];
}
