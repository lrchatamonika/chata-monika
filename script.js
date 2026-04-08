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
                img.loading = 'lazy'; // Super pre Performance

                img.onerror = () => slide.style.display = 'none';

                slide.appendChild(img);
                fragment.appendChild(slide);
            }

            track.replaceChildren(fragment);
        }
    });


    // --- 2. SLIDER BUTTONS ---
    document.querySelectorAll('.slider-btn').forEach(btn => {
        // Oprava pre Lighthouse: kazdy sipkovy button v slideri musi mat label
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
        }, { passive: true }); // Lepsi performance pri scrollovani

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


    // --- 4. LIGHTBOX (OPRAVENÝ PRE LIGHTHOUSE) ---
	const lightbox = document.createElement('div');
	lightbox.className = 'lightbox';
	lightbox.setAttribute('role', 'dialog');
	lightbox.setAttribute('aria-modal', 'true');
	lightbox.setAttribute('aria-label', 'Galéria fotografií'); // <--- DOPLNENÉ

	const lightboxImg = document.createElement('img');
	// Tip: alt nastavuj dynamicky v showImage() podľa altu pôvodnej fotky
	lightboxImg.alt = "Zväčšený náhľad galérie"; 

	const closeBtn = document.createElement('button');
	closeBtn.className = 'close-lightbox';
	closeBtn.setAttribute('aria-label', 'Zatvoriť galériu');
	closeBtn.innerHTML = '&times;';

	const prevBtn = document.createElement('button');
	prevBtn.className = 'lightbox-prev';
	prevBtn.setAttribute('aria-label', 'Predchádzajúci obrázok');
	prevBtn.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';

	const nextBtn = document.createElement('button');
	nextBtn.className = 'lightbox-next';
	nextBtn.setAttribute('aria-label', 'Nasledujúci obrázok');
	nextBtn.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';

    // OPEN
    document.addEventListener('click', (e) => {
        const clickedImg = e.target.closest('.slide img');

        if (clickedImg) {
            const track = clickedImg.closest('.slider-track');
            currentImages = Array.from(track.querySelectorAll('img'));
            currentIndex = currentImages.indexOf(clickedImg);

            showImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Stop scrollu na pozadi
        }

        if (e.target === lightbox || e.target.closest('.close-lightbox')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    function showImage() {
        if (currentImages.length > 0) {
            lightboxImg.src = currentImages[currentIndex].src;
            // Prenesieme ALT tag z miniatury do lightboxu kvoli SEO/Accessibility
            lightboxImg.alt = currentImages[currentIndex].alt;
        }
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % currentImages.length;
        showImage();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        showImage();
    }

    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);

    // KEYBOARD NAVIGATION
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
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


    // --- 5. MENU (HAMBURGER) - OPRAVENÝ ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        // Pridanie labelu pre Lighthouse, ak chyba v HTML
        mobileMenu.setAttribute('aria-label', 'Hlavné menu');
        const menuIcon = mobileMenu.querySelector('i');

        mobileMenu.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            mobileMenu.setAttribute('aria-expanded', isActive); // SEO/Accessibility standard
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

    // Inicializujeme recenzie
    initReviewSidebar();
});

// --- 6. REVIEW SIDEBAR (ASYNC) ---
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
            for(let i=0; i < parseInt(stars); i++) {
                starHtml += '<i class="fas fa-star" aria-hidden="true"></i>';
            }

            card.innerHTML = `
                <i class="fas fa-quote-left quote-icon" aria-hidden="true"></i>
                <div class="stars" aria-label="Hodnotenie ${stars} z 5 hviezdiciek">${starHtml}</div>
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