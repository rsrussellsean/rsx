// Single source of truth for the portfolio projects.
// Carousel/list order and copy mirror the original index.html;
// gallery image order mirrors each original works/*.html minimap.

export interface Work {
  slug: string;
  /** Title shown on the home carousel/list */
  title: string;
  /** Title shown on the project page (sometimes longer) */
  pageTitle: string;
  est: string;
  /** Image used on the home carousel + list view */
  homeImage: string;
  homeAlt: string;
  /** Minimap gallery images, first one doubles as the initial preview */
  gallery: string[];
  visitUrl?: string;
}

export const WORKS: Work[] = [
  {
    slug: "nexus",
    title: "Ealy Nexus",
    pageTitle: "Ealy Nexus",
    est: "(EST 2024)",
    homeImage: "/images/works/en2.webp",
    homeAlt: "Ealy Nexus website preview",
    gallery: [
      "/images/assets/en2.png",
      "/images/assets/en3.png",
      "/images/assets/ealynexus.png",
      "/images/assets/en4.png",
    ],
  },
  {
    slug: "ai",
    title: "AI Chatbot",
    pageTitle: "AI Chatbot",
    est: "(EST 2024)",
    homeImage: "/images/works/ai4.webp",
    homeAlt: "AI Chatbot project preview",
    gallery: [
      "/images/assets/ai1.jpg",
      "/images/assets/ai2.jpg",
      "/images/assets/ai3.jpg",
      "/images/assets/ai4.jpg",
    ],
    visitUrl: "https://rsrussellsean.github.io/AIChat/",
  },
  {
    slug: "sereno",
    title: "Sereno",
    pageTitle: "Sereno",
    est: "(EST 2024)",
    homeImage: "/images/works/realestate.webp",
    homeAlt: "Sereno real estate website preview",
    gallery: [
      "/images/assets/realestate.png",
      "/images/assets/realestate2.png",
      "/images/assets/realestate3.png",
    ],
    visitUrl: "https://rsrussellsean.github.io/Real-Estate/",
  },
  {
    slug: "alliance",
    title: "Alliance",
    pageTitle: "Alliance Subscription Monitoring",
    est: "(EST 2023)",
    homeImage: "/images/works/alliance2.webp",
    homeAlt: "Alliance website preview",
    gallery: [
      "/images/assets/alliance2.png",
      "/images/assets/alliance4.png",
      "/images/assets/alliance.png",
      "/images/assets/alliance3.png",
    ],
  },
  {
    slug: "gym",
    title: "Gym Trainer",
    pageTitle: "Gym Trainer",
    est: "(ES 2025)",
    homeImage: "/images/works/gym.webp",
    homeAlt: "Gym Trainer website preview",
    gallery: [
      "/images/assets/gym.png",
      "/images/assets/gym2.png",
      "/images/assets/gym3.png",
      "/images/assets/gym4.png",
      "/images/assets/gym5.png",
      "/images/assets/gym6.png",
      "/images/assets/gym7.png",
      "/images/assets/gym8.png",
      "/images/assets/gym9.png",
    ],
    visitUrl: "https://rsrussellsean.github.io/gymtrainer/",
  },
  {
    slug: "moola",
    title: "Moola",
    pageTitle: "Moola",
    est: "(EST 2025)",
    homeImage: "/images/works/m1.webp",
    homeAlt: "Moola website preview",
    gallery: [
      "/images/assets/moola2.png",
      "/images/assets/moola3.png",
      "/images/assets/moola4.png",
      "/images/assets/moola5.png",
      "/images/assets/moola6.png",
    ],
    visitUrl: "https://rsrussellsean.github.io/moola/",
  },
  {
    slug: "scandiweb",
    title: "My Shop Scandiweb",
    pageTitle: "My Shop",
    est: "(EST 2025)",
    homeImage: "/images/assets/scandi1.webp",
    homeAlt: "My Shop Scandiweb preview",
    gallery: [
      "/images/assets/scandi1.jpg",
      "/images/assets/scandi2.jpg",
      "/images/assets/scandi3.jpg",
      "/images/assets/scandi4.jpg",
      "/images/assets/scandi5.jpg",
    ],
    visitUrl: "https://heroic-treacle-6ef6d0.netlify.app/all",
  },
  {
    slug: "kitchenette",
    title: "Kat & Perry Kitchenette",
    pageTitle: "Kat & Perry Kitchenette",
    est: "(EST 2025)",
    homeImage: "/images/works/kp1.webp",
    homeAlt: "Kat and Perry Kitchenette website preview",
    gallery: [
      "/images/assets/kp1.png",
      "/images/assets/kp2.png",
      "/images/assets/kp3.png",
      "/images/assets/kp4.png",
      "/images/assets/kp5.png",
    ],
  },
  {
    slug: "downfield",
    title: "Downfield (Shopify)",
    pageTitle: "Downfield (Shopify)",
    est: "(ES 2025)",
    homeImage: "/images/works/df1.webp",
    homeAlt: "Downfield Shopify store preview",
    gallery: [
      "/images/assets/df1.png",
      "/images/assets/df2.png",
      "/images/assets/df3.png",
      "/images/assets/df4.png",
      "/images/assets/df5.png",
    ],
    visitUrl: "https://downfield.ph/",
  },
];

export function getWork(slug: string): Work | undefined {
  return WORKS.find((w) => w.slug === slug);
}
