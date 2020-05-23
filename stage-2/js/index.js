
const overlay = document.querySelector('#overlay');

let cache;
let isReset = true;
let counter = 0;

function openModalButtons() { //adds eventlistener to button that opens modal
    let modalIds = ["#myModal"];
    modalIds.forEach((modalId, i) => {
        document.querySelector(`#button${i}`).addEventListener('click', () => {
            const modal = document.querySelector(modalId);
            openModal(modal, null);
        })
    })
}

openModalButtons();

overlay.addEventListener('click', closeModals);

function closeModalButtons() {
    let closeMode = document.querySelectorAll('[data-close-button]');
    closeMode.forEach(button => {
        button.addEventListener('click', closeModals);
    })
}

closeModalButtons();

function openModal(modal, item) { //opens modal
    if (modal === null) {
        return
    }
    modal.classList.add('activeModal');
    overlay.classList.add('activeOverlay');
    if (item) {
        document.querySelector("#modal2Title").innerHTML = "";
        document.querySelector("#modal2Title").innerHTML +=item.name;
        document.querySelector(".pictureLine2").style.backgroundImage = "url('"+item.url+"')";
        manipulateSets();
        document.querySelector('#complete-button').addEventListener('click', () => {
            addNewSet(item);
            closeModals();
        });
    }
}

function addNewSet(item) {
    let addedSets = document.querySelectorAll(".addedSet");
    let overallTemplate = $(`
    <div class="day-item">
        <div class="day-item2 flex-container-row">
            <div class="picture custom-${counter}"></div>
            <div class="lift">
                <h3>${item.name}</h3>
                <div class="flex-container-row sets">
                </div>
                <div class="checkComplete">
                    <a href="#"><i class="fa fa-check" aria-label="check"></i></a>
                </div>
            </div>
            <div class="flex-container-row tags">
            </div>
        </div>
    </div>`)
    overallTemplate.find('.custom-'+counter).css("background-image", "url("+item.url+")");

    for (let i = 0; i <= addedSets.length; i++) {
        let weight = document.querySelector("#set-deets" + i + " .how-heavy").innerHTML;
        let reps = document.querySelector("#set-deets" + i + " .how-many").innerHTML;
        let setTemplate = $(`
        <div class="set">
            <p class="weight">${weight}</p>
            <p>${reps}</p>
        </div>`)
        overallTemplate.find(".sets").append(setTemplate);
    }

    $("#button0").before(overallTemplate);
    counter++;
}

function manipulateSets() {
    let previous;
    if (isReset) {
        previous = 1;
        $('#add-set').css('display', 'block');
        isReset = false;
    }

    //We can on these event listeners add the number to a list after something has been typed
    //those not in the list throw an error if user tries to "commit"

    document.querySelector("#lbs-set0").addEventListener('input', () => {
        let weight = document.querySelector("#set-deets0" + " .how-heavy");
        weight.innerHTML = document.querySelector("#lbs-set0").value + "lbs";
    })
    document.querySelector("#rep-set0").addEventListener('input', () => {
        let reps = document.querySelector("#set-deets0" + " .how-many");
        reps.innerHTML = document.querySelector("#rep-set0").value;
    })
    document.querySelector("#add-set").addEventListener('click', () => {
        let template = $(`
            <div id="set-deets${previous}" class="set2 addedSet">
                <p class="weight how-heavy">Weight</p>
                <p class="how-many">Reps</p>
                <input type="text" id="lbs-set${previous}" class="form-control" placeholder="Weight">
                <input type="text" id="rep-set${previous}" class="form-control" placeholder="Reps">
            </div>
        `);
        if (previous <= 4) {
            let set = $('#add-set');
            set.before(template);
            document.querySelector("#lbs-set" + previous).addEventListener('input', (previous) => {
                let target = previous.target.id[previous.target.id.length - 1];
                let weight = document.querySelector("#set-deets" + target + " .how-heavy");
                weight.innerHTML = previous.target.value + "lbs";
            })
            document.querySelector("#rep-set" + previous).addEventListener('input', (previous) => {
                let target = previous.target.id[previous.target.id.length - 1];
                let reps = document.querySelector("#set-deets" + target + " .how-many");
                reps.innerHTML = previous.target.value;
            })
            if (previous === 4) {
                $('#add-set').css('display', 'none');
            }
        }
        previous++;
    })
}

function closeModals() { //closes modal
    const modals = document.querySelectorAll('.myModal.activeModal');
    modals.forEach(modal => {
        modal.classList.remove('activeModal');
        overlay.classList.remove('activeOverlay');
    })
    reset();
}

function reset() {
    let resultsPane = document.querySelector('#resultsPane');
    resultsPane.querySelectorAll('*').forEach(child => {
        child.remove();
    })
    let addedSets = document.querySelectorAll(".addedSet");
    addedSets.forEach(element => {
        element.parentNode.removeChild(element);
    })
    document.querySelector("#set-deets0" + " .how-heavy").innerHTML = "Weight";
    document.querySelector("#set-deets0" + " .how-many").innerHTML = "Reps";
    document.querySelector("#lbs-set0").value = "";
    document.querySelector("#rep-set0").value = "";
    // let addSetOld = document.querySelector("#add-set");
    // let addSetNew = addSetOld.cloneNode(true);
    // addSetOld.parentElement.replaceChild(addSetNew, addSetOld)
    let oldModal2 = document.querySelector("#myModal2");
    let newModal2 = oldModal2.cloneNode(true);
    oldModal2.parentElement.replaceChild(newModal2, oldModal2);
    isReset = true;
}

//======================================================================================================
//======================================================================================================
//WORKING HERE - NEED TO GE THE SET COLORING TO WORK ON ADDED SETS 
//======================================================================================================
//======================================================================================================

//This section changes color of workout set circles based on the click //////////////////////////////
function clickSet () {
    let circleButton = document.querySelectorAll('div.set'); //This gets every single set circle 
    circleButton.forEach(clickColorChange); // For every set circle do the following function 
}

function clickColorChange(input){ //function to change color of sets 
    let numRows = document.querySelectorAll("div.flex-container-row.sets"); //This gets all of the sets containers
    let lightOn = document.querySelectorAll("div.lift"); // This gets all of the lift containers 
    let checkDisplay = document.querySelectorAll("div.checkComplete"); //This gets all of the check complete divs(that hold the checkmark icon)
    //numRows.forEach(isComplete);
    input.addEventListener('click', function() { //add a click event to every set circle
        if(input.className === "set") {
            input.classList.add("set-complete"); //if set is incomplete make it complete 
            for (i = 0; i < numRows.length; i++) {
                isComplete(numRows[i], lightOn[i], checkDisplay[i]);
            }
        } else {
            input.classList.remove("set-complete");
            for (i = 0; i < numRows.length; i++) {
                isComplete(numRows[i], lightOn[i], checkDisplay[i]);
            }
        }
    });
}

function isComplete(input, lightOn, checkDisplay) { //function that tells whether an exercise is completed
    let children = input.childNodes;
    let tracker = 0;
    let arrayHelp = [];
    for(let i = 0; i < children.length; i++) {
        arrayHelp.push(children[i]);
    }
    let filtered = arrayHelp.filter(function(el, index) {
        return index % 2 === 1;
      });
    for(let i = 0; i < filtered.length; i++) {
        if(filtered[i].className === "set set-complete") {
            tracker++;
        }
    }
    if(tracker === filtered.length) {
        lightOn.classList.add("active");
        checkDisplay.style.display = "block";
    } else {
        lightOn.classList.remove("active");
        checkDisplay.style.display = "none";
    }
}

let searchLoading = document.querySelector("div.fa-3x");
function readJson() { //function to read Json file
    //toggle on
    searchLoading.style.display = "block";
    if (!cache) {
        fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            onFetchSuccess(data);
            cache = data;
        })
    } else {
        onFetchSuccess(cache);
    }

}

function onFetchSuccess(data) { //after Fetch success
    //toggle off
    searchLoading.style.display = "none";
    let searchTerm = document.querySelector('#searchQuery').value;
    document.querySelector('#searchQuery').value = '';
    let options = {
        shouldSort: true,
        tokenize: true,
        findAllMatches: true,
        threshold: 0.25,
        location: 0,
        distance: 9999999999,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "name",
          "muscle"
        ]
    };
    let fuse = new Fuse(data.data, options); // "list" is the item array
    let result = fuse.search(searchTerm);
    result.forEach(item => {
        let template = $(`
        <button data-modal-targetSplit="#myModal2" id="searchLineTemplate" class="searchResultLine flex-container-row activeTemplate">
        <div class="pictureLine">
        </div>
        <div class="name-space">
            <p class="searchResultName">${item.name}</p>
        </div>
        </button>`);
        template.find('.pictureLine').css("background-image", "url("+item.url+")"); 
        $("#resultsPane").append(template);
        template.click(() => {
            let modal = document.querySelector("#myModal2");
            openModal(modal, item);
        })
    })
    closeModalButtons();

}

let searchButton = document.querySelector('#searchBut');
searchButton.addEventListener('click', (event) => {
    event.preventDefault();
    let resultsPane = document.querySelector('#resultsPane');
    resultsPane.querySelectorAll('*').forEach(child => {
        child.remove();
    })
    readJson();
})

