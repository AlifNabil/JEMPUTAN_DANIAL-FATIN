// Freeze the scroll as soon as the script loads
document.body.classList.add('no-scroll');

// ==========================================
// FORCE RESET TO TOP ON REFRESH
// ==========================================
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

// Extra safety: Reset again once everything is fully loaded
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// ==========================================
// 1. AUTO-SCROLL CONFIGURATION
// ==========================================
const scrollSpeed = 1; 
const resumeDelay = 6000; 
const scrollTarget = window; 

let isScrolling = false; // Starts false so it doesn't move behind the cover
let resumeTimer;
let accumulatedScroll = 0; 

// ==========================================
// 2. THE OPEN BUTTON (TRIGGERS MUSIC & SCROLL)
// ==========================================
function openInvitation() {

    // Force scroll to top the moment they click "Buka Jemputan"
    window.scrollTo(0, 0);
    // 1. Hide the cover
    document.getElementById('welcome-cover').classList.add('hidden');

    // --- NEW: ADD THIS LINE HERE ---
    // This removes the "no-scroll" lock so guests can now explore the page
    document.body.classList.remove('no-scroll');
    
    // 2. Tell the YouTube player to start the music!
    if (player && typeof player.playVideo === 'function') {
        player.playVideo();
        isPlaying = true;

        // Change the bottom button icon from "Play" to "Pause"
        const musicIcon = document.getElementById('music-btn').querySelector('.nav-icon');
        musicIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line>';
    }

    // 3. Start the auto-scroll exactly 2 seconds after the music starts
    setTimeout(() => {
        isScrolling = true;
        requestAnimationFrame(startAutoScroll);
    }, 2000);    
}

// ==========================================
// 3. THE ULTRA-SLOW SCROLL ENGINE
// ==========================================
function startAutoScroll() {
    if (isScrolling) {
        accumulatedScroll += scrollSpeed;
        if (accumulatedScroll >= 1) {
            const pixelsToScroll = Math.floor(accumulatedScroll);
            scrollTarget.scrollBy(0, pixelsToScroll);
            accumulatedScroll -= pixelsToScroll;
        }
    }
    requestAnimationFrame(startAutoScroll);
}

function handleGuestInteraction() {
    // Pause scroll when they touch the screen
    isScrolling = false;
    clearTimeout(resumeTimer);
    
    // Resume scroll 2 seconds after they let go
    resumeTimer = setTimeout(() => {
        isScrolling = true;
    }, resumeDelay);
}

// Event Listeners for the smart brakes
window.addEventListener('wheel', handleGuestInteraction, { passive: true });      
window.addEventListener('touchstart', handleGuestInteraction, { passive: true }); 
window.addEventListener('touchmove', handleGuestInteraction, { passive: true });  
window.addEventListener('mousedown', handleGuestInteraction, { passive: true });  

// --- Global Music Variables ---
// (Leave this and everything below it exactly as you have it!)


// --- Global Music Variables ---
let player;
let isPlaying = false;
const musicBtn = document.getElementById('music-btn');

// This function is automatically called by YouTube when the page loads
// This function is automatically called by YouTube when the page loads
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-audio', {
        height: '100%', 
        width: '100%',  
        videoId: 'IpFX2vq8HKw', // Your YouTube Video ID
        playerVars: {
            'autoplay': 0,
            'controls': 1, 
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': 'IpFX2vq8HKw', 
            'start': 46  // <--- ADD THIS LINE! (Starts the song at 30 seconds)
        }
    });
}


// --- Countdown Timer Logic ---
// Set the exact date and time of your event here
const weddingDate = new Date("April 11, 2026 11:00:00").getTime();

// Update the countdown every 1 second
const countdownTimer = setInterval(function() {
    
    // Get today's date and time
    const now = new Date().getTime();
    
    // Find the distance between now and the wedding date
    const distance = weddingDate - now;
    
    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Display the result (adds a '0' in front if the number is less than 10)
    document.getElementById("days").innerText = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
    
    // If the countdown is over, write some text
    if (distance < 0) {
        clearInterval(countdownTimer);
        document.querySelector(".countdown-container").innerHTML = "<p class='details-text'>The big day is here!</p>";
    }
}, 1000); // 1000 milliseconds = 1 second


// Google Sheets form submission logic
const scriptURL = 'https://script.google.com/macros/s/AKfycbziIeJN55S-v4S62ICkOq64S3SBiDP9lXDGzZHmy2NkpS6Mlpnt3HxheeB0aAbrMiFaSw/exec';
const form = document.getElementById('customRsvpForm');
const submitBtn = document.getElementById('submitBtn');

// Google Sheets form submission logic - UPDATED FOR SMOOTHNESS
form.addEventListener('submit', e => {
    e.preventDefault(); // This is the "Brakes" - it stops the page from refreshing/jumping
    
    // 1. Prepare the button
    submitBtn.innerText = 'Menghantar...';
    submitBtn.disabled = true;

    // 2. Send the data to your Google Sheet
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => {
            // 3. Clear the form fields
            form.reset(); 
            submitBtn.innerText = 'Berjaya Dihantar!';
            submitBtn.style.backgroundColor = '#4CAF50'; // Green for success
            
            // 4. Refresh the numbers & wishes
            loadRSVPData();

            // 5. THE MAGIC SCROLL: 
            // Instead of a jumping alert, we wait 1 second for the data to load, 
            // then we smoothly glide the user to see the updated wishes list.
            setTimeout(() => {
                submitBtn.innerText = 'Hantar Sekali Lagi';
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = ''; // Resets to original color

                const wishesSection = document.getElementById('wishes-list');
                if (wishesSection) {
                    wishesSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 1500);
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('Alamak! Sesuatu tidak kena. Sila cuba lagi.');
            submitBtn.innerText = 'Submit';
            submitBtn.disabled = false;
        });
});

// --- Scroll Animation Observer (The Slow Pop-up) ---
document.addEventListener('DOMContentLoaded', () => {
    // Create the observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the element comes into view, trigger the animation
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); 
            } else {
                // When the element leaves the screen, reset the animation!
                entry.target.classList.remove('visible');
            }
        });
    }, { 
 // --- NEW CENTER TRIGGER LOGIC ---
        // Shrinks the invisible trigger box by 40% from the top and 40% from the bottom,
        // meaning the animation only starts when the element enters the middle 20% of the screen.
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0
    });

    // Tell the observer to watch everything with the 'fade-in' class
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

// --- Fetch and Display Live Attendance & Wishes ---
function loadRSVPData() {
    // We use the exact same scriptURL you already have at the top of your file!
    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            let attendingCount = 0;
            let notAttendingCount = 0;
            let wishesHTML = '';

// Reverse the data so the newest wishes appear at the top!
        data.reverse().forEach(row => {
            
            // 1. Calculate Attendance (Total Heads)
            if (row.session === 'Not Attending') {
                // Count how many families declined
                notAttendingCount++; 
            } else if (row.session) { 
                // If they are attending, calculate their family size
                
                // parseInt grabs the number from "2 pax". If it fails, it defaults to 0.
                let adultsCount = parseInt(row.adults) || 0; 
                
                // parseInt grabs the number "1" or "2". "None" becomes 0.
                let childrenCount = parseInt(row.children) || 0; 
                
                // Add this family's total to the grand total!
                attendingCount += (adultsCount + childrenCount);
            }

            // 2. Build the Wishes List
            if (row.wishes && row.wishes.trim() !== '' && row.name) {
                wishesHTML += `
                    <div class="wish-item">
                        <p class="wish-text">"${row.wishes}"</p>
                        <p class="wish-name">${row.name}</p>
                    </div>
                `;
            }
        });

            // 3. Inject the calculations into your HTML
            document.getElementById('attending-count').innerText = attendingCount;
            document.getElementById('not-attending-count').innerText = notAttendingCount;
            
            // If there are wishes, show them. If not, show a placeholder message.
            if (wishesHTML !== '') {
                document.getElementById('wishes-list').innerHTML = wishesHTML;
                startWishesAutoScroll();
            } else {
                document.getElementById('wishes-list').innerHTML = '<p class="wish-text">Be the first to leave a wish!</p>';
            }
        })
        .catch(error => console.error('Error loading RSVP data:', error));
}

// Tell the webpage to load the data the moment someone opens the site
document.addEventListener('DOMContentLoaded', loadRSVPData);

// --- Auto-Scroll Logic for Wishes ---
// --- Updated Smooth Auto-Scroll Logic for Wishes ---
function startWishesAutoScroll() {
    const wishesBox = document.getElementById('wishes-list');
    let animationId;
    let currentScroll = wishesBox.scrollTop;

    function smoothScroll() {
        // We move in tiny fractions (0.5) for a "floating" feel
        currentScroll += 0.5; 
        wishesBox.scrollTop = currentScroll;

        // Reset to top if we hit the end
        if (currentScroll >= (wishesBox.scrollHeight - wishesBox.clientHeight)) {
            currentScroll = 0;
        }

        // Only keep moving if the user isn't touching it
        animationId = requestAnimationFrame(smoothScroll);
    }

    // Start the engine
    animationId = requestAnimationFrame(smoothScroll);

    // UX: Pause on interaction
    const pauseScroll = () => cancelAnimationFrame(animationId);
    const resumeScroll = () => animationId = requestAnimationFrame(smoothScroll);

    wishesBox.addEventListener('mouseenter', pauseScroll);
    wishesBox.addEventListener('touchstart', pauseScroll);
    wishesBox.addEventListener('mouseleave', resumeScroll);
    wishesBox.addEventListener('touchend', resumeScroll);
}

// ==========================================
// BOTTOM NAVIGATION POP-UP CONTROLS
// ==========================================

// 1. Music (Lagu) Button
document.getElementById('music-btn').addEventListener('click', (e) => {
    e.preventDefault(); 
    // Close all other popups
    document.getElementById('contact-popup').classList.remove('show');
    document.getElementById('lokasi-popup').classList.remove('show');
    // Toggle this popup
    document.getElementById('music-popup').classList.toggle('show');
});

// 2. Contact (Hubungi) Button
document.getElementById('contact-nav-btn').addEventListener('click', (e) => {
    e.preventDefault();
    // Close all other popups
    document.getElementById('music-popup').classList.remove('show');
    document.getElementById('lokasi-popup').classList.remove('show');
    // Toggle this popup
    document.getElementById('contact-popup').classList.toggle('show');
});

// 3. Location (Lokasi) Button
document.getElementById('lokasi-nav-btn').addEventListener('click', (e) => {
    e.preventDefault();
    // Close all other popups
    document.getElementById('music-popup').classList.remove('show');
    document.getElementById('contact-popup').classList.remove('show');
    // Toggle this popup
    document.getElementById('lokasi-popup').classList.toggle('show');
});

// ==========================================
// "TUTUP" (CLOSE) BUTTONS
// ==========================================
document.getElementById('close-music-btn').addEventListener('click', () => {
    document.getElementById('music-popup').classList.remove('show');
});

document.getElementById('close-contact-btn').addEventListener('click', () => {
    document.getElementById('contact-popup').classList.remove('show');
});

document.getElementById('close-lokasi-btn').addEventListener('click', () => {
    document.getElementById('lokasi-popup').classList.remove('show');
});

// ==========================================
// COPY ACCOUNT NUMBER FUNCTION (For Gift)
// ==========================================
function copyText(elementId) {
    // Get the text from the HTML
    const textToCopy = document.getElementById(elementId).innerText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Change the button text temporarily to "Disalin!" (Copied!)
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "Disalin!";
        btn.style.backgroundColor = "#7A7A7A";
        btn.style.color = "#fff";
        
        // Reset button after 2 seconds
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "transparent";
            btn.style.color = "#555";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy!', err);
    });
}
