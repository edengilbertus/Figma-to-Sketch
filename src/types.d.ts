// Basic Penpot API type definitions
declare global {
  const penpot: {
    ui: {
      open: (name: string, url: string, options?: { width?: number; height?: number }) => void;
      sendMessage: (message: any) => void;
      onMessage: (callback: (message: any) => void) => void;
    };
    currentPage: {
      id: string;
      name: string;
      appendChild: (shape: any) => void;
    };
    createPage: () => {
      id: string;
      name: string;
      appendChild: (shape: any) => void;
    };
    createRectangle: () => any;
    createEllipse: () => any;
    createText: (content: string) => any;
    createGroup: () => any;
    createFrame: () => any;
    closePlugin: () => void;
  };
}

export {}; 