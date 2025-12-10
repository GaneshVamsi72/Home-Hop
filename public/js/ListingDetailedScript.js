const deleteBtn = document.getElementById('deleteBtn');

deleteBtn.addEventListener('click', (event) => {
    const ok = confirm('Are you sure want to remove this listing?');
    if (!ok) {
        event.preventDefault();
    }
});