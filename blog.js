/* ==================================================
   BLOG TEMPLATE MASTER SCRIPT
================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initStickySidebar();
  initReadingProgress();
  initTocProgress();
  initShare();
  initFadeSections();
});

window.addEventListener('load', function () {
  setTimeout(initTOC, 250);
});

/* ==================================================
   STICKY SIDEBAR
================================================== */

function initStickySidebar() {
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
}

/* ==================================================
   TABLE OF CONTENTS
================================================== */

function initTOC() {
  const headings = document.querySelectorAll(
    '.blog-body-copy h2, .blog-body-copy h3'
  );

  const tocContainers = [
    document.querySelector('.article-list.article-toc'),
    document.querySelector('.mobile-article-list'),
  ].filter(Boolean);

  if (!headings.length || !tocContainers.length) return;

  tocContainers.forEach(function (container) {
    container.innerHTML = '';
  });

  headings.forEach(function (heading, index) {
    const fullText = heading.textContent.trim();

    if (!fullText) return;

    let id = fullText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (!id) {
      id = 'section-' + (index + 1);
    }

    heading.id = id;

    const isSubheading = heading.tagName === 'H3';

    const mobileText = fullText.split(' ').slice(0, 3).join(' ');
    const truncatedText =
      fullText.split(' ').length > 3 ? mobileText + '...' : mobileText;

    tocContainers.forEach(function (container) {
      const isMobile = container.classList.contains(
        'mobile-article-list'
      );

      if (isMobile && isSubheading) return;

      const link = document.createElement('a');

      link.href = '#' + id;

      if (isMobile) {
        link.className = 'mobile-article-toc-link';
        link.textContent = truncatedText;
      } else {
        link.className = isSubheading
          ? 'article-toc-sublink'
          : 'article-toc-link';

        link.textContent = fullText;
      }

      container.appendChild(link);
    });
  });

  const allTocLinks = document.querySelectorAll(
    '.article-toc-link, .article-toc-sublink, .mobile-article-toc-link'
  );

  /*
   * Calculates the fixed navigation height plus approximately
   * two line heights of additional spacing above the heading.
   */
  function getHeadingScrollOffset(heading) {
    const navOffset = 96;
    const headingStyles = window.getComputedStyle(heading);

    let headingLineHeight = parseFloat(headingStyles.lineHeight);

    /*
     * Some browsers may return "normal" instead of a pixel value.
     * In that case, estimate the line height from the font size.
     */
    if (Number.isNaN(headingLineHeight)) {
      const headingFontSize =
        parseFloat(headingStyles.fontSize) || 32;

      headingLineHeight = headingFontSize * 1.2;
    }

    const titleSpacing = headingLineHeight * 3;

    return navOffset + titleSpacing;
  }

  allTocLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();

      const targetId = link
        .getAttribute('href')
        .replace('#', '');

      const targetHeading = document.getElementById(targetId);

      if (!targetHeading) return;

      const scrollOffset =
        getHeadingScrollOffset(targetHeading);

      const targetPosition =
        targetHeading.getBoundingClientRect().top +
        window.pageYOffset -
        scrollOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      /*
       * Updates the URL hash without triggering the browser's
       * default anchor jump.
       */
      window.history.replaceState(
        null,
        '',
        '#' + targetId
      );
    });
  });

  function getParentH2Id(heading) {
    if (heading.tagName === 'H2') {
      return heading.id;
    }

    let previous = heading.previousElementSibling;

    while (previous) {
      if (previous.tagName === 'H2') {
        return previous.id;
      }

      previous = previous.previousElementSibling;
    }

    return '';
  }

  function updateActiveTocLink() {
    let currentHeadingId = '';
    let currentMobileParentId = '';

    headings.forEach(function (heading) {
      const activeOffset =
        getHeadingScrollOffset(heading) + 8;

      if (
        heading.getBoundingClientRect().top <= activeOffset
      ) {
        currentHeadingId = heading.id;
        currentMobileParentId = getParentH2Id(heading);
      }
    });

    allTocLinks.forEach(function (link) {
      link.classList.remove('is-active');

      const href = link.getAttribute('href');

      if (
        link.classList.contains(
          'mobile-article-toc-link'
        ) &&
        href === '#' + currentMobileParentId
      ) {
        link.classList.add('is-active');
      }

      if (
        !link.classList.contains(
          'mobile-article-toc-link'
        ) &&
        href === '#' + currentHeadingId
      ) {
        link.classList.add('is-active');
      }
    });
  }

  updateActiveTocLink();

  window.addEventListener(
    'scroll',
    updateActiveTocLink
  );

  window.addEventListener(
    'resize',
    updateActiveTocLink
  );
}

/* ==================================================
   READING PROGRESS BAR
================================================== */

function initReadingProgress() {
  const progressFill = document.querySelector(
    '.reading-progress-fill'
  );

  if (!progressFill) return;

  function updateReadingProgress() {
    const scrollTop = window.scrollY;

    const docHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const scrollPercent =
      docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    progressFill.style.width =
      Math.max(0, Math.min(100, scrollPercent)) + '%';
  }

  updateReadingProgress();

  window.addEventListener(
    'scroll',
    updateReadingProgress
  );

  window.addEventListener(
    'resize',
    updateReadingProgress
  );
}

/* ==================================================
   ARTICLE PROGRESS BAR
================================================== */

function initTocProgress() {
  const progressFill = document.querySelector(
    '.toc-progress-fill'
  );

  const progressText = document.querySelector(
    '.toc-progress-percentage'
  );

  const footer = document.querySelector('.footer');

  if (!progressFill || !progressText) return;

  function updateTocProgress() {
    const scrollTop = window.scrollY;
    const footerHeight = footer
      ? footer.offsetHeight
      : 0;

    const readableHeight =
      document.documentElement.scrollHeight -
      window.innerHeight -
      footerHeight;

    let progress =
      readableHeight > 0
        ? (scrollTop / readableHeight) * 100
        : 0;

    progress = Math.max(
      0,
      Math.min(100, progress)
    );

    progressFill.style.width = progress + '%';
    progressText.textContent =
      Math.round(progress) + '% read';
  }

  updateTocProgress();

  window.addEventListener(
    'scroll',
    updateTocProgress
  );

  window.addEventListener(
    'resize',
    updateTocProgress
  );
}

/* ==================================================
   SHARE
================================================== */

function initShare() {
  const pageUrl = window.location.href;
  const pageTitle = document.title;

  const linkedinButton = document.querySelector(
    '.share-linkedin'
  );

  const instagramButton = document.querySelector(
    '.share-instagram'
  );

  const nativeShareButton = document.querySelector(
    '.share-native'
  );

  function copyPageLink() {
    navigator.clipboard
      .writeText(pageUrl)
      .then(function () {
        alert('Article link copied');
      })
      .catch(function () {
        alert('Unable to copy the article link');
      });
  }

  if (linkedinButton) {
    linkedinButton.addEventListener(
      'click',
      function () {
        const linkedinUrl =
          'https://www.linkedin.com/sharing/share-offsite/?url=' +
          encodeURIComponent(pageUrl);

        window.open(
          linkedinUrl,
          '_blank',
          'noopener,noreferrer'
        );
      }
    );
  }

  if (instagramButton) {
    instagramButton.addEventListener(
      'click',
      copyPageLink
    );
  }

  if (nativeShareButton) {
    nativeShareButton.addEventListener(
      'click',
      function () {
        if (navigator.share) {
          navigator
            .share({
              title: pageTitle,
              url: pageUrl,
            })
            .catch(function () {
              /* User canceled the native share dialog. */
            });
        } else {
          copyPageLink();
        }
      }
    );
  }
}

/* ==================================================
   FADE IN ANIMATION - GLOBAL
================================================== */

function initFadeSections() {
  const fadeSections = document.querySelectorAll(
    '.fade-section'
  );

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
    }
  );

  fadeSections.forEach(function (section) {
    observer.observe(section);
  });
}
