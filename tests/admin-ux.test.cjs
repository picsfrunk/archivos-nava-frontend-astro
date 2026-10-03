const { test } = require('node:test');
const assert = require('node:assert/strict');

// Verify safe redirect validation rules
function resolveSafeRedirect(rawRedirect) {
    return (typeof rawRedirect === 'string' && rawRedirect.startsWith('/admin') && !rawRedirect.startsWith('/admin/login'))
        ? rawRedirect
        : '/admin/photos';
}

function buildRedirectToLoginUrl({ currentPath, expired = false, redirectUrl } = {}) {
    let target = redirectUrl;
    if (!target && currentPath) {
        const [pathname] = currentPath.split('?');
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            target = currentPath;
        }
    }

    const params = new URLSearchParams();
    if (expired) {
        params.set('expired', '1');
    }
    if (target) {
        params.set('redirect', target);
    }

    const query = params.toString();
    return query ? `/admin/login?${query}` : '/admin/login';
}

test('safe redirect allows valid internal admin destinations', () => {
    assert.equal(resolveSafeRedirect('/admin/photos'), '/admin/photos');
    assert.equal(resolveSafeRedirect('/admin/photos/new'), '/admin/photos/new');
    assert.equal(resolveSafeRedirect('/admin/photos/edit?id=123'), '/admin/photos/edit?id=123');
    assert.equal(resolveSafeRedirect('/admin/categories'), '/admin/categories');
    assert.equal(resolveSafeRedirect('/admin/advanced/settings'), '/admin/advanced/settings');
});

test('safe redirect blocks open redirects and redirect loops', () => {
    assert.equal(resolveSafeRedirect('https://evil.com'), '/admin/photos');
    assert.equal(resolveSafeRedirect('//evil.com'), '/admin/photos');
    assert.equal(resolveSafeRedirect('/gallery'), '/admin/photos');
    assert.equal(resolveSafeRedirect('/admin/login'), '/admin/photos');
    assert.equal(resolveSafeRedirect('/admin/login?redirect=/admin'), '/admin/photos');
    assert.equal(resolveSafeRedirect(''), '/admin/photos');
    assert.equal(resolveSafeRedirect(null), '/admin/photos');
});

test('buildRedirectToLoginUrl produces expected URLs for expired session', () => {
    assert.equal(buildRedirectToLoginUrl(), '/admin/login');
    assert.equal(buildRedirectToLoginUrl({ expired: true }), '/admin/login?expired=1');
    assert.equal(
        buildRedirectToLoginUrl({ expired: true, currentPath: '/admin/photos/edit?id=xyz123' }),
        '/admin/login?expired=1&redirect=%2Fadmin%2Fphotos%2Fedit%3Fid%3Dxyz123'
    );
    assert.equal(
        buildRedirectToLoginUrl({ expired: true, currentPath: '/admin/categories' }),
        '/admin/login?expired=1&redirect=%2Fadmin%2Fcategories'
    );
    // Does not redirect back to /admin/login
    assert.equal(
        buildRedirectToLoginUrl({ expired: true, currentPath: '/admin/login' }),
        '/admin/login?expired=1'
    );
});
