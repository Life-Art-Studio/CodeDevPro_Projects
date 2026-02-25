const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const loginBtn = document.querySelector("#main-login-btn");
const registerBtn = document.querySelector("#main-register-btn");
const forgotPasswordBtn = document.querySelector("#forgot-password");

const registerLink = document.querySelector("#register-a");
const loginLink = document.querySelector("#login-a");

registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "block";
  loginForm.style.display = "none";
  loginBtn.style.display = "none";
  registerBtn.style.display = "block";
  document.querySelector("#login-text").style.display = "none";
  document.querySelector("#register-text").style.display = "block";
});

loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "none";

  loginForm.style.display = "block";
  loginBtn.style.display = "block";
  registerBtn.style.display = "none";
  document.querySelector("#login-text").style.display = "block";
  document.querySelector("#register-text").style.display = "none";
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent form submission if it's in a form
  if (loginValidate(loginForm)) {
    window.location.href = "dashboard.html";
    console.log("Login");
  } else {
    console.log("Invalid");
    alert("Invalid username or password");
  }
});

registerBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateForm(registerForm)) {
    const usernameInput = registerForm.querySelector("#username");
    const passwordInput = registerForm.querySelector("#password");

    localStorage.setItem("username", usernameInput.value);
    localStorage.setItem("password", passwordInput.value);

    alert("Registration successful! Please sign in.");

    // Switch to login form
    registerForm.style.display = "none";
    if (loginForm) loginForm.style.display = "block";
    loginBtn.style.display = "block";
    registerBtn.style.display = "none";
    document.querySelector("#login-text").style.display = "block";
    document.querySelector("#register-text").style.display = "none";

    console.log("Register");
  } else {
    console.log("Invalid");
    alert("Please fill in all fields");
  }
});

function validateForm(form) {
  if (!form) return false;
  const username = form.querySelector("#username");
  const password = form.querySelector("#password");

  if (!username || !password) return false;
  if (username.value.trim() === "" || password.value.trim() === "") {
    return false;
  }
  return true;
}

function loginValidate(form) {
  if (!form) return false;
  const username = form.querySelector("#username");
  const password = form.querySelector("#password");

  if (!username || !password) return false;

  // stored values
  const storedUser = localStorage.getItem("username");
  const storedPass = localStorage.getItem("password");

  // check if values exist AND match (ignoring spaces)
  if (
    storedUser &&
    username.value.trim() === storedUser.trim() &&
    storedPass &&
    password.value.trim() === storedPass.trim()
  ) {
    return true;
  }

  return false;
}
const recoverPopup = document.querySelector("#recover-popup");
const secretKey = "CodeDevPro";
const closePopupBtn = document.querySelector("#close-popup");
const recoverUsername = document.querySelector("#recover-username");

if (forgotPasswordBtn && recoverPopup) {
  forgotPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    recoverPopup.style.display = "block";
    toggleLoginForm(true);
  });
}

if (closePopupBtn && recoverPopup) {
  closePopupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    recoverPopup.style.display = "none";
    toggleLoginForm(false);
  });
}

function toggleLoginForm(disabled) {
  if (!loginForm) return;
  const username = loginForm.querySelector("#username");
  const password = loginForm.querySelector("#password");
  const btn = loginForm.querySelector("#main-login-btn");

  if (username) username.disabled = disabled;
  if (password) password.disabled = disabled;
  if (btn) btn.disabled = disabled;
}

const recoverBtn = document.querySelector("#recover-btn");
if (recoverBtn) {
  recoverBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const secretKeyInput = document.querySelector("#recover-password");
    if (
      secretKeyInput.value === secretKey &&
      localStorage.getItem("username") === recoverUsername.value
    ) {
      alert(
        "Password recovered successfully! Your password is: " +
          localStorage.getItem("password"),
      );
      recoverPopup.style.display = "none";
      toggleLoginForm(false);
    } else {
      alert("Invalid secret key or username!");
    }
  });
}
// 3D Parallax Effect for Login Page
document.addEventListener("mousemove", (e) => {
  const container = document.querySelector(".container");
  if (!container) return;

  // Calculate rotation based on mouse position
  // 30 is the sensitivity divider (higher = less movement)
  const x = (window.innerWidth / 2 - e.pageX) / 30;
  const y = (window.innerHeight / 2 - e.pageY) / 30;

  container.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});
