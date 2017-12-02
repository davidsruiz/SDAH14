
// // import ReactDOM from 'react-dom';
// import HymnApp from './view.js';
// import FirebaseUser from './firebase.js';
// // import { data } from "../resources/objects/hymnal_data.js"

import HymnAppController from './controller.js';

const callback = (()=>{

  const controller = new HymnAppController();
  window.controller = controller;

});

window.addEventListener('load', () => callback());




