import type RecordModel from 'pocketbase';
import { pb } from './pocketbase';

export const TECHNICAL_CATEGORY_SLUG = 'sin-categoria';

export type CategoryRecord = RecordModel & {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
	sort_order?: number;
	active?: boolean;
};

export type PhotoRecord = RecordModel & {
	id: string;
	title?: string;
	year?: number;
	caption?: string;
	description?: string;
	category: string;
	image: string;
	cloudinary_public_id?: string;
	status: 'draft' | 'published' | 'trash';
	created: string;
	expand?: {
		category?: CategoryRecord;
	};
};

export type PublicCategory = CategoryRecord & {
	photoCount: number;
	coverPhoto: PhotoRecord | null;
};

export function isPublicCategory(category?: CategoryRecord | null) {
	return Boolean(category?.active && category.slug && category.slug !== TECHNICAL_CATEGORY_SLUG);
}

export function isPublicPhoto(photo?: PhotoRecord | null) {
	return Boolean(photo?.status === 'published' && isPublicCategory(photo.expand?.category));
}

export function photoLabel(photo: Pick<PhotoRecord, 'title' | 'caption'>) {
	return photo.title?.trim() || photo.caption?.trim() || 'Fotografía de archivo';
}

export function photoAlt(photo: Pick<PhotoRecord, 'title' | 'caption'>) {
	return photo.title?.trim() || photo.caption?.trim() || 'Fotografía de ARCHIVOS NAVA';
}

export function displayYear(year?: number | null) {
	if (!year) return '';
	return String(year);
}

export function cloudinaryUrl(
	source: string,
	transformations: string[],
) {
	if (!source || !transformations.length || !source.includes('/upload/')) return source;

	return source.replace('/upload/', `/upload/${transformations.join(',')}/`);
}

export function thumbnailUrl(source: string) {
	return cloudinaryUrl(source, ['f_auto', 'q_auto', 'c_fill', 'w_720', 'h_540']);
}

export function previewUrl(source: string) {
	return cloudinaryUrl(source, ['f_auto', 'q_auto', 'c_limit', 'w_1600', 'h_1600']);
}

export function downloadUrl(source: string) {
	return cloudinaryUrl(source, ['fl_attachment', 'q_auto:best']);
}

export async function getPublicCategories() {
	const categories = await pb.collection('categories').getFullList<CategoryRecord>({
		filter: `active = true && slug != "${TECHNICAL_CATEGORY_SLUG}"`,
		sort: 'sort_order,name',
	});

	const categoriesWithPhotos = await Promise.all(
		categories.map(async (category) => {
			const photos = await pb.collection('photos').getList<PhotoRecord>(1, 1, {
				filter: pb.filter('status = "published" && category = {:category}', {
					category: category.id,
				}),
				sort: '-created',
				expand: 'category',
			});

			const coverPhoto = photos.items.find(isPublicPhoto) ?? null;

			return {
				...category,
				photoCount: coverPhoto ? photos.totalItems : 0,
				coverPhoto,
			};
		}),
	);

	return categoriesWithPhotos.filter((category) => category.photoCount > 0);
}

export async function getPublicCategoryBySlug(slug: string) {
	if (!slug || slug === TECHNICAL_CATEGORY_SLUG) return null;

	try {
		const category = await pb.collection('categories').getFirstListItem<CategoryRecord>(
			pb.filter('slug = {:slug} && active = true', { slug }),
		);

		return isPublicCategory(category) ? category : null;
	} catch {
		return null;
	}
}

export async function getPublicPhotosByCategory(categoryId: string, page = 1, perPage = 24) {
	const result = await pb.collection('photos').getList<PhotoRecord>(page, perPage, {
		filter: pb.filter('status = "published" && category = {:category}', {
			category: categoryId,
		}),
		sort: '-created',
		expand: 'category',
	});

	const items = result.items.filter(isPublicPhoto);

	return {
		...result,
		items,
	};
}

export async function getRecentPublicPhotos(limit = 6) {
	const result = await pb.collection('photos').getList<PhotoRecord>(1, limit, {
		filter: 'status = "published"',
		sort: '-created',
		expand: 'category',
	});

	return result.items.filter(isPublicPhoto);
}

export async function getAllPublicPhotos() {
	const photos = await pb.collection('photos').getFullList<PhotoRecord>({
		filter: 'status = "published"',
		sort: '-created',
		expand: 'category',
	});

	return photos.filter(isPublicPhoto);
}

export async function getPublicPhotoById(id: string) {
	if (!id) return null;

	try {
		const photo = await pb.collection('photos').getFirstListItem<PhotoRecord>(
			pb.filter('id = {:id} && status = "published"', { id }),
			{ expand: 'category' },
		);

		return isPublicPhoto(photo) ? photo : null;
	} catch {
		return null;
	}
}
