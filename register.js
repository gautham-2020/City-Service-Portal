// register.js

import { db } from "./firebaseConfig.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const form = document.querySelector("#service form");

console.log("register.js started");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Submit captured in register.js");

  try {
    const nameInput = document.getElementById("reg-name");
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");

    if (!nameInput || !emailInput || !passwordInput) {
      // Fallback to querySelector if IDs fail for some reason
      console.warn("IDs not found, falling back to type selectors");
      const fbName = form.querySelector("input[type='text']");
      const fbEmail = form.querySelector("input[type='email']");
      const fbPass = form.querySelector("input[type='password']");

      if (!fbName) throw new Error("Could not find inputs in registration form.");

      var name = fbName.value;
      var email = fbEmail.value.trim().toLowerCase();
      var password = fbPass.value;
    } else {
      var name = nameInput.value;
      var email = emailInput.value.trim().toLowerCase();
      var password = passwordInput.value;
    }

    console.log("Registration attempt for:", email);

    if (!email || !password) {
      alert("Please fill in email and password.");
      return;
    }

    // Since we aren't using Firebase Auth for regular users, 
    // we use the email as the document ID to ensure emails are unique.
    const userRef = doc(db, "users", email);

    console.log("Saving to Firestore at users/" + email);
    // 🗂 Store user details directly in Firestore
    await setDoc(userRef, {
      name: name,
      email: email,
      password: password, // Storing in plain text as requested for this mini project
      createdAt: serverTimestamp()
    });

    console.log("Save complete!");
    alert("Registration successful! You can now log in.");
    form.reset();

    if (window.showSection) {
      window.showSection('login', document.getElementById('nav-login'));
    }

  } catch (error) {
    console.error("Critical Register Error:", error);
    alert("Registration Failed: " + error.message);
  }
});