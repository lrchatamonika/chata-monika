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
        if (!track || item.count <= 0) return;

        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= item.count; i++) {
            const slide = document.createElement('div');
            slide.className = 'slide';

            const img = document.createElement('img');
            img.src = `img/${item.id}-${i}.webp`;
            img.alt = `${item.alt} ${i}`;
            img.loading = 'lazy';

            img.onerror = () => slide.remove();

            slide.appendChild(img);
            fragment.appendChild(slide);
        }

        track.replaceChildren(fragment);
    });

    // --- 2. SLIDER BUTTONS ---
    document.querySelectorAll('.slider-btn').forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            const direction = btn.classList.contains('next') ? 'Nasledujúca fotka' : 'Predchádzajúca fotka';
            btn.setAttribute('aria-label', direction);
        }

        btn.addEventListener('click', () => {
            const id = btn.dataset.target;
            const track = document.querySelector(`.slider-track[data-id="${id}"]`);
            if (!track) return;

            const viewport = track.parentElement;
            const firstSlide = track.querySelector('.slide');

            const gapValue = getComputedStyle(track).gap;
            const gap = parseInt(gapValue) || 20;

            const scrollAmount = firstSlide
                ? firstSlide.offsetWidth + gap
                : viewport.clientWidth * 0.8;

            viewport.scrollBy({
                left: btn.classList.contains('next') ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        });
    });

    // --- 3. SWIPE (SLIDER) ---
    document.querySelectorAll('.slider-viewport').forEach(viewport => {
        let startX = 0;
        let isDown = false;

        viewport.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDown = true;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            if (!isDown) return;

            const diff = startX - e.changedTouches[0].clientX;

            if (Math.abs(diff) > 50) {
                const scrollAmount = viewport.clientWidth * 0.8;

                viewport.scrollBy({
                    left: diff > 0 ? scrollAmount : -scrollAmount,
                    behavior: 'smooth'
                });
            }

            isDown = false;
        });
    });

    // --- 4. LIGHTBOX ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox.querySelector('.close-lightbox');

    let currentImages = [];
    let currentIndex = 0;

    function showImage() {
        if (!currentImages.length) return;

        const img = currentImages[currentIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;

        // preload next image (smooth UX)
        const next = new Image();
        next.src = currentImages[(currentIndex + 1) % currentImages.length].src;
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % currentImages.length;
        showImage();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        showImage();
    }

    function openLightbox(clickedImg) {
        const track = clickedImg.closest('.slider-track');
        currentImages = Array.from(track.querySelectorAll('img'));
        currentIndex = currentImages.indexOf(clickedImg);

        showImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // CLICK HANDLING
    document.addEventListener('click', (e) => {
        const clickedImg = e.target.closest('.slide img');

        if (clickedImg) {
            openLightbox(clickedImg);
            return;
        }

        if (e.target === lightbox) closeLightbox();
        if (e.target.closest('.close-lightbox')) closeLightbox();
    });

    // KEYBOARD
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeLightbox();
    });

    // SWIPE (LIGHTBOX)
    let lbStartX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        lbStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const diff = lbStartX - e.changedTouches[0].clientX;

        if (Math.abs(diff) > 50) {
            diff > 0 ? nextImage() : prevImage();
        }
    });

    // --- 5. MENU ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.setAttribute('aria-label', 'Hlavné menu');
        const menuIcon = mobileMenu.querySelector('i');

        mobileMenu.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            mobileMenu.setAttribute('aria-expanded', isActive);

            menuIcon.classList.toggle('fa-bars');
            menuIcon.classList.toggle('fa-times');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');

                menuIcon.classList.add('fa-bars');
                menuIcon.classList.remove('fa-times');
            });
        });
    }

    // --- INIT REVIEWS ---
    initReviewSidebar();
});


// --- 6. REVIEW SIDEBAR ---
async function initReviewSidebar() {
    const container = document.getElementById('review-sidebar');
    if (!container) return;

    try {
        const response = await fetch('review.txt');
        if (!response.ok) throw new Error('Nepodarilo sa nacitat recenzie');

        const data = await response.text();
        const lines = data.trim().split('\n');

        container.innerHTML = '';

        lines.forEach((line, index) => {
            const parts = line.split('|');
            if (parts.length < 3) return;

            const [name, text, stars, platform] = parts;

            const card = document.createElement('div');
            card.className = `review-card-sidebar ${index === 0 ? 'active' : ''}`;

            let starHtml = '';
            for (let i = 0; i < parseInt(stars); i++) {
                starHtml += '<i class="fas fa-star" aria-hidden="true"></i>';
            }

            card.innerHTML = `
                <i class="fas fa-quote-left quote-icon" aria-hidden="true"></i>
                <div class="stars" role="img" aria-label="Hodnotenie ${stars} z 5 hviezdiciek">
                    ${starHtml}
                </div>
                <p>${text.trim()}</p>
                <h4>${name.trim()}</h4>
                <span class="platform-tag">${platform ? platform.trim() : 'Recenzia'}</span>
            `;

            container.appendChild(card);
        });

        const cards = container.querySelectorAll('.review-card-sidebar');
        let currentIndex = 0;

        if (cards.length > 1) {
            setInterval(() => {
                cards[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % cards.length;
                cards[currentIndex].classList.add('active');
            }, 6000);
        }

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="padding:20px">Zatiaľ žiadne recenzie.</p>';
    }
}