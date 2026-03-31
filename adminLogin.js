import { auth } from "./firebaseConfig.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginForm = document.getElementById("adminLoginForm");
const messageEl = document.getElementById("message");

// Auto-redirect if already logged in as admin
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Admin already logged in. Redirecting...");
        window.location.href = "admin.html";
    }
});

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        messageEl.innerText = "Authenticating...";
        messageEl.style.color = "#00d2ff";

        console.log("Attempting admin login for:", email);

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Admin claim found. Redirecting...");
                // No alert needed for smoother transition, or keep it if preferred
                window.location.href = "admin.html";
            })
            .catch((error) => {
                console.error("Login Error:", error);
                messageEl.innerText = error.message;
                messageEl.style.color = "#ff4d4d";
            });
    });
}
