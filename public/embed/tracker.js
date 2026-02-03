/**
 * PopupTool Tracking Script
 * Lightweight visitor tracking + smart popups
 *
 * Usage: <script src="https://yourapp.com/embed/tracker.js" data-key="YOUR_KEY" async></script>
 */

(function() {
  'use strict';

  // Get script key from data attribute
  const scriptTag = document.currentScript || document.querySelector('script[data-key]');
  const SCRIPT_KEY = scriptTag?.getAttribute('data-key');

  if (!SCRIPT_KEY) {
    console.warn('[PopupTool] Missing data-key attribute');
    return;
  }

  // Configuration
  const API_BASE = scriptTag?.src?.replace('/embed/tracker.js', '') || '';

  // ============================================
  // Global API for Conversion Tracking
  // ============================================

  // Create global _pt object for brands to call
  window._pt = window._pt || {};

  /**
   * Track a conversion (call this on thank-you/order-confirmation page)
   * @param {Object} data - Conversion data
   * @param {number} data.amount - Order amount in smallest currency unit (paise/cents)
   * @param {string} data.orderId - Order ID from store
   * @param {string} data.coupon - Coupon code used (optional)
   * @param {string} data.currency - Currency code (default: INR)
   */
  window._pt.convert = function(data = {}) {
    const visitorId = getVisitorIdForConversion();

    if (!visitorId) {
      console.warn('[PopupTool] No visitor ID found for conversion tracking');
      return;
    }

    // Send conversion event
    fetch(`${API_BASE}/api/v1/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptKey: SCRIPT_KEY,
        eventType: 'PURCHASE_CONVERSION',
        visitorId: visitorId,
        metadata: {
          amount: data.amount || 0,
          orderId: data.orderId || null,
          coupon: data.coupon || null,
          currency: data.currency || 'INR',
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      })
    }).then(() => {
      console.log('[PopupTool] Conversion tracked successfully');
    }).catch((err) => {
      console.warn('[PopupTool] Failed to track conversion:', err.message);
    });
  };

  // Helper to get visitor ID for conversion tracking
  function getVisitorIdForConversion() {
    // Try cookie first
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('_pt_visitor='))
      ?.split('=')[1];

    if (cookieValue) return cookieValue;

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('_pt_visitor');
      if (stored) {
        const data = JSON.parse(stored);
        return data?.id;
      }
    } catch {}

    return null;
  }
  const STORAGE_KEY = '_pt_visitor';
  const SESSION_KEY = '_pt_session';
  const SHOWN_POPUPS_KEY = '_pt_shown';

  // ============================================
  // Utility Functions
  // ============================================

  function generateId() {
    return 'v_' + Math.random().toString(36).substring(2, 15);
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage not available
    }
  }

  function getSessionStorage(key) {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function setSessionStorage(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage not available
    }
  }

  // ============================================
  // Visitor Identification
  // ============================================

  function getOrCreateVisitor() {
    // Try cookie first
    let visitorId = getCookie(STORAGE_KEY);

    // Fallback to localStorage
    if (!visitorId) {
      const stored = getStorage(STORAGE_KEY);
      visitorId = stored?.id;
    }

    // Create new visitor
    if (!visitorId) {
      visitorId = generateId();
    }

    // Store in both cookie and localStorage for redundancy
    setCookie(STORAGE_KEY, visitorId);

    // Get or initialize visitor data
    let visitorData = getStorage(STORAGE_KEY) || {
      id: visitorId,
      visitCount: 0,
      pagesViewed: [],
      totalTimeSeconds: 0,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    // Update visitor ID if changed
    visitorData.id = visitorId;

    return visitorData;
  }

  // ============================================
  // UTM & Referrer Tracking
  // ============================================

  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || null,
      utmMedium: params.get('utm_medium') || null,
      utmCampaign: params.get('utm_campaign') || null,
      utmTerm: params.get('utm_term') || null,
      utmContent: params.get('utm_content') || null
    };
  }

  function detectReferrer() {
    const referrer = document.referrer;
    if (!referrer) return 'direct';

    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    // Common referrer detection
    if (hostname.includes('google')) return 'google';
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'facebook';
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('twitter') || hostname.includes('t.co')) return 'twitter';
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('youtube')) return 'youtube';
    if (hostname.includes('whatsapp') || hostname.includes('wa.me')) return 'whatsapp';
    if (hostname.includes('pinterest')) return 'pinterest';
    if (hostname.includes('reddit')) return 'reddit';
    if (hostname.includes('tiktok')) return 'tiktok';

    // Return domain if not recognized
    return hostname;
  }

  // ============================================
  // Behavior Tracking
  // ============================================

  function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return {
      device: isMobile ? 'mobile' : 'desktop',
      browser: getBrowserName(ua),
      os: getOS(ua),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
  }

  function getBrowserName(ua) {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Edg')) return 'edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'opera';
    return 'other';
  }

  function getOS(ua) {
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Linux/.test(ua)) return 'Linux';
    return 'other';
  }

  function trackScrollDepth() {
    let maxScroll = 0;

    function updateScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - window.innerHeight;

      if (docHeight > 0) {
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        maxScroll = Math.max(maxScroll, scrollPercent);
      }
    }

    window.addEventListener('scroll', updateScroll, { passive: true });

    return () => maxScroll;
  }

  function trackTimeOnPage() {
    const startTime = Date.now();
    return () => Math.round((Date.now() - startTime) / 1000);
  }

  // ============================================
  // Intent Scoring
  // ============================================

  function calculateIntentScore(visitor, currentPage, scrollDepth, timeOnPage) {
    let score = 0;

    // Visit count scoring
    if (visitor.visitCount > 1) score += 10;
    if (visitor.visitCount > 3) score += 20;
    if (visitor.visitCount > 5) score += 10;

    // Page scoring (high-intent pages)
    const highIntentPages = ['/pricing', '/checkout', '/cart', '/buy', '/subscribe', '/demo', '/contact'];
    const currentPath = currentPage.toLowerCase();
    if (highIntentPages.some(p => currentPath.includes(p))) {
      score += 30;
    }

    // Check if viewed pricing before
    if (visitor.pagesViewed.some(p => p.includes('/pricing'))) {
      score += 15;
    }

    // Time on site scoring
    const totalTime = visitor.totalTimeSeconds + timeOnPage;
    if (totalTime > 60) score += 10;  // > 1 min
    if (totalTime > 120) score += 15; // > 2 min
    if (totalTime > 300) score += 10; // > 5 min

    // Scroll depth scoring
    if (scrollDepth > 25) score += 5;
    if (scrollDepth > 50) score += 10;
    if (scrollDepth > 75) score += 5;

    // Pages viewed scoring
    if (visitor.pagesViewed.length > 2) score += 10;
    if (visitor.pagesViewed.length > 5) score += 10;

    // Cap at 100
    return Math.min(score, 100);
  }

  function getIntentLevel(score) {
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  // ============================================
  // API Communication
  // ============================================

  async function sendEvent(eventType, data) {
    try {
      const response = await fetch(`${API_BASE}/api/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptKey: SCRIPT_KEY,
          eventType,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send event');
      }

      return await response.json();
    } catch (error) {
      console.warn('[PopupTool] Event error:', error.message);
      return null;
    }
  }

  async function fetchCampaigns(visitorData, intentScore) {
    try {
      const params = new URLSearchParams({
        key: SCRIPT_KEY,
        page: window.location.pathname,
        intentScore: intentScore.toString(),
        intentLevel: getIntentLevel(intentScore),
        visitCount: visitorData.visitCount.toString(),
        utmSource: visitorData.utmSource || '',
        referrer: visitorData.referrer || '',
        device: visitorData.device || ''
      });

      const response = await fetch(`${API_BASE}/api/v1/campaigns?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      return await response.json();
    } catch (error) {
      console.warn('[PopupTool] Campaign fetch error:', error.message);
      return { campaigns: [] };
    }
  }

  // ============================================
  // Popup Rendering (Shadow DOM)
  // ============================================

  function getShownPopups() {
    return getStorage(SHOWN_POPUPS_KEY) || {};
  }

  function markPopupShown(campaignId, frequency) {
    const shown = getShownPopups();
    shown[campaignId] = {
      timestamp: Date.now(),
      frequency
    };
    setStorage(SHOWN_POPUPS_KEY, shown);
  }

  function shouldShowPopup(campaign) {
    const shown = getShownPopups();
    const record = shown[campaign.id];

    if (!record) return true;

    const now = Date.now();
    const elapsed = now - record.timestamp;

    switch (campaign.frequency) {
      case 'EVERY_TIME':
        return true;
      case 'ONCE_PER_SESSION':
        return !getSessionStorage(`popup_${campaign.id}`);
      case 'ONCE_PER_DAY':
        return elapsed > 24 * 60 * 60 * 1000;
      case 'ONCE_PER_WEEK':
        return elapsed > 7 * 24 * 60 * 60 * 1000;
      case 'ONCE_EVER':
        return false;
      default:
        return true;
    }
  }

  function getPopupClass(popupType) {
    const classes = {
      'MODAL': '',
      'SLIDE_IN': 'slide-in',
      'BANNER': 'banner',
      'FLOATING': 'floating',
      'BOTTOM_SHEET': 'bottom-sheet',
      'FULL_SCREEN': 'full-screen'
    };
    return classes[popupType] || '';
  }

  function getOverlayClass(popupType) {
    const classes = {
      'SLIDE_IN': 'slide-in-overlay',
      'BANNER': 'banner-overlay',
      'FLOATING': 'floating-overlay'
    };
    return classes[popupType] || '';
  }

  function createPopupElement(campaign, visitorId, visitor, currentPage) {
    // Create container with Shadow DOM for style isolation
    const container = document.createElement('div');
    container.id = `pt-popup-${campaign.id}`;

    const shadow = container.attachShadow({ mode: 'closed' });

    const content = campaign.content || {};
    const styles = content.styles || {};

    // Replace dynamic variables in content
    const processedTitle = replaceVariables(content.title, visitor, currentPage);
    const processedText = replaceVariables(content.text, visitor, currentPage);
    const processedCtaText = replaceVariables(content.ctaText, visitor, currentPage);

    // Default styles
    const bgColor = styles.backgroundColor || '#ffffff';
    const textColor = styles.textColor || '#000000';
    const buttonColor = styles.buttonColor || '#000000';
    const buttonTextColor = styles.buttonTextColor || '#ffffff';

    shadow.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .pt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2147483647;
          animation: pt-fadeIn 0.2s ease;
        }

        .pt-popup {
          background: ${bgColor};
          color: ${textColor};
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: pt-slideUp 0.3s ease;
        }

        .pt-popup.bottom-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-width: 100%;
          width: 100%;
          border-radius: 16px 16px 0 0;
          animation: pt-slideFromBottom 0.3s ease;
        }

        /* Slide-in: corner popup */
        .pt-popup.slide-in {
          position: fixed;
          bottom: 20px;
          right: 20px;
          left: auto;
          top: auto;
          max-width: 340px;
          width: calc(100% - 40px);
          animation: pt-slideFromRight 0.3s ease;
        }

        .pt-overlay.slide-in-overlay {
          background: transparent;
          pointer-events: none;
        }

        .pt-overlay.slide-in-overlay .pt-popup {
          pointer-events: auto;
        }

        /* Banner: top or bottom bar */
        .pt-popup.banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: auto;
          max-width: 100%;
          width: 100%;
          border-radius: 0;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          animation: pt-slideFromTop 0.3s ease;
        }

        .pt-popup.banner .pt-title {
          margin-bottom: 0;
          font-size: 16px;
        }

        .pt-popup.banner .pt-text {
          margin-bottom: 0;
          display: none;
        }

        .pt-popup.banner .pt-cta {
          width: auto;
          white-space: nowrap;
        }

        .pt-overlay.banner-overlay {
          background: transparent;
          pointer-events: none;
          align-items: flex-start;
        }

        .pt-overlay.banner-overlay .pt-popup {
          pointer-events: auto;
        }

        /* Floating button */
        .pt-popup.floating {
          position: fixed;
          bottom: 20px;
          right: 20px;
          left: auto;
          top: auto;
          max-width: 60px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pt-bounceIn 0.4s ease;
          cursor: pointer;
        }

        .pt-popup.floating .pt-title,
        .pt-popup.floating .pt-text,
        .pt-popup.floating .pt-close,
        .pt-popup.floating .pt-cta,
        .pt-popup.floating .pt-input {
          display: none;
        }

        .pt-popup.floating::before {
          content: "💬";
          font-size: 28px;
        }

        .pt-overlay.floating-overlay {
          background: transparent;
          pointer-events: none;
        }

        .pt-overlay.floating-overlay .pt-popup {
          pointer-events: auto;
        }

        /* Full screen */
        .pt-popup.full-screen {
          max-width: 100%;
          width: 100%;
          height: 100%;
          border-radius: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .pt-popup.full-screen .pt-title {
          font-size: 28px;
        }

        .pt-popup.full-screen .pt-cta {
          width: auto;
          min-width: 200px;
        }

        .pt-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: ${textColor};
          opacity: 0.5;
          line-height: 1;
          padding: 4px;
        }

        .pt-close:hover {
          opacity: 1;
        }

        .pt-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          padding-right: 24px;
        }

        .pt-text {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
          opacity: 0.8;
        }

        .pt-cta {
          background: ${buttonColor};
          color: ${buttonTextColor};
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: transform 0.1s, opacity 0.1s;
        }

        .pt-cta:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .pt-cta:active {
          transform: scale(0.98);
        }

        .pt-secondary {
          background: transparent;
          color: ${textColor};
          border: 1px solid ${textColor};
          margin-top: 8px;
          opacity: 0.7;
        }

        .pt-input {
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .pt-input:focus {
          outline: none;
          border-color: ${buttonColor};
        }

        .pt-coupon {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0,0,0,0.05);
          border: 2px dashed rgba(0,0,0,0.2);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pt-coupon:hover {
          border-color: ${buttonColor};
          background: rgba(0,0,0,0.08);
        }

        .pt-coupon-code {
          font-family: monospace;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 2px;
          color: ${textColor};
        }

        .pt-coupon-copy {
          font-size: 12px;
          color: ${buttonColor};
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pt-coupon-copy svg {
          width: 14px;
          height: 14px;
        }

        .pt-coupon.copied {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .pt-coupon.copied .pt-coupon-copy {
          color: #22c55e;
        }

        @keyframes pt-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pt-slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pt-slideFromBottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes pt-slideFromRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pt-slideFromTop {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        @keyframes pt-bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 480px) {
          .pt-popup:not(.bottom-sheet):not(.banner):not(.floating):not(.full-screen) {
            width: 95%;
            padding: 20px;
          }

          /* Slide-in stays small corner popup on mobile */
          .pt-popup.slide-in {
            bottom: 10px;
            right: 10px;
            left: auto !important;
            max-width: 280px;
            width: calc(100vw - 20px);
            border-radius: 12px;
            padding: 14px;
            animation: pt-slideFromRight 0.3s ease;
          }

          .pt-popup.slide-in .pt-title {
            font-size: 15px;
            margin-bottom: 4px;
          }

          .pt-popup.slide-in .pt-text {
            font-size: 12px;
            margin-bottom: 12px;
          }

          .pt-popup.slide-in .pt-cta {
            padding: 10px 16px;
            font-size: 13px;
          }

          .pt-popup.slide-in .pt-close {
            font-size: 20px;
            top: 8px;
            right: 8px;
          }

          /* Banner gets smaller padding on mobile */
          .pt-popup.banner {
            padding: 12px 16px;
            flex-wrap: wrap;
          }

          .pt-popup.banner .pt-cta {
            width: 100%;
            margin-top: 8px;
          }
        }
      </style>

      <div class="pt-overlay ${getOverlayClass(campaign.popupType)}">
        <div class="pt-popup ${getPopupClass(campaign.popupType)}">
          <button class="pt-close" aria-label="Close">&times;</button>
          <h2 class="pt-title">${escapeHtml(processedTitle || 'Special Offer!')}</h2>
          <p class="pt-text">${escapeHtml(processedText || '')}</p>
          ${content.couponCode ? `
            <div class="pt-coupon" id="pt-coupon-${campaign.id}" data-code="${escapeHtml(content.couponCode)}">
              <span class="pt-coupon-code">${escapeHtml(content.couponCode)}</span>
              <span class="pt-coupon-copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="pt-copy-text">Copy</span>
              </span>
            </div>
          ` : ''}
          ${content.collectEmail ? `
            <input type="email" class="pt-input" placeholder="Enter your email" id="pt-email-${campaign.id}">
          ` : ''}
          ${content.collectPhone ? `
            <input type="tel" class="pt-input" placeholder="Enter your WhatsApp number" id="pt-phone-${campaign.id}">
          ` : ''}
          <button class="pt-cta">${escapeHtml(processedCtaText || 'Get Offer')}</button>
          ${content.secondaryCtaText ? `
            <button class="pt-cta pt-secondary">${escapeHtml(content.secondaryCtaText)}</button>
          ` : ''}
        </div>
      </div>
    `;

    // Event handlers
    const overlay = shadow.querySelector('.pt-overlay');
    const closeBtn = shadow.querySelector('.pt-close');
    const ctaBtn = shadow.querySelector('.pt-cta:not(.pt-secondary)');
    const secondaryBtn = shadow.querySelector('.pt-secondary');

    function closePopup(action = 'dismiss') {
      // Track event
      sendEvent('POPUP_' + action.toUpperCase(), {
        visitorId,
        campaignId: campaign.id
      });

      // Animate out
      overlay.style.animation = 'pt-fadeIn 0.2s ease reverse';
      setTimeout(() => {
        container.remove();
      }, 200);
    }

    closeBtn.addEventListener('click', () => closePopup('dismiss'));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup('dismiss');
    });

    // Coupon copy handler
    const couponEl = shadow.querySelector(`#pt-coupon-${campaign.id}`);
    if (couponEl) {
      couponEl.addEventListener('click', () => {
        const code = couponEl.dataset.code;
        navigator.clipboard.writeText(code).then(() => {
          couponEl.classList.add('copied');
          const copyText = couponEl.querySelector('.pt-copy-text');
          if (copyText) copyText.textContent = 'Copied!';

          // Track coupon copy event
          sendEvent('COUPON_COPY', {
            visitorId,
            campaignId: campaign.id,
            metadata: {
              couponCode: code,
              page: window.location.pathname
            }
          });

          setTimeout(() => {
            couponEl.classList.remove('copied');
            if (copyText) copyText.textContent = 'Copy';
          }, 2000);
        });
      });
    }

    ctaBtn.addEventListener('click', () => {
      // Collect lead data if applicable
      const emailInput = shadow.querySelector(`#pt-email-${campaign.id}`);
      const phoneInput = shadow.querySelector(`#pt-phone-${campaign.id}`);

      const leadData = {};
      if (emailInput?.value) leadData.email = emailInput.value;
      if (phoneInput?.value) leadData.phone = phoneInput.value;

      // If WhatsApp link
      if (content.ctaAction === 'whatsapp' && content.whatsappNumber) {
        const message = encodeURIComponent(content.whatsappMessage || 'Hi!');
        window.open(`https://wa.me/${content.whatsappNumber}?text=${message}`, '_blank');
      }

      // If external link
      if (content.ctaAction === 'link' && content.ctaUrl) {
        window.open(content.ctaUrl, '_blank');
      }

      // Send conversion event with lead data
      sendEvent('POPUP_CONVERSION', {
        visitorId,
        campaignId: campaign.id,
        ...leadData
      });

      closePopup('conversion');
    });

    if (secondaryBtn) {
      secondaryBtn.addEventListener('click', () => closePopup('dismiss'));
    }

    // Mark as shown for frequency capping
    markPopupShown(campaign.id, campaign.frequency);
    if (campaign.frequency === 'ONCE_PER_SESSION') {
      setSessionStorage(`popup_${campaign.id}`, true);
    }

    return container;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // Dynamic Variable Replacement
  // ============================================

  function replaceVariables(text, visitor, currentPage) {
    if (!text) return text;

    const variables = {
      // Visit data
      '{{visitCount}}': visitor.visitCount || 1,
      '{{visits}}': visitor.visitCount || 1,

      // Pages
      '{{currentPage}}': currentPage,
      '{{lastViewedPage}}': visitor.pagesViewed?.slice(-2, -1)[0] || currentPage,
      '{{pagesViewed}}': visitor.pagesViewed?.length || 1,

      // Time
      '{{timeOnSite}}': formatTime(visitor.totalTimeSeconds || 0),
      '{{timeOnSiteMinutes}}': Math.round((visitor.totalTimeSeconds || 0) / 60),

      // Intent
      '{{intentScore}}': visitor.intentScore || 0,
      '{{intentLevel}}': visitor.intentLevel || 'new',

      // Source (show friendly name, skip if direct)
      '{{source}}': visitor.utmSource || (visitor.referrer && visitor.referrer !== 'direct' ? visitor.referrer : ''),
      '{{utmSource}}': visitor.utmSource || '',
      '{{utmCampaign}}': visitor.utmCampaign || '',
      '{{referrer}}': visitor.referrer || 'direct',

      // Device
      '{{device}}': visitor.device || 'desktop',

      // Personalized messages based on visit count
      '{{returnVisitorMessage}}': visitor.visitCount > 1
        ? `Welcome back! This is visit #${visitor.visitCount}`
        : 'Welcome! Thanks for stopping by',

      // Ordinal visit (1st, 2nd, 3rd, etc.)
      '{{visitOrdinal}}': getOrdinal(visitor.visitCount || 1),
    };

    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.split(key).join(String(value));
    }

    return result;
  }

  function formatTime(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    const mins = Math.round(seconds / 60);
    return mins === 1 ? '1 minute' : `${mins} minutes`;
  }

  function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function showPopup(campaign, visitorId, visitor, currentPage) {
    // Track impression
    sendEvent('POPUP_IMPRESSION', {
      visitorId,
      campaignId: campaign.id
    });

    const popup = createPopupElement(campaign, visitorId, visitor, currentPage);
    document.body.appendChild(popup);
  }

  // ============================================
  // Main Initialization
  // ============================================

  async function init() {
    // Get or create visitor
    const visitor = getOrCreateVisitor();

    // Check if this is a new session
    const isNewSession = !getSessionStorage(SESSION_KEY);
    if (isNewSession) {
      visitor.visitCount += 1;
      setSessionStorage(SESSION_KEY, true);
    }

    // Get current page
    const currentPage = window.location.pathname;

    // Add to pages viewed if not already
    if (!visitor.pagesViewed.includes(currentPage)) {
      visitor.pagesViewed.push(currentPage);
      // Keep only last 50 pages
      if (visitor.pagesViewed.length > 50) {
        visitor.pagesViewed = visitor.pagesViewed.slice(-50);
      }
    }

    // Get UTM params (only store on first visit or if new params exist)
    const utm = getUTMParams();
    if (utm.utmSource && !visitor.utmSource) {
      visitor.utmSource = utm.utmSource;
      visitor.utmMedium = utm.utmMedium;
      visitor.utmCampaign = utm.utmCampaign;
    }

    // Get referrer (only on first visit)
    if (!visitor.referrer) {
      visitor.referrer = detectReferrer();
    }

    // Get device info
    const deviceInfo = getDeviceInfo();
    visitor.device = deviceInfo.device;
    visitor.browser = deviceInfo.browser;

    // Update last seen
    visitor.lastSeen = new Date().toISOString();

    // Save visitor data
    setStorage(STORAGE_KEY, visitor);

    // Start tracking
    const getScrollDepth = trackScrollDepth();
    const getTimeOnPage = trackTimeOnPage();

    // Calculate initial intent score
    let intentScore = calculateIntentScore(visitor, currentPage, 0, 0);

    // Send page view event
    sendEvent('PAGE_VIEW', {
      visitorId: visitor.id,
      page: currentPage,
      referrer: document.referrer,
      ...utm,
      ...deviceInfo,
      intentScore,
      intentLevel: getIntentLevel(intentScore)
    });

    // Fetch and show campaigns after a short delay
    setTimeout(async () => {
      // Recalculate with scroll/time data
      intentScore = calculateIntentScore(
        visitor,
        currentPage,
        getScrollDepth(),
        getTimeOnPage()
      );

      const { campaigns } = await fetchCampaigns(visitor, intentScore);

      // Filter and sort campaigns
      const eligibleCampaigns = campaigns
        .filter(shouldShowPopup)
        .sort((a, b) => b.priority - a.priority);

      // Show highest priority campaign
      if (eligibleCampaigns.length > 0) {
        // Add computed values to visitor for variable replacement
        visitor.intentScore = intentScore;
        visitor.intentLevel = getIntentLevel(intentScore);
        showPopup(eligibleCampaigns[0], visitor.id, visitor, currentPage);
      }
    }, 2000); // 2 second delay before showing popup

    // Update visitor data before leaving
    window.addEventListener('beforeunload', () => {
      visitor.totalTimeSeconds += getTimeOnPage();
      setStorage(STORAGE_KEY, visitor);

      // Send final update
      sendEvent('PAGE_EXIT', {
        visitorId: visitor.id,
        page: currentPage,
        timeOnPage: getTimeOnPage(),
        scrollDepth: getScrollDepth(),
        intentScore: calculateIntentScore(
          visitor,
          currentPage,
          getScrollDepth(),
          getTimeOnPage()
        )
      });
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
