// Google Publisher Tag (GPT) type definitions
interface GoogleTag {
  cmd: Array<() => void>;
  display: (slotId: string) => void;
  defineSlot: (adUnitPath: string, size: number[] | number[][], div: string) => any;
  pubads: () => any;
  enableServices: () => void;
  sizeMapping: () => any;
}

interface Window {
  googletag: GoogleTag;
  dataLayer: any[];
  _izq: any[];
  apstag: any;
}

declare global {
  interface Window {
    googletag: GoogleTag;
    dataLayer: any[];
    _izq: any[];
    apstag: any;
  }
}

export {};

