document.getElementById('createTicketForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    try {
        const response = await fetch('/api/create-ticket', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            window.location.href = '/manage-tickets.html';
        } else {
            console.error('Failed to create ticket');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    console.log('Menu Toggle:', menuToggle); // Check if the element is found
    console.log('Menu:', menu); // Check if the menu is found

    menuToggle.addEventListener('click', function () {
        console.log('Menu Toggle Clicked'); // Verify click event is working
        menu.classList.toggle('show');
    });
});