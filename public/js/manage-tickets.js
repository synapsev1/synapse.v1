document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/attendees');
    const attendees = await response.json();
    const ticketList = document.getElementById('ticketList');

    attendees.forEach(attendee => {
        const ticketContainer = document.createElement('div');
        ticketContainer.className = 'ticket-container';

        const statusIndicator = document.createElement('div');
        statusIndicator.className = `status-indicator ${attendee.alreadyEntered ? 'status-validated' : 'status-pending'}`;
        statusIndicator.id = `status-${attendee.inviteCode}`;

        const profileImg = document.createElement('img');
        profileImg.src = attendee.profilePicture; // Use the Base64 string directly
        profileImg.className = 'profile-picture'; // Apply the class for styling

        const ticketInfo = document.createElement('div');
        ticketInfo.className = 'ticket-info';
        ticketInfo.innerHTML = `
            <p>Name: ${attendee.name}</p>
            <p>Invite Code: ${attendee.invitationCode}</p>
        `;

        ticketContainer.appendChild(statusIndicator);
        ticketContainer.appendChild(profileImg);
        ticketContainer.appendChild(ticketInfo);
        ticketList.appendChild(ticketContainer);

        ticketContainer.addEventListener('click', () => {
            showFullTicket(attendee);
        });
    });

    document.getElementById('clearAll').addEventListener('click', async () => {
        if (confirm('Are you sure? This action cannot be undone.')) {
            try {
                const response = await fetch('/clear-tickets', {
                    method: 'POST'
                });
                
                if (response.ok) {
                    ticketList.innerHTML = '';
                    alert('All tickets cleared successfully.');
                } else {
                    alert('Failed to clear tickets. Please try again.');
                }
            } catch (error) {
                console.error('Error clearing tickets:', error);
                alert('An error occurred while clearing tickets.');
            }
        }
    });
});

function updateStatusIndicator(ticketId, isValid) {
    const ticketElement = document.getElementById(`ticket-${ticketId}`);
    if (!ticketElement) return;

    const statusIndicator = ticketElement.querySelector('.status-indicator');
    if (!statusIndicator) return;

    statusIndicator.classList.remove('status-pending', 'status-validated');
    statusIndicator.classList.add(isValid ? 'status-validated' : 'status-pending');
}

function showFullTicket(attendee) {
    const modal = document.getElementById('ticketModal');
    modal.style.display = 'block';

    const profilePictureFull = document.getElementById('profilePictureFull');
    profilePictureFull.src = attendee.profilePicture; // Use the Base64 string for the profile picture

    document.getElementById('editName').value = attendee.name;
    document.getElementById('editDate').value = attendee.date;
    document.getElementById('editTime').value = attendee.time;
    document.getElementById('editPurchasedFrom').value = attendee.purchasedFrom;
    document.getElementById('editPlace').value = attendee.place;

    // Update the URL to include the correct parameter
    const ticketPreview = document.getElementById('ticketPreview');
    fetch(`/api/ticket/${attendee.invitationCode}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching ticket image: ' + response.statusText);
            }
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Ticket Preview';
            img.style.maxWidth = '100%'; // Adjust as needed
            ticketPreview.innerHTML = ''; // Clear previous content
            ticketPreview.appendChild(img);
        })
        .catch(error => {
            console.error(error);
            ticketPreview.innerHTML = 'Error loading ticket preview';
        });

    document.getElementById('editTicketForm').onsubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(document.getElementById('editTicketForm'));
        try {
            const response = await fetch('/update-ticket', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                alert('Ticket updated successfully');
                modal.style.display = 'none';
                location.reload();
            } else {
                alert('Error updating ticket');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteTicketButton = document.querySelector('#editTicketForm .button[type="button"]');
    deleteTicketButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            const response = await fetch('/delete-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ invitationCode: attendee.invitationCode })
            });

            if (response.ok) {
                alert('Ticket deleted successfully');
                modal.style.display = 'none';
                location.reload();
            } else {
                alert('Error deleting ticket');
            }
        }
    });
}

function closeModal() {
    const modal = document.getElementById('ticketModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('resultModal');
    if (modal && event.target === modal) {
        closeModal();
    }
}

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