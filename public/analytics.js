(function () {
  var GA_ID = 'G-JM3HGZJM04';
  var GTM_ID = 'GTM-N5CK6BH8';
  var initialized = false;
  var idleCallbackId;
  var fallbackTimeoutId;
  var idleScheduled = false;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function insertGtmScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID + '&l=dataLayer';
    script.onerror = function (error) {
      console.error('Falha ao carregar Google Tag Manager.', error);
    };
    document.head.appendChild(script);
  }

  function initAnalytics() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (typeof window.cancelIdleCallback === 'function' && idleCallbackId) {
      window.cancelIdleCallback(idleCallbackId);
      idleCallbackId = null;
    }

    if (fallbackTimeoutId) {
      clearTimeout(fallbackTimeoutId);
      fallbackTimeoutId = null;
    }

    idleScheduled = false;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID)
      .catch(function (error) {
        console.error('Falha ao carregar gtag.js.', error);
      });

    insertGtmScript();

    removeInteractionListeners();
  }

  function scheduleIdleInit() {
    if (idleScheduled) {
      return;
    }

    idleScheduled = true;

    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(function () {
        initAnalytics();
      }, { timeout: 5000 });
    } else {
      fallbackTimeoutId = window.setTimeout(initAnalytics, 5000);
    }
  }

  function onFirstInteraction() {
    initAnalytics();
  }

  var interactionEvents = ['click', 'keydown', 'pointerdown', 'touchstart'];
  var supportsOptions = false;
  var interactionOptions = false;

  try {
    var noop = function () { };
    var opts = Object.defineProperty({}, 'once', {
      get: function () {
        supportsOptions = true;
      }
    });
    window.addEventListener('app-analytics-test', noop, opts);
    window.removeEventListener('app-analytics-test', noop, opts);
  } catch (error) {
    supportsOptions = false;
  }

  if (supportsOptions) {
    interactionOptions = { once: true, passive: true };
  }

  var listenersAttached = false;

  function addInteractionListeners() {
    if (listenersAttached) {
      return;
    }

    interactionEvents.forEach(function (eventName) {
      document.addEventListener(eventName, onFirstInteraction, interactionOptions);
    });

    listenersAttached = true;
  }

  function removeInteractionListeners() {
    if (!listenersAttached) {
      return;
    }

    interactionEvents.forEach(function (eventName) {
      document.removeEventListener(eventName, onFirstInteraction, interactionOptions);
    });

    listenersAttached = false;
  }

  function enableAutoStart() {
    scheduleIdleInit();
    addInteractionListeners();
  }

  function cancelIdleInit() {
    if (typeof window.cancelIdleCallback === 'function' && idleCallbackId) {
      window.cancelIdleCallback(idleCallbackId);
      idleCallbackId = null;
    }

    if (fallbackTimeoutId) {
      clearTimeout(fallbackTimeoutId);
      fallbackTimeoutId = null;
    }

    removeInteractionListeners();

    idleScheduled = false;
  }

  var shouldAutoStart = window.APP_ANALYTICS_AUTO_START !== false;

  window.appAnalytics = window.appAnalytics || {};
  window.appAnalytics.init = initAnalytics;
  window.appAnalytics.isInitialized = function () {
    return initialized;
  };
  window.appAnalytics.enableAutoStart = function () {
    if (!initialized) {
      enableAutoStart();
    }
  };
  window.appAnalytics.cancelAutoStart = function () {
    cancelIdleInit();
  };

  if (shouldAutoStart) {
    enableAutoStart();
  }
})();
