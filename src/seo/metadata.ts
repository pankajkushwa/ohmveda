import { COMPANY_INFO } from '../data/companyData';

export type SeoPage = 'home' | 'products' | 'store' | 'careers' | 'services' | 'about' | 'contact' | 'account' | 'admin';

export const SITE_URL = 'https://www.ohmvedatechnologies.com';
export const SITE_NAME = 'OhmVeda Technologies';
export const DEFAULT_IMAGE = '/logo1.png';
export const DEFAULT_KEYWORDS = [
  'embedded systems',
  'IoT engineering',
  'PCB design',
  'firmware development',
  'software development',
  'electronics manufacturing',
  'product engineering',
  'custom hardware',
  'industrial automation',
  'mobile app development',
];

export const PAGE_PATHS: Record<SeoPage, string> = {
  home: '/',
  products: '/products',
  store: '/store',
  careers: '/careers',
  services: '/services',
  about: '/about',
  contact: '/contact',
  account: '/account',
  admin: '/admin',
};

export interface SeoData {
  title: string;
  description: string;
  canonicalPath: string;
  keywords: string[];
  robots: string;
  image: string;
  type: string;
  page: SeoPage;
}

export const getPageSeo = (page: SeoPage, sectionId?: string): SeoData => {
  const base = {
    page,
    canonicalPath: PAGE_PATHS[page],
    robots: page === 'admin' ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    image: DEFAULT_IMAGE,
    type: 'website',
    keywords: DEFAULT_KEYWORDS,
  };

  switch (page) {
    case 'products':
      return {
        ...base,
        title: 'Turnkey Embedded, Electronics & IoT Products | OhmVeda Technologies',
        description:
          'Explore turnkey electronics, embedded hardware, firmware, IoT products, and engineering platforms built for industrial and connected product applications.',
        keywords: ['turnkey electronics', 'embedded products', 'IoT products', 'firmware platforms', 'electronics engineering'],
      };
    case 'store':
      return {
        ...base,
        title: 'Electronic Components Store & Development Boards | OhmVeda Technologies',
        description:
          'Browse premium electronic components, wireless modules, sensors, development boards, and prototyping parts from OhmVeda Technologies.',
        keywords: ['electronic components store', 'development boards', 'sensors', 'wireless modules', 'prototyping parts'],
      };
    case 'careers':
      return {
        ...base,
        title: 'Careers in Embedded, IoT & Software Engineering | OhmVeda Technologies',
        description:
          'Discover career opportunities in electronics, embedded systems, firmware, IoT, software, and product engineering with OhmVeda Technologies.',
        keywords: ['careers in engineering', 'embedded jobs', 'IoT jobs', 'firmware jobs', 'software engineering careers'],
      };
    case 'services':
      return {
        ...base,
        title: 'Engineering Services for Embedded, IoT & Software Solutions | OhmVeda Technologies',
        description:
          'Partner with OhmVeda Technologies for embedded systems, PCB design, firmware, software, mobile apps, IoT, and product engineering services.',
        keywords: ['embedded systems services', 'firmware development services', 'IoT services', 'software engineering services', 'product engineering'],
      };
    case 'about':
      return {
        ...base,
        title: 'About OhmVeda Technologies | Electronics, Embedded & Software Engineering',
        description:
          'Learn about OhmVeda Technologies, our engineering approach, and how we turn complex product ideas into reliable connected solutions.',
        keywords: ['about OhmVeda Technologies', 'engineering company', 'product innovation', 'embedded engineering firm'],
      };
    case 'contact':
      return {
        ...base,
        title: 'Contact OhmVeda Technologies for Hardware & Software Projects',
        description:
          'Get in touch with OhmVeda Technologies for hardware development, embedded systems, firmware, IoT, mobile apps, and custom engineering support.',
        keywords: ['contact engineering company', 'hardware consulting', 'embedded consulting', 'IoT consultation'],
      };
    case 'account':
      return {
        ...base,
        title: 'My Account | OhmVeda Technologies',
        description: 'View orders, saved addresses, and account details for your OhmVeda Technologies experience.',
        keywords: ['customer account', 'order tracking', 'saved addresses'],
        robots: 'noindex, follow',
      };
    case 'admin':
      return {
        ...base,
        title: 'Admin Panel | OhmVeda Technologies',
        description: 'Restricted administrative dashboard for OhmVeda Technologies operations.',
        keywords: ['admin panel'],
        robots: 'noindex, nofollow',
      };
    case 'home':
    default:
      const homeSection = sectionId === 'services' || sectionId === 'about' || sectionId === 'contact' ? sectionId : 'hero';
      const homeTitle = homeSection === 'services'
        ? 'Embedded Systems, IoT & Software Engineering Services | OhmVeda Technologies'
        : homeSection === 'about'
          ? 'About OhmVeda Technologies | Hardware, Software & IoT Engineering'
          : homeSection === 'contact'
            ? 'Contact OhmVeda Technologies for Product Engineering Projects'
            : `${COMPANY_INFO.tagline} | OhmVeda Technologies`;
      const homeDescription = homeSection === 'services'
        ? 'Discover OhmVeda Technologies expertise in electronics, embedded firmware, PCB design, web development, mobile apps, and IoT solutions.'
        : homeSection === 'about'
          ? 'Learn how OhmVeda Technologies delivers electronics, embedded, IoT, and software solutions from concept to production.'
          : homeSection === 'contact'
            ? 'Reach out to OhmVeda Technologies for custom engineering, hardware prototyping, software development, and IoT deployment support.'
            : COMPANY_INFO.heroDescription;
      return {
        ...base,
        title: homeTitle,
        description: homeDescription,
        keywords: ['OhmVeda Technologies', 'hardware engineering', 'embedded systems', 'IoT solutions', 'software development'],
      };
  }
};
