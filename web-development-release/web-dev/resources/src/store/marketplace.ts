import { create } from 'zustand'

export interface MarketplaceModule {
  id: string
  name: string
  category: string
  tag: string
  description: string
  author: string
  downloads: number
  rating: number
  reviews: number
  badge: 'hot' | 'new' | 'popular' | null
  previewStyle: string
  previewType: 'login' | 'dashboard' | 'landing' | 'settings' | 'payment' | 'auth' | 'onboarding'
  tree: string[]
  reviewsList: Array<{ author: string; stars: number; text: string }>
}

export type SortKey = 'hot' | 'new' | 'rating' | 'downloads'

interface MarketplaceState {
  modules: MarketplaceModule[]
  activeTag: string
  searchQuery: string
  sortKey: SortKey
  selectedModuleId: string | null
  compareList: string[]
  myModules: MarketplaceModule[]
  replacingModuleUuid: string | null

  setActiveTag(tag: string): void
  setSearchQuery(query: string): void
  setSortKey(key: SortKey): void
  selectModule(id: string | null): void
  toggleCompare(id: string): void
  clearCompare(): void
  addToMyModules(id: string): void
  removeFromMyModules(id: string): void
  setReplacingModule(uuid: string | null): void
  resetHubState(): void
  filteredModules(): MarketplaceModule[]
}

const MOCK_MODULES: MarketplaceModule[] = [
  {
    id: 'login-minimal',
    name: 'Minimal Login',
    category: 'Login / Registration',
    tag: 'login',
    description: 'Clean white background, distraction-free login form. Ideal for tool-based products and SaaS applications. Supports email/password and forgot-password flow.',
    author: 'archpark',
    downloads: 1243,
    rating: 4.8,
    reviews: 23,
    badge: 'hot',
    previewStyle: 'minimal',
    previewType: 'login',
    tree: ['login-minimal/', '  README.md', '  .archui/index.yaml', '  form-fields/', '    README.md', '  forgot-password/', '    README.md', '  resources/', '    visual-spec.md', '    preview.png'],
    reviewsList: [
      { author: 'liming', stars: 5, text: 'Very clean design — AI-generated code after replacement needed almost no manual tweaking.' },
      { author: 'devzhang', stars: 4, text: 'Clear module structure, thorough documentation. Would love a social-login sub-module.' },
    ],
  },
  {
    id: 'login-glass',
    name: 'Gradient Glass Login',
    category: 'Login / Registration',
    tag: 'login',
    description: 'Purple-blue gradient background with frosted glass card effect. Strong visual impact, great for creative and consumer-facing products.',
    author: 'uicraft',
    downloads: 987,
    rating: 4.7,
    reviews: 18,
    badge: 'popular',
    previewStyle: 'glass',
    previewType: 'login',
    tree: ['login-glass/', '  README.md', '  .archui/index.yaml', '  glass-card/', '    README.md', '  gradient-bg/', '    README.md', '  resources/', '    visual-spec.md'],
    reviewsList: [
      { author: 'sarah', stars: 5, text: 'Stunning effect! The client picked this design on the spot.' },
      { author: 'wanglei', stars: 4, text: 'Great visuals, but blur has performance issues on low-end devices. Consider adding a fallback.' },
    ],
  },
  {
    id: 'login-dark',
    name: 'Dark Login',
    category: 'Login / Registration',
    tag: 'login',
    description: 'Dark theme login page with a bold red CTA button. Perfect for games, developer tools, and dark-themed products.',
    author: 'nightdev',
    downloads: 756,
    rating: 4.6,
    reviews: 12,
    badge: null,
    previewStyle: 'dark',
    previewType: 'login',
    tree: ['login-dark/', '  README.md', '  .archui/index.yaml', '  dark-theme/', '    README.md', '  resources/', '    visual-spec.md'],
    reviewsList: [
      { author: 'hacker42', stars: 5, text: 'Finally a good dark login module — dropped it right into my CLI tool site.' },
    ],
  },
  {
    id: 'login-earth',
    name: 'Warm Earth Login',
    category: 'Login / Registration',
    tag: 'login',
    description: 'Warm beige background with terracotta CTA button. Friendly and inviting, great for lifestyle, health, and education products.',
    author: 'archpark',
    downloads: 534,
    rating: 4.5,
    reviews: 9,
    badge: 'new',
    previewStyle: 'earth',
    previewType: 'login',
    tree: ['login-earth/', '  README.md', '  .archui/index.yaml', '  warm-palette/', '    README.md', '  resources/', '    visual-spec.md'],
    reviewsList: [
      { author: 'flora', stars: 5, text: 'Beautiful warm tones — fits my yoga class app perfectly.' },
    ],
  },
  {
    id: 'dashboard-cards',
    name: 'Card Dashboard',
    category: 'Dashboard',
    tag: 'dashboard',
    description: 'Left sidebar navigation with card grid layout. Supports data overview, chart area, and recent activity feed. Enterprise back-office go-to.',
    author: 'bizdev',
    downloads: 2100,
    rating: 4.9,
    reviews: 45,
    badge: 'hot',
    previewStyle: 'cards',
    previewType: 'dashboard',
    tree: ['dashboard-cards/', '  README.md', '  .archui/index.yaml', '  sidebar-nav/', '  stat-cards/', '  chart-area/', '  activity-feed/', '  resources/'],
    reviewsList: [
      { author: 'pm-chen', stars: 5, text: 'Excellent module decomposition — swapping just the stat-cards sub-module changes the entire data display style.' },
    ],
  },
  {
    id: 'dashboard-dark',
    name: 'Dark Data Dashboard',
    category: 'Dashboard',
    tag: 'dashboard',
    description: 'Deep blue professional data dashboard. Ideal for monitoring panels, analytics platforms, and operations dashboards.',
    author: 'datavis',
    downloads: 1456,
    rating: 4.7,
    reviews: 28,
    badge: 'popular',
    previewStyle: 'dark',
    previewType: 'dashboard',
    tree: ['dashboard-dark/', '  README.md', '  .archui/index.yaml', '  dark-sidebar/', '  metric-panels/', '  resources/'],
    reviewsList: [
      { author: 'ops-lead', stars: 5, text: 'The monitoring panel looks completely refreshed — the team loves the new dark style.' },
    ],
  },
  {
    id: 'landing-saas',
    name: 'SaaS Landing Page',
    category: 'Landing Page',
    tag: 'landing',
    description: 'Classic SaaS landing structure — nav bar, hero section, feature grid, pricing table, CTA. Conversion-rate optimized.',
    author: 'growth-kit',
    downloads: 1890,
    rating: 4.8,
    reviews: 34,
    badge: 'hot',
    previewStyle: 'saas',
    previewType: 'landing',
    tree: ['landing-saas/', '  README.md', '  .archui/index.yaml', '  hero-section/', '  feature-grid/', '  pricing-table/', '  cta-block/', '  resources/'],
    reviewsList: [],
  },
  {
    id: 'landing-bold',
    name: 'Bold Dark Landing',
    category: 'Landing Page',
    tag: 'landing',
    description: 'Dark background with gradient highlights. Perfect for developer tools, AI products, and tech brands. High visual tension.',
    author: 'nightdev',
    downloads: 823,
    rating: 4.6,
    reviews: 15,
    badge: null,
    previewStyle: 'bold',
    previewType: 'landing',
    tree: ['landing-bold/', '  README.md', '  .archui/index.yaml', '  dark-hero/', '  gradient-features/', '  resources/'],
    reviewsList: [],
  },
  {
    id: 'settings-ios',
    name: 'iOS-style Settings',
    category: 'Settings',
    tag: 'settings',
    description: 'iOS-native settings page design — grouped rounded cards on gray background. Great for mobile web and hybrid apps.',
    author: 'mobilekit',
    downloads: 678,
    rating: 4.5,
    reviews: 11,
    badge: 'new',
    previewStyle: 'ios',
    previewType: 'settings',
    tree: ['settings-ios/', '  README.md', '  .archui/index.yaml', '  setting-group/', '  toggle-row/', '  resources/'],
    reviewsList: [],
  },
  {
    id: 'payment-stripe',
    name: 'Stripe-style Payment',
    category: 'Payment',
    tag: 'payment',
    description: 'Payment form inspired by Stripe Checkout. Clear input guidance, supports card number, expiry, and CVV fields.',
    author: 'paykit',
    downloads: 1567,
    rating: 4.9,
    reviews: 38,
    badge: 'hot',
    previewStyle: 'stripe',
    previewType: 'payment',
    tree: ['payment-stripe/', '  README.md', '  .archui/index.yaml', '  card-form/', '  order-summary/', '  resources/'],
    reviewsList: [],
  },
  {
    id: 'auth-social',
    name: 'Social Login',
    category: 'Authentication',
    tag: 'auth',
    description: 'One-click social login module — Google, Apple, GitHub, WeChat. Button group with OAuth flow spec.',
    author: 'archpark',
    downloads: 1120,
    rating: 4.7,
    reviews: 21,
    badge: 'popular',
    previewStyle: 'social',
    previewType: 'auth',
    tree: ['auth-social/', '  README.md', '  .archui/index.yaml', '  oauth-buttons/', '  callback-handler/', '  resources/'],
    reviewsList: [],
  },
  {
    id: 'onboarding-steps',
    name: 'Step-by-step Onboarding',
    category: 'Onboarding',
    tag: 'onboarding',
    description: 'Green-gradient multi-step onboarding. Progress bar with step forms, ideal for post-registration user initialization flow.',
    author: 'growth-kit',
    downloads: 445,
    rating: 4.4,
    reviews: 7,
    badge: 'new',
    previewStyle: 'steps',
    previewType: 'onboarding',
    tree: ['onboarding-steps/', '  README.md', '  .archui/index.yaml', '  progress-bar/', '  step-form/', '  resources/'],
    reviewsList: [],
  },
]

const TAGS = [
  { key: 'all', label: 'All', count: MOCK_MODULES.length },
  { key: 'login', label: 'Login / Registration', count: MOCK_MODULES.filter(m => m.tag === 'login').length },
  { key: 'dashboard', label: 'Dashboard', count: MOCK_MODULES.filter(m => m.tag === 'dashboard').length },
  { key: 'landing', label: 'Landing Page', count: MOCK_MODULES.filter(m => m.tag === 'landing').length },
  { key: 'payment', label: 'Payment', count: MOCK_MODULES.filter(m => m.tag === 'payment').length },
  { key: 'settings', label: 'Settings', count: MOCK_MODULES.filter(m => m.tag === 'settings').length },
  { key: 'auth', label: 'Authentication', count: MOCK_MODULES.filter(m => m.tag === 'auth').length },
  { key: 'onboarding', label: 'Onboarding', count: MOCK_MODULES.filter(m => m.tag === 'onboarding').length },
]

export { TAGS }

// Pre-seed My Modules with 2 entries so the UI isn't empty on first visit
const INITIAL_MY_MODULES = MOCK_MODULES.filter(m => m.id === 'login-glass' || m.id === 'dashboard-cards')

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  modules: MOCK_MODULES,
  activeTag: 'all',
  searchQuery: '',
  sortKey: 'hot',
  selectedModuleId: null,
  compareList: [],
  myModules: INITIAL_MY_MODULES,
  replacingModuleUuid: null,

  setActiveTag(tag) { set({ activeTag: tag }) },
  setSearchQuery(query) { set({ searchQuery: query }) },
  setSortKey(key) { set({ sortKey: key }) },
  selectModule(id) { set({ selectedModuleId: id }) },

  toggleCompare(id) {
    const { compareList } = get()
    if (compareList.includes(id)) {
      set({ compareList: compareList.filter(x => x !== id) })
    } else {
      if (compareList.length >= 4) return
      set({ compareList: [...compareList, id] })
    }
  },

  clearCompare() { set({ compareList: [] }) },

  addToMyModules(id) {
    const { modules, myModules } = get()
    if (myModules.some(m => m.id === id)) return
    const mod = modules.find(m => m.id === id)
    if (mod) set({ myModules: [...myModules, mod] })
  },

  removeFromMyModules(id) {
    set({ myModules: get().myModules.filter(m => m.id !== id) })
  },

  setReplacingModule(uuid) { set({ replacingModuleUuid: uuid }) },

  resetHubState() {
    set({ activeTag: 'all', searchQuery: '', sortKey: 'hot', selectedModuleId: null, compareList: [] })
  },

  filteredModules() {
    const { modules, activeTag, searchQuery, sortKey } = get()
    let result = modules.filter(m => {
      const tagMatch = activeTag === 'all' || m.tag === activeTag
      const q = searchQuery.toLowerCase()
      const searchMatch = !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      return tagMatch && searchMatch
    })

    switch (sortKey) {
      case 'new': result = [...result].sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0)); break
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break
      case 'downloads': result = [...result].sort((a, b) => b.downloads - a.downloads); break
      case 'hot': default: result = [...result].sort((a, b) => (b.badge === 'hot' ? 1 : 0) - (a.badge === 'hot' ? 1 : 0) || b.downloads - a.downloads); break
    }

    return result
  },
}))
