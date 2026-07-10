/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `cloud` or unset = PeerJS cloud broker; `host:port` = self-hosted PeerServer */
  readonly VITE_SIGNALING_URL?: string
  readonly VITE_TURN_URL?: string
  readonly VITE_TURN_USERNAME?: string
  readonly VITE_TURN_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.svg' {
  const src: string
  export default src
}
