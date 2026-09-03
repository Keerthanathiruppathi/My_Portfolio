/* Navigation */
const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.querySelector('.theme-toggle');
const backToTop = document.querySelector('.back-to-top');
const progressBar = document.querySelector('.scroll-progress span');

function updateScrollUi() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }

    if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    }
}

window.addEventListener('scroll', updateScrollUi, { passive: true });
updateScrollUi();

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

if (themeToggle) {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    themeToggle.innerHTML = `<i class="fas fa-${document.body.classList.contains('light-theme') ? 'moon' : 'sun'}"></i>`;
    themeToggle.setAttribute('aria-label', document.body.classList.contains('light-theme') ? 'Switch to dark theme' : 'Switch to light theme');

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
        themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
        themeToggle.innerHTML = `<i class="fas fa-${isLight ? 'moon' : 'sun'}"></i>`;
    });
}

function initBackgroundScene() {
    const canvas = document.querySelector('#scene-background');
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const particleCount = window.innerWidth < 600 ? 380 : 700;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
        particlePositions[index * 3] = (Math.random() - 0.5) * 13;
        particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 9;
        particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 7;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x8b9cff,
        size: 0.025,
        transparent: true,
        opacity: 0.7
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const orbit = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.35, 1),
        new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.16 })
    );
    orbit.position.set(2.8, 0.6, -1.3);
    scene.add(orbit);

    const accent = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.012, 8, 96),
        new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.22 })
    );
    accent.position.set(-3.2, -1.8, -1);
    accent.rotation.x = 0.9;
    scene.add(accent);

    const pointer = { x: 0, y: 0 };
    window.addEventListener('pointermove', (event) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animate() {
        if (!reduceMotion) {
            particles.rotation.y += 0.00035;
            particles.rotation.x += 0.00008;
            orbit.rotation.x += 0.0018;
            orbit.rotation.y += 0.0025;
            accent.rotation.z -= 0.0015;
            camera.position.x += (pointer.x * 0.18 - camera.position.x) * 0.02;
            camera.position.y += (-pointer.y * 0.12 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();
}

initBackgroundScene();

function initCardLighting() {
    if (window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.skill-category, .project-card, .timeline-content, .achievement-card');
    let pointerX = 0;
    let pointerY = 0;
    let framePending = false;

    function updateCardLighting() {
        cards.forEach((card) => {
            const bounds = card.getBoundingClientRect();
            const proximity = 110;
            const closestX = Math.max(bounds.left, Math.min(pointerX, bounds.right));
            const closestY = Math.max(bounds.top, Math.min(pointerY, bounds.bottom));
            const distance = Math.hypot(pointerX - closestX, pointerY - closestY);
            const isNear = distance < proximity;

            card.classList.toggle('is-near', isNear);
            if (isNear) {
                card.style.setProperty('--pointer-x', `${pointerX - bounds.left}px`);
                card.style.setProperty('--pointer-y', `${pointerY - bounds.top}px`);
            }
        });
        framePending = false;
    }

    window.addEventListener('pointermove', (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!framePending) {
            framePending = true;
            requestAnimationFrame(updateCardLighting);
        }
    }, { passive: true });
}

initCardLighting();

async function loadGithubStats() {
    const username = 'Keerthanathiruppathi';
    const repoCount = document.querySelector('#github-repos');
    const followerCount = document.querySelector('#github-followers');
    const commitCount = document.querySelector('#github-commits');
    if (!repoCount || !followerCount || !commitCount) return;

    try {
        const [profileResponse, commitsResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/search/commits?q=author:${username}`, {
                headers: { Accept: 'application/vnd.github+json' }
            })
        ]);

        if (profileResponse.ok) {
            const profile = await profileResponse.json();
            repoCount.textContent = profile.public_repos;
            followerCount.textContent = profile.followers;
        }

        if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            commitCount.textContent = commits.total_count.toLocaleString();
        }
    } catch (error) {
        repoCount.textContent = '—';
        followerCount.textContent = '—';
        commitCount.textContent = '—';
    }
}

loadGithubStats();

// Sticky Header
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        header.style.backgroundColor = 'color-mix(in srgb, var(--bg-color) 92%, transparent)';
    } else {
        header.style.boxShadow = 'none';
        header.style.backgroundColor = 'color-mix(in srgb, var(--bg-color) 78%, transparent)';
    }
});

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    navList.classList.toggle('active');
    hamburger.classList.toggle('active');

    // Animate Links
    navLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

    // Hamburger Animation transform
    const bars = document.querySelectorAll('.bar');
    if (navList.classList.contains('active')) {
        bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        const bars = document.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    });
});

// Scroll Sections Active Link
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

/* Scroll Animations */
const observerOptions = {
    threshold: 0.2, // Trigger when 20% of the element is visible
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stop observing once animation has triggered
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Select elements to animate
const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right, .zoom-in');
animatedElements.forEach(el => observer.observe(el));

/* Contact Form Handling */
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
            submitBtn.style.backgroundColor = '#10b981'; // Success color
            contactForm.reset();

            setTimeout(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
            }, 3000);
        }, 1500);
    });
}

/* Typing Effect */
const typingText = document.querySelector('.typing-text');
const words = ["AI&ML Engineer", "Fullstack Developer", "Data Engineer"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
        typingText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(type, 2000); // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500); // Pause before typing next word
    } else {
        const speed = isDeleting ? 100 : 200;
        setTimeout(type, speed);
    }
}

// Start typing effect if element exists — handle both pre- and post-DOM load
if (typingText) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', type);
    } else {
        // DOM already ready, start immediately
        type();
    }
}
