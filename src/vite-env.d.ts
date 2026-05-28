/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module 'vite-plugin-copy' {
  import { Plugin } from 'vite';
  
  interface CopyTarget {
    src: string;
    dest: string;
    rename?: string;
  }
  
  interface CopyOptions {
    targets: CopyTarget[];
    hook?: string;
  }
  
  function copy(options: CopyOptions): Plugin;
  
  export default copy;
}
