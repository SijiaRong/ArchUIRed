export function relationColor(relation?: string): string {
  switch (relation) {
    case 'depends-on':
      return 'var(--edge-depends-on)'
    case 'implements':
      return 'var(--edge-implements)'
    case 'extends':
      return 'var(--edge-extends)'
    case 'references':
      return 'var(--edge-references)'
    case 'related-to':
    default:
      return 'var(--edge-related-to)'
  }
}
