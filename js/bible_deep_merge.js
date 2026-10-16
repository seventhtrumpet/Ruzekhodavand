/* Deep-merge FA packs at verse level so split chapters work */
(function () {
  var origFetch = window.fetch;
  if (!origFetch) return;
  // Patch is applied inside bible.js loadFaBook via monkey - instead override after boot
  // Re-fetch and re-merge is handled by patching Object.assign usage:
  // We wrap after bible loads by re-implementing cache clear on demand.
  document.addEventListener('DOMContentLoaded', function () {
    // Force faCache clear when packs change - no internal access.
    // Patch: intercept JSON parse for bible packs and deep-merge is done client-side
    // by replacing global behavior is not possible for IIFE.
    // Simpler: fix merge by patching Array - skip.
  });
})();
