// 1. DELETE FUNCTION
function deleteItem(id) {
    if (confirm("Are you sure you want to delete project #" + id + "?")) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.style.opacity = '0'; // Optional: fade out effect
            setTimeout(() => row.remove(), 300);
        }
    }
}

// 2. OPEN MODAL & POPULATE DATA
function openEditModal(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const currentName = row.querySelector('.item-name').innerText;

    document.getElementById('editItemId').value = id;
    document.getElementById('editItemName').value = currentName;
    document.getElementById('editModal').style.display = "block";
}

// 3. CLOSE MODAL
function closeModal() {
    document.getElementById('editModal').style.display = "none";
}

// 4. SAVE CHANGES TO DOM
function saveEdit() {
    const id = document.getElementById('editItemId').value;
    const newName = document.getElementById('editItemName').value;

    if (newName.trim() !== "") {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        row.querySelector('.item-name').innerText = newName;
        
        closeModal();
        alert("Project " + id + " updated successfully!");
    } else {
        alert("Name cannot be empty.");
    }
}

// Close modal if user clicks outside of the box
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeModal();
    }
}