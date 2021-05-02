
//NAVBAR
const burger = document.querySelector("#header .burger");
const burgerLines = document.querySelector("#header .burger div");
const navbar = document.querySelector("#nav-bar");


function closeNav (e) {
    if (e.target !== navbar && e.target !== burger && e.target !== burgerLines) {
        burger.classList.remove("burger-active");
        navbar.classList.remove("nav-active");
        document.removeEventListener("click", closeNav);
    }
}


burger.onclick = function openNav() {
    burger.classList.toggle("burger-active");
    navbar.classList.toggle("nav-active");
    document.addEventListener("click", closeNav)
}


//VIDEO MODAL
 
const openBtn = document.querySelector(".video-modall-btn");
const videoModal = document.querySelector(".video-modall");
const videoPlayer = document.querySelector(".video-modall iframe");
const videoSrc = "https://www.youtube.com/embed/3eX9ZaILAmI";
 

openBtn.onclick = () => {                               //click on tile
    videoModal.classList.toggle("video-modall-active");  //opens modal
    videoPlayer.classList.toggle("iframe-active");       // iframe animation
    videoPlayer.src = videoSrc;                          // inserts video source to iframe
}

videoModal.addEventListener("click", (e) => {                 //when modal is open
    if (e.target != videoPlayer) {                             //if mouseclick doesn't target the iframe, the modal closes
        videoModal.classList.toggle("video-modall-active");
        videoPlayer.classList.toggle("iframe-active");
    }
})

videoPlayer.ontransitionend = () => {                       //after closing animation of iframe, the video's source is removed so it stops playing
    if (!videoPlayer.classList.contains("iframe-active")) { 
        videoPlayer.src ="";
    }
}

