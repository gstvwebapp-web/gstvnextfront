declare global {
  interface Window {
    tinymce: {
      init: (config: any) => void;
      get: (selector: string) => any;
      remove: (selector: string) => void;
      triggerSave: () => void;
    };
  }
}

export {};
