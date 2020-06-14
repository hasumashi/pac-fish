'use strict';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import './style/prism-dracula.css';
// import 'style/prism-material-oceanic.css';

import './style.css'

console.log('Pac-Fish');

const editor = document.querySelector('#editor');
const jar = CodeJar(editor as any, Prism.highlightElement, {tab: '\t'});

// Update code
jar.updateCode('let foo = bar');

// Get code
let code = jar.toString();

// Listen to updates
jar.onUpdate(code => {
	console.log(code);
});
