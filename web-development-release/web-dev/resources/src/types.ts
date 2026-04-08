/** Cross-module link as stored in .archui/index.yaml */
export interface ModuleLink {
  uuid: string
  relation?: string
  description?: string
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

export interface ChildModule {
  folderName: string
  uuid: string
  path: string
  name: string
  description: string
  submoduleCount: number
  links: ModuleLink[]
}

export interface ProjectIndexEntry {
  uuid: string
  path: string
  parentPath: string | null
  name: string
  description: string
  submodules: Record<string, string>
  links: ModuleLink[]
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
