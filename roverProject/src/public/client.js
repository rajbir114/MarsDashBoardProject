const map = Immutable.Map({
  apod: '',
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
  tab: 'pod',
  roverData: null,
  roverPhotos: [],
});

let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

// add our markup to the page
const root = document.getElementById('root')
/*
const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}
*/
const render = async (root, state) => {
    root.innerHTML = App(state)
}

window.addEventListener('load', () => {
  render(root, map);
});

// ------------------------------------------------------  UTIL FUNCTIONS BELOW
function RoverImages(imgArray) {
  const output = imgArray.map(
    img => `<img src="${img}" height="350px" width="100%" />`
  );
  return output.join('');
}

const updateStore = (storeParam, newState) => {
  const newMap = storeParam.merge(newState);
  render(root, newMap);
};

// W3Schools tab reference:
// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
function setTab(tab) {
  const newMap = map.set('tab', tab);
  render(root, newMap);
}

// create content
/*
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}
*/

const App = state => {
  const stateObj = state.toJS();
  const { rovers, apod, tab } = stateObj;
  const activeRoverArr = rovers.filter(name => tab === name.toLowerCase());
  return `
    <button class="tablink" onclick="setTab('pod')">Picture of the Day</button>
    <button class="tablink" onclick="setTab('curiosity')">Curiosity</button>
    <button class="tablink" onclick="setTab('spirit')">Spirit</button>
    <button class="tablink" onclick="setTab('opportunity')">Opportunity</button>
    ${
      activeRoverArr[0]
        ? RoverData(activeRoverArr[0].toLowerCase(), state)
        : ImageOfTheDay(apod)
    }
  `;
};


// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}



const ImageOfTheDay = apod => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  if (
    (!apod || photodate === today.getDate()) &&
    !ImageOfTheDay._imagesRequested
  ) {
    ImageOfTheDay._imagesRequested = true;
    getImageOfTheDay(map);
  }

  if (!apod) {
    return `<h1>Loading...</h1>`;
  }
  // check if the photo of the day is actually type video!
  if (apod.media_type === 'video') {
    return `
      <div id="pod" class="tabcontent">
        <p>See today's featured video <a href="${apod.image.url}">here</a></p>
        <p>${apod.title}</p>
        <p>${apod.explanation}</p>
      </div>
      `;
  }
  return `
      <div id="pod" class="tabcontent">
          <img src="${apod.image.url}" height="350px" width="100%" />
          <p>${apod.image.explanation}</p>
      </div>            
      `;
};

const RoverData = (rover, state) => {
  //console.log('RoverData');
  if (RoverData._called !== rover) {
    RoverData._called = rover;
    getRoverData(rover, state);
  }
  if (!state.get('roverData') || !state.get('roverPhotos').size) {
    return `<h1>Loading...</h1>`;
  }
  return `
    <div class="tabcontent">
      <h1>${state.getIn(['roverData', 'name'])}</h1>
      <ul>
        <li>Launch date ${state.getIn(['roverData', 'launch_date'])}</li>
        <li>Landing date  ${state.getIn(['roverData', 'landing_date'])}</li>
        <li>Status ${state.getIn(['roverData', 'status'])}</li>
        <li>Most recent photos taken on ${state.getIn(['roverData', 'max_date'])}</li>
      </ul>
      ${RoverImages(state.get('roverPhotos').toJS())}
      </div>
      `;
};

// ------------------------------------------------------  API CALLS



const getImageOfTheDay = state => {
  const stateObj = state.toJS();
  const { apod } = stateObj;

  fetch(`https://r950324c957034xreactr0lcusuk-3000.udacity-student-workspaces.com/apod`)
    .then(res => res.json())
    .then(apod => {
      updateStore(state, { apod });
    });
};

const getRoverData = (rover, state) => {
  fetch(`https://r950324c957034xreactr0lcusuk-3000.udacity-student-workspaces.com/rover`)
    .then(response => response.json())
    .then(r => {
    	//console.log('getRoverData');
      const roversByName = {
        // curiosity: {}
      };

      r.rovers.forEach(roverPram => {
        roversByName[roverPram.name.toLowerCase()] = roverPram;
      });

      const { max_date: maxDate } = roversByName[rover];
      fetch(`https://r950324c957034xreactr0lcusuk-3000.udacity-student-workspaces.com/rover/${rover}/${maxDate}`)
        .then(response => response.json())
        .then(roverPhotos => {
          updateStore(state, {
            roverData: roversByName[rover],
            roverPhotos: roverPhotos.photos.map(photo => photo.img_src),
          });
        });
    });
};