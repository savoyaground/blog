<!--
══════════════════════════════════════════════════════════════════
BLOG TEMPLATE: TABLE OF CONTENTS (CMS)
══════════════════════════════════════════════════════════════════

Desktop
H2 → .article-toc-link
H3 → .article-toc-sublink

Mobile
H2 → .mobile-article-toc-link
H3 → Hidden

Features
✓ Auto-generate TOC
✓ Smooth scrolling
✓ Active states
✓ Mobile active parent H2 while scrolling H3 sections

══════════════════════════════════════════════════════════════════
-->

<script>
  document.addEventListener('DOMContentLoaded', function () {
    /* ==================================================
     STICKY SIDEBAR
  ================================================== */

    const sidebar = document.querySelector('.sidebar');
    const sticky = document.querySelector('.article-sticky');

    if (sidebar) {
      sidebar.style.alignSelf = 'stretch';
      sidebar.style.height = 'auto';
    }

    if (sticky) {
      sticky.style.position = 'sticky';
      sticky.style.top = '96px';
      sticky.style.alignSelf = 'flex-start';
      sticky.style.zIndex = '10';
    }

    /* ==================================================
     SELECT ARTICLE HEADINGS

     H2 = Main TOC Item
     H3 = Sub TOC Item
  ================================================== */

    const headings = document.querySelectorAll('.blog-body-copy h2, .blog-body-copy h3');

    /* ==================================================
     SELECT TOC CONTAINERS

     Desktop:
     .article-list.article-toc

     Mobile:
     .mobile-article-list
  ================================================== */

    const tocContainers = [document.querySelector('.article-list.article-toc'), document.querySelector('.mobile-article-list')].filter(Boolean);

    if (!headings.length || !tocContainers.length) return;

    /* ==================================================
     CLEAR EXISTING PLACEHOLDER LINKS
  ================================================== */

    tocContainers.forEach(function (container) {
      container.innerHTML = '';
    });

    /* ==================================================
     GENERATE TOC LINKS
  ================================================== */

    headings.forEach(function (heading, index) {
      const fullText = heading.textContent.trim();

      if (!fullText) return;

      /* ==================================================
       CREATE ID FROM HEADING
    ================================================== */

      let id = fullText

        .toLowerCase()

        .replace(/[^a-z0-9\s-]/g, '')

        .replace(/\s+/g, '-')

        .replace(/-+/g, '-');

      if (!id) {
        id = 'section-' + (index + 1);
      }

      heading.id = id;

      /* ==================================================
       DETERMINE H3 SUBHEADING
    ================================================== */

      const isSubheading = heading.tagName === 'H3';

      /* ==================================================
       MOBILE TEXT TRUNCATION
    ================================================== */

      const mobileText = fullText

        .split(' ')

        .slice(0, 3)

        .join(' ');

      const truncatedText = fullText.split(' ').length > 3 ? mobileText + '...' : mobileText;

      /* ==================================================
       GENERATE LINKS
    ================================================== */

      tocContainers.forEach(function (container) {
        const isMobile = container.classList.contains('mobile-article-list');

        /* ==================================================
         HIDE H3 ON MOBILE
      ================================================== */

        if (isMobile && isSubheading) return;

        const link = document.createElement('a');

        link.href = '#' + id;

        /* ==================================================
         MOBILE LINKS
      ================================================== */

        if (isMobile) {
          link.className = 'mobile-article-toc-link';

          link.textContent = truncatedText;
        } else {
          /* ==================================================
         DESKTOP LINKS
      ================================================== */
          link.className = isSubheading ? 'article-toc-sublink' : 'article-toc-link';

          link.textContent = fullText;
        }

        container.appendChild(link);
      });
    });

    /* ==================================================
     SELECT ALL GENERATED LINKS
  ================================================== */

    const allTocLinks = document.querySelectorAll('.article-toc-link,' + '.article-toc-sublink,' + '.mobile-article-toc-link');

    /* ==================================================
     SMOOTH SCROLL
  ================================================== */

    allTocLinks.forEach(function (link) {
      link.addEventListener(
        'click',

        function (event) {
          event.preventDefault();

          const targetId = link

            .getAttribute('href')

            .replace('#', '');

          const targetHeading = document.getElementById(targetId);

          if (!targetHeading) return;

          const navOffset = 96;

          const targetPosition = targetHeading.getBoundingClientRect().top + window.pageYOffset - navOffset;

          window.scrollTo({
            top: targetPosition,

            behavior: 'smooth',
          });
        },
      );
    });

    /* ==================================================
     FIND PARENT H2
     (Used for Mobile Active States)
  ================================================== */

    function getParentH2Id(heading) {
      if (heading.tagName === 'H2') return heading.id;

      let previous = heading.previousElementSibling;

      while (previous) {
        if (previous.tagName === 'H2') return previous.id;

        previous = previous.previousElementSibling;
      }

      return '';
    }

    /* ==================================================
     ACTIVE STATE SCROLLSPY
  ================================================== */

    function updateActiveTocLink() {
      let currentHeadingId = '';

      let currentMobileParentId = '';

      headings.forEach(function (heading) {
        if (heading.getBoundingClientRect().top <= 120) {
          currentHeadingId = heading.id;

          currentMobileParentId = getParentH2Id(heading);
        }
      });

      allTocLinks.forEach(function (link) {
        link.classList.remove('is-active');

        const href = link.getAttribute('href');

        /* ==================================================
         MOBILE ACTIVE STATE
      ================================================== */

        if (link.classList.contains('mobile-article-toc-link') && href === '#' + currentMobileParentId) {
          link.classList.add('is-active');
        }

        /* ==================================================
         DESKTOP ACTIVE STATE
      ================================================== */

        if (!link.classList.contains('mobile-article-toc-link') && href === '#' + currentHeadingId) {
          link.classList.add('is-active');
        }
      });
    }

    /* ==================================================
     INITIALIZE SCROLLSPY
  ================================================== */

    updateActiveTocLink();

    window.addEventListener(
      'scroll',

      updateActiveTocLink,
    );
  });
</script>

<!--
══════════════════════════════════════════════════════════════════
READING PROGRESS BAR
══════════════════════════════════════════════════════════════════
-->

<script>
  document.addEventListener('DOMContentLoaded', function () {
    const progressFill = document.querySelector('.reading-progress-fill');

    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      progressFill.style.width = scrollPercent + '%';
    });
  });
</script>

<!--
══════════════════════════════════════════════════════════════════
ARTICLE PROGRESS BAR 
══════════════════════════════════════════════════════════════════
-->

<script>
  document.addEventListener('DOMContentLoaded', function () {
    const progressFill = document.querySelector('.toc-progress-fill');
    const progressText = document.querySelector('.toc-progress-percentage');
    const footer = document.querySelector('.footer');

    if (!progressFill || !progressText) return;

    function updateTocProgress() {
      const scrollTop = window.scrollY;

      const footerHeight = footer ? footer.offsetHeight : 0;

      const readableHeight = document.documentElement.scrollHeight - window.innerHeight - footerHeight;

      let progress = (scrollTop / readableHeight) * 100;

      progress = Math.max(0, Math.min(100, progress));

      progressFill.style.width = progress + '%';
      progressText.textContent = Math.round(progress) + '% read';
    }

    updateTocProgress();

    window.addEventListener('scroll', updateTocProgress);
    window.addEventListener('resize', updateTocProgress);
  });
</script>

<!--
══════════════════════════════════════════════════════════════════
SHARE
══════════════════════════════════════════════════════════════════
-->

<script>
  document.addEventListener('DOMContentLoaded', function () {
    const pageUrl = window.location.href;
    const pageTitle = document.title;

    const linkedinButton = document.querySelector('.share-linkedin');
    const instagramButton = document.querySelector('.share-instagram');
    const nativeShareButton = document.querySelector('.share-native');

    function copyPageLink() {
      navigator.clipboard.writeText(pageUrl);
      alert('Article link copied');
    }

    if (linkedinButton) {
      linkedinButton.addEventListener('click', function () {
        const linkedinUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(pageUrl);

        window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
      });
    }

    if (instagramButton) {
      instagramButton.addEventListener('click', copyPageLink);
    }

    if (nativeShareButton) {
      nativeShareButton.addEventListener('click', function () {
        if (navigator.share) {
          navigator.share({
            title: pageTitle,
            url: pageUrl,
          });
        } else {
          copyPageLink();
        }
      });
    }
  });
</script>

<!--
══════════════════════════════════════════════════════════════════
FADE IN ANIMATION - GLOBAL
══════════════════════════════════════════════════════════════════
-->

<script>
  document.addEventListener('DOMContentLoaded', function () {
    const fadeSections = document.querySelectorAll('.fade-section');

    if (!fadeSections.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    fadeSections.forEach(function (section) {
      observer.observe(section);
    });
  });
</script>
