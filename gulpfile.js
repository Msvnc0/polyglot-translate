const fs = require("fs");
const process = require("process");

const gulp = require("gulp");
const zip = require("gulp-zip");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");

const crx3 = require("crx3");

const remoteSourceMaps =
  process.argv[2] === "--local-sourcemaps" ? false : true;
const version = JSON.parse(
  fs.readFileSync("src/manifest.json", "utf8")
).version;

const chromium_folder_name = `Polyglot_${version}_Chromium`;
const firefox_folder_name = `Polyglot_${version}_Firefox`;
const firefox_selfhosted_folder_name = `Polyglot_${version}_Firefox_selfhosted`;

const mappath = `../maps/${version}`;
const mapconfig = remoteSourceMaps
  ? {
      sourceMappingURLPrefix:
        "https://raw.githubusercontent.com/polyglot-translate/polyglot-source-maps/main",
    }
  : null;

const babelConfig = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          firefox: "64",
          chrome: "70",
        },
        // corejs: 3,
        // useBuiltIns: "usage",
      },
    ],
  ],
  plugins: [
    // ["@babel/plugin-transform-runtime"],
    // ["@babel/plugin-syntax-dynamic-import"],
  ],
};

gulp.task("clean", (cb) => {
  fs.rmSync("build", { recursive: true, force: true });
  cb();
});

gulp.task("firefox-copy", () => {
  return gulp
    .src(["src/**/**"], {encoding: false})
    .pipe(gulp.dest(`build/${firefox_folder_name}`));
});

gulp.task("firefox-babel", () => {
  return Promise.all([
    new Promise((resolve, reject) => {
      gulp
        .src([`build/${firefox_folder_name}/background/*.js`], {encoding: false})
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(sourcemaps.write(mappath, mapconfig))
        .on("error", reject)
        .pipe(gulp.dest(`build/${firefox_folder_name}/background`))
        .on("end", resolve);
    }),
    new Promise((resolve, reject) => {
      gulp
        .src([`build/${firefox_folder_name}/lib/*.js`], {encoding: false})
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(sourcemaps.write(mappath, mapconfig))
        .on("error", reject)
        .pipe(gulp.dest(`build/${firefox_folder_name}/lib`))
        .on("end", resolve);
    }),
    new Promise((resolve, reject) => {
      gulp
        .src([`build/${firefox_folder_name}/contentScript/*.js`], {encoding: false})
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(sourcemaps.write(mappath, mapconfig))
        .on("error", reject)
        .pipe(gulp.dest(`build/${firefox_folder_name}/contentScript`))
        .on("end", resolve);
    }),
    new Promise((resolve, reject) => {
      gulp
        .src([`build/${firefox_folder_name}/options/*.js`], {encoding: false})
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(sourcemaps.write(mappath, mapconfig))
        .on("error", reject)
        .pipe(gulp.dest(`build/${firefox_folder_name}/options`))
        .on("end", resolve);
    }),
    new Promise((resolve, reject) => {
      gulp
        .src([`build/${firefox_folder_name}/popup/*.js`], {encoding: false})
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(sourcemaps.write(mappath, mapconfig))
        .on("error", reject)
        .pipe(gulp.dest(`build/${firefox_folder_name}/popup`))
        .on("end", resolve);
    }),
  ]);
});

gulp.task("firefox-move-sourcemap", (cb) => {
  if (!remoteSourceMaps) {
    return cb();
  }
  return new Promise((resolve, reject) => {
    gulp
      .src([`build/${firefox_folder_name}/maps/**/*`], {encoding: false})
      .pipe(gulp.dest("build/maps"))
      .on("error", reject)
      .on("end", resolve);
  }).then(() => {
    fs.rmSync(`build/${firefox_folder_name}/maps`, {
      recursive: true,
      force: true,
    });
  });
});

gulp.task("firefox-self-hosted", (cb) => {
  return new Promise((resolve, reject) => {
    gulp
      .src([`build/${firefox_folder_name}/**/**`], {encoding: false})
      .pipe(gulp.dest(`build/${firefox_selfhosted_folder_name}`))
      .on("error", reject)
      .on("end", resolve);
  }).then(() => {
    const manifest = JSON.parse(
      fs.readFileSync(
        `build/${firefox_selfhosted_folder_name}/manifest.json`,
        "utf8"
      )
    );
    manifest.browser_specific_settings.gecko.update_url =
      "https://raw.githubusercontent.com/polyglot-translate/polyglot-translate/main/dist/firefox/updates.json";
    fs.writeFileSync(
      `build/${firefox_selfhosted_folder_name}/manifest.json`,
      JSON.stringify(manifest, null, 4),
      "utf8"
    );
  });
});

gulp.task("firefox-zip", () => {
  return gulp
    .src([`build/${firefox_folder_name}/**/*`], {encoding: false})
    .pipe(zip(`Polyglot_${version}_Firefox.zip`))
    .pipe(gulp.dest("build"));
});

gulp.task("firefox-self-hosted-zip", () => {
  return gulp
    .src([`build/${firefox_selfhosted_folder_name}/**/*`], {encoding: false})
    .pipe(zip(`Polyglot_${version}_Firefox_selfhosted.zip`))
    .pipe(gulp.dest("build"));
});

gulp.task("chrome-copy-from-firefox", () => {
  return gulp
    .src([`build/${firefox_folder_name}/**/**`], {encoding: false})
    .pipe(gulp.dest(`build/${chromium_folder_name}`));
});

gulp.task("chrome-rename", (cb) => {
  fs.renameSync(
    `build/${chromium_folder_name}/manifest.json`,
    `build/${chromium_folder_name}/firefox_manifest.json`
  );
  fs.renameSync(
    `build/${chromium_folder_name}/chrome_manifest.json`,
    `build/${chromium_folder_name}/manifest.json`
  );
  cb();
});

gulp.task("chrome-bundle-background", (cb) => {
  const bgFiles = [
    "/lib/polyfill.js",
    "/lib/checkedLastError.js",
    "/lib/stuff.js",
    "/lib/languages.js",
    "/lib/config.js",
    "/lib/platformInfo.js",
    "/lib/i18n.js",
    "/background/translationCache.js",
    "/background/translationService.js",
    "/background/textToSpeech.js",
    "/background/background.js",
  ];
  const shimCode = `// Polyglot Translate - Background Bundle (MV3)
"use strict";

var window = self, document = self, global = self;
if (typeof browser === 'undefined') var browser = chrome;

// --- matchMedia shim (not available in service workers) ---
var matchMedia = (typeof matchMedia !== 'undefined') ? matchMedia : function matchMediaShim(q) {
  var mql = { matches: false, media: q, onchange: null,
    addListener: function(){}, removeListener: function(){},
    addEventListener: function(){}, removeEventListener: function(){},
    dispatchEvent: function(){ return false; }
  };
  return mql;
};

// --- DOMParser shim (not available in service workers) ---
var DOMParser = (typeof DOMParser !== 'undefined') ? DOMParser : function DOMParserShim() {
  this.parseFromString = function(s, t) {
    var body = { childNodes: [], textContent: '', innerHTML: '' };
    var doc = {
      querySelectorAll: function(){ return []; }, querySelector: function(){ return null; },
      getElementsByTagName: function(){ return []; }, getElementById: function(){ return null; },
      documentElement: { textContent: '' }, body: body, head: { childNodes: [] }
    };
    return doc;
  };
};

// --- XMLHttpRequest -> fetch shim ---
if (typeof XMLHttpRequest === 'undefined') {
  var XMLHttpRequest = function XMLHttpRequestShim() {
    var _this = this, _method, _url, _headers = {}, _respHeaders = {};
    this.readyState = 0; this.status = 0; this.statusText = ''; this.responseText = '';
    this.response = null; this.responseType = ''; this.responseURL = '';
    this.timeout = 0; this.withCredentials = false;
    this.onreadystatechange = null; this.onload = null; this.onerror = null;
    this.onabort = null; this.ontimeout = null; this.upload = { addEventListener: function(){}, removeEventListener: function(){} };
    this.getResponseHeader = function(n) { return _respHeaders[n.toLowerCase()] || null; };
    this.getAllResponseHeaders = function() {
      return Object.keys(_respHeaders).map(function(k) { return k + ': ' + _respHeaders[k]; }).join('\\r\\n');
    };
    this.open = function(m, u) { _method = m; _url = u; _this.readyState = 1; };
    this.setRequestHeader = function(n, v) { _headers[n] = v; };
    this.overrideMimeType = function() {};
    this.send = function(body) {
      _this.readyState = 2;
      var opts = { method: _method, headers: _headers };
      if (body) opts.body = body;
      fetch(_url, opts).then(function(r) {
        _this.status = r.status; _this.statusText = r.statusText; _this.responseURL = r.url;
        _respHeaders = {}; r.headers.forEach(function(v,k) { _respHeaders[k] = v; });
        _this.getResponseHeader = function(n) { return _respHeaders[n.toLowerCase()] || null; };
        _this.getAllResponseHeaders = function() {
          return Object.keys(_respHeaders).map(function(k) { return k + ': ' + _respHeaders[k]; }).join('\\r\\n');
        };
        return r.text();
      }).then(function(t) {
        _this.responseText = t; _this.readyState = 4;
        if (_this.responseType === 'json') {
          try {
            var cleaned = t;
            if (cleaned.indexOf(')]}\\'\\n') === 0) cleaned = cleaned.substring(4);
            else if (cleaned.indexOf(')]}\\'\\r\\n') === 0) cleaned = cleaned.substring(6);
            else if (cleaned.indexOf(')]}\\'') === 0) cleaned = cleaned.substring(4);
            _this.response = JSON.parse(cleaned);
          } catch(e) {
            try { _this.response = JSON.parse(t); } catch(e2) { _this.response = null; }
          }
        } else {
          _this.response = t;
        }
        if (_this.onreadystatechange) _this.onreadystatechange();
        if (_this.onload) _this.onload();
      }).catch(function(e) {
        _this.readyState = 4; _this.status = 0;
        if (_this.onerror) _this.onerror(e);
      });
    };
    this.abort = function() { if (_this.onabort) _this.onabort(); };
  };
}

// --- Chrome MV3 API shims ---
if (typeof chrome !== 'undefined' && chrome.action) {
  var _noopListener = { addListener: function(){}, removeListener: function(){}, hasListener: function(){ return false; } };
  if (!chrome.browserAction) chrome.browserAction = chrome.action;
  if (!chrome.pageAction) chrome.pageAction = chrome.action;
  if (!chrome.browserAction.onClicked) chrome.browserAction.onClicked = _noopListener;
  if (!chrome.pageAction.onClicked) chrome.pageAction.onClicked = _noopListener;
}

`;
  let bundle = shimCode;
  for (const file of bgFiles) {
    const filePath = `build/${chromium_folder_name}${file}`;
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      if (content.startsWith('"use strict"') || content.startsWith("'use strict'")) {
        content = content.replace(/^(['"])use strict\1\s*;?\s*\n?/, "");
      }
      bundle += `// --- ${file} ---\n${content}\n\n`;
    } else {
      console.warn(`[chrome-bundle] File not found: ${filePath}`);
    }
  }
  const outPath = `build/${chromium_folder_name}/background/background-bundle.js`;
  fs.writeFileSync(outPath, bundle, "utf8");
  cb();
});

gulp.task("chrome-zip", () => {
  return gulp
    .src([`build/${chromium_folder_name}/**/**`], {encoding: false})
    .pipe(zip(`${chromium_folder_name}.zip`))
    .pipe(gulp.dest("build"));
});

gulp.task("chrome-sign", (cb) => {
  const dialog = require("node-file-dialog");

  if (process.argv[2] === "--sign") {
    return dialog({ type: "open-file" }).then((file) => {
      return crx3([`build/${chromium_folder_name}/manifest.json`], {
        keyPath: file[0],
        crxPath: `build/${chromium_folder_name}.crx`,
      });
    });
  } else {
    cb();
  }
});

gulp.task(
  "firefox-build",
  gulp.series(
    "firefox-copy",
    "firefox-babel",
    "firefox-move-sourcemap",
    "firefox-self-hosted",
    "firefox-zip",
    "firefox-self-hosted-zip"
  )
);
gulp.task(
  "chrome-build",
  gulp.series(
    "chrome-copy-from-firefox",
    "chrome-rename",
    "chrome-bundle-background",
    "chrome-zip",
    "chrome-sign"
  )
);

gulp.task("default", gulp.series("clean", "firefox-build", "chrome-build"));
