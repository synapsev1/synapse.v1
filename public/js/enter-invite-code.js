document.addEventListener('DOMContentLoaded', () => {
    const inviteCodeForm = document.getElementById('inviteCodeForm');
    const ticketPreviewModal = document.getElementById('ticketPreviewModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const ticketPreviewImage = document.getElementById('ticketPreviewImage');
    const ticketPreviewClose = document.getElementById('ticketPreviewClose');
    const confirmationClose = document.getElementById('confirmationClose');
    const confirmTicketButton = document.getElementById('confirmTicketButton');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const validationResult = document.getElementById('validationResult');
    let currentInviteCode = '';

    // Handle form submission
    inviteCodeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const inviteCode = document.getElementById('inviteCode').value.trim();
        currentInviteCode = inviteCode;

        try {
            const response = await fetch('/api/validate-invitation-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invitationCode: inviteCode }),
            });

            const result = await response.json();
            if (result.valid) {
                if (result.alreadyEntered) {
                    showModal(`Ticket already verified.<br>Name: ${result.attendee.name}<br>Date: ${result.attendee.date}<br>Time: ${result.attendee.time}<br>Place: ${result.attendee.place}`);
                } else {
                    // Show ticket preview
                    ticketPreviewImage.src = `/api/ticket/${inviteCode}`; // Fetch ticket image
                    ticketPreviewModal.style.display = 'block';
                }
            } else {
                showModal(result.message || 'Invalid invite code or ticket not found.');
                document.getElementById('inviteCode').value = '';
            }
        } catch (error) {
            console.error('Error validating invitation code:', error);
            showModal('An error occurred while validating the code. Please try again.');
        }
    });

    // Close ticket preview modal
    ticketPreviewClose.addEventListener('click', () => {
        ticketPreviewModal.style.display = 'none';
    });

    // Confirm ticket
    confirmTicketButton.addEventListener('click', () => {
        ticketPreviewModal.style.display = 'none';
        confirmationModal.style.display = 'block';
    });

    // Close confirmation modal
    confirmationClose.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    // Confirm action
    confirmYes.addEventListener('click', async () => {
        confirmationModal.style.display = 'none';

        // Submit the invite code for final verification
        try {
            const response = await fetch('/api/verify-invite-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invitationCode: currentInviteCode }),
            });

            const result = await response.json();
            if (result.valid) {
                showModal(result.message || 'Ticket verified successfully.');
                document.getElementById('inviteCode').value = ''; // Clear the invite code input field
            } 
            else {
                showModal(result.message || 'Verification failed.');
                document.getElementById('inviteCode').value = ''; // Clear the invite code input field
            }
        } catch (error) {
            console.error('Error verifying invite code:', error);
            showModal('An error occurred while verifying the ticket. Please try again.');
            document.getElementById('inviteCode').value = ''; // Clear the invite code input field
        }
    });

    // Cancel action
    confirmNo.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    // Show modal with message
    function showModal(message) {
        const modal = document.getElementById('resultModal');
        const modalMessage = document.getElementById('modalMessage');
        
        modalMessage.innerHTML = message;
        modal.style.display = 'block';
    }

    // Close modal
    function closeModal() {
        const modal = document.getElementById('resultModal');
        modal.style.display = 'none';
    }

    // Close modal when clicking outside of the modal content
    window.onclick = function(event) {
        const modal = document.getElementById('resultModal');
        if (event.target === modal) {
            closeModal();
        }
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