const CACHE_NAME = 'gamma-pomodoro-v1';

// キャッシュするファイル一覧
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './focus.mp3',
    './rest.mp3',
    './icon/icon-192.jpg',
    './icon/icon-512.jpg'
];

// インストール時：全アセットをキャッシュ
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching all assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            )
        )
    );
    self.clients.claim();
});

// フェッチ時：キャッシュ優先（オフライン対応）
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                // レスポンスをキャッシュにも追加（動的キャッシュ）
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            }).catch(() => {
                // オフラインでキャッシュもない場合はindex.htmlを返す
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
