(() => {
  'use strict';

  // Public, project-scoped founder profile data only.
  // Portraits are deterministic crops of approved Last Bench identity-card sources.
  // No private Founder DR.X / Second Brain context is shipped to the browser.
  window.LB_FOUNDER_PROFILES = Object.freeze({
    sayem: Object.freeze({
      key: 'sayem',
      name: 'Sayem Ahmed',
      title: 'Co-founder & Chief Executive Officer',
      alias: '',
      portrait: './assets/founders/sayem-ahmed.jpg',
      links: Object.freeze([
        { label: 'Last Bench', href: 'https://lastbenchbd.com' }
      ])
    }),
    fahim: Object.freeze({
      key: 'fahim',
      name: 'Fahim Shahbaz Mahmud',
      title: 'Co-founder & Chief Operating Officer',
      alias: '',
      portrait: './assets/founders/fahim-shahbaz-mahmud.jpg',
      links: Object.freeze([
        { label: 'LinkedIn', href: 'https://bd.linkedin.com/in/fahim-shahbaz-mahmud-765255124' },
        { label: 'Last Bench', href: 'https://lastbenchbd.com' }
      ])
    }),
    erfan: Object.freeze({
      key: 'erfan',
      name: 'Erfan Uddin',
      title: 'Co-founder & Chief Business & Innovation Officer',
      alias: 'Also known as Dr. X',
      portrait: './assets/founders/erfan-uddin.jpg',
      links: Object.freeze([
        { label: 'Last Bench', href: 'https://lastbenchbd.com' }
      ])
    })
  });
})();
