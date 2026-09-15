const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/layouts/Layout.astro'), 'utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
function fixture({ defaultTheme = 'dark', stored = null, dark = false, blocked = false } = {}) {
    const listeners = {}, root = { dataset: { defaultTheme } }, control = {};
    const media = { matches: dark, addEventListener: (_, callback) => listeners.media = callback };
    const state = { stored };
    vm.runInNewContext(source, {
        document: { documentElement: root, querySelector: () => control, addEventListener: (event, callback) => listeners[event] = callback },
        window: { addEventListener: (event, callback) => listeners[event] = callback },
        matchMedia: () => media,
        localStorage: {
            getItem() { if (blocked) throw Error('blocked'); return state.stored; },
            setItem(_, value) { if (blocked) throw Error('blocked'); state.stored = value; },
            removeItem() { if (blocked) throw Error('blocked'); state.stored = null; },
        },
    });
    return {
        root, control, state,
        select: value => listeners.change({ target: { id: 'theme-choice', value } }),
        system: matches => { media.matches = matches; listeners.media(); },
        storage: (key, newValue) => listeners.storage({ key, newValue }),
    };
}
test('default dark and default light are applied before DOM ready', () => {
    for (const theme of ['dark', 'light']) assert.equal(fixture({ defaultTheme: theme }).root.dataset.theme, theme);
});
test('instance system follows OS changes without an override', () => {
    const f = fixture({ defaultTheme: 'system' }); assert.equal(f.root.dataset.theme, 'light');
    f.system(true); assert.equal(f.root.dataset.theme, 'dark');
});
test('explicit preference wins and persists when selected', () => {
    const f = fixture({ defaultTheme: 'light', stored: 'dark' }); assert.equal(f.root.dataset.theme, 'dark');
    f.select('light'); assert.equal(f.state.stored, 'light'); f.system(true); assert.equal(f.root.dataset.theme, 'light');
});
test('visitor system overrides fixed default and follows OS', () => {
    const f = fixture({ defaultTheme: 'dark', stored: 'system' }); assert.equal(f.root.dataset.theme, 'light');
    f.system(true); assert.equal(f.root.dataset.theme, 'dark');
});
test('reset removes preference and restores instance default', () => {
    const f = fixture({ defaultTheme: 'light', stored: 'dark' }); f.select('default');
    assert.equal(f.state.stored, null); assert.equal(f.root.dataset.theme, 'light'); assert.equal(f.control.value, 'default');
});
test('invalid storage values are ignored', () => {
    const f = fixture({ stored: 'unexpected', defaultTheme: 'light' }); assert.equal(f.root.dataset.theme, 'light');
});
test('blocked storage never prevents rendering or changing theme', () => {
    const f = fixture({ blocked: true }); assert.equal(f.root.dataset.theme, 'dark');
    f.select('light'); assert.equal(f.root.dataset.theme, 'light');
});
test('preference synchronizes across tabs and storage clear', () => {
    const f = fixture({ defaultTheme: 'light' }); f.storage('archive-theme', 'dark'); assert.equal(f.root.dataset.theme, 'dark');
    f.storage(null, null); assert.equal(f.root.dataset.theme, 'light');
});
