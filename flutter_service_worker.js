'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "6413e47e81b79943af624cb06e4f4829",
"assets/assets/fonts/CustomIcons.ttf": "ce50ecf6b3e3b7d5a1e819d02ce4f48c",
"assets/assets/fonts/impact.ttf": "f12902024f7b77ee4c34557ee6f3818b",
"assets/assets/fonts/Raleway-VariableFont_wght.ttf": "e2c3271576c410d8b097ed9809cb6539",
"assets/assets/i18n/en.json": "04154b7a5b6b1b19d779feee2dbb94a4",
"assets/assets/i18n/es.json": "1c20a910660142acf89d9661e398d966",
"assets/assets/images/fullhb.jpg": "0f3968107daac44bc5531ff653975ec5",
"assets/assets/images/fullhb_1.jpg": "bb292a7b3f0f062c39cc14ffc455e1a2",
"assets/assets/images/fullhb_2.jpg": "d8ba74e334d0cc65fe305fe31505a25c",
"assets/assets/images/fullhb_mirror.jpg": "5269e0438527c327e5b8910f35d11379",
"assets/assets/images/fullhb_mirror_1.jpg": "97994dbfa3f3889ad2ef42db9b0d42c9",
"assets/assets/images/fullhb_mirror_2.jpg": "f98ee3610a1909465cffcdbf99edaf08",
"assets/assets/images/halfhb_down.jpg": "770189396c6c349f1e01b40f9ec0e928",
"assets/assets/images/halfhb_down_1.jpg": "a78f7543426b7b1e12ab9253a340427f",
"assets/assets/images/halfhb_down_2.jpg": "c17fffe6b04715eca399f163557ea0af",
"assets/FontManifest.json": "1c4c846c26abba03bc23a79afb09b2a0",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "aedb934c925989bcc61aa9afba6abf5d",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "62b9906717d7215a6ff4cc24efbd1b5c",
"canvaskit/canvaskit.wasm": "b179ba02b7a9f61ebc108f82c5a1ecdb",
"canvaskit/profiling/canvaskit.js": "3783918f48ef691e230156c251169480",
"canvaskit/profiling/canvaskit.wasm": "6d1b0fc1ec88c3110db88caa3393c580",
"favicon.png": "58163a95b2073c4dbad49530984cfe4e",
"icons/Icon-192.png": "9d3e75246566ebfd79c030397441b6a8",
"icons/Icon-192_old.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "22baa104eca3dc10c660fb8290597088",
"icons/Icon-512_old.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "1e769ee2bf327ed9f66c27f5b1f169c3",
"/": "1e769ee2bf327ed9f66c27f5b1f169c3",
"main.dart.js": "ce505816cc28808069c034be706724e3",
"manifest.json": "66abb3057ac18978ab85948b71ca05eb",
"version.json": "3672c55fed90fa63309c3feb039338ab"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
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
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
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
