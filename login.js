import { db } from "./firebaseConfig.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("nav-logout");

// Helper to update UI based on login status
function updateUIForLoginState(isLoggedIn) {
  const authHideElements = document.querySelectorAll(".auth-hide");
  const authShowElements = document.querySelectorAll(".auth-show");

  if (isLoggedIn) {
    authHideElements.forEach((el) => el.style.display = "none");
    authShowElements.forEach((el) => el.style.display = "block");
  } else {
    authHideElements.forEach((el) => el.style.display = "block");
    authShowElements.forEach((el) => el.style.display = "none");
  }
}

// Initial UI check on page load
const storedUser = localStorage.getItem("loggedInUser");
if (storedUser) {
  updateUIForLoginState(true);
} else {
  updateUIForLoginState(false);
}

console.log("login.js loaded");

// Handle user login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    if (!emailInput || !passwordInput) {
      console.error("Login inputs not found!");
      alert("Login inputs missing from page.");
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    console.log("Attempting login for:", email);

    try {
      // Look up user in Firestore
      const userRef = doc(db, "users", email);
      console.log("Querying Firestore for user at path: users/" + email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("User document found:", userData.email);
        if (userData.password === password) {
          console.log("Password match success");
          // Exact match found
          localStorage.setItem("loggedInUser", JSON.stringify({
            email: userData.email,
            name: userData.name
          }));

          loginForm.reset();
          updateUIForLoginState(true);

          // Auto redirect to Submit Complaints if login is successful
          if (window.showSection) {
            console.log("Redirecting to submit section");
            window.showSection('submit', null);
          }

          alert("Login successful!");
        } else {
          console.warn("Invalid password attempt");
          alert("Invalid password.");
        }
      } else {
        console.warn("User document not found in Firestore for email:", email);
        alert("No account found with that email.");
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert("An error occurred during login: " + error.message);
    }
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Logout clicked");
    localStorage.removeItem("loggedInUser");
    updateUIForLoginState(false);
    alert("Logged out successfully");
    if (window.showSection) {
      window.showSection('home', null);
    }
  });
}
