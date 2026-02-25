# Advanced Form System (Prototype)

A vanilla JavaScript implementation of a schema-driven multi-step form engine. This project serves as the foundational prototype for an enterprise-grade form system, demonstrating core concepts like schema-based rendering and centralized state management without external dependencies.

## 🚀 Current Status

This is a working **v1 Prototype**. It implements the core architecture but is currently limited to basic field types and validation.

### Features Implemented

- **Schema-Driven Rendering:** Forms are generated entirely from a JavaScript object (`core/schema.js`), allowing for easy updates and versioning.
- **Multi-Step Navigation:** Supports linear progression through multiple form steps (Personal -> Address -> Education, etc.).
- **Centralized State Management:** All form data (`values`, `touched`, `errors`) is held in a single reactive state object (`core/state.js`).
- **Basic Validation:** Prevents progression to the next step if required fields are empty.
- **Vanilla JS Architecture:** No frameworks (React, Vue, etc.) used; understanding the raw DOM manipulation and state logic is the primary goal.

## 📂 Project Structure

```
Project_1/
├── core/
│   ├── schema.js       # Defines the form structure (steps, fields, labels)
│   ├── state.js        # Manages form state (values, errors, visibility)
│   └── renderer.js     # Functions to render HTML from schema
├── validation/
│   └── validators.js   # Basic validation logic (required fields)
├── dashboard.html      # Main application entry point
├── dashboard.js        # Wires together schema, state, and renderer
├── index.html          # Login/Landing page (Entry point)
├── style.css           # Global styles
└── dashboard.css       # and dashboard specific styles
```

## 🛠️ How to Run

1.  **Clone/Download** the project.
2.  Open `index.html` in your browser to see the Login page.
    - _Note: Login functionality is currently a frontend-only simulation._
3.  Click "Sign In" (any credentials work) to navigate to the **Dashboard**.
4.  Experience the multi-step form:
    - Fill out fields.
    - Click "Next" to proceed (validation will block you if fields are empty).
    - Click "Previous" to go back.
    - Data is preserved in the state object as you navigate.

## 🔮 Roadmap (Towards Enterprise Goal)

The current implementation is the seed for the larger vision described in `advanced_form_system_readme.md`. Future planned updates include:

- [ ] **Advanced Validation:** Async validation, regex patterns, and custom rules.
- [ ] **Rich Field Types:** Selects, radios, checkboxes, and file uploads.
- [ ] **Dependency Engine:** Conditional field visibility based on other field values.
- [ ] **Persistence:** Autosave to LocalStorage/IndexedDB to prevent data loss.
- [ ] **Undo/Redo:** specific history stack for form state.

## 🤝 Contributing

This project is designed for educational purposes to demonstrate systems-level frontend architecture. Feel free to fork and experiment with adding new field types or validation rules modules!
