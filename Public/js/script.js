document.getElementById('intakeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 1. Gather Data from the form
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // 2. Set Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

    // 3. Send Data to Backend
    try {
        const response = await fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Show Success
            const responseArea = document.getElementById('responseArea');
            const jsonDisplay = document.getElementById('jsonPayload');
            
            responseArea.classList.remove('hidden');
            jsonDisplay.textContent = JSON.stringify(data, null, 2);
            
            // Clear form
            e.target.reset();
            
            // Scroll to success message
            responseArea.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Error submitting form: ' + result.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Could not connect to the server. Make sure "node server.js" is running.');
    } finally {
        // Reset Button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});
