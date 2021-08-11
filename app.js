//dark mode switch

const switchButton = document.querySelector("div.switch");




//set icon according to current theme
if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.setAttribute("dark-mode", `true`);
  switchButton.innerHTML = `<span class="material-icons">light_mode</span>`;
} else {
  document.body.setAttribute("dark-mode", `false`);
  switchButton.innerHTML = `<span class="material-icons">dark_mode</span>`;
}


switchButton.onclick = (()=> {
  let currentState = document.body.getAttribute("dark-mode");
  console.log(currentState)
  currentState === "true" ? 
    switchButton.innerHTML = `<span class="material-icons">dark_mode</span>`
    :
    switchButton.innerHTML = `<span class="material-icons">light_mode</span>`

  document.body.setAttribute("dark-mode", `${currentState === "true" ? "false" : "true"}`);



})