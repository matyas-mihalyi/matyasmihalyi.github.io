//TIMELINE NAVBAR

//VARIABLES
const burger = document.querySelector(".burger");
const sections = document.querySelectorAll("section");
const navbar = document.querySelector(".timeline-wrapper");
const navElements = document.querySelectorAll(".element-wrapper");
const navDot = document.querySelectorAll(".dot");
const navText = document.querySelectorAll(".element-text");
const timeLine = document.querySelector(".timeline");
const timeLineFiller = document.querySelector(".timeline-filler");
const main = document.querySelector(".main");
const progressBar = document.querySelectorAll(".progress-line")

//ENDING ANIMATIONS
const endTitle = document.querySelector(".end h2");
const endText = document.querySelector(".end ul");
const ending = document.querySelector(".end");

function endingAnimations() {
    let bounding = endTitle.getBoundingClientRect();
    let textBounding = endText.getBoundingClientRect();

    if (bounding.top < window.innerHeight) {                //translates title
        endTitle.style.transform = `translate(${(bounding.top / window.innerHeight)*100}%)`
    }

    if (textBounding.top < window.innerHeight) {            //translates text
        endText.style.transform = `translate(${((bounding.top/2) / window.innerHeight)*100}%)`
    }
}

//LANDING ANIMATIONS
const landing = document.querySelector(".landing-wrapper");
const landingTitle = document.querySelector(".landing-title h1")
const landingIntro=document.querySelector(".landing-text");
const chevrons = document.querySelector(".landing-cta")

function landingAnimations() {
    let bounding=landing.getBoundingClientRect();
    if (bounding.bottom>0) {
        landingIntro.style.opacity = `${(bounding.bottom-(landing.offsetHeight/2))/(landing.offsetHeight/2)}` //removes opacity of landing intro
        chevrons.style.opacity = `${(bounding.bottom-(landing.offsetHeight/1.75))/(landing.offsetHeight/1.75)}`     //removes opacity of cta chevrons
        landingTitle.style.backgroundPosition = `${(bounding.top/landing.offsetHeight)*(-100)}%`                  //adds gradient background to h1
    }
    if (bounding.bottom < window.innerHeight/2 && bounding.bottom > 0) {                                          //translates landing title
        landingTitle.style.transform = `translateX(${((window.innerHeight - bounding.bottom)/(window.innerHeight/2))*100-100}%)`   
    } else {
        landingTitle.style.transform = `translateX(0%)`   

    }
}

//PROGRESS LINE FOR MOBILE

function fillProgressbar() {
    for (let i=0; i < sections.length; i++) {
        let bounding = sections[i].getBoundingClientRect();
        if (bounding.top<=0 && bounding.bottom>=0) {
            progressBar[i].style.width = `${((bounding.top/sections[i].offsetHeight)*(-1))*100}%`;
        } else {
            progressBar[i].style.width = "0"
        }
    }
}



//TRANSLATEX NAV AFTER LANDING & AT ENDING
function translateNav() {
    if (window.innerWidth>800) {
        let mainBounding = main.getBoundingClientRect();
        let endBounding = ending.getBoundingClientRect();
        if (mainBounding.top/(mainBounding.top + window.pageYOffset)>0) { 
            navbar.style.transform = `translateX(-${(mainBounding.top/(mainBounding.top + window.pageYOffset))*100}%)`;
            navbar.style.opacity = `${((mainBounding.top/(mainBounding.top + window.pageYOffset)-1)*(-1))}`;
        }
        else if (window.innerHeight>endBounding.top) {                             
            navbar.style.transform =`translate(${((endBounding.top/ending.offsetHeight)-1)*100}%)`;
            navbar.style.opacity = `${endBounding.top/ending.offsetHeight}`;
        } else {
            navbar.style.transform = "translateX(0%)";
            navbar.style.opacity = "1";
        }
    }
}

//BURGER FOR MOBILE

burger.onclick = () => {
    burger.classList.toggle("burger-active");
    navbar.classList.toggle("timeline-wrapper-active");
}

function displayBurger() {
    let bounding = main.getBoundingClientRect();
    if ( 0 > bounding.top && bounding.bottom > 0) {    //checks if main section is in view
        burger.style.display = "block";
    } else {
        burger.style.display = "none";
    }
}

//CLICK TO SCROLL

for (let i=0; i < navElements.length; i++) {
    navElements[i].addEventListener("click",() => {
        sections[i].scrollIntoView({behavior: "smooth",});
    })

}

//ADD STYLE TO CURRENT NAV ELEMENT

function animateNav() {
    for (let i=0; i < sections.length; i++) {
        let bounding = sections[i].getBoundingClientRect();
        let sectionHeight = sections[i].offsetHeight;

        if (bounding.top <= 0
            &&bounding.bottom >= 0) {
                navText[i].classList.add("timeline-text-active");
            } else {
                navText[i].classList.remove("timeline-text-active");
            }

        }
};

//FILL TIMELINE

function fillTimeLine () {
    let bounding = main.getBoundingClientRect();
    if (bounding.top<0) {
        timeLineFiller.style.height = `${(bounding.top / (main.offsetHeight-(sections[0].offsetHeight)))*100*(-1)}%`;
    }
}
//ADD STYLE TO PASSED DOTS

function animateNavDot() {
    for (let i=0; i < sections.length; i++) {
        let bounding = sections[i].getBoundingClientRect();
        let sectionHeight = sections[i].offsetHeight;

        if (bounding.top <= 0) {
                navDot[i].classList.add("dot-active");
            } else {
                navDot[i].classList.remove("dot-active");
            }

        }
};

//ADD HEIGHT AND POSITION TO TIMELINE

function addTimeLinePosition () {
    const timeLineBounding = timeLine.getBoundingClientRect();
    const firstNavDot = navDot[0].getBoundingClientRect();
    const lastNavDot = navDot[navDot.length-1].getBoundingClientRect();
    timeLine.style.left = `${navDot[0].offsetLeft + navDot[0].offsetWidth/2 - (timeLineBounding.width/2)}px`;
    timeLine.style.height = `${lastNavDot.top - firstNavDot.top}px`;
    timeLineFiller.style.maxHeight = `${lastNavDot.top - firstNavDot.top}px`;         //prevents timeline filler overflow
}





//FUNCTION COLECTION

function functionsOnScroll () {
    fillTimeLine();
    animateNav();
    animateNavDot();
    translateNav();
    fillProgressbar();
    landingAnimations();
    endingAnimations();
    displayBurger();
}

function functionsOnLoad() {
    addTimeLinePosition();

}

function functionsOnResize() {
    fillTimeLine();
    addTimeLinePosition();
    translateNav();
    animateNavDot();
    displayBurger();
    landingAnimations();
}
window.addEventListener("load",functionsOnLoad);
window.addEventListener("resize",functionsOnResize);
document.addEventListener("scroll",functionsOnScroll);


//IMG MODALS
const modal = document.querySelector(".modal");
const images = document.querySelectorAll(".pic img")
const modalImage = document.querySelector(".modal-img")
const modalText = document.querySelector(".modal-img-caption")
const modalCloseBtn = document.querySelector(".close-btn")

for (let i=0; i < images.length; i++) {
    images[i].onclick = () => {
        modalImage.src = images[i].src;                 //get clicked img's src & put it in modal
        modalText.innerHTML = images[i].alt;            //get clicked img's alt & put it in modal text span
        modal.classList.toggle("modal-active");         //activate modal
    }
}

modal.addEventListener("click", (e) => {                //close modal if clicked anywhere but image
    if (e.target != modalImage && e.target != modalText) {
        modal.classList.toggle("modal-active");
    }
})
