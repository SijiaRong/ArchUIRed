/** Cross-module link as stored in .archui/index.yaml */
export interface ModuleLink {
  uuid: string
  relation?: string
  description?: string
  fromPortId?: string  // child UUID of the source port row; absent = module-level handle
}

/** Parsed .archui/index.yaml */
export interface IndexYaml {
  schema_version: string
  uuid: string
  submodules?: Record<string, string> // folder-name → child-uuid
  links?: ModuleLink[]
}

/** Centralized layout stored in .archui/layout.yaml */
export type LayoutFile = Record<string, Record<string, { x: number; y: number }>>

/** Parsed README.md frontmatter */
export interface ReadmeFrontmatter {
  name: string
  description: string
}

/** A fully-loaded ArchUI module */
export interface ArchModule {
  /** Absolute (or root-relative) filesystem path */
  path: string
  name: string
  description: string
  uuid: string
  submodules: Record<string, string> // folder-name → child-uuid
  links: ModuleLink[]
  layout: Record<string, { x: number; y: number }>
  /** Immediate children (loaded one level deep) */
  children: ChildModule[]
}

/** A lightweight summary of a grandchild module, for detail-panel submodule list */
export interface SubmoduleSummary {
  uuid: string
  folderName: string
  name: string
  description?: string
}

export interface ChildModule {
  folderName: string
  uuid: string
  path: string
  name: string
  description: string
  links: ModuleLink[]       // child's own outgoing links (from its .archui/index.yaml)
  submodules: SubmoduleSummary[]  // child's own direct submodules (one level deeper)
}

/** A directory entry returned by the server /api/fs/list */
export interface DirEntry {
  name: string
  type: 'file' | 'dir'
}

/** Generic filesystem adapter interface */
export interface FsAdapter {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  listDir(path: string): Promise<DirEntry[]>
  exists(path: string): Promise<boolean>
  mkdir(path: string): Promise<void>
}
