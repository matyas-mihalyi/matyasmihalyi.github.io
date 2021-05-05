
//DOM ELEMENTS
//
//CLOCK + BUTTONS
const clock = document.querySelector(".timer");
const intervalNameDisplay = document.querySelector(".interval-name");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const stopButton = document.getElementById("stop");

//INTERVAL SUBMIT FORM
const intervalForm = document.getElementById("set-intervals");
const intervalInputs = intervalForm.querySelectorAll("input");
const setButton = document.getElementById("set");
const repeatCheckBox = document.getElementById("repeat");
const intervalTimeInputs = intervalForm.getElementsByClassName("set-interval-time");


let sound1 = new Audio("sounds/glass_ping.wav");

//INTERVALS
let deleteButton; 
let editButton;
let editOkButton;
let editCancelButton;
let copyButton;
const intervalContainer = document.getElementById("intervals");
let intervalElement;
let dragItemArray; //array-t kell csinálni a draggelhető itemek nodeListjéből, hogy tudjuk őket index alapján azonosítani

//////////////////////////////////////
////////////RENDER INTERVALS//////////
//////////////////////////////////////

function renderIntervals () {
    let formHTML = "";
    
    for (let item of intervals)
    formHTML += `
    <div class="interval" draggable="true">
        <div class="name">${item.name}</div>
        <div class="time">${formatTimeLeft(item.timeSet)}</div>
        <button class="edit">edit</button>
        <button class="delete">del</button>
        <button class="copy">copy</button>
    </div>`;
    intervalContainer.innerHTML = formHTML;
    if (intervals.length === 0) {
        clock.innerHTML = "00:00";
        intervalNameDisplay.innerHTML = "";

        startButton.disabled = true;
        stopButton.disabled = true;
    } else {
        clock.innerHTML = formatTimeLeft(intervals[0].timeLeft);
        intervalNameDisplay.innerHTML = `${intervals[0].name}`
    }
    //CLEAR INTERVAL FORM INPUTS
    [...intervalInputs].forEach((input) => input.value="")
    //drag function and variables
    intervalElement = document.querySelectorAll(".interval");
    dragItemArray =  Array.from(intervalElement);
    dragFunction();
 
    
    //check if there are intervals
    if (intervals.length !== 0) {
        //DELETE, EDIT & COPY BUTTONS
        deleteButton = document.querySelectorAll(".delete");
        editButton = document.querySelectorAll(".edit");
        copyButton = document.querySelectorAll(".copy");
        
        for (let i = 0; i < intervals.length; i++) {
            deleteButton[i].onclick = () => {    
                intervals.splice(i, 1);
                renderIntervals();
            }
            editButton[i].onclick = () => editInterval(i);
            copyButton[i].onclick = () => copyInterval(i);
        }
        //adjust container size
        resizeIntervalContainer();
    }
    //enable start & stop buttons if there are intervals
    startButton.disabled = false;
    stopButton.disabled = false;
    setButton.disabled = false;
}


//SUBMIT EVENT
intervalForm.onsubmit = (e) => {
    e.preventDefault();
    if (e.target.min.value === "" && e.target.sec.value ==="") {
        alert("You must set up a time")
    } else {
        let timeSum = parseInt(e.target.min.value*60) + parseInt(e.target.sec.value !== "" ? e.target.sec.value : 0);
        //hozzádja a nevet és az időt 
        e.target.name.value === "" ?
            intervals.push(new CreateTimer(`Interval ${intervals.length + 1}`, timeSum))
            :
            intervals.push(new CreateTimer(e.target.name.value, timeSum));
        //kirendereli az új és az eddigi intervalokat
        renderIntervals();
    }
}




//format time
function formatTimeLeft(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    
    if (seconds < 10) {
        seconds = `0${seconds}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    return `${minutes}:${seconds}`;
}

//EDIT FUNCTION
function editInterval(i) {
    [...intervalElement].forEach((element) => element.setAttribute("draggable", false)); 
    intervalElement[i].innerHTML = `
    <form id="edit-form" action="">
        <input type="text" name="name" class="edited-interval-name" value="${intervals[i].name}">
        <input type="number" min="0" max="90" name="min" class="edited-interval-time" value="${Math.floor(intervals[i].timeSet/60)}"> : 
        <input type="number" min="0" max="1000" name="sec" class="edited-interval-time" value="${intervals[i].timeSet % 60}"> 
    <button type="submit" id="edit-ok">Ok</button>
    <button class="edit-cancel">cancel</button>
    </form>`;
    editForm = document.getElementById("edit-form")
    editOkButton = document.getElementById("edit-ok");
    editCancelButton = document.querySelector(".edit-cancel");

    editCancelButton.onclick = () => renderIntervals();
   
    editForm.onsubmit = (e) => {
        e.preventDefault();
        let timeSum = parseInt(e.target.min.value*60) + parseInt(e.target.sec.value);
        //hozzádja a nevet és az időt
        e.target.name.value === "" ?
        intervals.splice(i, 1, (new CreateTimer(`Interval ${intervals.length + 1}`, timeSum)))
        :
        intervals.splice(i, 1, (new CreateTimer(e.target.name.value, timeSum)));
        
        //kirendereli az új és az eddigi intervalokat
        renderIntervals();
    }
}


//COPY FUNCTION
function copyInterval (i) {
    let intervalCopy =  new CreateTimer(intervals[i].name, intervals[i].timeSet);
    
    intervals.splice(i, 0, intervalCopy);
    
    renderIntervals();
}

//RESIZE #INTERVALS INTERVAL CONTAINER
function resizeIntervalContainer () {
    intervalContainer.style.height = `${(intervalElement[0].offsetHeight+16) * (intervalElement.length)}px`
}

///////////////////////////////////
//////////////BUTTONS//////////////
///////////////////////////////////


//START BUTTON
startButton.onclick = () => {
    
    //find first non-expired interval and start/resume it
    intervals.find((item) => item.isExpired === false).start_timer();
    
   //a lenyomással a set és delete buttont inaktívvá/lenyomhatatlanná kell tenni
    startButton.disabled = true;
    pauseButton.disabled = false;
    setButton.disabled = true;
    [...deleteButton].forEach((button)=>button.disabled=true);
    [...editButton].forEach((button)=>button.disabled=true);
    [...copyButton].forEach((button)=>button.disabled=true);
}

//PAUSE BUTTON
pauseButton.onclick = () => {
    //find running interval and pause it with clearInterval
    for (let i = 0; i < intervals.length; i++) {
        if (intervals[i].isRunning) {
            intervals[i].isRunning === false;
            intervals[i].pause_timer();    
        }
    }
    //enable start button
    startButton.disabled = false;
    pauseButton.disabled = true;
    setButton.disabled = false;
    [...deleteButton].forEach((button)=>button.disabled=false);
    [...copyButton].forEach((button)=>button.disabled=false);
}
//STOP BUTTON
stopButton.onclick = () => {
    intervals.forEach((item) => {
        item.stop_timer();
    });
    //lenyomással legyen ismét elérhető a set és delete gomb
    startButton.disabled = false;
    pauseButton.disabled = true;
    setButton.disabled = false;
    renderIntervals();
}



//////////////////////////////////
///////INTERVAL CONSTRUCTOR///////
///////////////&//////////////////
/////////TIME MEASUREMENT/////////
//////////////////////////////////
                            
CreateTimer.prototype = {
    timerInterval : null,
}

//set the countdown starter method on each interval object
CreateTimer.prototype.start_timer = function startTimer(){
    this.timerInterval = setInterval(() => {
        this.isRunning = true;
        this.timePassed = this.timePassed += 1;
        this.timeLeft = this.timeSet-this.timePassed;
        //render remaining time & interval name
        clock.innerHTML = formatTimeLeft(this.timeLeft);
        intervalNameDisplay.innerHTML = this.name;
        //stop sound
        // sound1.pause();
        // sound1.currentTime = 0;
        //if countdown reaches zero start next interval or finish if it was the last one
        //REPEAT UNCHECKED
        if (this.timeLeft === 0 && !repeatCheckBox.checked) {
            //set current interval to base 
            clearInterval(this.timerInterval);
            this.timePassed = 0;
            this.isRunning = false;
            this.isExpired = true;

            //to start next interval, get current one's index
            let i = intervals.indexOf(this);             
             
            //play alarm sound
            sound1.play();

            //if current interval was the last one, every element of intervals[] is set to base with stop_timer() function
            if (intervals.length === i+1) {
                intervals.forEach((item)=> item.stop_timer());
                renderIntervals();
            //if there are still intervals left, start the next one
            } else if (intervals[i + 1].isExpired === false) {  
                intervals[i + 1].start_timer();
                
            } 
        //REPEAT CHECKED
        } else if (this.timeLeft === 0 && repeatCheckBox.checked) {
            //set current interval to base 
            clearInterval(this.timerInterval);
            this.timePassed = 0;
            this.isRunning = false;
            this.isExpired = true;
            //to start next interval, get current one's index
            let i = intervals.indexOf(this);
             
            //play alarm sound
            sound1.play();

            //if it was the last, set isExpired false to all, and start first timer
            if (intervals.length === i+1) {
                intervals.forEach((interval) => interval.isExpired = false);
                intervals[0].start_timer();
             //if there are still intervals left, start the next one
            } else if (intervals[i + 1].isExpired === false) {  
                intervals[i + 1].start_timer();
            }  
        }
    }, 1000);
    
}

//set the pause function for each interval object
CreateTimer.prototype.pause_timer = function pauseTimer() {
    clearInterval(this.timerInterval);
}


CreateTimer.prototype.stop_timer = function stopTimer() {
    clearInterval(this.timerInterval);
    this.timePassed = 0;
    this.timeLeft = this.timeSet;
    this.isRunning = false;
    this.isExpired = false;
}

//the constructor function. takes time as input and sets it to timeSet key
function CreateTimer(name, num) {
    this.name = name,
    this.timeSet = num,
    this.timePassed = 0,
    this.timeLeft = this.timeSet,
    this.isRunning = false,
    this.isExpired = false
}

//ARRAY STORING THE INTERVALS
let intervals = [];




//////////////////////////
///////DRAG & DROP////////
//////////////////////////



function dragFunction() { 

    let intervalDragged;
    intervalElement.forEach((item) => 
        item.addEventListener('dragstart', (e) => {
        
            setTimeout(() => {item.classList.add("hide");},0); //draggelt elementet elrejtjük display none-nal
            //ezzel 'kiszedjuk' a draggelt elementet indexét, amivel később visszahívjuk
            e.dataTransfer.setData('text/plain', dragItemArray.indexOf(e.target));
            intervalDragged = intervals[dragItemArray.indexOf(e.target)];
        }
        
        ));
        
    intervalElement.forEach((item) => 
    item.addEventListener(("dragend"), (e)=> {
        e.preventDefault();
        e.target.classList.remove("hide");
        renderIntervals();
    } 
    ));
        
    intervalContainer.addEventListener('dragenter', dragEnter);
    intervalContainer.addEventListener('dragover', dragOver);
    // intervalContainer.addEventListener('dragleave', dragLeave);
    
    function dragEnter (e) {
        e.preventDefault();
    }
    
    function dragOver (e) {
        e.preventDefault();
        //kiszedjük az elementet, amelyik középvonala fölött vagyunk a draggelt elementtel
        let previousItem = getDragAfterElement(e.clientY);
        let previousItemIndex = dragItemArray.indexOf(previousItem);
        
        //az épp draggelt element alatti elementre rárak egy margin-top classt h lejebb menjen
        if (previousItem !== undefined) {
            previousItem.classList.add("dragged-over");
            for (let i = previousItemIndex + 1; i < dragItemArray.length; i++) {
                dragItemArray[i].classList.remove("dragged-over");
            } 
            for (let i = 0; i < previousItemIndex; i++) {
                dragItemArray[i].classList.remove("dragged-over");
            }
            
        }
        //ha az utolsó element alá draggeljük az elementet margin-bottomot kap
        if ((e.clientY - dragItemArray[dragItemArray.length-1].offsetHeight/2) > dragItemArray[dragItemArray.length-1].getBoundingClientRect().top) {
            dragItemArray[dragItemArray.length -1].classList.add("dragged-over-last");
            dragItemArray.forEach((item) => item.classList.remove("dragged-over"));
        } else {
            dragItemArray[dragItemArray.length -1].classList.remove("dragged-over-last");
        }
    }
    
    
    intervalContainer.ondrop = (e) => {
        e.preventDefault();
        //kiszedjük a beküldött adatot, azaz a draggelt element indexét, és így megkapjuk magát az elementet is
        let draggedItemIndex = e.dataTransfer.getData('text/plain'); 
        //kiszedjük az arrayből
        intervals.splice(draggedItemIndex,1);
        //a dragItemArrayből is kiszedjük, hogy visszaillesztsénél passzoljanak az indexek
        dragItemArray.splice(draggedItemIndex,1);
        
        //kiszedjük az elementet, amelyik középvonala fölött vagyunk droppoláskor
        let previousItem = getDragAfterElement(e.clientY);
        let previousItemIndex = dragItemArray.indexOf(previousItem);
        //beillesztyük a megfelelő helyre
        if (previousItemIndex >= 0) {
            intervals.splice(previousItemIndex, 0, intervalDragged);
        } else  {
            intervals.push(intervalDragged);
        }
    //újra rendereljük az intervalokat
    renderIntervals();
    }
    // kiszedi az elementet ami elé bekerül a draggelt element
    function getDragAfterElement(y) {
        return dragItemArray.reduce((closest, item) => {
          const box = item.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: item }
          } else {
            return closest;
          }
        }, {offset: Number.NEGATIVE_INFINITY }).element
    }
}

//////////////////////////////////
//////////////////////////////////
////////////SAVE & LOAD///////////
//////////////////////////////////
//////////////////////////////////
const modal = document.querySelector(".modal");


//////////////////////////////////
/////////////OPEN MENU////////////
//////////////////////////////////
const burger = document.querySelector(".burger");
const navlinks = document.querySelector(".navlink-wrapper");

burger.onclick = () => {
    burger.classList.toggle("burger-active"); navlinks.classList.toggle("nav-active");
}

//////////////////////////////////
///////////SAVE FUNCTION//////////
//////////////////////////////////
const saveModalButton = document.getElementById("save-button");
const saveForm = document.getElementById("save-form");
const cancelSaveForm = document.getElementById("cancel-save")

let savedIntervals = {}; //intervals will be saved here
let extractedIntervals = localStorage.getItem("savedIntervals");
let storedIntervals; //variable for storing intervals loaded from localStorage


//on load import saved intervals & settings from localStorage
window.onload = () => {updateSavedIntervals();}

function updateSavedIntervals () {
    //update variable containing savedIntervals
    extractedIntervals = localStorage.getItem("savedIntervals");
    //only update if there are saved intervals
    if (extractedIntervals !== null) {
        storedIntervals = JSON.parse(extractedIntervals);
        savedIntervals = storedIntervals;
    }
}




//On cancel, close modal & do nothing
cancelSaveForm.onclick = () => {modal.classList.remove("modal-open"); saveForm.classList.remove("form-open");}

//Clicking save brings up the modal & save-form, closes nav
saveModalButton.onclick = () => {
    if (intervals.length !== 0) {
        modal.classList.add("modal-open");
        saveForm.classList.add("form-open");
        burger.classList.remove("burger-active"); 
        navlinks.classList.remove("nav-active");
        //clear value of text input
        saveForm.nameOfInterval.value = "";
    } else {
        alert("You haven't set up any intervals yet");
    }

}

//on submitting save form
saveForm.onsubmit = (e) => {
    e.preventDefault();
    //alert if there is another interval with this name
    if (storedIntervals !== undefined && Object.entries(storedIntervals).some(item => item.some(key => key === `${e.target.nameOfInterval.value}`))) {alert("You already have a save with this name")}
    
    else {
        //add saved interval as property and key to savedIntervals object
        savedIntervals[`${e.target.nameOfInterval.value}`] = intervals.slice(0);
        
        //save savedIntervals to local storage
        localStorage.setItem("savedIntervals", JSON.stringify(savedIntervals));
        
        //update variables
        updateSavedIntervals();
        //close modal & form
        modal.classList.remove("modal-open"); saveForm.classList.remove("form-open"); 
    }
}

//////////////////////////////////
///////////////LOAD///////////////
//////////////////////////////////
const loadModalButton = document.getElementById("load-button");
const loadForm = document.getElementById("load-form");
const cancelLoadForm = document.getElementById("cancel-load");
const savedIntervalContainer = document.querySelector(".saved-interval-container");
let savedIntervalElements;
let deleteSavedButtons;

//Clicking load brings up the modal & save-form, closes nav
loadModalButton.onclick = () => {
    modal.classList.add("modal-open");
    loadForm.classList.add("form-open");
    burger.classList.remove("burger-active"); 
    navlinks.classList.remove("nav-active");
    updateSavedIntervals();
    renderSavedIntervals();
}

//cancel load form
cancelLoadForm.onclick = () => {modal.classList.remove("modal-open"); loadForm.classList.remove("form-open");}

//render saved intervals
function renderSavedIntervals () {
    //check if there are saved intervals
    if (storedIntervals === undefined || Object.keys(storedIntervals).length === 0) {
        alert("You don't have any saved intervals in your browser's storage");
        //close modal if there are none
        modal.classList.remove("modal-open"); loadForm.classList.remove("form-open");
        return;
    } else {
        //set innerHTML for container
        let loadFormHTML = "";
        for (let [key] of Object.entries(storedIntervals))
        loadFormHTML += `
        
        <div class="saved-interval-element">
            <label>
                <span>${[key]}</span>
                <input type="radio" id="${[key]}" name="saveditem" value="${[key]}"> 
            </label>
            <button type="button" class="delete-saved-button">
        </div>`;
        savedIntervalContainer.innerHTML = loadFormHTML;
        // get saved intervals and delete buttons for saved intervals
        savedIntervalElements = savedIntervalContainer.querySelectorAll(".saved-interval-element");
        deleteSavedButtons = savedIntervalContainer.querySelectorAll(".delete-saved-button");
        //delete saved item by deleting its property and key from savedIntervals, clearing local storage, and setting up savedIntervals again
        for (let i = 0; i < deleteSavedButtons.length; i++) {
            deleteSavedButtons[i].onclick = () => {
                delete savedIntervals[`${savedIntervalElements[i].querySelector("span").innerHTML}`];
                localStorage.clear();
                localStorage.setItem("savedIntervals", JSON.stringify(savedIntervals));
                renderSavedIntervals();
            }
        }
    }    
}


//load intervals on click
loadForm.onsubmit = (e) => {
    e.preventDefault();
    
    //the selected input is the property of the saved interval array so we store it in a variable
    intervalToLoad = e.target.saveditem.value;
    //assigning the selected saved item to the intervals array
    intervals = savedIntervals[intervalToLoad];
    
    //refresh displayed intervals
    renderIntervals();
    
    //close modal & form
    modal.classList.remove("modal-open"); loadForm.classList.remove("form-open");
}


//////////////////////////////////
/////////////SETTINGS/////////////
//////////////////////////////////

const optionsModalButton = document.getElementById("settings-button");
const settingsForm = document.getElementById("settings-form");
const cancelSettingsForm = document.getElementById("cancel-settings");

optionsModalButton.onclick = () => {
    //open modal & settings form
    modal.classList.add("modal-open"); settingsForm.classList.add("form-open");
}

cancelSettingsForm.onclick = () => {modal.classList.remove("modal-open"); settingsForm.classList.remove("form-open")}


//////////////////////////////////
//////////////////////////////////
//////////REPEAT SECTIONS/////////
//////////////////////////////////
//////////////////////////////////

let repeatForm;
let cancelRepeatButton;

function renderIntervalsToRepeat() {
    let formHTML = "";
    
    for (let item of intervals)
    formHTML += `
    <div class="interval" draggable="false">
        <div class="name">${item.name}</div>
        <div class="time">${formatTimeLeft(item.timeSet)}</div>
        <input type="checkbox" value="${intervals.indexOf(item)}"> 
    </div>`;
    //embed elements into a form
    formHTML = `<form id="repeat-form">` + formHTML + `
            <label for="times-to-repeat">Times to repeat</label>
                <input type="number" id="times-to-repeat" name="timesToRepeat" min="1" required>
                <button type="submit">okidoki</button>
                <button type="button" id="cancel-repeat-form">cancelláris</button>
            </form>
    `

    //még ki kell találni milyen value alapján fogjuk visszahívni a form által beküldött intervalokat. egyelőre 
    //az INDEX van megadva
    intervalContainer.innerHTML = formHTML;

    repeatForm = document.getElementById("repeat-form");
    cancelRepeatButton = document.getElementById("cancel-repeat-form");
    intervalElement = document.querySelectorAll(".interval"); //might have to use antoher one, this used in drag function

}


//on checking second element select all between them










//add to homescreen


//repeat function, írja ki hányadik ismétlés

//repeat section ~repeat point

//tips

//SAVE

//bea able to overwrite previous saved names

////////////////////////////////////////

//choose sound

//color themes

//edit sound of interval