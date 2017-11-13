
// import ReactDOM from 'react-dom';
import HymnApp from './view.js';
import FirebaseUser from './firebase.js';
// import { data } from "../resources/objects/hymnal_data.js"

const callback = (()=>{
  const mountNode = document.querySelector('#container');
  const language = 'en';


  const render = () => {
    ReactDOM.render(
      <HymnApp tree={reactDataTree} />,
      mountNode
    );
  }

  const fu = new FirebaseUser(() => render());
  const signin = provider => {
    switch(provider) {
      case 'google':
        fu.googleSignin();
        break;
      case 'facebook':
        fu.facebookSignin();
        break;
    }
  };
  const logout = () => fu.logout();
  const onFavorite = n => fu.favorite(n);
  const onRecent = n => fu.recent(n);

  const reactDataTree = {

    hymnal: data[language],

    user: fu.user,

    groups: fu.groups,

    signin,
    logout,
    onFavorite,
    onRecent,


  };

});

window.onload = callback;




