import 'highlight.js/styles/stackoverflow-dark.css';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';

window.hljs = hljs;
hljs.registerLanguage('python', python);

import('highlightjs-line-numbers.js');
