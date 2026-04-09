/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FS_MODE: 'server' | 'fsa' | 'mem'
  readonly VITE_SERVER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg?url' {
  const src: string
  export default src
}
