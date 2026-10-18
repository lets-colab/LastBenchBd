// Preserve links shared before Malaysia moved to its own route.
(() => {
  const anchors = new Set(['#lb-education', '#lb-malaysia-service', '#universities', '#signup', '#lb-beyond-arrival']);
  const route = () => { if (anchors.has(location.hash)) location.replace('./malaysia/' + location.search + location.hash); };
  route();
  window.addEventListener('hashchange', route);
})();
