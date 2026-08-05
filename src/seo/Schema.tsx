import React from 'react';
import { COMPANY_INFO } from '../data/companyData';
import { SITE_URL, SITE_NAME } from './metadata';

interface SchemaProps {
  page: 'home' | 'products' | 'store' | 'careers' | 'services' | 'about' | 'contact' | 'account' | 'admin';
  path?: string;
}

export const SeoSchema: React.FC<SchemaProps> = ({ page, path = '/' }) => {
  const canonicalUrl = `${SITE_URL}${path}`;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo1.png`,
    image: `${SITE_URL}/logo1.png`,
    description: COMPANY_INFO.heroDescription,
    sameAs: ['https://www.linkedin.com/', 'https://github.com/'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'ohmvedatechnologies@gmail.com',
      telephone: '+91-0000000000',
      areaServed: 'Worldwide',
      availableLanguage: ['English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: page.charAt(0).toUpperCase() + page.slice(1), item: canonicalUrl },
    ],
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    image: `${SITE_URL}/logo1.png`,
    url: SITE_URL,
    telephone: '+91-0000000000',
    email: 'ohmvedatechnologies@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Innovation Hub',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560001',
      addressCountry: 'IN',
    },
    description: COMPANY_INFO.heroDescription,
    priceRange: '$$-$$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: SITE_NAME,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    primaryImageOfPage: `${SITE_URL}/logo1.png`,
    description: COMPANY_INFO.heroDescription,
  };

  const schemaList = [organizationSchema, websiteSchema, breadcrumbSchema, localBusinessSchema, webPageSchema];

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaList) }} />
  );
};
