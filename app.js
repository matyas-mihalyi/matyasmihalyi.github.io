//DOM ELEMENTS
const clock = document.querySelector(".timer");
const intervalNameDisplay = document.querySelector(".interval-name")
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const stopButton = document.getElementById("stop");
const intervalForm = document.getElementById("set-intervals");
const setButton = document.getElementById("set");
const intervalTimeInputs = intervalForm.getElementsByClassName("set-interval-time")
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
    intervalNameDisplay.innerHTML = `${intervals[0].name}`
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
    
    
    //enable start & stop buttons if there are intervals
    if (intervals !== "") {
        startButton.disabled = false;
        stopButton.disabled = false;
    }
    //disable submit if intervals are running
    
    //drag function and variables
    intervalElement = document.querySelectorAll(".interval");
    dragItemArray =  Array.from(intervalElement);
    dragFunction();
    
    clock.innerHTML = formatTimeLeft(intervals[0].timeLeft);

    //resive #intervals container
    resizeIntervalContainer();

}



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

//////////////////////////////////
//////////////BUTTONS/////////////
//////////////////////////////////


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
        clock.innerHTML = formatTimeLeft(this.timeLeft);
        intervalNameDisplay.innerHTML = this.name;
        
        //if countdown reacehs zero
        if (this.timeLeft === 0) {
            //set everything to base 
            clearInterval(this.timerInterval);
            this.timePassed = 0;
            this.isRunning = false;
            this.isExpired = true;
            //start next timer
            let i = intervals.indexOf(this); //get curent timer object's index            
            if (intervals[i + 1].isExpired === false) {      //only start next timer if current isn't the last      
                intervals[i + 1].start_timer(); //start the next timer
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
        }, { offset: Number.NEGATIVE_INFINITY }).element
    }
}





//a format time órára is formatoljon ?

//ha új interval indul ne az előző 0:00-ját írja ki, 0.5s

//tudjon hangot lejátszani értesítést küldeni

//add to homescreen

//utolsó timer lejártával mindent visszaállítani

//lehessen menteni, nevet adni neki

//ne lehessen üres idővel intervalt beállítani