import React, { useEffect } from 'react';
import { getPageSeo, SITE_URL, SITE_NAME, DEFAULT_IMAGE } from '../seo/metadata';
import { SeoSchema } from '../seo/Schema';

interface SeoHeadProps {
  page: 'home' | 'products' | 'store' | 'careers' | 'services' | 'about' | 'contact' | 'account' | 'admin';
  sectionId?: string;
  title?: string;
  description?: string;
  canonicalPath?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ page, sectionId, title, description, canonicalPath }) => {
  const seo = getPageSeo(page, sectionId);
  const pageTitle = title || seo.title;
  const pageDescription = description || seo.description;
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : `${SITE_URL}${seo.canonicalPath}`;

  useEffect(() => {
    document.title = pageTitle;
    document.documentElement.lang = 'en';

    const setMeta = (name: string, content: string, attr = 'name') => {
      const existing = document.querySelector(`meta[${attr}="${name}"]`);
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    const setLink = (rel: string, href: string) => {
      let existing = document.querySelector(`link[rel="${rel}"]`);
      if (!existing) {
        existing = document.createElement('link');
        existing.setAttribute('rel', rel);
        document.head.appendChild(existing);
      }
      existing.setAttribute('href', href);
    };

    setMeta('description', pageDescription);
    setMeta('keywords', seo.keywords.join(', '));
    setMeta('robots', seo.robots);
    setMeta('author', SITE_NAME);
    setMeta('theme-color', '#0f172a');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDescription);
    setMeta('twitter:image', `${SITE_URL}${DEFAULT_IMAGE}`);
    setMeta('og:title', pageTitle);
    setMeta('og:description', pageDescription);
    setMeta('og:type', seo.type);
    setMeta('og:url', canonical);
    setMeta('og:image', `${SITE_URL}${DEFAULT_IMAGE}`);
    setMeta('og:site_name', SITE_NAME);
    setMeta('og:locale', 'en_US');
    setMeta('article:published_time', '2026-01-01T00:00:00+00:00');
    setMeta('article:modified_time', new Date().toISOString());
    setMeta('google-site-verification', 'google-site-verification-token');
    setMeta('msvalidate.01', 'bing-site-verification-token');

    setLink('canonical', canonical);
    setLink('alternate', `${SITE_URL}${seo.canonicalPath}`);
    setLink('icon', `${SITE_URL}${DEFAULT_IMAGE}`);
    setLink('apple-touch-icon', `${SITE_URL}${DEFAULT_IMAGE}`);
  }, [pageTitle, pageDescription, canonical, seo]);

  return (
    <>
      <SeoSchema page={page} path={canonicalPath || seo.canonicalPath} />
    </>
  );
};
