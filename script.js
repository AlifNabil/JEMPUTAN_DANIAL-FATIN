// --- 1. INITIAL SETUP ---
document.body.classList.add('no-scroll');

if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// --- 2. GLOBAL VARIABLES ---
const scrollSpeed = 1; 
const resumeDelay = 6000; 
let isScrolling = false; 
let resumeTimer;
let accumulatedScroll = 0; 
let isPlaying = false;

// DOM Elements Cached for Performance
const musicIcon = document.getElementById('music-btn').querySelector('.nav-icon');
const music = document.getElementById('bgMusic');

// --- 3. OPEN INVITATION (Triggered from Cover) ---
function openInvitation() {
    window.scrollTo(0, 0);
    document.getElementById('welcome-cover').classList.add('hidden');
    document.body.classList.remove('no-scroll');
    
    if (music) {
        music.currentTime = 13; // Skips to best part
        music.play().catch(error => console.log("Auto-play prevented", error));
        isPlaying = true;
        musicIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line>';
    }

    setTimeout(() => {
        isScrolling = true;
        requestAnimationFrame(startAutoScroll);
    }, 2000);    
}

// --- 4. MUSIC CONTROLS ---
function togglePopupMusic() {
    const popupMusicBtn = document.getElementById('popup-music-btn');
    if (!popupMusicBtn || !music) return;
    
    const popupMusicIcon = popupMusicBtn.querySelector('.center-nav-icon');

    if (isPlaying) {
        music.pause();
        isPlaying = false;
        popupMusicIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>';
        musicIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>';
    } else {
        music.play().catch(error => console.log("Play prevented", error));
        isPlaying = true;
        popupMusicIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line>';
        musicIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line>';
    }
}

// --- 5. AUTO-SCROLL ENGINE ---
function startAutoScroll() {
    if (isScrolling) {
        accumulatedScroll += scrollSpeed;
        if (accumulatedScroll >= 1) {
            const pixelsToScroll = Math.floor(accumulatedScroll);
            window.scrollBy(0, pixelsToScroll);
            accumulatedScroll -= pixelsToScroll;
        }
    }
    requestAnimationFrame(startAutoScroll);
}

function handleGuestInteraction() {
    isScrolling = false;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { isScrolling = true; }, resumeDelay);
}

window.addEventListener('wheel', handleGuestInteraction, { passive: true });      
window.addEventListener('touchstart', handleGuestInteraction, { passive: true }); 
window.addEventListener('touchmove', handleGuestInteraction, { passive: true });  
window.addEventListener('mousedown', handleGuestInteraction, { passive: true });  

// --- 6. COUNTDOWN TIMER (Optimized) ---
const weddingDate = new Date("April 11, 2026 11:00:00").getTime();
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const countdownTimer = setInterval(function() {
    const distance = weddingDate - new Date().getTime();
    
    if (distance < 0) {
        clearInterval(countdownTimer);
        document.querySelector(".countdown-container").innerHTML = "<p class='details-text'>The big day is here!</p>";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    daysEl.innerText = days < 10 ? "0" + days : days;
    hoursEl.innerText = hours < 10 ? "0" + hours : hours;
    minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
    secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
}, 1000);

// --- 7. GOOGLE SHEETS & RSVP LOGIC ---
const scriptURL = 'https://script.google.com/macros/s/AKfycbziIeJN55S-v4S62ICkOq64S3SBiDP9lXDGzZHmy2NkpS6Mlpnt3HxheeB0aAbrMiFaSw/exec';
const form = document.getElementById('customRsvpForm');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', e => {
    e.preventDefault(); 
    submitBtn.innerText = 'Menghantar...';
    submitBtn.disabled = true;

    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => {
            form.reset(); 
            submitBtn.innerText = 'Berjaya Dihantar!';
            submitBtn.style.backgroundColor = '#4CAF50'; 
            
            loadRSVPData();

            setTimeout(() => {
                submitBtn.innerText = 'Hantar Sekali Lagi';
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = ''; 

                const wishesSection = document.getElementById('wishes-list');
                if (wishesSection) {
                    wishesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 1500);
        })
        .catch(error => {
            alert('Alamak! Sesuatu tidak kena. Sila cuba lagi.');
            submitBtn.innerText = 'Submit';
            submitBtn.disabled = false;
        });
});

function loadRSVPData() {
    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            let attendingCount = 0;
            let notAttendingCount = 0;
            let wishesHTML = '';

            data.reverse().forEach(row => {
                if (row.session === 'Not Attending') {
                    notAttendingCount++; 
                } else if (row.session) { 
                    let adultsCount = parseInt(row.adults) || 0; 
                    let childrenCount = parseInt(row.children) || 0; 
                    attendingCount += (adultsCount + childrenCount);
                }

                if (row.wishes && row.wishes.trim() !== '' && row.name) {
                    wishesHTML += `<div class="wish-item"><p class="wish-text">"${row.wishes}"</p><p class="wish-name">${row.name}</p></div>`;
                }
            });

            document.getElementById('attending-count').innerText = attendingCount;
            document.getElementById('not-attending-count').innerText = notAttendingCount;
            
            const wishesList = document.getElementById('wishes-list');
            if (wishesHTML !== '') {
                wishesList.innerHTML = wishesHTML;
                startWishesAutoScroll();
            } else {
                wishesList.innerHTML = '<p class="wish-text">Jadilah yang pertama memberi ucapan!</p>';
            }
        })
        .catch(error => console.error('Error loading RSVP data:', error));
}
document.addEventListener('DOMContentLoaded', loadRSVPData);

// --- 8. WISHES SCROLL (Hardware Accelerated & Time-Based) ---
function startWishesAutoScroll() {
    const wishesBox = document.getElementById('wishes-list');
    let animationId;
    let isUserInteracting = false;
    let resumeTimeout;
    
    let exactScroll = wishesBox.scrollTop;
    let lastTime = performance.now();
    const speedPerSecond = 30; // Adjust this number to make it faster/slower!

    function smoothScroll(currentTime) {
        if (!isUserInteracting) {
            // Calculate how much time passed since the last frame
            let deltaTime = currentTime - lastTime;
            
            // Safety catch for when the browser tab is hidden
            if (deltaTime > 100) deltaTime = 16; 
            
            // Move exactly based on time, not frames (fixes 60Hz/120Hz stutter)
            exactScroll += (speedPerSecond * deltaTime) / 1000; 
            wishesBox.scrollTop = exactScroll;
            
            // Loop smoothly back to the top
            if (wishesBox.scrollTop >= (wishesBox.scrollHeight - wishesBox.clientHeight - 1)) {
                exactScroll = 0;
                wishesBox.scrollTop = 0;
            }
        }
        lastTime = currentTime;
        animationId = requestAnimationFrame(smoothScroll);
    }

    animationId = requestAnimationFrame(smoothScroll);

    const pauseScroll = () => {
        isUserInteracting = true;
        clearTimeout(resumeTimeout);
        exactScroll = wishesBox.scrollTop;
    };

    const resumeScroll = () => {
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            exactScroll = wishesBox.scrollTop;
            lastTime = performance.now(); // Crucial: Reset time so it doesn't jump!
            isUserInteracting = false;
        }, 2000); 
    };

    wishesBox.addEventListener('touchstart', pauseScroll, {passive: true});
    wishesBox.addEventListener('touchmove', pauseScroll, {passive: true});
    wishesBox.addEventListener('touchend', resumeScroll);
    wishesBox.addEventListener('mouseenter', pauseScroll);
    wishesBox.addEventListener('mouseleave', resumeScroll);
    wishesBox.addEventListener('wheel', () => { pauseScroll(); resumeScroll(); }, {passive: true});
}

document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible'); 
            else entry.target.classList.remove('visible');
        });
    }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

// --- 9. POPUP NAVIGATION ---
function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) popup.classList.remove('show');
}

document.getElementById('music-btn').addEventListener('click', (e) => {
    e.preventDefault(); 
    closePopup('contact-popup');
    closePopup('lokasi-popup');
    document.getElementById('music-popup').classList.toggle('show');
});

document.getElementById('contact-nav-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closePopup('music-popup');
    closePopup('lokasi-popup');
    document.getElementById('contact-popup').classList.toggle('show');
});

document.getElementById('lokasi-nav-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closePopup('music-popup');
    closePopup('contact-popup');
    document.getElementById('lokasi-popup').classList.toggle('show');
});

// --- 10. UTILITIES ---
function copyText(elementId) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "Disalin!";
        btn.style.backgroundColor = "#7A7A7A";
        btn.style.color = "#fff";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "transparent";
            btn.style.color = "#555";
        }, 2000);
    }).catch(err => console.error('Failed to copy!', err));
}