const signUpSecBtn = document.querySelector(".signup");
const signUpForm = document.getElementById("signup-form");
const signInform = document.getElementById("login-form");
const signInSecBtn = document.querySelector(".signin");

const input = document.querySelectorAll("#login-form input");

signUpSecBtn.addEventListener("click", () => {
  signUpForm.style = "transform:translateY(-100%)";
  signInform.style = "transform:scaleY(0)";
  signInform.style.pointerEvents = "none";
  signUpSecBtn.style.display = "none";
  signInSecBtn.style.display = "block";
});

signInSecBtn.addEventListener("click", () => {
  signUpForm.style = "transform:translateY(100%)";
  signInform.style = "transform:scaleY(1)";
  signInform.style.pointerEvents = "All";
  signUpSecBtn.style.display = "block";
  signInSecBtn.style.display = "none";
});

let users = {};

// Signup validation
signInform.addEventListener("submit", (e) => {
  e.preventDefault();

  let isValid = true;
  input.forEach((input) => {
    if (!input.value.trim()) {
      // Use trim() for spaces
      input.classList.add("error");
      isValid = false;
    } else {
      input.classList.remove("error");
    }
  });

  if (!isValid) return; // Stop here if any empty

  // Proceed with login logic
  const username = document.getElementById("login-user").value;
  const password = document.getElementById("login-pass").value;
  // debugger
  if (users[username] === password) {
    document.getElementById("forms-container").style = "display:none";
    document.getElementById("dashboard").style = "display:block";
  } else {
    alert("Invalid credentials!");
  }
});

// 1. Initialize users at top of script

// 2. Define signup inputs correctly (before event listener)
const signupInputs = Array.from(signUpForm.querySelectorAll("input"));

// 3. Fixed signup handler
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let isValid = true;
  signupInputs.forEach((input) => {
    // Use signupInputs
    console.log(`Input ${input.id || input.name}: "${input.value}"`);

    if (!input.value.trim()) {
      input.classList.add("error");
      isValid = false;
    } else {
      input.classList.remove("error");
    }
  });

  if (!isValid) return;
  const companyCode = "GCC";

  // Additional signup checks
  const username = document.getElementById("signup-user").value.trim();
  const password = document.getElementById("signup-pass").value;
  const confirm = document.getElementById("signup-confirm").value;
  const cC = document.getElementById("cC").value.trim();

  if (password !== confirm) {
    alert("Passwords must match!");
    return;
  }

  if (users[username]) {
    alert("User exists!");
    return;
  }

  if (cC !== companyCode) {
    alert("Get A New Employee Code of Your Company");
    return;
  }

  // Success - add user
  users[username] = password;

  // ✅ Correct: setItem(key, value)
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signed up! Now login.");
  console.log("Users:", users);

  // Optional: Clear form
  signUpForm.reset();
});

window.addEventListener("load", () => {
  const stored = localStorage.getItem("users");
  if (stored) {
    users = JSON.parse(stored);
  }
});





