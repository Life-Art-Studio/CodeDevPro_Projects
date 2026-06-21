"use strict"
let inp = document.querySelector("form")

let noteLi = document.querySelector("#notes-list")
let prenote = JSON.parse(localStorage.getItem("notes")) || [];
let notes = prenote.sort((a, b) => {
    return new Date(a.date) - new Date(b.date)
})

inp.addEventListener("submit", (e) => {

    e.preventDefault()
    const title = e.target[0].value
    const reason = e.target[1].value
    const date = e.target[5].value
    const type = document.querySelector('input[name="type"]:checked').value;
    const note = {
        id: crypto.randomUUID(),
        title,
        reason,
        type,
        date,
        createdAt: Date.now(),
        completed: false
    }

    inp.classList.add("hideform")
    noteLi.classList.add("shownote")

    notes.push(note)
    saveNote()
    renderNotes()
    inp.reset()

})
function saveNote() {
    localStorage.setItem("notes", JSON.stringify(notes))
}
function createNoteCard(id, title, reason, type, date, createdAt, completed) {
    document.querySelector("#add-note-btn").style.display = "flex"
    const li = document.createElement("li");
    li.className = "note-card";
    li.dataset.id = id;

    /* HEADER */

    const header = document.createElement("div");
    header.className = "note-card__header";

    const h3 = document.createElement("h3");
    h3.className = "note-card__title";
    h3.textContent = title;

    const badge = document.createElement("span");
    badge.className = `note-card__badge badge-${type}`;
    badge.textContent = type;

    header.append(h3, badge);


    /* REASON */

    const p = document.createElement("p");
    p.className = "note-card__reason";
    p.textContent = reason;


    /* META */

    const meta = document.createElement("div");
    meta.className = "note-card__meta";

    const time = document.createElement("time");
    time.className = "note-card__date";
    time.setAttribute("datetime", date);
    time.textContent = `📅 ${date}`;

    const created = document.createElement("span");
    created.className = "note-card__created";

    const createdDate = new Date(createdAt).toLocaleDateString();
    created.textContent = `Created: ${createdDate}`;

    meta.append(time, created);


    /* STATUS */

    const statusDiv = document.createElement("div");
    statusDiv.className = "note-card__status";

    const statusLabel = document.createTextNode("Status: ");

    const status = document.createElement("span");
    // debugger



    /* ACTIONS */

    const actions = document.createElement("div");
    actions.className = "note-card__actions";

    const completeBtn = document.createElement("button");
    completeBtn.className = "note-btn complete-btn";
    completeBtn.textContent = "Complete";

    // const editBtn = document.createElement("button");
    // editBtn.className = "note-btn edit-btn";
    // editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "note-btn delete-btn";
    deleteBtn.textContent = "Delete";

    actions.append(completeBtn, deleteBtn);


    if (completed) {
        status.className = "status-completed";
        status.textContent = "Completed";
        completeBtn.style.display = "none";
    } else {
        status.className = "status-pending";
        status.textContent = "Pending";
    }

    statusDiv.append(statusLabel, status);
    /* BUILD CARD */

    li.append(header, p, meta, statusDiv, actions);

    return li;
}
function renderNotes() {

    noteLi.innerHTML = ""
    //  inp.classList.add("hideform")
    // noteLi.classList.add("shownote")
    // debugger
    if (notes.length === 0) {

        inp.classList.remove("hideform")
        noteLi.classList.remove("shownote")
    }
    else {
        inp.classList.add("hideform")
        noteLi.classList.add("shownote")
    }


    notes.forEach(note => {

        const card = createNoteCard(
            note.id,
            note.title,
            note.reason,
            note.type,
            note.date,
            note.createdAt,
            note.completed
        )

        noteLi.appendChild(card)

    })
}
let addNoteBtn = document.querySelector("#add-note-btn")

addNoteBtn.addEventListener("click", (e) => {

    const btn = e.target.closest("#add-note-btn")
    if (!btn) return

    if (inp.classList.contains("hideform")) {

        inp.classList.remove("hideform")
        noteLi.classList.remove("shownote")

        addNoteBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`
        addNoteBtn.setAttribute("title", "Close")

    } else {

        inp.classList.add("hideform")
        noteLi.classList.add("shownote")

        addNoteBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`
        addNoteBtn.setAttribute("title", "New Note")

    }

})
renderNotes()

const notesList = document.getElementById("notes-list")

notesList.addEventListener("click", (e) => {

    const card = e.target.closest(".note-card")
    if (!card) return

    const noteId = card.dataset.id

    /* COMPLETE */

    if (e.target.classList.contains("complete-btn")) {

        const note = notes.find(n => n.id === noteId)

        if (note) {
            note.completed = true
        }

    }

    /* DELETE */

    if (e.target.classList.contains("delete-btn")) {

        notes = notes.filter(n => n.id !== noteId)

    }

    saveNote()
    renderNotes()

})
