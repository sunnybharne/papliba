export const product = {
  name: 'Papliba',
  version: __APP_VERSION__,
  phase: 'Architecture preview',
  repository: 'https://github.com/sunnybharne/papliba',
  site: 'https://papliba.com/',
  piDocs: 'https://pi.dev/docs/latest/',
  piRpcDocs: 'https://pi.dev/docs/latest/rpc/',
} as const;

export const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Architecture', to: '/architecture' },
  { label: 'Docs', to: '/docs' },
  { label: 'Roadmap', to: '/roadmap' },
] as const;
