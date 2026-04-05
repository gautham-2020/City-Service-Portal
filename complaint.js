// complaint.js

import { db, storage, auth } from "./firebaseConfig.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const form = document.getElementById("complaintForm");
const complaintTableBody = document.getElementById("my-complaints-list");

let unsubscribeComplaints = null;
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://my-backend-production-31b5.up.railway.app';

// Submission Logic
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get user from localStorage instead of Firebase Auth
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!storedUser) {
      alert("You must be logged in to submit a complaint.");
      return;
    }
    const userEmail = storedUser.email;

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value.trim();
    const file = document.getElementById("evidence").files[0];

    try {

      // 1️⃣ AUTO INCREMENT COUNTER
      console.log("Step 1: FETCHING/UPDATING COUNTER...");
      const counterRef = doc(db, "counters", "complaintCounter");
      const counterSnap = await getDoc(counterRef);

      let newId;

      if (counterSnap.exists()) {
        newId = counterSnap.data().lastId + 1;

        await updateDoc(counterRef, {
          lastId: increment(1)
        });

      } else {
        newId = 1;

        await setDoc(counterRef, {
          lastId: 1
        });
      }


      // 2️⃣ FILE UPLOAD (IF EXISTS)
      console.log("Step 2: FILE UPLOAD (IF EXISTS)...");
      let fileURL = "";

      if (file) {
        const extension = file.name.split(".").pop();

        const storageRef = ref(
          storage,
          `complaints/complaint_${newId}.${extension}`
        );

        await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(storageRef);
      }


      // 3️⃣ SAVE COMPLAINT TO FIRESTORE
      console.log("Step 3: SAVING COMPLAINT TO FIRESTORE...");

      await addDoc(collection(db, "complaints"), {
        userId: userEmail, // Track who submitted the complaint using their email address
        complaintId: newId,
        title: title,
        description: description,
        category: category,
        location: location,
        evidence: fileURL,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      console.log("SUCCESS: Saved to Firestore with ID:", newId);
      alert(`✅ Complaint saved to the database! ID: ${newId}. Now sending email notification...`);

      // 4️⃣ SEND CONFIRMATION EMAIL
      console.log("Step 4: SENDING BACKEND EMAIL VIA:", `${BACKEND_URL}/send-email`);
      let emailSent = false;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(`${BACKEND_URL}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            toEmail: userEmail,
            complaintId: newId,
            title: title,
            category: category,
            description: description,
            location: location,
            status: "Pending"
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let backendErrorMessage = "Unknown error";
          try {
            const errorData = await response.json();
            backendErrorMessage = errorData.error;
          } catch (e) {
            backendErrorMessage = `Server Error: ${response.status} ${response.statusText}`;
          }
          throw new Error(backendErrorMessage);
        }
        console.log("Email notification sent successfully.");
        emailSent = true;
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        alert(`⚠️ Backend server issue!
Error: ${emailError.message}
Target URL: ${BACKEND_URL}/send-email
Please ensure the backend is running and CORS is allowed.`);
      }

      if (emailSent) {
        console.log("SUCCESS: Backend email sent.");
        alert("📧 Email notification sent successfully to " + userEmail);
      }

      form.reset();

      // Switch view to dashboard to see the new complaint
      if (window.showSection) {
        window.showSection('complaints', document.querySelector('[onclick*="complaints"]'));
      }

    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("❌ Error submitting complaint. Check console.");
    }
  });
}

// Fetch and Display User's Complaints in Real-time
function setupComplaintsListener() {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (storedUser) {
    const userEmail = storedUser.email;
    // User logged in - setup listener for their complaints
    const q = query(
      collection(db, "complaints"),
      where("userId", "==", userEmail)
    );

    unsubscribeComplaints = onSnapshot(q, (snapshot) => {
      if (!complaintTableBody) return;

      complaintTableBody.innerHTML = "";

      if (snapshot.empty) {
        complaintTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No complaints found.</td></tr>';
        return;
      }

      // Sort manually by createdAt to avoid needing a composite index
      const sortedDocs = snapshot.docs.sort((a, b) => {
        const timeA = a.data().createdAt?.toMillis() || 0;
        const timeB = b.data().createdAt?.toMillis() || 0;
        return timeB - timeA; // Descending
      });

      sortedDocs.forEach((doc) => {
        const data = doc.data();
        const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Just now";

        const row = `
                    <tr>
                        <td>#${data.complaintId}</td>
                        <td>${data.title}</td>
                        <td><span class="status-pending">${data.status}</span></td>
                        <td>${date}</td>
                    </tr>
                `;
        complaintTableBody.insertAdjacentHTML("beforeend", row);
      });
    });
  } else {
    // User logged out - clear listener and table
    if (unsubscribeComplaints) {
      unsubscribeComplaints();
      unsubscribeComplaints = null;
    }
    if (complaintTableBody) {
      complaintTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Please login to view your complaints.</td></tr>';
    }
  }
}

// Check for login state on load
setupComplaintsListener();

// We need to re-run the listener setup when the user logs in or out.
// Let's expose a global way to refresh it or just use an interval for simplicity in this mini project.
setInterval(() => {
  const storedUser = localStorage.getItem("loggedInUser");
  const currentListEmail = complaintTableBody?.getAttribute("data-loaded-for");

  // Simple check to see if we need to reload (user changed)
  const storedEmail = storedUser ? JSON.parse(storedUser).email : null;

  if (storedEmail !== currentListEmail) {
    if (unsubscribeComplaints) unsubscribeComplaints();
    setupComplaintsListener();
    if (complaintTableBody) {
      if (storedEmail) complaintTableBody.setAttribute("data-loaded-for", storedEmail);
      else complaintTableBody.removeAttribute("data-loaded-for");
    }
  }
}, 1000); // Check every second for auth changes in localStorage