export type ValidationCode =
  | 'missing-readme'
  | 'missing-index'
  | 'invalid-index-yaml'
  | 'undeclared-subfolder'
  | 'missing-submodule-folder'
  | 'structure/missing-layout'
  | 'index/forbidden-layout-field'
  | 'index-submodule-missing-on-disk'
  | 'undeclared-directory-in-index'
  | 'missing-uuid'
  | 'invalid-frontmatter'
  | 'missing-name'
  | 'missing-description'
  | 'forbidden-frontmatter-field'
  | 'link-missing-uuid'
  | 'layout/node-overlap'

export interface Violation {
  ruleId: ValidationCode | string
  filePath: string
  message: string
  severity?: 'error' | 'warn'
}

export interface IndexYaml {
  schema_version?: string
  uuid?: string
  submodules?: Record<string, string>
  links?: Array<{ uuid?: string; relation?: string; description?: string }>
}
