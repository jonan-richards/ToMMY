import { HLJSApi } from 'highlight.js';

declare global {
    export interface Window {
        hljs: HLJSApi & {
            lineNumbersBlock: (element: HTMLElement) => void;
        };
    }
}
