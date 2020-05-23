import React, { Component } from 'react'; //import React Component;
import _ from 'lodash';
import 'whatwg-fetch';
import Fuse from "fuse.js";
import { Route, Switch, Redirect } from 'react-router-dom';
//Import material-ui icons -------------------------------------------------
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
//---------------------------------------------------------------------------
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, UncontrolledAlert } from 'reactstrap';
import firebase from 'firebase/app';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { stack as Menu } from 'react-burger-menu';
import Popup from "reactjs-popup";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modals: [false, false],
      user: null,
      loading: true,
      theDate: new Date
    };

  }

  // Changes the date value within the App's overall state.
  changeDate = (value) => {
    let theDate = this.state.theDate;
    theDate.setDate(theDate.getDate() + value);
    this.setState({theDate: theDate});
  }

  // "Toggles" one or more modals within the App's state to either true or false
  // depending on its previous state.
  toggleModals = (modals) => {
    let currState = this.state;
    modals.forEach( (modalIndex) => {
      let modals = currState.modals;
      modals[modalIndex] = !modals[modalIndex];
      return modals;
    })
    this.setState(currState);
  }

  // Necessary function for the reactstrap modals, toggles modal one specifically.
  reactToggleOne = () => {
    this.toggleModals([0]);
  }

  // Necessary function for the reactstrap modals, toggles modal two specifically.
  reactToggleTwo = () => {
    this.toggleModals([1]);
  }

  // Renders modal one within the DOM. If modal one is not supposed to be active, i.e. 
  // it is false within the app state, it redirects the user to the homepage.
  modalOne = () => {
    if (!this.state.modals[0] && !this.state.modals[1]) {
      return <Redirect to="/" />;
    }
    return <ModalComponentOne modal={this.state.modals[0]} toggleModals={this.toggleModals}
            reactModal={this.reactToggleOne} />;
  }

  // Renders modal two within the DOM. If modal two is not supposed to be active, it
  // redirects to the homepage.
  modalTwo = (routerProps) => {
    if (!this.state.modals[0] && !this.state.modals[1]) {
      return <Redirect to="/" />;
    }
    return <ModalComponentTwo {...routerProps} modal={this.state.modals[1]} reactModal={this.reactToggleTwo}
            toggleModals={this.toggleModals} user={this.state.user} date={this.state.theDate} />;
  }

  // Renders the landing (also referred to as homepage) within the DOM. Passes in state
  // values necessary for the landing to render additional components like modals and 
  // the pieces of the body.
  landing = () => {
    return <Landing toggleModals={this.toggleModals} modals={this.state.modals} user={this.state.user}
            signOut={this.handleSignOut} date={this.state.theDate} change={this.changeDate} />;
  }

  // Sets the sign in options (via firebase) that the app uses: email, Google, and Facebook.
  firebaseUiConfig = {
    signinOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    signInFlow: 'popup'
  }

  // Loads user information via a Firebase DB when the app first mounts onto the DOM.
  // Listens to changes made in the users information.
  componentDidMount() {
    this.unregFunction = firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {       
        this.setState({
          user: currentUser, 
          loading: false,
        });
      } else {
        this.setState({
          user: null,
          loading: false,
        });
      }
    })
  }

  // Stops listening for new user information when the App closes. 
  componentWillUnmount() {
    this.unregFunction();
  }

  //A callback function for registering new users
  handleSignUp = (email, password, handle, avatar) => {
    this.setState({errorMessage:null}); //clear any old errors

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        let user = userCredentials.user;
        let updatePromise = user.updateProfile({
          displayName: handle,
          photoURL: avatar
        });
        return updatePromise;
      })
      .catch((err) => {
        this.setState({errorMessage: err.message})
      });
  }

  //A callback function for logging in existing users
  handleSignIn = (email, password) => {
    this.setState({errorMessage: null}); //clear any old errors

    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((err => {
        this.setState({errorMessage: err.message})
      }));
  }

  //A callback function for logging out the current user
  handleSignOut = () => {
    this.setState({errorMessage:null}); //clear any old errors

    firebase.auth().signOut()
      .catch((err => {
        this.setState({errorMessage: err.message})
      }));
  }
  
  // Renders the overall App
  render() {

    let content = null; //content to render
    let Modal = () => ( //modal for about us
      <Popup
        trigger={<button className="aboutUs"> About The App </button>}
        modal
        closeOnDocumentClick
      >
        <span className="informationUs"> 
          This app was created by Matthew Mcvicker and Dan Lu. Users can create workouts and search exercises
          from bodybuilding.com. Users can also track their sets and reps.
        </span>
      </Popup>
    );
    
    // If in a loading state, displays a spinner
    if(this.state.loading) {
      return (
      <div className="text-center">
        <i className="fa fa-spinner fa-spin fa-3x" aria-label="Connecting..."></i>
      </div>
      );
    }

    if(!this.state.user) { //if logged out, show signup form
      content = (
        <div className="big-flex">
          <div className="login-header">
            <h1>FORGE 34</h1>
          </div>
          <div className="login-body">
            <div className="front-image">
              <h2 className="front-text">Easily create and track your own workouts</h2>
              <p className="subtext">With over 15 exercises, users can search and create their own workout routines with ease!</p>
            </div>
            <StyledFirebaseAuth uiConfig={this.firebaseUiConfig} firebaseAuth={firebase.auth()} />
            <Modal className="aboutUs" />
          </div>
        </div>
      );
    } 
    else { //if logged in, provides the potential paths for users to explore on our website
      content = (
        <div className="big-flex">
          <main>
            <Switch>
              <Route exact path="/" render={this.landing}/>
              <Route exact path="/add-exercise" render={this.modalOne} />
              <Route path="/add-exercise/:exerciseName" render={this.modalTwo} />
              <Redirect to="/" />
            </Switch>
          </main>
        </div>
      );
    }

    // Renders an alert if the user fails to log in.
    return (
      <div className="second-in-command">
        {this.state.errorMessage &&
          <p className="alert alert-danger">{this.state.errorMessage}</p>
        }
        {content}
      </div>
    );
  }
}

// The Landing component. Renders the Header, Slider, and MainBody components
class Landing extends Component {
  componentDidMount() {
    this.props.modals.forEach((bool, index) => {
      if (bool) {
        this.props.toggleModals([index]);
      }
    });
  }

  render() {
    return (
      <div className="flex-container-body">
        <Header user={this.props.user} signOut={this.props.signOut} />
        <Slider date={this.props.date} change={this.props.change} />
        <MainBody toggleModals={this.props.toggleModals} user={this.props.user} 
          date={this.props.date} change={this.props.change} />
      </div>
    );
  }
}

// The Header component. On mobile, contains the hamburger menu, with the logout button, and the
// website title 
class Header extends Component {
  render() {
    return (
      <div className="flex-item fi-one">
        <WebHeader user={this.props.user} signOut={this.props.signOut} />
        <nav className="nav-mobile">
          <div id="hamburger-menu">
            <Menu> 
              <button id="logout" className="btn btn-danger" onClick={this.props.signOut}>
                Log Out {this.props.user.displayName}
              </button>
              <Footer />
            </Menu>
          </div>
          <a className="link">
            <h1>FORGE34</h1>
          </a>
        </nav>
      </div>
    );
  }
}

// The mobile Slider component. Contains the date on mobile view and lets users change the date
// via arrows.
class Slider extends Component {
  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  backClick = () => {
    this.props.change(-1);
  }

  forwardClick = () => {
    this.props.change(1);
  }

  render() {

  let theDate = this.monthNames[this.props.date.getMonth()] + " " + 
    this.props.date.getDate() + ", " + this.props.date.getFullYear();

    return (
      <div className="flex-item class-slider">
        <div className="black-bar flex-container-row">
          <div className="header-item-day">
            <h2>{theDate}</h2>
          </div>
          <div className="header-item" >
            <ArrowBackIosIcon onClick={this.backClick} />
          </div>
          <div className="header-item">
            <ArrowForwardIosIcon onClick={this.forwardClick} />
          </div>
        </div>
      </div>
    );
  }
}

// HEADER FOR WEB-VIEW LEFT SIDE PAGE
class WebHeader extends Component {
  render() {
    return(
      <nav id="nav-web" className="flex-container-column">
        <div className="nav-header">
          <h1>FORGE34</h1>
        </div>
        <NavIsActive />
        <button id="logout" className="btn btn-danger" onClick={this.props.signOut}>
          Log Out {this.props.user.displayName}
        </button>
        <Footer />
      </nav>
    );
  }
}

class Footer extends Component {
  render() {
    return(
      <footer className="foot-class">
        <div className="separate-icons">
          <p>© 2019 FORGE34</p>
        </div>
    </footer>
    )
  }
}

// Contains and renders the Left-Hand NavBar in web view
class NavIsActive extends Component {

  navIcons = [
    {Number: 2, Name: <FitnessCenterIcon className="material-icons cust-size"/>,
    Reference: "#", active: "nav-item-active", paragraph:"Workouts", activeText: "Workouts"},
  ];

  render() {

    return(
      <MakeReference navIconsY={this.navIcons} />
    );
  } 
}

// Component representing the quicklinks in the web-view NavBar
class MakeReference extends Component {
  render() {
    let elements = this.props.navIconsY.map((objects, index) => {
      return (
      <div className={objects.active} key={index}>
        <a href={objects.Reference}>{objects.Name}</a><p>{objects.paragraph}</p>
      </div>
      );
    })
    return(elements);
  }
}

// MainBody component, contains web date and arrows, as well as the exercise list
class MainBody extends Component {
  constructor(props) {
    super(props)

    this.state = {lifts: []};
  }

  // Populates the exercise list with information that it recieves from the Firebase DB
  populate = () => {    
    let monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    this.theDate = monthNames[this.props.date.getMonth()] + " " + 
      this.props.date.getDate() + ", " + this.props.date.getFullYear();
  
    this.dbRef = firebase.database().ref(this.props.user.uid).child(this.theDate + "/UserTrayState/Exercises");
    this.dbRef.on("value", (snapshot) => {
      let currLifts = [];
      if (snapshot.val()) {
        let exerciseObj = snapshot.val();
        let trayKeyArray = Object.keys(exerciseObj);
        trayKeyArray.forEach((liftName) => {
          let lift = {};
          lift.name = liftName;
          let urlKey = Object.keys(exerciseObj[liftName].Url);
          lift.url = exerciseObj[liftName].Url[urlKey];
          lift.id = urlKey;
          lift.sets = [];
          let setsKeyArray = Object.keys(exerciseObj[liftName].Sets);
          setsKeyArray.forEach((setKey) => {
            lift.sets.push(exerciseObj[liftName].Sets[setKey])
          });
          currLifts.push(lift);
        });
      }
      this.setState({lifts: currLifts});
    });
  }

  componentDidMount() {
    this.populate();
  }

  componentWillReceiveProps() {
    this.populate();
  }


  componentWillUnmount() {
    this.dbRef.off();
  }

  editTray = (newLift) => {
    this.setState((currState) => {
      let newLifts = currState.lifts;
      newLifts.push(newLift);
      return {lifts: newLifts}
    });
  }

  render() {

    let exercises = this.state.lifts.map((lift) => {
      return <Exercise key={lift.id} lift={lift} user={this.props.user} date={this.theDate} />
    });

    return (
      <div className="flex-item-fc">
        <div className="flex-container-column">
          <MainHeader date={this.theDate} change={this.props.change} />
          <div className="web-day flex-container-column">
            {exercises}
            {this.state.lifts.length === 0 ? <UncontrolledAlert color="info">
              <p>It's empty in here. Click the button below to add an exercise!</p>
            </UncontrolledAlert> : null}
            <AddNewExercise toggleModals={this.props.toggleModals} whenClicked={this.editTray} />
          </div>
        </div>
      </div>
    );
  }
}

// The Website's header, located within the main body. Has arrows that allow users to set the date.
class MainHeader extends Component {

  backClick = () => {
    this.props.change(-1);
  }

  forwardClick = () => {
    this.props.change(1);
  }

  render() {
    return (
    <div className="web-main-header flex-container-row">
      <div className="left-header-item flex-container-row">
        <div className="header-item-day">
          <h2>{this.props.date}</h2>
        </div>
        <div className="header-item">
          <ArrowBackIosIcon onClick={this.backClick} />
        </div>
        <div className="header-item">
          <ArrowForwardIosIcon onClick={this.forwardClick} />
        </div>
      </div>
    </div>
    );
  }
}

// Creates an exercise object. This displays a picture representing the exercise
// as well as the set information.
class Exercise extends Component {
  constructor(props) {
    super(props)
    this.state = {
        sets: this.props.lift.sets
    };
  } 

  toggleClass(index) {
    let sets = this.state.sets;
    sets[index].active = !sets[index].active;
    this.setState({
      sets: sets
    });
  }

  // Allows users to delete an exercise from their tray and from the database.
  deleteExercise = () => {
    let path = this.props.user.uid + '/' + this.props.date + '/UserTrayState/Exercises/' + this.props.lift.name;
      let theRef = firebase.database().ref(path);
      theRef.remove();
  }

  render() {
    let allTrue = true;
    let setSetter = this.state.sets.map((set, index) => {
      allTrue = allTrue && Boolean(set.active);
      return (
        <div onClick={() => this.toggleClass(index)} key={index} className={"set" + (set.active ? " set-complete" : "")}>
          <p className="weight">{set.Weight + "lbs"}</p>
          <p>{set.Reps}</p>
        </div>
      )
    });
    let backgroundImage = {backgroundImage: "url(" + this.props.lift.url + ")"}

    return (
      <div className="day-item">
        <div className="day-item2 flex-container-row">
          <div className={"picture " + this.props.lift.id} style={backgroundImage}>
          </div>
          <div className={"lift" + (allTrue ? " complete" : "")}>
          <button type="button" className="delete-button" onClick={this.deleteExercise}>&times;</button>
            <h3>{this.props.lift.name}</h3>
            <div className="flex-container-row sets">
              {setSetter}
            </div>
          </div>
          <div className={"checkComplete" + (!allTrue ? " hideCheck" : "")}>
              <a href="#"><FontAwesomeIcon icon={ faCheck } /></a>
          </div>
          <div className="active">
          </div>
        </div>
      </div>
    );
  }
}

// Renders a button that on click, toggles modal one to true in the overall state, which allows
// users to add a new exercise to their tray.
class AddNewExercise extends Component {
  constructor(props){
    super(props);
    this.state = {shouldRedirect: false};
  }

  handleClick = () => {
    this.props.toggleModals([0]);
    this.setState({shouldRedirect: true});
  }

  render() {
    if (this.state.shouldRedirect) {
      return <Redirect to="/add-exercise" />;
    }

    return (
      <button data-modal-target="#myModal" id="button0" className="add-button" onClick={this.handleClick} >
        <AddCircleOutlineIcon />
      </button>
    );
  }
}

// Modal One, which allows users to search for an exercise and select one to add to their tray.
class ModalComponentOne extends Component {
  constructor(props) {
    super(props);

    this.state={input: '', results: [], data: [], shouldRedirect: false};
  }

  // Loads the exercise data from within the Firebase DB
  componentDidMount() {
    this.dbRef = firebase.database().ref('data');
    this.dbRef.on("value", (snapshot) => {
      let item = {};
      if (snapshot.val()) {
        item = snapshot.val();
      }
      this.setState({data: item});
    });
  }

  componentWillUnmount() {
    this.dbRef.off();
  }

  handleClick = () => {
    this.setState({shouldRedirect: true});
  }

  inputting = (letter) => {
    this.setState({
      input: letter,
    });
  }

  // Searches through the data loaded from the DB with a fuzzy search. Returns the resulting array.
  fuzzyBoi = () => {
    let options = {
      shouldSort: true,
      tokenize: true,
      findAllMatches: true,
      threshold: 0.4,
      location: 0,
      distance: 9999999999,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "name",
        "muscle"
      ]
    };
    let fuse = new Fuse(this.state.data, options);
    let result = fuse.search(this.state.input);
    return result;
  }

  render() {
    if (this.state.shouldRedirect) {
      return <Redirect to="/" />;
    }

    let theResults = this.state.results.map((result, index) => {
      return <SearchResultComponent key={index} result={result} toggleModals={this.props.toggleModals} />
    });

    return (
      <div>
        <Modal centered isOpen={this.props.modal} toggle={this.props.reactModal} className={this.props.className}>
          <ModalHeader toggle={this.handleClick}>Add an exercise!</ModalHeader>
          <ModalBody>
            <div id="searcher">
              <form className="form-inline">
                <div className="form-group mr-3">
                  <input type="text" name="term" id="searchQuery" className="form-control"
                    placeholder="Search for an exercise!"
                    onChange={(change) => {
                      this.inputting(change.target.value)
                    }} 
                  />
                </div>
                <button id="searchBut" className="btn btn-primary" onClick={ (event) => {
                  event.preventDefault();
                  this.setState({results: this.fuzzyBoi()});
                  }
                }>
                  <FontAwesomeIcon icon={ faSearch } />Search
                </button>
              </form>
              <div id="resultsPane" className="flex-container-column">
                {theResults}
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

// Represents the search result components that result from the search in modal one. On click links
// to Modal Two which allows users to specify set information
class SearchResultComponent extends Component {
  constructor(props) {
    super(props);

    this.state={shouldRedirect: false};
  }

  handleClick = () => {
    this.props.toggleModals([0,1]);
    this.setState({shouldRedirect: true});
  }

  render() {

    if (this.state.shouldRedirect) {
      return <Redirect to={"/add-exercise/" + this.props.result.name}/>; 
    }

    let backgroundImage = {backgroundImage: "url(" + this.props.result.url + ")"};

    return (
      <button className="searchResultLine flex-container-row" onClick={this.handleClick}>
        <div className="pictureLine" style={backgroundImage}>
        </div>
        <div className="name-space">
          <p className="searchResultName">{this.props.result.name}</p>
        </div>
      </button>
    );
  }
}

// Component for Modal Two, which allows users to specify set information for their 
// selected exercise and add it to their tray.
class ModalComponentTwo extends Component {
  constructor(props) {
    super(props);

    this.state={
      lift: {},
      liftKey: null,
      sets: [{ Weight: "", Reps: ""}],
      isValid: true,
    };

  }

  // Takes the route parameter and searches through the database for the item matching that 
  // param. Sets the 'lift' object within state to that item.
  componentDidMount() {
    this.liftName = this.props.match.params.exerciseName;
    this.dbRef = firebase.database().ref('data').orderByChild("name").equalTo(this.liftName);
    this.dbRef.on("value", (snapshot) => {
      let item = {};
      let key = null;
      if (snapshot.val()) {
        item = snapshot.val();
        key = Object.keys(item);
      }
      this.setState({lift: item, liftKey: key});
    });
  }

  componentWillUnmount() {
    this.dbRef.off();
  }

  // Submits a chosen exercise - including name, the date, picture, and set information to the DB
  submitExercise = () => {
    let monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    let theDate = monthNames[this.props.date.getMonth()] + " " + this.props.date.getDate() + ", " + 
      this.props.date.getFullYear();

    let allValid = true;
    this.state.sets.forEach((item) => {
      allValid = allValid && !(!item.Weight || !item.Reps);
      allValid = allValid && (Number.isInteger(item.Weight) && Number.isInteger(item.Reps));
      allValid = allValid && (item.Weight > 0 && item.Reps > 0);
    });
    if (allValid) {
      let path = this.props.user.uid + '/' + theDate + '/UserTrayState/Exercises/' + 
        this.state.lift[this.state.liftKey].name + '/Url';
      let theRef = firebase.database().ref(path);
      theRef.remove();
      theRef.push(this.state.lift[this.state.liftKey].url);
      let currState = this.state;
      path = this.props.user.uid + '/' + theDate + '/UserTrayState/Exercises/' + 
        this.state.lift[this.state.liftKey].name + '/Sets';
      theRef = firebase.database().ref(path);
      theRef.remove();
      currState.sets.forEach((item) => {
        let theRef = firebase.database().ref(path);
        theRef.push(item); 
      })
      this.setState(currState, () => this.props.reactModal());
    } else {
      this.setState({isValid: false});
    }
  }

  // Adds a new setDeets component.
  handleClick = () => {
    let currState = this.state;
    if (currState.sets.length <= 5) {
      currState.sets.push({ Weight: "", Reps: "" });
      this.setState(currState);
    }
  }

  // Sets the weight for a specific setDeets component within state.
  changeWeight = (index, input) => {
    let sets = this.state.sets;
    if (!isNaN(input * 1)) {
      sets[index].Weight = input * 1;
      this.setState({ sets: sets });
    } else {
      sets[index].Weight = input;
    }
    this.setState({ sets: sets });
  }

  // Sets the reps for a specific setDeets component within state.
  changeReps = (index, input) => {
    let sets = this.state.sets;
    if (!isNaN(input * 1)) {
      sets[index].Reps = input * 1;
      this.setState({ sets: sets });
    } else {
      sets[index].Reps = input;
    }
    this.setState({ sets: sets })
  }

  reset = () => {
    this.setState({sets: [{ Weight: "", Reps: ""}]});
  }

  toggleValid = () => {
    let currState = this.state;
    currState.isValid = true;
    this.setState({currState});
  }

  render() {
    if (this.state.liftKey) {
      let backgroundImage = {backgroundImage: "url(" + this.state.lift[this.state.liftKey].url + ")"};

      let renderedSets = this.state.sets.map((set, index) => <SetDeets changeWeight={this.changeWeight} 
                         changeReps={this.changeReps} {...set} index={index} key={index}/>);
      return (
        <div>
          <Modal centered isOpen={this.props.modal} toggle={this.props.reactModal} className={this.props.className + " customHeight"}>
            <Alert color="danger" isOpen={!this.state.isValid} toggle={this.toggleValid}>
              <p>Please submit valid set information; i.e. no negatives, decimals, or empty fields!</p>
            </Alert>
            <ModalHeader toggle={this.props.reactModal}>{this.state.lift[this.state.liftKey].name}</ModalHeader>
            <ModalBody>
              <div className="flex-container-modal">
                <div className="pictureLine2" style={backgroundImage}>
                </div>
                <div className="modal-box">
                  <div className="set-builder flex-container-row sets2">
                    {renderedSets}
                    {this.state.sets.length === 5 ? null : <div id="add-set" className="set2">
                      <button id="button3" className="add-button" onClick={this.handleClick}>
                        <AddCircleOutlineIcon />
                      </button>
                    </div> }
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" onClick={this.submitExercise}>Confirm</Button>{' '}
              <Button color="secondary" onClick={this.reset}>Reset</Button>
            </ModalFooter>
          </Modal>
        </div>
      );
    } else {
      return null;
    }
  }
}

// A SetDeets component, which renders the user-specified weight and reps of a set within modal two
class SetDeets extends Component {

  render() {
    let index = this.props.index;
    return (
      <div id="set-deets0" className="set2">
        <p className="weight how-heavy">{!this.props.Weight ? "Weight" : this.props.Weight + "lbs"}</p>
        <p className="how-many">{!this.props.Reps ? "Reps" : this.props.Reps}</p>

         <input type="text" id="lbs-set0" className="form-control" placeholder="Weight" value={this.props.Weight}
        onChange={(change) => {
          this.props.changeWeight(index, change.target.value)
        }} />

        <input type="text" id="rep-set0" className="form-control" placeholder="Reps" value={this.props.Reps}
        onChange={(change) => {
          this.props.changeReps(index, change.target.value)
        }} />

      </div>
    );
  }
}

export default App;