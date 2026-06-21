const progressBar = document.getElementById('progress');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const stopButton = document.getElementById('stop');
const container= document.querySelector(".app")

let width = 0;
let intervalId = null;

function startProgress() {
    if (intervalId) return; // Prevent multiple intervals
    intervalId = setInterval(() => {
        if (width >= 100) {
            clearInterval(intervalId);  
            intervalId = null;
        } else {
            width++;
            progressBar.style.width = width + '%';
            if(width<=30){
    container.style= " box-shadow: 0 0 10px rgb(255, 0, 0);"
    progressBar.style.backgroundColor="red"
}
else if(width>30 && width<=70){
    container.style= " box-shadow: 0 0 10px rgba(197, 197, 0, 1);"
    progressBar.style.backgroundColor="yellow"
}else{
    container.style= " box-shadow: 0 0 10px rgb(0, 255, 0);"
    progressBar.style.backgroundColor="green"
}
        }
    }, 250);
}
function resetProgress() {
    clearInterval(intervalId);
    intervalId = null;
    width = 0;
    progressBar.style.width = width + '%';
}
function stopProgress() {
    clearInterval(intervalId);
    intervalId = null;
}
startButton.addEventListener('click', startProgress);
resetButton.addEventListener('click', resetProgress);
stopButton.addEventListener('click', stopProgress);