# Reminder Notes Web App — Engineer Level Requirements

---

# 1. Project Vision

Build a **production-quality reminder management web application** using only:

* HTML
* CSS
* Vanilla JavaScript

The application should be designed with **scalability, maintainability, and performance in mind**, mimicking real frontend architecture used in modern frameworks.

The goal is not only functionality but also **engineering-quality system design**.

---

# 2. System Goals

The application must:

• Allow users to create reminders
• Display reminders in stacked cards
• Support priority types (Normal / Important / Urgent)
• Persist reminders using local storage
• Support reminder scheduling logic
• Implement undo / redo state management
• Provide modular architecture

---

# 3. High Level Architecture

The application follows a **layered architecture**.

UI Layer
State Layer
Logic Layer
Persistence Layer
Scheduler Layer

```
User Interaction
       │
       ▼
Event Controller
       │
       ▼
State Manager
       │
       ▼
Render Engine
       │
       ▼
Storage Layer
```

---

# 4. Application Modules

The system will be divided into independent modules.

```
/src
 ├── app.js
 ├── state
 │     └── store.js
 ├── modules
 │     ├── reminderEngine.js
 │     ├── scheduler.js
 │     └── validation.js
 ├── ui
 │     ├── renderer.js
 │     ├── cardFactory.js
 │     └── formHandler.js
 ├── storage
 │     └── localStorageEngine.js
 └── utils
       └── helpers.js
```

---

# 5. Data Model

Each reminder object must follow a strict schema.

```
{
 id: string,
 name: string,
 reason: string,
 type: "normal" | "important" | "urgent",
 date: ISODate,
 createdAt: timestamp,
 completed: boolean
}
```

Example:

```
{
 id: "rem_102391",
 name: "Pay Electricity Bill",
 reason: "Avoid late fine",
 type: "urgent",
 date: "2026-03-20",
 createdAt: 1700000000000,
 completed: false
}
```

---

# 6. Global State Management

A central store will hold the application state.

```
const store = {
 reminders: [],
 history: [],
 future: [],
 filters: {},
 ui: {
   loading: false
 }
}
```

---

# 7. State Transitions

All mutations must go through **controlled state actions**.

Example actions:

```
ADD_REMINDER
DELETE_REMINDER
UPDATE_REMINDER
MARK_COMPLETE
UNDO_ACTION
REDO_ACTION
LOAD_REMINDERS
```

---

# 8. Undo / Redo System

Every state change must be tracked.

State snapshot flow:

```
currentState
    │
    ▼
push to history
    │
    ▼
apply mutation
```

Undo:

```
history.pop()
```

Redo:

```
future.push()
```

---

# 9. Reminder Engine

The Reminder Engine manages business logic.

Responsibilities:

• Create reminder
• Delete reminder
• Update reminder
• Mark completed
• Sort reminders

Core functions:

```
createReminder(data)
deleteReminder(id)
updateReminder(id, updates)
getReminders()
```

---

# 10. Validation Engine

The validation system must validate input before creating reminders.

Validation rules:

Name cannot be empty
Reason cannot be empty
Date must be valid
Type must be selected

Example validation schema:

```
const schema = {
 name: { required: true },
 reason: { required: true },
 date: { required: true },
 type: { required: true }
}
```

---

# 11. Scheduler Engine

The Scheduler monitors reminder times.

Responsibilities:

• Detect upcoming reminders
• Highlight urgent reminders
• Trigger visual alerts

Scheduler loop:

```
setInterval(checkReminders, 60000)
```

Reminder states:

```
UPCOMING
TODAY
OVERDUE
```

---

# 12. Rendering Engine

Rendering should be **state-driven**.

Instead of manually updating DOM nodes everywhere, rendering will depend on state.

Rendering flow:

```
state change
     │
     ▼
renderReminders()
     │
     ▼
virtual representation
     │
     ▼
DOM update
```

---

# 13. Card Factory

Reminder cards should be generated using a factory pattern.

Responsibilities:

• Generate card DOM structure
• Apply priority styling
• Attach event listeners

Card structure:

```
Reminder Card
 ├─ Title
 ├─ Reason
 ├─ Priority Badge
 ├─ Date
 └─ Delete Button
```

---

# 14. Event Driven UI

All UI interactions must trigger events.

Example events:

```
FORM_SUBMIT
DELETE_CLICK
UNDO_CLICK
REDO_CLICK
```

Event flow:

```
UI Event
   │
   ▼
Controller
   │
   ▼
State Update
   │
   ▼
Renderer
```

---

# 15. Storage Engine

Persistence will use localStorage.

Key:

```
REMINDER_APP_DATA
```

Storage structure:

```
{
 reminders: [...],
 lastUpdated: timestamp
}
```

Functions:

```
saveState()
loadState()
clearState()
```

---

# 16. Autosave System

The system should automatically persist state when changes occur.

Flow:

```
state change
     │
     ▼
debounce( saveState, 500ms )
```

---

# 17. Reminder Card UI Requirements

Cards must include:

• Reminder Name
• Reason
• Reminder Type Badge
• Date
• Delete Button

Priority styling:

Normal → gray
Important → orange
Urgent → red

Cards must stack vertically.

---

# 18. CSS System Design

CSS must follow structured naming.

Use a **component-based approach**.

Example:

```
.card
.card__title
.card__reason
.card__badge
.card__date
.card__actions
```

Form classes:

```
.form
.form__input
.form__textarea
.form__radio
.form__button
```

---

# 19. Performance Considerations

The system should avoid inefficient rendering.

Techniques:

Event delegation
DOM batching
Debounced storage writes
Minimal reflows

---

# 20. Error Handling

All critical functions must handle failures.

Example cases:

Invalid input
Storage unavailable
Corrupted state data

Fallback:

```
reset state
```

---

# 21. Accessibility Requirements

The UI must support accessibility basics.

Requirements:

Labels for inputs
Keyboard accessible buttons
Focus states
ARIA roles where necessary

---

# 22. Edge Cases

The system must handle:

No reminders created
Long reminder text
Duplicate reminders
Past reminder dates
Storage corruption

---

# 23. Future System Extensions

The architecture must support future features such as:

Reminder notifications
Reminder editing
Reminder categories
Cloud sync
Multi-user support

---

# 24. Folder Structure

Final recommended structure:

```
reminder-engine-app

index.html
requirements.md

css
  style.css

js
  app.js

src
  state
    store.js

  modules
    reminderEngine.js
    scheduler.js
    validation.js

  ui
    renderer.js
    cardFactory.js
    formHandler.js

  storage
    localStorageEngine.js

  utils
    helpers.js
```

---

# 25. MVP Scope

Minimum working product must support:

Create reminder
Delete reminder
Persistent storage
Reminder cards UI
Priority badges

---

# 26. Success Metrics

The project is considered successful if:

• The architecture is modular
• The codebase is maintainable
• State is predictable
• Reminders persist correctly
• UI updates consistently

---

# 27. Engineering Objective

This project should serve as a **practice implementation of frontend architecture concepts** such as:

State management
Event systems
Rendering abstraction
Data persistence
Scalable modular design
