const apiUrl = '/data';
const studentsPerPage = 5;
let students = [];
let currentPage = 1;

// Modal
const modal = document.getElementById("studentModal");
const openModalBtn = document.getElementById("openAddModal");
const closeModalBtn = document.querySelector(".close");
const form = document.getElementById("studentForm");

openModalBtn.onclick = () => {
  document.getElementById("modalTitle").innerText = "Add Student";
  document.getElementById("editId").value = '';
  form.reset();
  document.getElementById("date").value = new Date().toISOString().split('T')[0];
  modal.style.display = "block";
};

closeModalBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

// Fetch data
async function fetchStudents() {
  const res = await fetch(apiUrl);
  students = await res.json();
  console.log("Fetched students:", students); // 🐞 Debug log
  renderTable();
}

function renderTable() {
  const start = (currentPage - 1) * studentsPerPage;
  const end = start + studentsPerPage;
  const currentStudents = students.slice(start, end);
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = "";

  currentStudents.forEach(student => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.class}</td>
      <td>${student.date ? formatDate(student.date) : '-'}</td>
      <td>
        <button class="edit" onclick="editStudent(${student.id})">Edit</button>
        <button class="delete" onclick="deleteStudent(${student.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination();
}

function renderPagination() {
  const pageCount = Math.ceil(students.length / studentsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = '';

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    if (i === currentPage) btn.classList.add('active');
    pagination.appendChild(btn);
  }
}

// Add or update student
form.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const name = document.getElementById("name").value;
  const studentClass = parseInt(document.getElementById("class").value);
  const date = document.getElementById("date").value;

  const studentData = { name, class: studentClass, date };

  if (id) {
    await fetch(`${apiUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    showToast("Student updated successfully");
  } else {
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    showToast("Student added successfully");
  }

  modal.style.display = "none";
  await fetchStudents(); // ✅ This must run after the POST/PATCH

};

async function editStudent(id) {
  const student = students.find(s => s.id === id);
  document.getElementById("modalTitle").innerText = "Edit Student";
  document.getElementById("editId").value = student.id;
  document.getElementById("name").value = student.name;
  document.getElementById("class").value = student.class;
  document.getElementById("date").value = student.date || '';
  modal.style.display = "block";
}

async function deleteStudent(id) {
  await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
  showToast("Student deleted successfully");
  fetchStudents();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Toast
function showToast(message, isError = false) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast${isError ? ' error' : ''}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Export to CSV
document.getElementById("exportBtn").onclick = () => {
  if (students.length === 0) return alert("No data to export!");

  const header = ["ID", "Name", "Class", "Date of Enrollment"];
  const rows = students.map(s => [
    s.id,
    s.name,
    s.class,
    s.date ? formatDate(s.date) : "-"
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
      + [header, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "students_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Exported to CSV");
};

// Import Modal
const importModal = document.getElementById("importModal");
const openImportBtn = document.getElementById("openImportModal");
const closeImportBtn = document.getElementById("closeImportModal");
const importBtn = document.getElementById("importBtn");
const csvFileInput = document.getElementById("csvFileInput");

openImportBtn.onclick = () => {
  csvFileInput.value = '';
  importModal.style.display = "block";
};
closeImportBtn.onclick = () => importModal.style.display = "none";
window.onclick = (e) => {
  if (e.target === importModal) importModal.style.display = "none";
};

// CSV Import
importBtn.onclick = async () => {
  const file = csvFileInput.files[0];
  if (!file) {
    showToast("Please select a CSV file.", true);
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (e) {
    const text = e.target.result;
    const rows = text.trim().split("\n").map(row => row.split(","));
    const header = rows[0].map(h => h.trim().toLowerCase());

    const nameIndex = header.indexOf("name");
    const classIndex = header.indexOf("class");
    const dateIndex = header.indexOf("date");

    if (nameIndex === -1 || classIndex === -1) {
      showToast("CSV must include 'name' and 'class' headers.", true);
      return;
    }

    const studentData = rows.slice(1).map(row => ({
      name: row[nameIndex]?.trim(),
      class: parseInt(row[classIndex]?.trim()),
      date: row[dateIndex]?.trim() || new Date().toISOString().split("T")[0]
    }));

    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });

    importModal.style.display = "none";
    fetchStudents();
    showToast("Students imported successfully");
  };

  reader.readAsText(file);
};

// Init
fetchStudents();
