// ===== CURSOR FOLLOWING LIGHT EFFECT =====
const cursorFollowLight = document.querySelector('.cursor-follow-light');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Smooth follow effect
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    cursorFollowLight.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;

    requestAnimationFrame(animateCursor);
}

animateCursor();

// ===== FORM SUBMISSION =====
document.getElementById('intakeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // 1. Gather Data from the form
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // 2. Set Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Submitting...';

    // 3. Send Data to Backend
    try {
        const response = await fetch('/api/submit', {
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
            setTimeout(() => {
                responseArea.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            showNotification('Error: ' + (result.message || 'Failed to submit'), 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showNotification('Could not connect to server. Please ensure the API is running.', 'error');
    } finally {
        // Reset Button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg backdrop-blur-xl border z-50 animate-pulse`;

    if (type === 'error') {
        notification.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            color: #fca5a5;
        `;
        notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    } else {
        notification.style.cssText = `
            background: rgba(34, 197, 94, 0.1);
            border-color: rgba(34, 197, 94, 0.3);
            color: #86efac;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== INPUT ANIMATIONS =====
const inputs = document.querySelectorAll('.form-input');
inputs.forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.01)';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});
