/* ==================================================
   BLOG TEMPLATE MASTER SCRIPT
================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initStickySidebar();
  initReadingProgress();
  initTocProgress();
  initShare();
  initFadeSections();
  initPrevNext();
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

/* ==================================================
   PREVIOUS / NEXT ARTICLE
   Order follows the /blog listing (newest first):
   "Previous" = the post above this one in the list (newer),
   "Next" = the post below it (older).
   1440px+: edge arrows with a hover preview.
   1439px and below: "Keep reading" cards; 991px and below also
   gets a sticky pager once the article body has been read.
================================================== */

var PN_LIST_URL = '/blog';
var PN_PAGE_PARAM = '3f15550f_page';
var PN_CACHE_KEY = 'svy-blog-index-v1';
var PN_CACHE_TTL = 60 * 60 * 1000; /* 1 hour */
var PN_MAX_PAGES = 40;

function initPrevNext() {
  var match = window.location.pathname.match(/\/blog\/([^\/?#]+)/);
  if (!match) return;

  var slug = decodeURIComponent(match[1]).toLowerCase();

  pnFindNeighbors(slug)
    .then(function (result) {
      if (!result || (!result.prev && !result.next)) return;
      pnRenderEdge(result.prev, result.next);
      pnRenderKeepReading(result.prev, result.next);
      pnRenderPager(result.prev, result.next);
      pnWatchScroll();
    })
    .catch(function () {
      /* Navigation is an enhancement; fail silently. */
    });
}

/* ---------- data ---------- */

function pnLoadCache() {
  try {
    var raw = window.localStorage.getItem(PN_CACHE_KEY);
    if (!raw) return null;
    var data = JSON.parse(raw);
    if (!data || Date.now() - data.t > PN_CACHE_TTL) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function pnSaveCache(cache) {
  try {
    window.localStorage.setItem(PN_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    /* Storage unavailable or full. */
  }
}

function pnParseListing(html) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var wrapper = doc.querySelector('.blog-wrapper') || doc;
  var items = [];

  wrapper.querySelectorAll('.blog-item').forEach(function (item) {
    var link = item.querySelector('a[href*="/blog/"]');
    if (!link) return;

    var href = link.getAttribute('href');
    var slugMatch = href.match(/\/blog\/([^\/?#]+)/);
    if (!slugMatch) return;

    var titleEl = item.querySelector('h4, h3, h2, [fs-cmsfilter-field="title"]');
    var thumbEl = item.querySelector('.blog-thumbnail:not(.w-condition-invisible)');
    var thumb = '';

    if (thumbEl) {
      var bg = (thumbEl.getAttribute('style') || '').match(/url\((['"]?)(.*?)\1\)/);
      if (bg) thumb = bg[2].replace(/&quot;/g, '');
    }

    items.push({
      slug: decodeURIComponent(slugMatch[1]).toLowerCase(),
      href: '/blog/' + slugMatch[1],
      title: titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '',
      thumb: thumb,
    });
  });

  return {
    items: items,
    hasNext: !!doc.querySelector('.blog-wrapper .w-pagination-next, .w-pagination-next'),
  };
}

function pnFetchPage(cache, page) {
  if (cache.pages[page]) return Promise.resolve(cache.pages[page]);

  var url = PN_LIST_URL + '?' + PN_PAGE_PARAM + '=' + page;

  return fetch(url, { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) throw new Error('Listing ' + response.status);
      return response.text();
    })
    .then(function (html) {
      var parsed = pnParseListing(html);
      cache.pages[page] = parsed;
      return parsed;
    });
}

function pnFindNeighbors(slug) {
  var cached = pnLoadCache();

  return pnSearch(slug, cached || { t: Date.now(), pages: {} }).then(function (result) {
    /* A stale cache can miss newly published posts: retry fresh once. */
    if (!result && cached) {
      return pnSearch(slug, { t: Date.now(), pages: {} });
    }
    return result;
  });
}

function pnSearch(slug, cache) {
  var page = 1;

  function step() {
    if (page > PN_MAX_PAGES) return null;

    /* Fetch up to three pages at a time to keep first visits quick. */
    var batch = [page, page + 1, page + 2];

    return Promise.all(
      batch.map(function (p) {
        return pnFetchPage(cache, p).catch(function () {
          return { items: [], hasNext: false };
        });
      })
    ).then(function () {
      for (var i = 0; i < batch.length; i++) {
        var p = batch[i];
        var current = cache.pages[p];
        if (!current || !current.items.length) break;

        var index = -1;
        current.items.forEach(function (item, j) {
          if (item.slug === slug) index = j;
        });

        if (index > -1) {
          var prev = null;
          var next = null;

          if (index > 0) {
            prev = current.items[index - 1];
          } else if (p > 1 && cache.pages[p - 1]) {
            var before = cache.pages[p - 1].items;
            prev = before[before.length - 1] || null;
          }

          if (index < current.items.length - 1) {
            next = current.items[index + 1];
            pnSaveCache(cache);
            return { prev: prev, next: next };
          }

          if (!current.hasNext) {
            pnSaveCache(cache);
            return { prev: prev, next: null };
          }

          return pnFetchPage(cache, p + 1)
            .then(function (after) {
              pnSaveCache(cache);
              return { prev: prev, next: after.items[0] || null };
            })
            .catch(function () {
              return { prev: prev, next: null };
            });
        }

        if (!current.hasNext) {
          pnSaveCache(cache);
          return null;
        }
      }

      page += batch.length;
      return step();
    });
  }

  return Promise.resolve().then(step);
}

/* ---------- markup helpers ---------- */

function pnEl(tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function pnThumb(className, post) {
  var thumb = pnEl('span', className);
  thumb.setAttribute('aria-hidden', 'true');
  if (post.thumb) {
    thumb.style.backgroundImage = 'url("' + post.thumb.replace(/"/g, '%22') + '")';
  }
  return thumb;
}

function pnText(overline, post) {
  var text = pnEl('span', 'pn-text');
  text.appendChild(pnEl('span', 'pn-overline', overline));
  text.appendChild(pnEl('span', 'pn-title', post.title));
  return text;
}

function pnChevron(direction) {
  var path = direction === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7';
  var span = pnEl('span', 'pn-chevron');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
  return span;
}

/* ---------- A: desktop edge arrows ---------- */

function pnRenderEdge(prev, next) {
  var nav = pnEl('nav', 'pn-edge');
  nav.setAttribute('aria-label', 'Previous and next articles');

  [['prev', prev, 'Previous article'], ['next', next, 'Next article']].forEach(function (cfg) {
    var post = cfg[1];
    if (!post) return;

    var link = pnEl('a', 'pn-edge-link pn-edge-' + cfg[0]);
    link.href = post.href;
    link.setAttribute('aria-label', cfg[2] + ': ' + post.title);

    var button = pnEl('span', 'pn-edge-btn');
    button.appendChild(pnChevron(cfg[0]));

    var preview = pnEl('span', 'pn-edge-preview');
    preview.setAttribute('aria-hidden', 'true');
    preview.appendChild(pnThumb('pn-edge-thumb', post));
    preview.appendChild(pnText(cfg[2], post));

    link.appendChild(button);
    link.appendChild(preview);
    nav.appendChild(link);
  });

  document.body.appendChild(nav);
}

/* ---------- D: mobile "Keep reading" cards ---------- */

function pnRenderKeepReading(prev, next) {
  var anchor = document.querySelector('.section-container.pt-24');

  var wrap = pnEl('div', 'section-container pn-keep-wrap');
  var section = pnEl('section', 'pn-keep');
  section.setAttribute('aria-label', 'Keep reading');
  section.appendChild(pnEl('div', 'pn-keep-label', 'Keep reading'));

  [['prev', prev, 'Previous article'], ['next', next, 'Next article']].forEach(function (cfg) {
    var post = cfg[1];
    if (!post) return;

    var card = pnEl('a', 'pn-card');
    card.href = post.href;
    card.appendChild(pnThumb('pn-card-thumb', post));
    card.appendChild(pnText(cfg[2], post));
    card.appendChild(pnChevron('next'));
    section.appendChild(card);
  });

  wrap.appendChild(section);

  if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(wrap, anchor);
  } else {
    var footer = document.querySelector('.footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(wrap, footer);
    else document.body.appendChild(wrap);
  }
}

/* ---------- D: mobile sticky pager ---------- */

function pnRenderPager(prev, next) {
  var pager = pnEl('nav', 'pn-pager');
  pager.setAttribute('aria-label', 'Previous and next articles');

  [['prev', prev, 'Previous'], ['next', next, 'Next']].forEach(function (cfg, i) {
    var post = cfg[1];
    var item = post ? pnEl('a', 'pn-pager-link') : pnEl('span', 'pn-pager-link is-disabled');

    if (post) {
      item.href = post.href;
      item.setAttribute('aria-label', cfg[2] + ' article: ' + post.title);
    } else {
      item.setAttribute('aria-disabled', 'true');
    }

    var label = pnEl('span', 'pn-pager-label', cfg[2]);
    if (cfg[0] === 'prev') {
      item.appendChild(pnChevron('prev'));
      item.appendChild(label);
    } else {
      item.appendChild(label);
      item.appendChild(pnChevron('next'));
    }

    if (i === 1) pager.appendChild(pnEl('span', 'pn-pager-divider'));
    pager.appendChild(item);
  });

  document.body.appendChild(pager);
}

/* ---------- visibility ---------- */

function pnWatchScroll() {
  var body = document.querySelector('.blog-section .blog-body-copy') ||
    document.querySelector('.blog-body-copy');
  var keep = document.querySelector('.pn-keep');
  var footer = document.querySelector('.footer');
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;

    var footerInView = footer ? footer.getBoundingClientRect().top < vh : false;
    var keepInView = false;

    if (keep) {
      var k = keep.getBoundingClientRect();
      keepInView = k.top < vh && k.bottom > 0;
    }

    var finished = body ? body.getBoundingClientRect().bottom < vh * 0.9 : false;

    document.documentElement.classList.toggle('pn-edge-hidden', footerInView);
    document.documentElement.classList.toggle('pn-done', finished);
    document.documentElement.classList.toggle(
      'pn-pager-on',
      finished && !keepInView && !footerInView
    );
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
