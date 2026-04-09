/**
 * Marketplace UI strings — English, structured for future i18n migration.
 * Mirrors the pattern of workspace-content.generated.ts but hardcoded for now.
 *
 * Style guide (matches existing app copy):
 *  - Short, verb-led labels for actions
 *  - Sentence case for descriptions
 *  - No trailing periods on labels/hints
 */
export const marketplaceContent = {
  hub: {
    kicker: 'MODULE HUB',
    title: 'Module Hub',
    description: 'Discover and collect modules shared by the community.',
    closeLabel: 'Close',
    closeAriaLabel: 'Close module hub',
  },
  myModules: {
    kicker: 'MY COLLECTION',
    title: 'My Modules',
    description: 'Modules you have collected — add them to your project or use them as replacements.',
    browseHub: 'Browse hub',
    empty: {
      title: 'Nothing here yet',
      body: 'Pull modules from the hub to start building your collection.',
    },
    replacing: 'Replacing',
    replaceWith: 'Use as replacement',
    addToProject: 'Add to project',
    remove: 'Remove',
    closeLabel: 'Close',
    closeAriaLabel: 'Close my modules',
  },
  search: {
    placeholder: 'Search modules\u2026',
    shortcut: '/',
  },
  sort: {
    hot: 'Trending',
    new: 'Newest',
    rating: 'Top rated',
    downloads: 'Most downloaded',
  },
  card: {
    badges: {
      hot: 'Trending',
      new: 'New',
      popular: 'Featured',
    },
    compare: 'Compare',
    compared: 'Compared',
  },
  detail: {
    back: 'Back',
    pull: 'Pull to collection',
    pulled: 'In collection',
    structure: 'Module structure',
    reviews: 'Reviews',
    downloads: 'Downloads',
    rating: 'Rating',
    reviewCount: 'Reviews',
    version: 'Version',
  },
  compare: {
    label: 'Comparing',
    clear: 'Clear all',
  },
  empty: {
    noResults: 'No modules match your search',
    hint: 'Try different keywords or clear the active filter',
  },
  detailPanel: {
    replaceModule: 'Replace module',
  },
  toolbar: {
    moduleHub: 'Module hub',
  },
  commands: {
    addFromMyModules: 'Add from collection',
    addFromMyModulesHint: 'Place a saved module into this workspace',
    moduleHubHint: 'Browse community modules',
  },
  contextMenu: {
    addFromMyModules: 'Add from collection',
  },
  toast: {
    pulled: 'Added to your collection',
    added: 'Module added to project',
    replaced: 'Module replaced successfully',
  },
  tags: {
    all: 'All',
  },
} as const
