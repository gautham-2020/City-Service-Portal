import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const table = document.getElementById("complaintTable");
const logoutBtn = document.getElementById("logoutBtn");

// Protect the page
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Admin verified. Loading data...");
    loadComplaints();
  } else {
    console.warn("No user logged in. Redirecting...");
    window.location.href = "adminLogin.html";
  }
});

// Logout logic
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      console.log("Logged out. Redirecting to home...");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout Error:", error);
    }
  });
}

async function loadComplaints() {
  const complaintsRef = collection(db, "complaints");
  const q = query(complaintsRef, orderBy("complaintId", "asc")); 

  const querySnapshot = await getDocs(q);
  //const querySnapshot = await getDocs(collection(db, "complaints"));

  table.innerHTML = "";

  querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();

    // Use data-id attribute and class names for cleaner event delegation
    const row = `
      <tr>
        <td>${data.complaintId}</td>
        <td>${data.title}</td>
        <td>${data.category}</td>
        <td>${data.location}</td>

        <td>
          <select class="status-select" data-id="${docSnap.id}">
            <option ${data.status == "Pending" ? "selected" : ""}>Pending</option>
            <option ${data.status == "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${data.status == "Resolved" ? "selected" : ""}>Resolved</option>
          </select>
        </td>

        <td>
          <button class="btn-action" data-id="${docSnap.id}">
            Mark Resolved
          </button>
          <button class="btn-action btn-delete" style="background: linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%); box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4); margin-top: 5px; margin-left: 5px;" data-id="${docSnap.id}">
            Delete
          </button>
        </td>
      </tr>
    `;

    table.innerHTML += row;

  });

}

// Event Delegation for Table Interactions (Handles both Select and Button clicks)
table.addEventListener("change", async (e) => {
  if (e.target.classList.contains("status-select")) {
    const id = e.target.getAttribute("data-id");
    const newStatus = e.target.value;
    await updateComplaintStatus(id, newStatus);
  }
});

table.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-action") && !e.target.classList.contains("btn-delete")) {
    const id = e.target.getAttribute("data-id");
    await updateComplaintStatus(id, "Resolved");
    // Optically update dropdown so it matches
    const select = e.target.closest("tr").querySelector(".status-select");
    if (select) select.value = "Resolved";
  }

  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Are you sure you want to delete this complaint?")) {
      try {
        const ref = doc(db, "complaints", id);
        await deleteDoc(ref);
        e.target.closest("tr").remove(); // Optically remove row
        alert("Complaint deleted successfully.");
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete complaint.");
      }
    }
  }
});

async function updateComplaintStatus(id, status) {
  try {
    const ref = doc(db, "complaints", id);
    await updateDoc(ref, {
      status: status
    });
    alert("Status Updated");
    // Optional: Instead of reloading the whole table, we rely on the optical changes above
    // loadComplaints(); 
  } catch (error) {
    console.error("Error updating document: ", error);
    alert("Failed to update status.");
  }
}

// Initial load is now handled by the onAuthStateChanged listener at the top of the file
// loadComplaints(); 
