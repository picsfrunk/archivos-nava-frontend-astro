import type RecordModel from 'pocketbase';
import { pb } from './pocketbase';

export const TECHNICAL_CATEGORY_SLUG = 'sin-categoria';

export type CategoryRecord = RecordModel & {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
	sort_order?: number;
	cover_photo?: string;
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
	is_home_cover?: boolean;
	sort_order?: number;
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

export function lightboxUrl(source: string) {
	return cloudinaryUrl(source, ['f_auto', 'q_auto:best', 'c_limit', 'w_2400', 'h_2400']);
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
			const firstPage = await pb.collection('photos').getList<PhotoRecord>(1, 1, {
				filter: pb.filter('status = "published" && category = {:category}', {
					category: category.id,
				}),
				sort: 'sort_order,created,id',
				expand: 'category',
			});

			let coverPhoto: PhotoRecord | null = null;
			if (category.cover_photo) {
				try {
					const selectedCover = await pb.collection('photos').getFirstListItem<PhotoRecord>(
						pb.filter('id = {:id} && status = "published" && category = {:category}', {
							id: category.cover_photo,
							category: category.id,
						}),
						{ expand: 'category' },
					);
					coverPhoto = isPublicPhoto(selectedCover) ? selectedCover : null;
				} catch {
					coverPhoto = null;
				}
			}

			if (!coverPhoto) {
				coverPhoto = firstPage.items.find(isPublicPhoto) ?? null;
			}

			return {
				...category,
				photoCount: coverPhoto ? firstPage.totalItems : 0,
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
		sort: 'sort_order,created,id',
		expand: 'category',
	});

	const items = result.items.filter(isPublicPhoto);

	return {
		...result,
		items,
	};
}

export async function getHomeCoverPhoto() {
	try {
		const photo = await pb.collection('photos').getFirstListItem<PhotoRecord>(
			'is_home_cover = true && status = "published"',
			{ expand: 'category' },
		);

		return isPublicPhoto(photo) ? photo : null;
	} catch {
		return null;
	}
}

export async function getRecentPublicPhotos(limit = 6) {
	const visiblePhotos: PhotoRecord[] = [];
	const perPage = Math.max(limit * 2, 12);
	let page = 1;
	let totalPages = 1;

	while (visiblePhotos.length < limit && page <= totalPages) {
		const result = await pb.collection('photos').getList<PhotoRecord>(page, perPage, {
			filter: 'status = "published"',
			sort: '-created',
			expand: 'category',
		});

		visiblePhotos.push(...result.items.filter(isPublicPhoto));
		totalPages = result.totalPages;
		page += 1;
	}

	return visiblePhotos.slice(0, limit);
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

export async function getPublicPhotoNavigation(photo: PhotoRecord) {
	const categoryId = photo.expand?.category?.id || photo.category;
	if (!categoryId || !isPublicPhoto(photo)) {
		return { previous: null, next: null };
	}

	const photos = await pb.collection('photos').getFullList<PhotoRecord>({
		filter: pb.filter('status = "published" && category = {:category}', {
			category: categoryId,
		}),
		sort: 'sort_order,created,id',
		expand: 'category',
	});
	const publicPhotos = photos.filter(isPublicPhoto);
	const currentIndex = publicPhotos.findIndex((item) => item.id === photo.id);

	if (currentIndex === -1) {
		return { previous: null, next: null };
	}

	return {
		previous: publicPhotos[currentIndex - 1] ?? null,
		next: publicPhotos[currentIndex + 1] ?? null,
	};
}
