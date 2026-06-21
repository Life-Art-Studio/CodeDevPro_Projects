const addTask =document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList =document.getElementById("task-ul")
const closeBtn= document.getElementById("close-icon")

addBtn.addEventListener("click",(e)=>{
e.preventDefault();
if(addTask.value == ""){
    alert("You must enter a task")
}else{
    let task = document.createElement("li");
task.innerHTML=`<h4>${addTask.value}</h4>
            <img src="assets/icons8-close-64.png" alt="" />`
console.log(task);
taskList.appendChild(task)
addTask.value="";
saveData()
}

});

taskList.addEventListener("click",(e)=>{
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked")
        saveData()
    }
    else if(e.target.tagName === "IMG"){
        e.target.parentElement.remove()
        saveData()
    }
})

function saveData(){
    localStorage.setItem("data",taskList.innerHTML)
}
function showList(){
    taskList.innerHTML=localStorage.getItem("data")
}
showList()