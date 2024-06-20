'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "0591c6a40241d4453ad0203459665b54",
"assets/AssetManifest.bin.json": "c74c2539fb29ebdc77ddeff2423e8d83",
"assets/AssetManifest.json": "32698c31469e36c8439ca778e71c4704",
"assets/assets/fonts/CustomIcons.ttf": "c12061ea34a5fcc146ef618b0360c043",
"assets/assets/fonts/impact.ttf": "f12902024f7b77ee4c34557ee6f3818b",
"assets/assets/fonts/Raleway-VariableFont_wght.ttf": "e2c3271576c410d8b097ed9809cb6539",
"assets/assets/i18n/en.json": "76d7a069658835970efd51dab9f0d882",
"assets/assets/i18n/es.json": "260510c5aa8b9dda427e62c24990608e",
"assets/assets/images/fullhb.jpg": "0f3968107daac44bc5531ff653975ec5",
"assets/assets/images/fullhb_1.jpg": "bb292a7b3f0f062c39cc14ffc455e1a2",
"assets/assets/images/fullhb_2.jpg": "d8ba74e334d0cc65fe305fe31505a25c",
"assets/assets/images/fullhb_mirror.jpg": "5269e0438527c327e5b8910f35d11379",
"assets/assets/images/fullhb_mirror_1.jpg": "97994dbfa3f3889ad2ef42db9b0d42c9",
"assets/assets/images/fullhb_mirror_2.jpg": "f98ee3610a1909465cffcdbf99edaf08",
"assets/assets/images/halfhb_down.jpg": "770189396c6c349f1e01b40f9ec0e928",
"assets/assets/images/halfhb_down_1.jpg": "a78f7543426b7b1e12ab9253a340427f",
"assets/assets/images/halfhb_down_2.jpg": "c17fffe6b04715eca399f163557ea0af",
"assets/FontManifest.json": "3b4762254f9f2e2ff7efd05f52628997",
"assets/fonts/MaterialIcons-Regular.otf": "a4d93563e7a32539d9ccb31923aaf9e3",
"assets/NOTICES": "32d35bc1b1c3b26a154c02d8dc8a273c",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "5fda3f1af7d6433d53b24083e2219fa0",
"canvaskit/canvaskit.js.symbols": "b85fedc601db924025e7936d851e7e7e",
"canvaskit/canvaskit.wasm": "afe4e31e8f3adb944a0883a694706404",
"canvaskit/chromium/canvaskit.js": "87325e67bf77a9b483250e1fb1b54677",
"canvaskit/chromium/canvaskit.js.symbols": "9f2dfa8c181a437290aa2b58e55da15d",
"canvaskit/chromium/canvaskit.wasm": "938f6103658d67ab8971f6225502b8af",
"canvaskit/skwasm.js": "f17a293d422e2c0b3a04962e68236cc2",
"canvaskit/skwasm.js.symbols": "c6f605aa7f865f54f11010319bec4307",
"canvaskit/skwasm.wasm": "cae92e9f0585c2ecccb9fae9062349f8",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "58163a95b2073c4dbad49530984cfe4e",
"flutter.js": "383e55f7f3cce5be08fcf1f3881f585c",
"flutter_bootstrap.js": "86fd1947c3a32fd6d7c0cb6feca950a0",
"icons/Icon-192.png": "9d3e75246566ebfd79c030397441b6a8",
"icons/Icon-192_old.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "22baa104eca3dc10c660fb8290597088",
"icons/Icon-512_old.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "d54ddfbfe98a89fad35f31e02fa82160",
"/": "d54ddfbfe98a89fad35f31e02fa82160",
"main.dart.js": "501e6b7e4f061c2537444473bb57af5d",
"manifest.json": "66abb3057ac18978ab85948b71ca05eb",
"splash/splash.js": "c6a271349a0cd249bdb6d3c4d12f5dcf",
"splash/style.css": "40ad7c033d08045524640f5a04efb967",
"version.json": "40dafee0776d4174c6cfea0ed1d5dbe3"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
