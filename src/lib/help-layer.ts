/**
 * Client-side engine for ARCHIVOS NAVA help layer and tooltips.
 * Adheres to Modern Web Guidance: Popover API, light-dismiss, keyboard navigation,
 * and user-controlled persistence in localStorage.
 */

const STORAGE_KEY_MODE = 'nava_help_mode';
const STORAGE_KEY_DISMISSED = 'nava_dismissed_tips';

export function getHelpMode(): 'enabled' | 'disabled' {
	try {
		const val = localStorage.getItem(STORAGE_KEY_MODE);
		if (val === 'disabled') return 'disabled';
	} catch {}
	return 'enabled';
}

export function setHelpMode(mode: 'enabled' | 'disabled') {
	try {
		localStorage.setItem(STORAGE_KEY_MODE, mode);
	} catch {}
	document.documentElement.dataset.helpMode = mode;
	updateHelpToggleButtons();
}

export function toggleHelpMode(): 'enabled' | 'disabled' {
	const current = getHelpMode();
	const next = current === 'enabled' ? 'disabled' : 'enabled';
	setHelpMode(next);
	return next;
}

export function getDismissedBannerIds(): Set<string> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return new Set(parsed);
		}
	} catch {}
	return new Set();
}

export function dismissBanner(id: string) {
	const dismissed = getDismissedBannerIds();
	dismissed.add(id);
	try {
		localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(Array.from(dismissed)));
	} catch {}

	const banner = document.querySelector(`[data-help-banner-id="${CSS.escape(id)}"]`);
	if (banner instanceof HTMLElement) {
		banner.hidden = true;
	}
}

export function resetDismissedBanners() {
	try {
		localStorage.removeItem(STORAGE_KEY_DISMISSED);
	} catch {}
	document.querySelectorAll('[data-help-banner-id]').forEach((el) => {
		if (el instanceof HTMLElement) {
			el.hidden = false;
		}
	});
}

function updateHelpToggleButtons() {
	const mode = getHelpMode();
	const isEnabled = mode === 'enabled';
	document.querySelectorAll('[data-help-toggle]').forEach((btn) => {
		if (btn instanceof HTMLElement) {
			btn.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');
			const labelEl = btn.querySelector('.help-toggle-status');
			if (labelEl) {
				labelEl.textContent = isEnabled ? 'Activa' : 'Inactiva';
			}
			btn.title = isEnabled ? 'Desactivar carteles de ayuda y tooltips' : 'Activar carteles de ayuda y tooltips';
		}
	});
}

function initDismissedBanners() {
	const dismissed = getDismissedBannerIds();
	dismissed.forEach((id) => {
		const banner = document.querySelector(`[data-help-banner-id="${CSS.escape(id)}"]`);
		if (banner instanceof HTMLElement) {
			banner.hidden = true;
		}
	});
}

export function setupHelpLayer() {
	if (typeof window === 'undefined') return;

	// 1. Sync html attribute
	document.documentElement.dataset.helpMode = getHelpMode();
	updateHelpToggleButtons();
	initDismissedBanners();

	// 2. Delegate dismiss buttons
	document.addEventListener('click', (evt) => {
		const target = evt.target as HTMLElement | null;
		if (!target) return;

		// Help toggle button
		const toggleBtn = target.closest('[data-help-toggle]');
		if (toggleBtn) {
			evt.preventDefault();
			toggleHelpMode();
			return;
		}

		// Dismiss banner button
		const dismissBtn = target.closest('[data-dismiss-banner]');
		if (dismissBtn) {
			evt.preventDefault();
			const bannerId = dismissBtn.getAttribute('data-dismiss-banner');
			if (bannerId) {
				dismissBanner(bannerId);
			}
			return;
		}
	});

	// 3. Fallback for popover="hint" where only "auto"/"manual" is natively supported
	if (typeof HTMLDivElement !== 'undefined' && 'popover' in HTMLDivElement.prototype) {
		const probe = document.createElement('div');
		try {
			probe.popover = 'hint';
			if (probe.popover !== 'hint') {
				document.addEventListener('beforetoggle', (event) => {
					const t = event.target as HTMLElement;
					if (t && t.getAttribute('popover') === 'hint') {
						t.popover = 'auto';
					}
				}, true);
			}
		} catch {}
	}

	// 4. Sync across browser tabs
	window.addEventListener('storage', (event) => {
		if (event.key === STORAGE_KEY_MODE) {
			document.documentElement.dataset.helpMode = getHelpMode();
			updateHelpToggleButtons();
		} else if (event.key === STORAGE_KEY_DISMISSED) {
			initDismissedBanners();
		}
	});
}
