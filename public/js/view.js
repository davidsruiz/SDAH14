
import localizationStrings from "./localization.js"
import {
  normalizeQueryWithPunctuation,
  clearemptystrings,
  weakRanks,
  usableLocalStorage,
} from "./util.js"

// --------------- //
// ---- React ---- //
// --------------- //

export default class HymnAppView extends React.Component {

  constructor(props) {
    super(props);
    this.colors = [
      ['#EEEEEE', '#424242', '#D32F2F'],
      ['#424242', '#DCDCDC', '#FBC02D'],
      ['#5734A8', '#DCDCDC', '#FBC02D'],
      ['#FBC02D', '#424242', '#424242'],
    ];
    this.state = {
      pages: {
        home: true,
        list: false,
        search: false,
        hymn: false,
        account: false,
      },
      activeGroup: 'recents',
      hymn: 1,
    };
    this.hymnalChoices = Object.keys(this.props.hymnal).map(key =>
      [key, this.props.hymnal[key].year + ' ' +
      localizationStrings[this.props.hymnal[key].languageCode].words[this.props.hymnal[key].languageCode]]);

  }

  showPage(page) {

    // search
    setTimeout(()=>{
      if(page === 'search') {
        const searchBar = document.querySelector('#search-bar-input');
        if(searchBar) searchBar.focus();
        if(searchBar) searchBar.select();
      } else if(page === 'hymn') {
        const searchBar = document.querySelector('#search-bar-input');
        if(searchBar) searchBar.blur();
      }
    }, 500);

    const pages = this.state.pages;
    pages[page] = true;
    this.setState({ pages });
  }

  hidePage(page) {

    // search
    setTimeout(()=>{
      if(page === 'search') {
        const searchBar = document.querySelector('#search-bar-input');
        if(searchBar) searchBar.blur();
      } else if(page === 'hymn') {
        if(this.state.pages.search) {
          const searchBar = document.querySelector('#search-bar-input');
          if(searchBar) searchBar.focus();
          if(searchBar) searchBar.select();
        }
      }
    }, 500);

    const pages = this.state.pages;
    pages[page] = false;
    this.setState({ pages });
  }

  showList(group) {
    this.setState({ activeGroup: group });
    this.showPage('list');
  }

  openHymn(hymn) {
    this.props.actions.recent(hymn);
    this.setState({ hymn });
    this.showPage('hymn');
  }

  setTheme(theme) {
    // set in doc css
    document.documentElement.style.setProperty('--primary-color', this.colors[theme][0]);
    document.documentElement.style.setProperty('--secondary-color', this.colors[theme][1]);
    document.documentElement.style.setProperty('--accent-color', this.colors[theme][2]);

  }

  render() {


    const user = this.props.user;
    const hymnal = this.props.hymnal[user.hymnal];

    const language = user.language || hymnal.languageCode;
    const languageStrings = localizationStrings[language];
    this.setTheme(this.props.user.theme);

    const popular = this.props.popular[user.hymnal] || [];

    let list = [];
    switch(this.state.activeGroup) {
      case 'favorites':
        list = user.favorites;
        break;
      case 'recents':
        list = user.recents;
        break;
      case 'popular':
        list = popular;
        break;
    }

    return (
      <div id="hymn-app">

        <HymnAppHomePage
          show={this.state.pages.home}
          title={languageStrings.words.hymnal}
          user={user}
          hymnalChoices={this.hymnalChoices}
          hymnal={hymnal}
          popular={popular}
          theme={user.theme}
          openHymn={n => this.openHymn(n)}
          onFavorite={n => this.props.actions.favorite(n)}
          cycleTheme={() => this.props.actions.cycleTheme()} // <<
          onHymnal={h => this.props.actions.setHymnal(h)}
          languageStrings={languageStrings}
          showList={page => this.showList(page)}
          showPage={page => this.showPage(page)}
          logout={() => this.props.actions.logout()} />

        <HymnAppListPage
          show={this.state.pages.list}
          title={languageStrings.words[this.state.activeGroup]}
          list={list}
          hymns={hymnal.data}
          user={user}
          openHymn={n => this.openHymn(n)}
          onFavorite={n => this.props.actions.favorite(n)}
          languageStrings={languageStrings}
          hidePage={() => this.hidePage('list')} />

        <HymnAppSearchPage
          show={this.state.pages.search}
          hymns={hymnal.data}
          favorites={user.favorites}
          openHymn={n => this.openHymn(n)}
          onFavorite={n => this.props.actions.favorite(n)}
          languageStrings={languageStrings}
          hidePage={() => this.hidePage('search')} />

        <HymnAppHymnPage
          show={this.state.pages.hymn}
          hymn={this.state.hymn}
          hymns={hymnal.data}
          favorites={user.favorites}
          onFavorite={n => this.props.actions.favorite(n)}
          languageStrings={languageStrings}
          hidePage={() => this.hidePage('hymn')} />

        <HymnAppAccountPage
          show={this.state.pages.account}
          title={languageStrings.words.account}
          user={user}
          google={() => this.props.actions.signIn.google()}
          facebook={() => this.props.actions.signIn.facebook()}
          onSignOut={2}
          languageStrings={languageStrings}
          hidePage={() => this.hidePage('account')} />

      </div>
    );

  }

}

// class HymnAppPage extends React.Component {
//
//
//   openHymn() {
//     // n => this.props.actions.logHymn(n)
//
//
//   }
//
//
//   render() {
//     return (
//
//     );
//   }
//
// }

class HymnAppHomePage extends React.Component {

  constructor(props) {
    super(props);

    this.sectionListLength = 3;
  }

  render() {

    let pageClass = 'app-page';
    if(!this.props.show) pageClass += ' hidden';

    const hymnal = this.props.hymnal;
    const hymns = hymnal.data;

    const favoritesShow = !!this.props.user.favorites.length;
    const recentsShow = !!this.props.user.recents.length;
    const popularShow = !!this.props.popular.length;

    const popularSectionLength = (!recentsShow && !favoritesShow) ? 7 : 3 ;

    const accountButton = this.props.user.name ? this.props.user.name : this.props.languageStrings.words.signIn;
    const accountButtonAction = this.props.user.name ? (() => (window.confirm('logout?') && this.props.logout())) : () => this.props.showPage('account');

    const hymnalChoices = this.props.hymnalChoices.map(([value, text]) => <option key={value} value={value}>{text}</option>);
    // const hymnalChoices = this.props.hymnalChoices.map(text => <option>{text}</option>);

    return (
      <div id="home-page" className={pageClass}>
        <div className="page-content">

          <div className="page-top">
            <span className="title-bar">
              <span className="page-title">{this.props.title}</span>
              <span className="left-title">
                <ThemeButton theme={this.props.user.theme} onClick={() => this.props.cycleTheme()} />
              </span>
            </span>
            <span className="subtitle-bar">
              <span id="hymnal-info">

                <select value={this.props.user.hymnal} onChange={e => this.props.onHymnal(e.target.value)}>
                  {hymnalChoices}
                </select>
                
                {/*{`${hymnal.year} ${this.props.languageStrings.words[hymnal.languageCode]}`}*/}
                
                </span>
              <span id="account-button" onClick={accountButtonAction}>{accountButton}</span>
            </span>
          </div>

          <div className="page-bottom">


            <hr className={recentsShow ? '' : 'hide'} />

            <div className={recentsShow ? 'home-section' : 'home-section hide'}> { /* TODO -- fix! inefficient */ }
              <span
                className="home-section-title"
                onClick={() => this.props.showList('recents')}>{ this.props.languageStrings.words.recents + ' ▾'}</span>
              <HymnList
                hymns={hymns}
                list={this.props.user.recents.slice(0, this.sectionListLength)}
                favorites={this.props.user.favorites}
                recents={this.props.user.recents}
                sortMethod="Latest Viewed"
                onClick={n => this.props.openHymn(n)}
                onFavorite={n => this.props.onFavorite(n)} />
            </div>

            <hr className={favoritesShow ? '' : 'hide'} />

            <div className={favoritesShow ? 'home-section' : 'home-section hide'}>
              <span
                className="home-section-title"
                onClick={() => this.props.showList('favorites')}>{ this.props.languageStrings.words.favorites + ' ▾'}</span>
              <HymnList
                hymns={hymns}
                list={this.props.user.favorites.slice(-this.sectionListLength)}
                favorites={this.props.user.favorites}
                recents={this.props.user.recents}
                sortMethod="by Favorites"
                onClick={n => this.props.openHymn(n)}
                onFavorite={n => this.props.onFavorite(n)} />
            </div>

            <hr className={popularShow ? '' : 'hide'} />

            <div className={popularShow ? 'home-section' : 'home-section hide'}>
              <span
                className="home-section-title"
                onClick={() => this.props.showList('popular')}>{ this.props.languageStrings.words.popular + ' ▾'}</span>
              <HymnList
                hymns={hymns}
                list={this.props.popular.slice(0, popularSectionLength)}
                favorites={this.props.user.favorites}
                recents={this.props.user.recents}
                onClick={n => this.props.openHymn(n)}
                onFavorite={n => this.props.onFavorite(n)} />
            </div>
          </div>

          <div id="fab" onClick={() => this.props.showPage('search')}>
            <MaterialIcon code="search" />
          </div>

        </div>
      </div>
    );
  }
}

class HymnAppListPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sortMethod: 'Latest Viewed',
    };
    this.sortMethodOptions = [
      'Latest Viewed',
      'Oldest Viewed',
      'Alphabetically',
      'Reverse Alphabetically',
      'by Favorites',
      'by Number Ascending',
      'by Number Descending',
    ]
  }

  updateSortMethod(method) {
    this.setState({
      sortMethod: method,
    })
  }

  
  render() {

    let pageClass = 'app-page';
    if(!this.props.show) pageClass += ' hidden';

    return (

      <div id="list-page" className={pageClass}>
        <div className="page-content">
          <div className="page-top">
            <span className="page-title">{this.props.title}</span>
            <span className="left-title">
                <CloseButton onClick={() => this.props.hidePage()} />
              </span>
          </div>
          <div className="page-bottom">

            <span className="subtitle-bar">
              <ListSort options={this.sortMethodOptions} onChange={method => this.updateSortMethod(method)} languageStrings={this.props.languageStrings} />
            </span>
            <HymnList
              hymns={this.props.hymns}
              list={this.props.list}
              favorites={this.props.user.favorites}
              recents={this.props.user.recents}
              sortMethod={this.state.sortMethod}
              onClick={n => this.props.openHymn(n)}
              onFavorite={n => this.props.onFavorite(n)} />

          </div>
        </div>
      </div>
      
    );
  }
}

class HymnAppSearchPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      query: '',
      list: [],
    };
  }

  updateSearchQuery(query) {

    const list = this.search(this.props.hymns, query);
    console.log(list);


    this.setState({ query, list: list.map(entry => entry.hymn.number) })
  }

  search(hymnal, query) {

    let ranks = [];
    for(let i = 0; i < hymnal.length; i++) {
      ranks.push({hymn: hymnal[i], rank: 0});
    }

    // Similarity Check. 70%
    // var wt = 0.7; var wt1 = 0.8 * wt; var wt2 = 0.2 * wt; // Number or Title: 80% (56%)
    const similarityCheckWeight = 1.0; //0.7;
    for(let i = 0; i < ranks.length; i++) {
      const numberRank = (this.compare(query, ranks[i].hymn.number)) * similarityCheckWeight;
      const titleRank  = (this.compare(normalizeQueryWithPunctuation(query), normalizeQueryWithPunctuation(ranks[i].hymn.name))) * similarityCheckWeight;
      ranks[i].rank += (numberRank > titleRank) ? numberRank : titleRank;
    }
    // Content: 20% (14%)
    // Not computed "on the fly" to save memory, should be indexed

    // Overall Popularity. 20%
    // var freq;
    // if(database)
    //   for(var i = 0; i < ranks.length; i++) {
    //     if(freq = database[loaded_hymnal_id][ranks[i].hymn.number]) {
    //       ranks[i].rank += f2(freq)/2;
    //       // log(`hymn ${ranks[i].hymn.number} freq ${freq} weight ${f2(freq)}`)
    //     }
    //   }

    // History. 10%
    // var str = getLocalStorageKey("history");
    // if(str) {
    //   var obj = JSON.parse(str)
    //   if(obj) {
    //     var list = obj[loaded_hymnal_id];
    //     if(list) {
    //       var occurences = {};
    //       for(var j = 0; j < list.length; j++) {
    //         if(!occurences[list[j]]) occurences[list[j]] = 0;
    //         occurences[list[j]]++;
    //       }
    //       var times = 0;
    //       for(var i = 0; i < ranks.length; i++) {
    //         if(times = occurences[ranks[i].hymn.number]) ranks[i].rank += f1(times);
    //       }
    //       // log(occurences)
    //     }
    //   }
    // }

    // Last Category. 10%
    // if(lastHymn && (lastHymn.category || lastHymn.subcategory)) {
    //   if(lastHymn.category)
    //     var similar = ranks.filter(function(elem) {return elem.hymn.category == lastHymn.category;})
    //   if(lastHymn.subcategory)
    //     var similar = ranks.filter(function(elem) {return elem.hymn.subcategory == lastHymn.subcategory;})
    //
    //   for(var entry of similar)
    //     entry.rank += 10;
    //   // log('similar');
    //   // log(similar.map(function(e) {return `${e.hymn.subcategory || e.hymn.category} ${e.hymn.number} ${e.hymn.name}`}));
    // } else {
    //   for(var entry in ranks)
    //     entry.rank += 10;
    // }

    ranks.sort((a, b) => b.rank - a.rank);

    const maxResults = 5;
    ranks = ranks.slice(0, maxResults);

    // log(ranks.filter(weakRanks).map(function(e) {return `${e.rank} ${e.hymn.name}`}));

    return ranks.filter(weakRanks(0));
  }

  compare(str1, str2) {
  var result = 0;

  var averageChars = (str1.length + str2.length) / 2;
  var averageWords = (str1.split(" ").length + str2.split(" ").length) / 2;

  // Exact Matching 40%
  var totalCharactersMatched = 0
  for(var g = 0; g < str1.length; g++) {
    if(str1[g] != str2[g]) break;
    totalCharactersMatched++;
  }
  result += (totalCharactersMatched / averageChars) * 0.4;

  // Word Matching 40%
  var totalWordsMatched = 0;
  var words1 = str1.split(" ").filter(clearemptystrings);
  var words2 = str2.split(" ").filter(clearemptystrings);
  for(var g = 0; g < words1.length; g++) {
    var indexOf = words2.indexOf(words1[g]);
    if(indexOf != -1) {
      words2.splice(indexOf, 1);
      totalWordsMatched++;
    }
  }
  result += (totalWordsMatched / averageWords) * 0.4;

  // Character Matching 20%
  var searcher = (str1.length > str2.length) ? str2 : str1;
  var searched = (str1.length > str2.length) ? str1 : str2;
  var longestLength = searched.length;
  totalCharactersMatched = 0;
  for(var g = 0; g < searcher.length; g++) {
    var indexOf = searched.indexOf(searcher[g]);
    if(indexOf != -1) {
      searched = searched.slice(indexOf + 1);
      totalCharactersMatched++;
    } else {break}
  }
  result += (totalCharactersMatched / longestLength) * 0.2;

  return result * 100;
}

  things() {

    function compareRanks(a, b) {
      return b.rank - a.rank;
    }

    function isC(elem) {
      return elem.hymn.category == category;
    }

    function isS(elem) {
      return elem.hymn.subcategory == subcategory;
    }

    function f1(x) { //computational function
      return Math.places((-8 / (x + (4/5))) + 10, 2)
    }

    function f2(x) { // takes a frequency number(0-10000's), returns weight(0-20).. adjust 0.02
      return Math.places((-8 / ((x * 0.02) + (4/5))) + 10, 2)
    }

  }

  render() {

    let pageClass = 'app-page';
    if(!this.props.show) pageClass += ' hidden';

    return (

      <div id="search-page" className={pageClass}>
        <div className="page-content">
          <div className="page-top">
            <SearchBar onChange={q => this.updateSearchQuery(q)} placeholder={this.props.languageStrings.words.search} />
            <span className="left-title">
                <CloseButton onClick={() => this.props.hidePage()} />
              </span>
          </div>
          <div className="page-bottom">

            <HymnList
              hymns={this.props.hymns}
              list={this.state.list}
              favorites={this.props.favorites}
              onClick={n => this.props.openHymn(n)}
              onFavorite={n => this.props.onFavorite(n)} />

          </div>
        </div>
      </div>

    );
  }

}

class HymnAppHymnPage extends React.Component {

  hymnLyrics(hymn) {

    let lyrics = [];
    const newLine = '';

    if(hymn.other) {

      for(let group of hymn.other) {
        for(let line of group)
          lyrics.push(line + newLine);
        lyrics.push(newLine);
      }

    } else {

      const refrainGroup = [];
      const verseGroup = [];

      let verseCounter = 1;
      for(let verseLines of hymn.verses) {
        let group = [];
        group.push(`${this.props.languageStrings.words.verse} ${verseCounter++}`);
        for(let line of verseLines)
          group.push(line);
        group.push(newLine);
        verseGroup.push(group)
      }

      if(hymn.refrain) {

        for(let verseLines of hymn.verses) {
          let group = [];
          group.push(this.props.languageStrings.words.refrain);
          for(let line of hymn.refrain)
            group.push(line);
          group.push(newLine);
          refrainGroup.push(group)
        }

        let firstGroup = verseGroup;
        let secondGroup = refrainGroup;
        
        if(hymn.refrainFirst) {
          firstGroup = refrainGroup;
          secondGroup = verseGroup;
        }

        for(let i = 0; i < hymn.verses.length; i++) {
          for(let line of firstGroup[i])
            lyrics.push(line);
          for(let line of secondGroup[i])
            lyrics.push(line);
        }

      } else {

        for(let groupLines of verseGroup)
          for(let line of groupLines)
            lyrics.push(line);

      }

    }

    return lyrics.join('\n');

  }

  render() {

    let pageClass = 'app-page';
    if(!this.props.show) pageClass += ' hidden';

    const hymn = this.props.hymns[this.props.hymn - 1];

    // hymn lyrics



    return (
      <div id="hymn-page" className={pageClass}>
        <div className="page-content">

          <div className="page-top">
            <span className="title-bar">
              <span className="hymn-number">{hymn.number}</span>
              <span className="left-title">
                <FavoriteButton active={this.props.favorites.indexOf(hymn.number) !== -1} onClick={() => this.props.onFavorite(hymn.number)} />
                <CloseButton onClick={() => this.props.hidePage()} />
              </span>
            </span>
            <span className="subtitle-bar">
              <span id="hymn-name">{hymn.name}</span>
            </span>
          </div>

          <hr/>

          <div className="page-bottom">
            <div id="hymn-lyrics">
              {this.hymnLyrics(hymn)}
            </div>
          </div>

        </div>
      </div>
    );
  }

}

class HymnAppAccountPage extends React.Component {

  render() {

    let pageClass = 'app-page';
    if(!this.props.show) pageClass += ' hidden';

    return (

      <div id="account-page" className={pageClass}>
        <div className="page-content">
          <div className="page-top">
            <span className="page-title">{this.props.title}</span>
            <span className="left-title">
                <CloseButton onClick={() => this.props.hidePage()} />
              </span>
          </div>
          <div className="page-bottom">

            <div id="signin-buttons">
              <img
                src="./resources/images/googleSignin.svg"
                alt="Google Sign In"
                onClick={() => this.props.google()} />
              {/*<img*/}
                {/*src="./resources/images/facebookSignin.svg"*/}
                {/*alt="Facebook Sign In"*/}
                {/*onClick={() => this.props.signin('facebook')} />*/}
            </div>

          </div>
        </div>
      </div>

    );
  }
}

class ListSort extends React.Component {

  render() {

    const translatedOptions = this.props.options.map(option => this.props.languageStrings.sortMethods[option]);
    const values = this.props.options.slice();

    // let options = [];
    // for(let option of this.props.options) {
    //   options.push(
    //     <option key={option}>{this.props.languageStrings.sortMethods[option]}</option>
    //   );
    // }
    // return (
    //   <span id="list-sort">
    //     {this.props.languageStrings.words.sort}: <select id="list-sort-select" onChange={e => this.props.onChange(e.target.value)} dir="rtl">
    //       {options}
    //     </select>
    //   </span>
    // );

    return (
      <span id="list-sort">
        {this.props.languageStrings.words.sort}: <VariableWidthSelect
          id="list-sort-select"
          onChange={e => this.props.onChange(e.target.value)}
          dir="rtl"
          options={translatedOptions}
          values={values} />

      </span>
    );
  }
}

class HymnList extends React.Component {

  // TODO : make efficient

  render() {

    const {
      hymns,
      list,
      favorites = [],
      recents = [],
      sortMethod,
    } = this.props;
    let mappedList = list.map(n => hymns[n - 1]);

    if(sortMethod) {

      let method;
      switch(this.props.sortMethod) {
        case 'Latest Viewed':
          method = (a, b) => recents.indexOf(b.number) - recents.indexOf(a.number);
          break;
        case 'Oldest Viewed':
          method = (a, b) => recents.indexOf(a.number) - recents.indexOf(b.number);
          break;
        case 'Alphabetically':
          method = (a, b) => a.name.localeCompare(b.name);
          break;
        case 'Reverse Alphabetically':
          method = (a, b) => b.name.localeCompare(a.name);
          break;
        case 'by Favorites':
          method = (a, b) => favorites.indexOf(b.number) - favorites.indexOf(a.number);
          break;
        case 'by Number Ascending':
          method = (a, b) => a.number - b.number;
          break;
        case 'by Number Descending':
          method = (a, b) => b.number - a.number;
          break;
      }

      mappedList = mappedList.sort(method);

    }

    const entries = mappedList.map(hymn =>
      <HymnEntry
        key={hymn.number}
        number={hymn.number}
        name={hymn.name}
        favorited={favorites.indexOf(hymn.number) !== -1}
        onClick={() => this.props.onClick(hymn.number)}
        onFavorite={() => this.props.onFavorite(hymn.number)} />
    );

    return (
      <div className="hymn-list">
        {entries}
      </div>
    );
  }

}

class HymnEntry extends React.Component {

  render() {


    return (
      <div className="hymn-entry" onClick={() => this.props.onClick()} >
        <span className="hymn-entry-number">{this.props.number}</span>
        <span className="hymn-entry-title">{this.props.name}</span>
        <span className="hymn-entry-favorite">
          <FavoriteButton active={this.props.favorited} onClick={() => this.props.onFavorite()} />
        </span>
      </div>
    );
  }
}

class SearchBar extends React.Component {

  render() {
    return (
      <span id="search-bar">
        <input id="search-bar-input" type="text" onChange={e => this.props.onChange(e.target.value)} placeholder={this.props.placeholder} />
      </span>
    );
  }
}

class CloseButton extends React.Component {

  render() {
    return (
      <div className="page-close" onClick={() => this.props.onClick()}>
        <MaterialIcon code="close" />
      </div>
    );
  }
}

class FavoriteButton extends React.Component {
  render() {

    const className = this.props.active ? 'favorite active' : 'favorite';

    return (
      <div className={className} onClick={e => {e.stopPropagation(); this.props.onClick()} }>
        <MaterialIcon code="favorite" />
      </div>
    );
  }
}

class MaterialIcon extends React.Component {
  render() {
    return (
      <i className="material-icons">{this.props.code}</i>
    );
  }
}

class ThemeButton extends React.Component {

  render() {

    const imageSource = `./resources/images/${this.props.theme}-themeIcon.svg`;

    return (
      <div className='theme-button' onClick={() => this.props.onClick()}>
        <img src={imageSource} alt="Theme Button" />
      </div>
    );
  }

}


class VariableWidthSelect extends React.Component {

  constructor(props) {
    super(props);

    this.IDS = {
      mainSelectClassID: '_' + Math.round(Math.random()*10000),
      referenceSelect: 'ref_select__',
      referenceSelectOption: 'ref_select_option__',
    };
  }

  componentDidMount() {
    this.updateWidth();
  }

  optionChosen(event) {
    this.updateWidth()
    this.props.onChange(event);
  }

  updateWidth() {
    const selectNode = document.querySelector(`.${this.IDS.mainSelectClassID}`);
    const selectedOption = selectNode.querySelector(`:checked`);
    const referenceSelect = document.getElementById(this.IDS.referenceSelect);
    const referenceSelectOption = document.getElementById(this.IDS.referenceSelectOption);
    if(!referenceSelect || !referenceSelectOption) return;
    referenceSelectOption.innerHTML = selectedOption.innerHTML;
    selectNode.style.width = `${referenceSelect.offsetWidth}px`;
  }
  
  render() {

    let {
      id = '',
      className = '',
      onChange = () => {},
      dir = 'rtl',

      options = [],
      values,
    } = this.props;

    const optionTags = [];
    for(let i = 0; i < options.length; i++) {
      const option = options[i];
      const value = (typeof values[i] !== 'undefined') ? values[i] : option;
      optionTags.push(
        <option key={option} value={value}>{option}</option>
      );
    }

    return (
      <div>
        <select id={id} className={className + ' ' + this.IDS.mainSelectClassID} onChange={e => this.optionChosen(e)} dir={dir}>
          {optionTags}
        </select>
        <select id={this.IDS.referenceSelect} style={{position: 'fixed', top: '-100px'}}>
          <option id={this.IDS.referenceSelectOption}></option>
        </select>
      </div>
    );
  }
}

