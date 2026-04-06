document.addEventListener('DOMContentLoaded', () => {

    // --- 0. CONFIG ---
    const config = [
        { id: 'monika', count: 6, alt: 'Chata Monika' },
        { id: 'cast-a', count: 11, alt: 'Časť A' },
        { id: 'cast-b', count: 10, alt: 'Časť B' },
        { id: 'okolie', count: 1, alt: 'Okolie' }
    ];


    // --- 1. RENDER FOTIEK ---
    config.forEach(item => {

        const track = document.querySelector(`.slider-track[data-id="${item.id}"]`);

        if (track && item.count > 0) {

            const fragment = document.createDocumentFragment();

            for (let i = 1; i <= item.count; i++) {

                const slide = document.createElement('div');
                slide.className = 'slide';

                const img = document.createElement('img');
                img.src = `img/${item.id}-${i}.webp`;
                img.alt = `${item.alt} ${i}`;
                img.loading = 'lazy';

                img.onerror = () => slide.style.display = 'none';

                slide.appendChild(img);
                fragment.appendChild(slide);
            }

            track.replaceChildren(fragment);
        }

    });


    // --- 2. SLIDER BUTTONS ---
    document.querySelectorAll('.slider-btn').forEach(btn => {

        btn.addEventListener('click', () => {

            const id = btn.dataset.target;
            const track = document.querySelector(`.slider-track[data-id="${id}"]`);

            if (!track) return;

            const viewport = track.parentElement;

            const firstSlide = track.querySelector('.slide');
            const gap = parseInt(getComputedStyle(track).gap) || 20;

            const scrollAmount = firstSlide
                ? firstSlide.offsetWidth + gap
                : 320;

            viewport.scrollBy({
                left: btn.classList.contains('next') ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });

        });

    });


    // --- 3. SWIPE ---
    document.querySelectorAll('.slider-viewport').forEach(viewport => {

        let startX = 0;
        let isDown = false;

        viewport.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDown = true;
        });

        viewport.addEventListener('touchend', (e) => {

            if (!isDown) return;

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                viewport.scrollBy({
                    left: diff > 0 ? 300 : -300,
                    behavior: 'smooth'
                });
            }

            isDown = false;
        });

    });


    // --- 4. LIGHTBOX + SLIDER ---
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';

const lightboxImg = document.createElement('img');

const closeBtn = document.createElement('span');
closeBtn.innerHTML = '&times;';
closeBtn.className = 'close-lightbox';

// NAV BUTTONS
const prevBtn = document.createElement('button');
prevBtn.className = 'lightbox-prev';
prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

const nextBtn = document.createElement('button');
nextBtn.className = 'lightbox-next';
nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

lightbox.appendChild(closeBtn);
lightbox.appendChild(prevBtn);
lightbox.appendChild(lightboxImg);
lightbox.appendChild(nextBtn);

document.body.appendChild(lightbox);

let currentImages = [];
let currentIndex = 0;

// OPEN
document.addEventListener('click', (e) => {

    const clickedImg = e.target.closest('.slide img');

    if (clickedImg) {
        const track = clickedImg.closest('.slider-track');
        currentImages = Array.from(track.querySelectorAll('img'));

        currentIndex = currentImages.indexOf(clickedImg);

        showImage();
        lightbox.classList.add('active');
    }

    if (e.target === lightbox || e.target === closeBtn) {
        lightbox.classList.remove('active');
    }

});

// SHOW IMAGE
function showImage() {
    if (currentImages.length > 0) {
        lightboxImg.src = currentImages[currentIndex].src;
    }
}

// NEXT
function nextImage() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    showImage();
}

// PREV
function prevImage() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    showImage();
}

// BUTTONS
nextBtn.addEventListener('click', nextImage);
prevBtn.addEventListener('click', prevImage);

// KEYBOARD
document.addEventListener('keydown', (e) => {

    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') lightbox.classList.remove('active');

});

// SWIPE (LIGHTBOX)
let startX = 0;

lightbox.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

lightbox.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 50) {
        diff > 0 ? nextImage() : prevImage();
    }
});


    // --- 5. ESC CLOSE ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
        }
    });


    // --- 6. MENU (HAMBURGER) ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {

        const menuIcon = mobileMenu.querySelector('i');

        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuIcon.classList.toggle('fa-bars');
            menuIcon.classList.toggle('fa-times');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuIcon.classList.add('fa-bars');
                menuIcon.classList.remove('fa-times');
            });
        });

    }

});

    /* REVIEW CSS */
async function initReviewSidebar() {
    const container = document.getElementById('review-sidebar');
    
    try {
        const response = await fetch('review.txt');
        const data = await response.text();
        const lines = data.trim().split('\n');
        
        container.innerHTML = ''; // Vymazeme loading text

        // 1. Vytvorime vsetky karty
        lines.forEach((line, index) => {
            const [name, text, stars, platform] = line.split('|');
            if (!name) return;

            const card = document.createElement('div');
            card.className = `review-card-sidebar ${index === 0 ? 'active' : ''}`;
            
            let starHtml = '';
            for(let i=0; i<parseInt(stars); i++) starHtml += '<i class="fas fa-star"></i>';

            card.innerHTML = `
                <i class="fas fa-quote-left quote-icon"></i>
                <div class="stars">${starHtml}</div>
                <p>${text.trim()}</p>
                <h4>${name.trim()}</h4>
                <span class="platform-tag">${platform ? platform.trim() : 'Recenzia'}</span>
            `;
            container.appendChild(card);
        });

        // 2. Logika prelinania (Cyklovac)
        const cards = container.querySelectorAll('.review-card-sidebar');
        let currentIndex = 0;

        if (cards.length > 1) {
            setInterval(() => {
                cards[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % cards.length;
                cards[currentIndex].classList.add('active');
            }, 6000); // Kazdych 6 sekund sa vymeni recenzia
        }

    } catch (err) {
        container.innerHTML = '<p style="padding:20px">Ziadne nove recenzie.</p>';
    }
}

// Spustit po nacitani
document.addEventListener('DOMContentLoaded', initReviewSidebar);
