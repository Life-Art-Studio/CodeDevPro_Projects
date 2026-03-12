const display = document.querySelector(".display")

function updateDisplay(h, m, s) {

    const time = `${h}:${m}:${s}`

    display.setAttribute("data-time", time)

}
let hours = document.querySelector(".hours")
let mins = document.querySelector(".minutes")
let secs = document.querySelector(".seconds")

let time = 0;
let milicount = 0
let secCount = 0
let minCount = 0
let hourCount = 0
let str = document.querySelector("#start")
let stp = document.querySelector("#stop")
let rst = document.querySelector("#reset")
let miliInterval;
str.addEventListener("click", () => {

    miliInterval = setInterval(() => {

        milicount++

        if (milicount === 100) {
            milicount = 0
            secCount++
        }

        if (secCount === 60) {
            secCount = 0
            minCount++
        }
        if (minCount === 60) {
            minCount = 0
            hourCount++
        }


        secs.textContent = secCount
        mins.textContent = minCount
        hours.textContent = hourCount

    }, 10)

})

stp.addEventListener("click", () => {
    clearInterval(miliInterval)
})
rst.addEventListener("click", () => {

    secs.textContent = "0";
    mins.textContent = "0";
    hours.textContent = "0"
    milicount = 0
    secCount = 0
    minCount = 0
    hourCount = 0
})

