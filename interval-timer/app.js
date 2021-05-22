
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
let optionsButtons;
const intervalContainer = document.getElementById("intervals");
let intervalElement;
let dragItemArray; //array-t kell csinálni a draggelhető itemek nodeListjéből, hogy tudjuk őket index alapján azonosítani

//////////////////////////////////////
////////////RENDER INTERVALS//////////
//////////////////////////////////////

function renderIntervals () {
    let formHTML = "";
    
    for (let item of intervals) {
        let i = intervals.indexOf(item);
        formHTML += `
        ${intervals[i-1] === undefined && item.repeatGroup > 0 ? "<div class='topbar'></div>" : ""}
        ${intervals[i-1] === undefined && item.repeatGroup > 0? `<div class="times-to-repeat">${item.repeatSet}x</div>` : ""} 
        ${intervals[i-1] !== undefined && intervals[i-1].repeatGroup !== item.repeatGroup && item.repeatGroup > 0? "<div class='topbar'></div>" : ""}
        ${item.repeatGroup > 0 && intervals[i-1] !== undefined && intervals[i-1].repeatGroup !== item.repeatGroup? `<div class="times-to-repeat">${item.repeatSet}x</div>` : ""} 
        
        <div class="interval ${item.repeatSet > 1 ? "repeated" : ""}" draggable="true">
        <div class="name">${item.name}</div>
        <div class="time">${formatTimeLeft(item.timeSet)}</div>
        <button class="edit"></button>
        <button class="delete"></button>
        <button class="copy"></button>
        <button class="options"><div></div><div></div><div></div></button>
        </div>
        ${intervals[i+1] === undefined && item.repeatGroup > 0 ? "<div class='bottombar'></div>" : ""}
        ${intervals[i+1] !== undefined && intervals[i+1].repeatGroup !== item.repeatGroup && item.repeatGroup > 0? "<div class='bottombar'></div>" : ""}
        `;
    }
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
    //EDIT INTERVAL BUTTON SHOWS/HIDES OPTIONS
    
    //CLEAR INTERVAL FORM INPUTS
    [...intervalInputs].forEach((input) => input.value="")
    //drag function and variables
    intervalElement = document.querySelectorAll(".interval");
    dragItemArray =  Array.from(intervalElement);
    dragFunction();
    
    
    //check if there are intervals
    if (intervals.length !== 0) {
        //DELETE, EDIT & COPY BUTTONS
        intervalElement = document.querySelectorAll(".interval");
        deleteButton = document.querySelectorAll(".delete");
        editButton = document.querySelectorAll(".edit");
        copyButton = document.querySelectorAll(".copy");
        optionsButtons = document.querySelectorAll(".options");

        for (let i = 0; i < intervals.length; i++) {
            deleteButton[i].onclick = () => {intervals.splice(i, 1); renderIntervals();}
            editButton[i].onclick = () => editInterval(i);
            copyButton[i].onclick = () => copyInterval(i);
            optionsButtons[i].addEventListener("click", () => {showIntervalOptions(i)})
        }
        //adjust container size
        resizeIntervalContainer();
        //adjust repeat indicators for repeat groups
        adjustRepeatIndicator();
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

//SHOW INTERVAL OPTIONS

function showIntervalOptions(i) {
    
    deleteButton[i].classList.toggle("interval-button-active");
    editButton[i].classList.toggle("interval-button-active");
    copyButton[i].classList.toggle("interval-button-active");
    optionsButtons[i].classList.toggle("options-active");
    
    
    [...intervalElement].filter(element => element !== intervalElement[i])
                        .map((element) => {
                            return element.querySelectorAll("button");
                        })
                        .forEach(element => ([...element].forEach(child => {
                            child.classList.remove("options-active")
                            child.classList.remove("interval-button-active")})))
    
    
}

//EDIT FUNCTION
function editInterval(i) {
    [...intervalElement].forEach((element) => element.setAttribute("draggable", false)); 
    intervalElement[i].innerHTML = `
    <form id="edit-form" action="">
    <input type="text" name="name" class="edited-interval-name" value="${intervals[i].name}">
    <input type="number" min="0" max="90" name="min" class="edited-interval-time" value="${Math.floor(intervals[i].timeSet/60)}"> : 
    <input type="number" min="0" max="1000" name="sec" class="edited-interval-time" value="${intervals[i].timeSet % 60}"> 
        <button type="submit" id="edit-ok"></button>
        <button typpe="button" class="edit-cancel"></button>
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
    intervalCopy.repeatSet = intervals[i].repeatSet;
    intervalCopy.repeat = intervalCopy.repeatSet;
    intervalCopy.repeatGroup = intervals[i].repeatGroup;

    intervals.splice(i, 0, intervalCopy);
    
    renderIntervals();
}

//RESIZE #INTERVALS INTERVAL CONTAINER
function resizeIntervalContainer () {
    // intervalElement = 
    //if repeat form is open add extra height
    if (intervalContainer.querySelector("form") !== null) {
        intervalContainer.style.height = `${((intervalElement[0].offsetHeight+16) * (intervalElement.length + 1))}px`
    } else {
        intervalContainer.style.height = `${(intervalElement[0].offsetHeight+16) * (intervalElement.length)}px`
    }
}

//ADJUST REPEAT INIDCATOR
function adjustRepeatIndicator () {
    let topbar = document.querySelectorAll(".topbar");
    let bottombar = document.querySelectorAll(".bottombar");
    let repeatIndicator = document.querySelectorAll(".times-to-repeat");

    for (let i = 0; i < repeatIndicator.length; i++) {
        topbarBounding = topbar[i].getBoundingClientRect();
        bottombarBounding = bottombar[i].getBoundingClientRect();
        let indicatorPositionTop = 
            ((((bottombarBounding.bottom + window.scrollY) -
            (topbarBounding.top + window.scrollY) + 
            (bottombar[i].offsetHeight / 2)) -
            repeatIndicator[i].offsetHeight) / 2) +
            (topbarBounding.top + window.scrollY);

        repeatIndicator[i].style.top = `${indicatorPositionTop}px`
    }
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
    // intervals.forEach(interval => console.table(`${interval.name} ${interval.isRunning}`))
    intervals.filter(interval => interval.isRunning)
    .forEach(interval => {interval.pause_timer(); interval.isRunning = false; console.log(`${interval.name} paused`)});
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
        this.isExpired = false;
        this.isRunning = true;
        this.timePassed = this.timePassed += 1;
        this.timeLeft = this.timeSet - this.timePassed;
        //render remaining time & interval name
        clock.innerHTML = formatTimeLeft(this.timeLeft);
        intervalNameDisplay.innerHTML = this.name;
        

    //TEMPORARY FIX for pausing at 0
    if (intervals.some(interval => interval.isRunning === true)) {
        startButton.disabled = true;
        pauseButton.disabled = false;
        setButton.disabled = true;
        [...deleteButton].forEach((button)=>button.disabled=true);
        [...editButton].forEach((button)=>button.disabled=true);
        [...copyButton].forEach((button)=>button.disabled=true);
    }

        //to start next interval, get current one's index
        let i = intervals.indexOf(this);  
        
        //REPEAT 
        //if countdown reaches zero start next interval /check for repeat & repeat if needed/ finish if it was the last one
        if (
            this.isRunning === true && //if paused at 00:00 it will start next so check isRunnig flag
            this.repeat > 0 && //if it still needs to be repeated
            this.timeLeft === 0) {  //if the split's time is up

                //current one needs to be repeated one less time
                this.repeat = this.repeat - 1;
                // console.log(this.repeat)
                
                //set current interval to base 
                this.setToBase();
                // console.log("repeat condition");


            //if it's the last one to be repeated
            if (intervals.indexOf(this) !== intervals.length-1 && //it's not the last among all intervals 
                intervals[i+1].repeatGroup !== this.repeatGroup  //it's the last to be repeated 
                ) {
                    if (this.repeat !== 0) { //if it will be repeated more
                        
                        // console.log("last to repeat && will be repeated again");
                        //look for a split to be repeated  that has a repeat value and start it
                        intervals.find(item => item.repeatGroup === this.repeatGroup).start_timer();
                        
                    } else { //if this was the last time it was repeated
                        intervals[i + 1].start_timer();
                        // console.log("last to repeat && won't be repeated again");
                    }                                
            
            //it's the last of all intervals
            } else if (intervals.indexOf(this) === intervals.length-1 
                ) {
                    if (this.repeat !== 0) {
                        intervals.find(item => item.repeatGroup === this.repeatGroup).start_timer();
                        // console.log("last of all intervals & to be repeated");
                    } else {
                           //if infinite repeat is checked 
                            if (repeatCheckBox.checked) {
                                intervals.forEach((interval) => {interval.isExpired = false; interval.repeat = interval.repeatSet;});
                                intervals[0].start_timer();
                            //if there's no infinite repeat
                            } else {  
                                intervals.forEach((interval) => {interval.isExpired = false; interval.repeat = interval.repeatSet;});
                            }    
                    }

            } else { //if it's not the last to be repeated
                // console.log("not last to repeat");
                intervals[i + 1].start_timer();  
            }

   
        //INFINITE REPEAT CHECKED
        } else if (this.timeLeft === 0 && repeatCheckBox.checked && this.isRunning === true) {
            //set current interval to base 
            this.setToBase();
             
            //play alarm sound
            sound1.play();

            //if it was the last
            if (intervals.length === i+1) {
                intervals.forEach((item)=> item.stop_timer());
                intervals[0].start_timer();
            //if there are still intervals left, start the next one
            } else if (intervals[i + 1].isExpired === false) {  
                intervals[i + 1].start_timer();
            }
        }     

        //INFINITE REPEAT UNCHECKED
        else if (this.timeLeft === 0 && !repeatCheckBox.checked && this.isRunning === true) {
            //set current interval to base 
            this.setToBase();
                       
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
        }
    }, 1000);
    
}
//helper functions for .start_timer();

//need one to start next split


//set interval to base
CreateTimer.prototype.setToBase = function setIntervaltoBase () {
    clearInterval(this.timerInterval);
    // this.timerInterval = null;
    this.timePassed = 0;
    this.isRunning = false;
    this.isExpired = true;
}


//set the pause function for each interval object
CreateTimer.prototype.pause_timer = function pauseTimer() {
    clearInterval(this.timerInterval);
}


CreateTimer.prototype.stop_timer = function stopTimer() {
    clearInterval(this.timerInterval);
    // this.timerInterval = null;
    this.timePassed = 0;
    this.timeLeft = this.timeSet;
    this.isRunning = false;
    this.isExpired = false;
    this.repeat = this.repeatSet;
}

//the constructor function. takes time as input and sets it to timeSet key
function CreateTimer(name, num) {
    this.name = name,
    this.timeSet = num,
    this.timePassed = 0,
    this.timeLeft = this.timeSet,
    this.isRunning = false,
    this.isExpired = false,
    //for repeat
    this.repeatSet = 0,
    this.repeat = this.repeatSet
    this.repeatGroup = 0;
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
    intervalForm.classList.remove("set-intervals-active");
    renderIntervals();
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
let intervalsToLoad = [];

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
    itemToLoad = e.target.saveditem.value;

    intervalsToLoad = []; //this variable will store the new interval object, we have to clear it
    
    //we get the saved interval and for each of its items we create object with CreateTimer constructor. this is necessary for the timers to have prototype functions
    for(let i = 0; i < savedIntervals[itemToLoad].length; i++) {
        intervalsToLoad.push(new CreateTimer (`${savedIntervals[itemToLoad][i]["name"]}`,`${savedIntervals[itemToLoad][i]["timeSet"]}`));
        //add repeatSet & repeatGroup
        intervalsToLoad[i]["repeatSet"] = savedIntervals[itemToLoad][i]["repeatSet"]; 
        intervalsToLoad[i]["repeat"] = intervalsToLoad[i]["repeatSet"]; 
        intervalsToLoad[i]["repeatGroup"] = savedIntervals[itemToLoad][i]["repeatGroup"];
    }
    
    //intervals are loaded into main variable    
    intervals = intervalsToLoad;

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
const addRepeatButton = document.querySelector("#add-rep")
let repeatForm;
let cancelRepeatButton;
let repeatFormCheckboxes;
let checkedBoxes = [];
//repeat section flag base value. always add 1 when form is submitted
let repeatGroupFlag = 0;


addRepeatButton.onclick = () => {if (intervals.length >0) {renderIntervalsToRepeat();}}

function renderIntervalsToRepeat() {
    let formHTML = "";
    
    for (let item of intervals) {
    let i = intervals.indexOf(item);
    formHTML += `
        ${intervals[i-1] === undefined && item.repeatGroup > 0 ? "<div class='topbar'></div>" : ""}
        ${intervals[i-1] === undefined && item.repeatGroup > 0? `<div class="times-to-repeat">${item.repeatSet}x<button class="delete interval-button-active" type="button" value="${item.repeatGroup}"></button></div>` : ""} 
        ${intervals[i-1] !== undefined && intervals[i-1].repeatGroup !== item.repeatGroup && item.repeatGroup > 0? "<div class='topbar'></div>" : ""}
        ${item.repeatGroup > 0 && intervals[i-1] !== undefined && intervals[i-1].repeatGroup !== item.repeatGroup? `<div class="times-to-repeat">${item.repeatSet}x<button class="delete interval-button-active" type="button" value="${item.repeatGroup}"></button></div>` : ""} 
            <div class="interval ${item.repeatSet > 1 ? "repeated" : ""}" draggable="false">
                <div class="name">${item.name}</div>
                <div class="time">${formatTimeLeft(item.timeSet)}</div>
                <input type="checkbox" name ="repbox" value="${intervals.indexOf(item)}" ${item.repeatSet > 1 ? "checked disabled" : ""}>
                </div>
                ${intervals[i+1] === undefined && item.repeatGroup > 0 ? "<div class='bottombar'></div>" : ""}
                ${intervals[i+1] !== undefined && intervals[i+1].repeatGroup !== item.repeatGroup && item.repeatGroup > 0? "<div class='bottombar'></div>" : ""}
                `;
            }
    //embed elements into a form
    formHTML = `<form id="repeat-form">
                    <div class="repeat-settings">
                        <p>Select splits to repeat</p>
                        <label for="times-to-repeat">times to repeat</label>
                        <input type="number" id="times-to-repeat" name="timesToRepeat" min="2" required>
                        <button type="submit" id="submit-repeat-form"><img src="icons/check-fill.svg" alt="ok"></button>
                        <button type="button" id="cancel-repeat-form"><img src="icons/close-fill.svg" alt="cancel"></button>
                    </div>` 
                    + formHTML + `    
                </form>`;          
    intervalContainer.innerHTML = formHTML;
                
    repeatForm = document.getElementById("repeat-form");
    deleteButton = document.querySelectorAll(".delete");
    cancelRepeatButton = document.getElementById("cancel-repeat-form");
    intervalElement = document.querySelectorAll(".interval"); //might have to use antoher one, this used in drag function
    repeatFormCheckboxes = [...intervalElement]
                            .filter(element => !element.classList.contains("repeated"))
                            .map(element => element.querySelector("input"));
    
    //delete repeatGroup function
    for (let i = 0; i < deleteButton.length; i++) {
        deleteButton.length !== null ?
        deleteButton[i].onclick = (e) => {deleteRepeatGroup(e); renderIntervalsToRepeat()} : "";
    }
    //resize container bc buttons & adjust repeat indicator
    resizeIntervalContainer();
    adjustRepeatIndicator();

    //add eventlistener to checkboxes and run selectRepeat function whihch automatically checks boxes between two distant boxes
    [...repeatFormCheckboxes].forEach(element => {
        element.addEventListener("change", (e) => {selectRepeat(e)});
    });

    //submitting repeat form
    repeatForm.onsubmit = (e) => {
        e.preventDefault();
        checkedBoxes = repeatFormCheckboxes.filter(element => element.checked);
        let repeatStartIndex = parseInt(checkedBoxes[0].value);
        let repeatEndIndex = parseInt(checkedBoxes[checkedBoxes.length-1].value) + 1;
       
        //find interval with highest repeatGroup and add 1. this is needed bc when intervals are loaded repeatGroupFlag would be 0
        repeatGroupFlag = Math.max.apply(null, (intervals.map((interval) => {return interval.repeatGroup})));
        repeatGroupFlag += 1;

        //modify repeat values of selected intervals
        for (let i = repeatStartIndex; i < repeatEndIndex; i++) {
            intervals[i]["repeatSet"] = parseInt(e.target.timesToRepeat.value);
            intervals[i]["repeat"] = intervals[i]["repeatSet"];
            //add repeat flag 
            intervals[i]["repeatGroup"] = repeatGroupFlag;
        } 

        renderIntervals();
    }
    //cancelling repeatform
    cancelRepeatButton.onclick = () => {renderIntervals();}
}

//////////////////////////////////////
//HELPER FUNCTIONS FOR REPEAT SET UP//
//////////////////////////////////////

//this function selects the splits that need to be repeated. when two boxes are checked, all others between the two will be checked automatically
function selectRepeat (e) {

    //if the first element is unchecked, uncheck all
     if (checkedBoxes.length >= 2 && e.target.value === checkedBoxes[0].value) {
        checkedBoxes.forEach(element => {element.checked = false;});
        checkedBoxes = repeatFormCheckboxes.filter(element => element.checked);
    }

    //get all checked boxes here
    checkedBoxes = repeatFormCheckboxes.filter(element => element.checked); 
        
    //if next check is not at the end uncheck all after it
    if (checkedBoxes.length >= 2 && checkedBoxes.indexOf(e.target) < checkedBoxes.length-1 && e.target.value !== checkedBoxes[0].value) {
        let boxesAfter = repeatFormCheckboxes.filter(element => repeatFormCheckboxes.indexOf(e.target) < repeatFormCheckboxes.indexOf(element));
        boxesAfter.forEach(element => {element.checked = false;});
        checkedBoxes = repeatFormCheckboxes.filter(element => element.checked);
        
        //else get the checkboxes between the first and the highest indexed checkbox and check them
    } else if (checkedBoxes.length >= 2 && checkedBoxes.indexOf(e.target) === checkedBoxes.length-1) {
        let boxesBetween = [...repeatFormCheckboxes].splice(`${checkedBoxes[0].value}`, `${checkedBoxes[checkedBoxes.length-1].value}`);
        boxesBetween.forEach(element => element.checked = true);
        checkedBoxes = repeatFormCheckboxes.filter(element => element.checked);
    }
}

//deleting a repeatGroup
function deleteRepeatGroup (e) {
    e.preventDefault();
    let toDelete = intervals
                    .filter(item => item.repeatGroup === parseInt(e.target.value));
    toDelete.forEach(item => {
        item.repeatGroup = 0;
        item.repeatSet = 0;
        item.repeat = item.repeatSet;
    })
}



//when an element is checked, apply a style to it?





//add to homescreen


//repeat function, írja ki hányadik ismétlés

//repeat section ~repeat point

//tips

//SAVE

//bea able to overwrite previous saved names

//


////////////////////////////////////////

//choose sound

//color themes

//edit sound of interval

const addSplitButton = document.getElementById("add-split");
addSplitButton.onclick = () => {
    intervalForm.classList.toggle("set-intervals-active");
    navlinks.classList.remove("nav-active");
    burger.classList.remove("burger-active");
    renderIntervals();
}