/**
 * Zotpress - Modern Frontend Module
 *
 * TypeScript implementation for Zotpress bibliography/citation functionality.
 * Replaces legacy jQuery-dependent code with modern, accessible patterns.
 *
 * @package Zotpress
 * @since 8.0.0
 */

// Type definitions for WordPress globals
declare const wp: {
  ajax: {
    post: (action: string, data: Record<string, unknown>) => Promise<unknown>;
  };
};
declare const jQuery: JQueryStatic;

/**
 * Zotpress configuration interface
 */
interface ZotpressConfig {
  ajaxUrl: string;
  nonce: string;
  cacheTime: number;
  debug: boolean;
}

/**
 * Zotero item interface
 */
interface ZoteroItem {
  key: string;
  version: number;
  itemType: string;
  title: string;
  creators?: ZoteroCreator[];
  date?: string;
  DOI?: string;
  URL?: string;
  abstractNote?: string;
  tags?: ZoteroTag[];
}

interface ZoteroCreator {
  creatorType: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface ZoteroTag {
  tag: string;
  type?: number;
}

/**
 * Main Zotpress class
 */
class Zotpress {
  private readonly config: ZotpressConfig;
  private cache: Map<string, { data: unknown; timestamp: number }>;

  constructor(config: Partial<ZotpressConfig> = {}) {
    this.config = {
      ajaxUrl: '/wp-admin/admin-ajax.php',
      nonce: '',
      cacheTime: 600000, // 10 minutes
      debug: false,
      ...config,
    };
    this.cache = new Map();

    this.init();
  }

  /**
   * Initialize the module
   */
  private init(): void {
    this.setupEventListeners();
    this.initLazyLoading();
    this.log('Zotpress initialized');
  }

  /**
   * Set up event listeners using event delegation
   */
  private setupEventListeners(): void {
    // Use event delegation instead of jQuery LiveQuery
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;

      // Handle citation clicks
      if (target.closest('.zp-Citation-link')) {
        event.preventDefault();
        const link = target.closest('.zp-Citation-link') as HTMLAnchorElement;
        this.handleCitationClick(link);
      }

      // Handle download clicks
      if (target.closest('.zp-Attachment')) {
        const attachment = target.closest('.zp-Attachment') as HTMLAnchorElement;
        this.trackDownload(attachment);
      }

      // Handle pagination
      if (target.closest('.zp-Pagination-btn')) {
        event.preventDefault();
        const btn = target.closest('.zp-Pagination-btn') as HTMLButtonElement;
        this.handlePagination(btn);
      }
    });

    // Handle form submissions
    document.addEventListener('submit', (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (form.classList.contains('zp-Search-form')) {
        event.preventDefault();
        this.handleSearch(form);
      }
    });
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  private initLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadAllBibliographies();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const container = entry.target as HTMLElement;
            this.loadBibliography(container);
            observer.unobserve(container);
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0,
      }
    );

    document.querySelectorAll('.zp-Zotpress[data-lazy]').forEach((el) => {
      observer.observe(el);
    });
  }

  /**
   * Load all bibliographies (fallback for no IntersectionObserver)
   */
  private loadAllBibliographies(): void {
    document.querySelectorAll('.zp-Zotpress[data-lazy]').forEach((el) => {
      this.loadBibliography(el as HTMLElement);
    });
  }

  /**
   * Load bibliography content via AJAX
   */
  async loadBibliography(container: HTMLElement): Promise<void> {
    const params = this.getDataParams(container);

    if (!params.api_user_id) {
      this.showError(container, 'Missing API user ID');
      return;
    }

    // Check cache
    const cacheKey = this.getCacheKey(params);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.renderBibliography(container, cached as ZoteroItem[]);
      return;
    }

    // Show loading state
    this.showLoading(container);

    try {
      const response = await this.fetchData('zpRetrieveViaShortcode', params);
      const items = response as ZoteroItem[];

      // Cache the result
      this.setCache(cacheKey, items);

      // Render
      this.renderBibliography(container, items);
    } catch (error) {
      this.showError(container, error instanceof Error ? error.message : 'Failed to load');
      this.log('Load error:', error);
    }
  }

  /**
   * Fetch data from WordPress AJAX endpoint
   */
  private async fetchData(action: string, data: Record<string, unknown>): Promise<unknown> {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('_ajax_nonce', this.config.nonce);

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await fetch(this.config.ajaxUrl, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success === false) {
      throw new Error(result.data?.message || 'Request failed');
    }

    return result.data;
  }

  /**
   * Get data attributes from container
   */
  private getDataParams(container: HTMLElement): Record<string, string> {
    const params: Record<string, string> = {};

    Array.from(container.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) {
        const key = attr.name.slice(5).replace(/-/g, '_');
        params[key] = attr.value;
      }
    });

    return params;
  }

  /**
   * Render bibliography items
   */
  private renderBibliography(container: HTMLElement, items: ZoteroItem[]): void {
    container.removeAttribute('data-lazy');

    if (items.length === 0) {
      container.innerHTML = '<p class="zp-Message zp-Message--info">No items found.</p>';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'zp-List';
    list.setAttribute('role', 'list');

    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'zp-Entry zp-animate-fadeIn';
      li.style.animationDelay = `${index * 50}ms`;
      li.innerHTML = this.renderItem(item, index + 1);
      list.appendChild(li);
    });

    container.innerHTML = '';
    container.appendChild(list);

    // Announce to screen readers
    this.announceToScreenReader(`Loaded ${items.length} bibliography items`);
  }

  /**
   * Render a single item
   */
  private renderItem(item: ZoteroItem, num: number): string {
    const authors = this.formatAuthors(item.creators || []);
    const year = item.date ? new Date(item.date).getFullYear() : '';

    return `
      <span class="zp-Entry-num">${num}.</span>
      <div class="zp-Entry-content">
        <h3 class="zp-Entry-title">
          ${item.URL ? `<a href="${this.escapeHtml(item.URL)}" class="zp-Citation-link">${this.escapeHtml(item.title)}</a>` : this.escapeHtml(item.title)}
        </h3>
        <p class="zp-Entry-meta">
          ${authors ? `<span class="zp-Entry-authors">${authors}</span>` : ''}
          ${year ? `<span class="zp-Entry-year">(${year})</span>` : ''}
        </p>
      </div>
      <div class="zp-Entry-actions">
        ${item.DOI ? `<a href="https://doi.org/${this.escapeHtml(item.DOI)}" class="zp-Attachment" target="_blank" rel="noopener"><span class="zp-Attachment-icon">📄</span>DOI</a>` : ''}
      </div>
    `;
  }

  /**
   * Format authors list
   */
  private formatAuthors(creators: ZoteroCreator[]): string {
    const authors = creators.filter((c) => c.creatorType === 'author');
    if (authors.length === 0) return '';

    return authors
      .map((a) => {
        if (a.name) return a.name;
        return [a.lastName, a.firstName].filter(Boolean).join(', ');
      })
      .join('; ');
  }

  /**
   * Handle citation click
   */
  private handleCitationClick(link: HTMLAnchorElement): void {
    const url = link.href;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Track download click
   */
  private trackDownload(attachment: HTMLAnchorElement): void {
    const href = attachment.href;
    this.log('Download tracked:', href);
    // Analytics tracking could go here
  }

  /**
   * Handle pagination click
   */
  private handlePagination(btn: HTMLButtonElement): void {
    const container = btn.closest('.zp-Zotpress') as HTMLElement;
    const page = btn.dataset.page;

    if (container && page) {
      container.dataset.page = page;
      this.loadBibliography(container);
    }
  }

  /**
   * Handle search form submission
   */
  private async handleSearch(form: HTMLFormElement): Promise<void> {
    const container = form.closest('.zp-Zotpress') as HTMLElement;
    const input = form.querySelector('input[type="search"]') as HTMLInputElement;

    if (container && input) {
      container.dataset.search = input.value;
      await this.loadBibliography(container);
    }
  }

  /**
   * Show loading state
   */
  private showLoading(container: HTMLElement): void {
    container.innerHTML = `
      <div class="zp-Loading" role="status" aria-live="polite">
        <div class="zp-Spinner" aria-hidden="true"></div>
        <span class="zp-sr-only">Loading bibliography...</span>
      </div>
    `;
  }

  /**
   * Show error message
   */
  private showError(container: HTMLElement, message: string): void {
    container.innerHTML = `
      <div class="zp-Message zp-Message--error" role="alert">
        ${this.escapeHtml(message)}
      </div>
    `;
  }

  /**
   * Announce to screen readers
   */
  private announceToScreenReader(message: string): void {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'zp-sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);
    setTimeout(() => announcer.remove(), 1000);
  }

  /**
   * Escape HTML entities
   */
  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Cache management
   */
  private getCacheKey(params: Record<string, unknown>): string {
    return JSON.stringify(params);
  }

  private getFromCache(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.config.cacheTime) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[Zotpress]', ...args);
    }
  }
}

// Export for module usage
export { Zotpress };
export type { ZotpressConfig, ZoteroItem, ZoteroCreator, ZoteroTag };

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Get config from global or data attribute
    const configEl = document.querySelector('[data-zotpress-config]');
    const config = configEl ? JSON.parse(configEl.getAttribute('data-zotpress-config') || '{}') : {};

    // Initialize
    (window as unknown as { Zotpress: Zotpress }).Zotpress = new Zotpress(config);
  });
}
