
import HymnApp from './view.js';
import FirebaseUser from './firebase.js';

export default class HymnAppController {

  constructor() {

    // vars
    this.model = new FirebaseUser();
    this.reactRoot = document.querySelector('#container');

    // actions
    this.model.on('load', () => {
      this.storeActions();
      this.mountView();
    });

  }

  storeActions() {

    this.modelActions = {
      favorite: n => this.model.favorite(n),
      recent: n => this.model.recent(n),
      cycleTheme: () => this.model.cycleTheme(),
      setLanguage: l => this.model.setLanguage(l),
      setHymnal: h => this.model.setHymnal(h),
      signIn: {
        google: () => this.model.googleSignin(),
        facebook: () => this.model.facebookSignin(),
      },
      logout: () => this.model.logout()
    }

  }

  mountView() {

    this.renderView();

    this.model.on('data update', () => this.renderView());
    this.model.on('server update', () => this.renderView()); // <-- better, though non-existent

  }

  renderView() {

    ReactDOM.render(
      <HymnApp
        hymnal={data}
        user={this.model.simpleUser}
        popular={this.model.popularHymns}
        actions={this.modelActions} />,
      this.reactRoot
    );

  }

}

