// ============================================================================
// Constants
// ============================================================================

/**
 * Configuration constants for various features.
 * @type {Object}
 */
const Constants = {
    /** Scroll threshold in pixels for navigation background change */
    SCROLL_THRESHOLD: 100,
    /** Delay in milliseconds before clearing screen reader announcements */
    SCREEN_READER_CLEAR_DELAY: 1000,
    /** Intersection Observer threshold for fade-in animations */
    FADE_IN_THRESHOLD: 0.1,
    /** Root margin for fade-in animations (bottom offset) */
    FADE_IN_ROOT_MARGIN: '0px 0px -50px 0px',
    /** Root margin for image lazy loading (preload distance) */
    IMAGE_LAZY_LOAD_MARGIN: '50px 0px',
    /** Intersection Observer threshold for image lazy loading */
    IMAGE_LAZY_LOAD_THRESHOLD: 0.01,
    /** CSS selector for CTA buttons with hash links */
    CTA_BUTTON_SELECTOR: '.cta-button[href^="#"]',
    /** CSS selector for navigation container */
    NAV_CONTAINER_SELECTOR: '.nav-container',
    /** CSS selector for navigation element */
    NAV_SELECTOR: '.nav',
    /** CSS selector for menu button */
    MENU_BUTTON_SELECTOR: '.menu-btn',
    /** ID for menu overlay element */
    MENU_OVERLAY_ID: 'menu-overlay',
    /** ID for ARIA live region */
    ARIA_LIVE_REGION_ID: 'aria-live-region',
    /** CSS selector for elements to animate (all content elements within sections, but not sections themselves) */
    ANIMATION_ELEMENTS_SELECTOR: 'section h1, section h2, section h3, section h4, section h5, section h6, section p, section ul, section ol, section li, section div, section article, section header, section footer, section aside',
    /** CSS selector for all images */
    IMAGES_SELECTOR: 'img',
    /** CSS class name for screen reader only content */
    SR_ONLY_CLASS: 'sr-only',
    /** CSS class name for component error display */
    COMPONENT_ERROR_CLASS: 'component-error',
    /** CSS class name for loaded state */
    LOADED_CLASS: 'loaded',
    /** CSS class name for scrolled navigation state */
    SCROLLED_CLASS: 'scrolled',
    /** CSS class name for active menu state */
    ACTIVE_CLASS: 'active',
    /** CSS class name for fade-in animation */
    FADE_IN_CLASS: 'fade-in',
    /** Keyboard key for Escape */
    KEY_ESCAPE: 'Escape',
    /** Keyboard key for Tab */
    KEY_TAB: 'Tab'
};

// ============================================================================
// Component Loading
// ============================================================================

/**
 * Fetches HTML content from a file using the Fetch API.
 * @param {string} componentPath - Relative path to the HTML component file (e.g., 'components/nav.html').
 * @returns {Promise<string>} The HTML content as a string.
 * @throws {Error} Throws an error if the HTTP request fails or returns a non-OK status.
 * @example
 * const html = await fetchHTML('components/nav.html');
 */
async function fetchHTML(componentPath) {
    if (!componentPath || typeof componentPath !== 'string') {
        throw new Error('Invalid component path provided');
    }

    const response = await fetch(componentPath);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch ${componentPath}: HTTP ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
}

/**
 * Loads a component HTML file into a target element by its ID.
 * If loading fails, displays a user-friendly error message in the target element.
 * @param {string} elementId - The ID of the target DOM element where the component will be inserted.
 * @param {string} componentPath - Relative path to the component HTML file.
 * @returns {Promise<boolean>} Returns true if the component loaded successfully, false otherwise.
 * @example
 * await loadComponent('nav-placeholder', 'components/nav.html');
 */
async function loadComponent(elementId, componentPath) {
    if (!elementId || typeof elementId !== 'string') {
        console.error('Invalid element ID provided');
        return false;
    }
    if (!componentPath || typeof componentPath !== 'string') {
        console.error('Invalid component path provided');
        return false;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found`);
        return false;
    }

    try {
        const html = await fetchHTML(componentPath);
        element.innerHTML = html;
        return true;
    } catch (error) {
        console.error(`Failed to load component ${componentPath} into element "${elementId}":`, error);
        // Show fallback content if component fails to load
        element.innerHTML = `<div class="${Constants.COMPONENT_ERROR_CLASS}" role="alert" aria-live="polite">${AppConfig.messages.componentLoadError}</div>`;
        return false;
    }
}

/**
 * Loads a project card HTML file and appends it to a container element.
 * If loading fails, appends an error message to the container.
 * @param {string} containerSelector - CSS selector for the container element (e.g., '.project-cards-list').
 * @param {string} componentPath - Relative path to the project card HTML file.
 * @returns {Promise<boolean>} Returns true if the project card loaded successfully, false otherwise.
 * @example
 * await loadProjectCard('.project-cards-list', 'components/project-navy-pacific.html');
 */
async function loadProjectCard(containerSelector, componentPath) {
    if (!containerSelector || typeof containerSelector !== 'string') {
        console.error('Invalid container selector provided');
        return false;
    }
    if (!componentPath || typeof componentPath !== 'string') {
        console.error('Invalid component path provided');
        return false;
    }

    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container "${containerSelector}" not found`);
        return false;
    }

    try {
        const html = await fetchHTML(componentPath);
        container.insertAdjacentHTML('beforeend', html);
        return true;
    } catch (error) {
        console.error(`Failed to load project card ${componentPath} into container "${containerSelector}":`, error);
        // Show fallback content for failed project card
        const errorHTML = `<div class="${Constants.COMPONENT_ERROR_CLASS}" role="alert" aria-live="polite">${AppConfig.messages.projectCardLoadError}</div>`;
        container.insertAdjacentHTML('beforeend', errorHTML);
        return false;
    }
}

/**
 * Initializes and loads all components defined in AppConfig.
 * Loads standard components (nav, footer, CTA) and project cards in parallel.
 * Uses configuration from AppConfig to determine which components to load.
 * @returns {Promise<void>} Resolves when all components have been loaded (or failed to load).
 * @throws {Error} May throw an error if Promise.all fails, though individual component failures are handled gracefully.
 */
async function initializeComponents() {
    // Load all standard components in parallel
    const componentPromises = Object.entries(AppConfig.components).map(
        ([elementId, componentPath]) => loadComponent(elementId, componentPath)
    );

    // Load individual project cards into the container
    const projectCardsList = document.querySelector(AppConfig.selectors.projectCardsList);
    if (projectCardsList) {
        const projectCardPromises = AppConfig.projectCards.map(
            (componentPath) => loadProjectCard(AppConfig.selectors.projectCardsList, componentPath)
        );
        componentPromises.push(...projectCardPromises);
    }

    // Wait for all components to load (individual failures are handled gracefully)
    // Promise.allSettled never rejects, so no try-catch needed
    await Promise.allSettled(componentPromises);
}

// ============================================================================
// Main Application Logic
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initializeComponents();

        // Add loaded class to body for smooth fade-in
        if (document.body) {
            document.body.classList.add(Constants.LOADED_CLASS);
        }

        // Initialize features (each handles its own null checks)
        initializeSmoothScrolling();
        initializeNavigationScroll();
        initializeMenuOverlay();
        initializeFadeInAnimations();
        initializeImageObserver();
        initializeRotatingIndustry();
        
        // Initialize banner h1 click handlers for industry pages
        initializeBannerH1Click();
        
        // Initialize carousel after components are loaded
        initializeCarousel();
    } catch (error) {
        console.error('Error during initialization:', error);
        // Ensure body still gets loaded class even if components fail
        if (document.body) {
            document.body.classList.add(Constants.LOADED_CLASS);
        }
    }
});

// ============================================================================
// Smooth Scrolling for Navigation Links
// ============================================================================

/**
 * Initializes smooth scrolling behavior for CTA buttons that link to page sections.
 * Calculates the correct scroll position accounting for fixed navigation height.
 * @returns {void}
 */
function initializeSmoothScrolling() {
    try {
        const ctaButtons = document.querySelectorAll(Constants.CTA_BUTTON_SELECTOR);

        if (ctaButtons.length === 0) {
            return; // No buttons to handle
        }

        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                try {
                    e.preventDefault();

                    const targetId = this.getAttribute('href');
                    if (!targetId) {
                        console.warn('CTA button has no href attribute');
                        return;
                    }

                    const targetSection = document.querySelector(targetId);
                    if (!targetSection) {
                        console.warn(`Target section not found: ${targetId}`);
                        return;
                    }

                    const nav = document.querySelector(Constants.NAV_SELECTOR);
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const targetPosition = targetSection.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } catch (error) {
                    console.error('Error during smooth scroll:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error initializing smooth scrolling:', error);
    }
}

// ============================================================================
// Navigation Background Change on Scroll
// ============================================================================

/**
 * Initializes navigation background change on scroll.
 * Adds a 'scrolled' class to the navigation container when the user scrolls past 100px.
 * Uses passive event listener for better scroll performance.
 * @returns {void}
 */
function initializeNavigationScroll() {
    try {
        const navContainer = document.querySelector(Constants.NAV_CONTAINER_SELECTOR);
        
        if (!navContainer) {
            return; // Navigation container not found
        }

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > Constants.SCROLL_THRESHOLD) {
                navContainer.classList.add(Constants.SCROLLED_CLASS);
            } else {
                navContainer.classList.remove(Constants.SCROLLED_CLASS);
            }
        }, { passive: true });
    } catch (error) {
        console.error('Error initializing navigation scroll:', error);
    }
}

// ============================================================================
// Full-Screen Menu Overlay Toggle with Focus Trap
// ============================================================================

/**
 * Initializes the full-screen menu overlay with keyboard navigation and focus trap.
 * Handles opening/closing the menu, focus management, and ARIA attributes.
 * Implements accessibility features including focus trapping and screen reader announcements.
 * @returns {void}
 */
function initializeMenuOverlay() {
    try {
        const menuBtn = document.querySelector(Constants.MENU_BUTTON_SELECTOR);
        const menuOverlay = document.getElementById(Constants.MENU_OVERLAY_ID);

        if (!menuBtn || !menuOverlay) {
            return;
        }

    const menuLinks = menuOverlay.querySelectorAll('a');
    const firstFocusable = menuLinks[0];
    const lastFocusable = menuLinks[menuLinks.length - 1];
    let previousActiveElement = null;

    /**
     * Traps keyboard focus within the menu overlay when active.
     * Prevents focus from escaping the menu using Tab/Shift+Tab navigation.
     * @param {KeyboardEvent} e - The keyboard event object.
     * @returns {void}
     */
    function trapFocus(e) {
        if (!menuOverlay.classList.contains(Constants.ACTIVE_CLASS)) {
            return;
        }

        if (e.key === Constants.KEY_TAB) {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }

    /**
     * Opens the menu overlay and sets up focus trap.
     * Updates ARIA attributes, prevents body scrolling, and announces to screen readers.
     * @returns {void}
     */
    function openMenu() {
        try {
            menuOverlay.classList.add(Constants.ACTIVE_CLASS);
            menuBtn.classList.add(Constants.ACTIVE_CLASS);
            menuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            
            // Store the previously focused element
            previousActiveElement = document.activeElement;
            
            // Focus first menu item
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Add focus trap
            menuOverlay.addEventListener('keydown', trapFocus);
            
            // Announce menu opening
            announceToScreenReader('Menu opened');
        } catch (error) {
            console.error('Error opening menu:', error);
        }
    }

    /**
     * Closes the menu overlay and restores normal page behavior.
     * Removes focus trap, restores body scrolling, returns focus to trigger element, and announces to screen readers.
     * @returns {void}
     */
    function closeMenu() {
        try {
            menuOverlay.classList.remove(Constants.ACTIVE_CLASS);
            menuBtn.classList.remove(Constants.ACTIVE_CLASS);
            menuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
            
            // Remove focus trap
            menuOverlay.removeEventListener('keydown', trapFocus);
            
            // Return focus to the button that opened the menu
            if (previousActiveElement) {
                previousActiveElement.focus();
                previousActiveElement = null;
            }
            
            // Announce menu closing
            announceToScreenReader('Menu closed');
        } catch (error) {
            console.error('Error closing menu:', error);
        }
    }

    menuBtn.addEventListener('click', function() {
        const isActive = menuOverlay.classList.contains(Constants.ACTIVE_CLASS);
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking on overlay (but not on content)
    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            closeMenu();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === Constants.KEY_ESCAPE && menuOverlay.classList.contains(Constants.ACTIVE_CLASS)) {
            closeMenu();
        }
    });
    } catch (error) {
        console.error('Error initializing menu overlay:', error);
    }
}

// ============================================================================
// ARIA Live Region for Screen Reader Announcements
// ============================================================================

/**
 * Creates or retrieves an ARIA live region element for screen reader announcements.
 * The live region is hidden visually but accessible to assistive technologies.
 * @returns {HTMLElement} The ARIA live region element.
 */
function createAriaLiveRegion() {
    try {
        let liveRegion = document.getElementById(Constants.ARIA_LIVE_REGION_ID);
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = Constants.ARIA_LIVE_REGION_ID;
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = Constants.SR_ONLY_CLASS;
            document.body.appendChild(liveRegion);
        }
        
        return liveRegion;
    } catch (error) {
        console.error('Error creating ARIA live region:', error);
        // Return a dummy element to prevent crashes
        return document.createElement('div');
    }
}

/**
 * Announces a message to screen readers using an ARIA live region.
 * The message is automatically cleared after 1 second to prevent stale announcements.
 * @param {string} message - The message to announce to screen reader users.
 * @returns {void}
 * @example
 * announceToScreenReader('Menu opened');
 */
function announceToScreenReader(message) {
    try {
        if (!message || typeof message !== 'string') {
            console.warn('Invalid message provided to announceToScreenReader');
            return;
        }

        const liveRegion = createAriaLiveRegion();
        liveRegion.textContent = message;
        
        // Clear after announcement is read (screen readers typically read within 1-2 seconds)
        setTimeout(() => {
            try {
                liveRegion.textContent = '';
            } catch (error) {
                console.error('Error clearing ARIA live region:', error);
            }
        }, Constants.SCREEN_READER_CLEAR_DELAY);
    } catch (error) {
        console.error('Error announcing to screen reader:', error);
    }
}

// ============================================================================
// Fade-in Animations with Intersection Observer
// ============================================================================

/**
 * Initializes fade-in animations for articles and items within sections using Intersection Observer.
 * Elements fade in when they enter the viewport. Falls back to immediate fade-in for browsers without IntersectionObserver support.
 * Note: Sections themselves are not animated, only their child elements.
 * @returns {void}
 */
function initializeFadeInAnimations() {
    try {
        // Check if IntersectionObserver is supported
        if (typeof IntersectionObserver === 'undefined') {
            // Fallback: add fade-in class immediately for browsers without support
            const elementsToAnimate = document.querySelectorAll(Constants.ANIMATION_ELEMENTS_SELECTOR);
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                elementsToAnimate.forEach(element => {
                    element.classList.add(Constants.FADE_IN_CLASS);
                });
            });
            return;
        }

        const observerOptions = {
            threshold: Constants.FADE_IN_THRESHOLD,
            rootMargin: Constants.FADE_IN_ROOT_MARGIN
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(Constants.FADE_IN_CLASS);
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, observerOptions);

        // Observe all articles and headings within sections for animations
        const elementsToAnimate = document.querySelectorAll(Constants.ANIMATION_ELEMENTS_SELECTOR);
        
        if (elementsToAnimate.length > 0) {
            // Use requestAnimationFrame to ensure DOM is fully rendered before checking viewport
            requestAnimationFrame(() => {
                elementsToAnimate.forEach(element => {
                    // Check if element is already in viewport - if so, animate immediately
                    const rect = element.getBoundingClientRect();
                    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    if (isInViewport) {
                        // Element is already visible, add fade-in class immediately
                        element.classList.add(Constants.FADE_IN_CLASS);
                    } else {
                        // Element is not yet visible, observe it
                        observer.observe(element);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error initializing fade-in animations:', error);
    }
}

// ============================================================================
// Performance Optimization: Lazy Load Images
// ============================================================================

/**
 * Initializes lazy loading for images using Intersection Observer.
 * Adds the 'loading="lazy"' attribute to images when they approach the viewport.
 * No-op if IntersectionObserver is not supported by the browser.
 * @returns {void}
 */
function initializeImageObserver() {
    try {
        // Check if IntersectionObserver is supported
        if (typeof IntersectionObserver === 'undefined') {
            return; // Browser doesn't support IntersectionObserver
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Add loading="lazy" if not already set
                    if (!img.hasAttribute('loading')) {
                        img.setAttribute('loading', 'lazy');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: Constants.IMAGE_LAZY_LOAD_MARGIN,
            threshold: Constants.IMAGE_LAZY_LOAD_THRESHOLD
        });

        // Observe all images
        const images = document.querySelectorAll(Constants.IMAGES_SELECTOR);
        if (images.length > 0) {
            images.forEach(img => imageObserver.observe(img));
        }
    } catch (error) {
        console.error('Error initializing image observer:', error);
    }
}

// ============================================================================
// Project Carousel
// ============================================================================

/**
 * Initializes the project cards carousel with navigation and pagination.
 * Sets up event listeners for navigation arrows and pagination dots.
 * Manages slide transitions and active states.
 * @returns {void}
 */
function initializeCarousel() {
    try {
        const carouselSlides = document.querySelector('.carousel-slides');
        const projectCardsList = document.querySelector('.project-cards-list');
        const paginationContainer = document.querySelector('.carousel-pagination');

        // Check if all required elements exist
        if (!carouselSlides || !projectCardsList || !paginationContainer) {
            console.warn('Carousel elements not found, skipping carousel initialization');
            return;
        }

        // Get all project cards
        const slides = projectCardsList.querySelectorAll('.project-showcase');
        
        if (slides.length === 0) {
            console.warn('No project cards found for carousel');
            return;
        }

        // Initialize carousel state
        let currentSlide = 0;
        const totalSlides = slides.length;

        /**
         * Updates the carousel display to show the specified slide.
         * Calculates the transform to center the active card on the page.
         * @param {number} index - The index of the slide to display (0-based).
         * @returns {void}
         */
        function goToSlide(index) {
            try {
                // Ensure index is within bounds
                if (index < 0 || index >= totalSlides) {
                    return;
                }

                currentSlide = index;

                // Calculate transform to center the current slide
                // With padding: 0 50vw, first card is already centered at index 0
                // Each subsequent card needs to move by (cardWidth + gap)
                const slide = slides[0];
                if (slide) {
                    const slideWidth = slide.offsetWidth;
                    const gap = parseInt(getComputedStyle(projectCardsList).gap) || 0;
                    const moveDistance = slideWidth + gap;
                    
                    // Calculate the offset to center the current slide
                    // Negative value moves left, positive moves right
                    const translateX = -currentSlide * moveDistance;
                    projectCardsList.style.transform = `translateX(${translateX}px)`;
                }

                // Update active slide styling
                slides.forEach((slide, i) => {
                    if (i === currentSlide) {
                        slide.classList.add('active-slide');
                    } else {
                        slide.classList.remove('active-slide');
                    }
                });

                // Update pagination dots
                updatePaginationDots();

                // Announce slide change to screen readers
                announceToScreenReader(`Project ${currentSlide + 1} of ${totalSlides}`);
            } catch (error) {
                console.error('Error navigating to slide:', error);
            }
        }

        /**
         * Navigates to the next slide in the carousel.
         * @returns {void}
         */
        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                goToSlide(currentSlide + 1);
            }
        }

        /**
         * Navigates to the previous slide in the carousel.
         * @returns {void}
         */
        function prevSlide() {
            if (currentSlide > 0) {
                goToSlide(currentSlide - 1);
            }
        }

        /**
         * Updates the active state of pagination dots.
         * @returns {void}
         */
        function updatePaginationDots() {
            const dots = paginationContainer.querySelectorAll('.carousel-pagination-dot');
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.setAttribute('aria-selected', 'false');
                }
            });
        }

        /**
         * Creates pagination dots for each slide.
         * @returns {void}
         */
        function createPaginationDots() {
            // Clear existing dots
            paginationContainer.innerHTML = '';

            // Create a dot for each slide
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-pagination-dot');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Go to project ${i + 1}`);
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                
                // Add click event listener
                dot.addEventListener('click', () => goToSlide(i));
                
                paginationContainer.appendChild(dot);
            }

            // Set first dot as active
            updatePaginationDots();
        }

        // Add click handlers to each card to navigate to it
        slides.forEach((slide, index) => {
            slide.addEventListener('click', function(e) {
                // Only navigate if it's a click, not the end of a swipe
                if (!isSwiping && index !== currentSlide) {
                    goToSlide(index);
                }
            });
        });

        // Touch/Swipe functionality for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        let isSwiping = false;
        const swipeThreshold = 50; // Minimum distance for a swipe

        /**
         * Handles the start of a touch event.
         * @param {TouchEvent} e - The touch event.
         * @returns {void}
         */
        function handleTouchStart(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isSwiping = false;
        }

        /**
         * Handles touch movement to detect swiping.
         * @param {TouchEvent} e - The touch event.
         * @returns {void}
         */
        function handleTouchMove(e) {
            const currentX = e.changedTouches[0].screenX;
            const currentY = e.changedTouches[0].screenY;
            const diffX = Math.abs(currentX - touchStartX);
            const diffY = Math.abs(currentY - touchStartY);
            
            // If horizontal movement is greater than vertical, it's a swipe
            if (diffX > diffY && diffX > 10) {
                isSwiping = true;
            }
        }

        /**
         * Handles the end of a touch event and executes swipe navigation.
         * @param {TouchEvent} e - The touch event.
         * @returns {void}
         */
        function handleTouchEnd(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }

        /**
         * Determines swipe direction and navigates accordingly.
         * @returns {void}
         */
        function handleSwipe() {
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);
            
            // Only register as swipe if horizontal movement is greater than vertical
            if (Math.abs(diffX) > diffY && Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    // Swiped left - go to next slide
                    nextSlide();
                } else {
                    // Swiped right - go to previous slide
                    prevSlide();
                }
            }
            
            // Reset swipe flag after a short delay
            setTimeout(() => {
                isSwiping = false;
            }, 50);
        }

        // Add touch event listeners to carousel
        carouselSlides.addEventListener('touchstart', handleTouchStart, { passive: true });
        carouselSlides.addEventListener('touchmove', handleTouchMove, { passive: true });
        carouselSlides.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Create pagination dots
        createPaginationDots();

        // Initialize to first slide
        goToSlide(0);

        // Handle window resize to recalculate slide positions
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                goToSlide(currentSlide);
            }, 150);
        }, { passive: true });

        // Optional: Add keyboard navigation
        carouselSlides.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });

    } catch (error) {
        console.error('Error initializing carousel:', error);
    }
}

// ============================================================================
// Rotating Industry Heading
// ============================================================================

/**
 * Initializes the rotating industry heading with hand-drawn underline.
 * Rotates through industry names and opens menu overlay on click.
 * @returns {void}
 */
function initializeRotatingIndustry() {
    try {
        const rotatingText = document.getElementById('rotating-industry-text');
        if (!rotatingText) {
            console.warn('Rotating industry text element not found');
            return;
        }
        
        const rotatingWord = rotatingText.querySelector('.rotating-industry-word-text');
        const rotatingWordContainer = rotatingText.querySelector('.rotating-industry-word');
        if (!rotatingWord || !rotatingWordContainer) {
            console.warn('Rotating industry word element not found');
            return;
        }

        // Ensure config exists, fallback to defaults if not
        if (!AppConfig || !AppConfig.rotatingIndustry) {
            console.error('AppConfig.rotatingIndustry not found. Using defaults.');
        }
        const config = AppConfig?.rotatingIndustry || {
            industries: ['Military & Defense', 'Remote Businesses', 'Residential Homes', 'Commercial Buildings', 'Emergency Response', 'Job Sites'],
            rotationInterval: 3500,
            initialDelay: 2000,
            fadeDuration: 300,
            underlineDuration: 600,
            resumeDelay: 2000
        };
        const { industries, rotationInterval, initialDelay, fadeDuration, underlineDuration, resumeDelay } = config;

        // Validate config values
        if (!industries || industries.length === 0) {
            console.error('No industries configured for rotation');
            return;
        }
        if (!rotationInterval || !initialDelay || !fadeDuration) {
            console.error('Invalid rotation timing configuration');
            return;
        }

        let currentIndex = 0;
        let rotationTimer = null;
        let isPaused = false;

        /**
         * Restarts the underline animation by forcing a reflow.
         * @param {HTMLElement} underline - The underline SVG element
         * @returns {void}
         */
        function restartUnderlineAnimation(underline) {
            underline.style.animation = 'none';
            void underline.offsetWidth; // Trigger reflow
            underline.style.animation = `underlineDraw ${underlineDuration}ms ease-out`;
        }

        /**
         * Updates the rotating text with fade animation.
         * @returns {void}
         */
        function updateRotatingText() {
            if (isPaused) return;

            rotatingWord.classList.add('fade-out');
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % industries.length;
                rotatingWord.textContent = industries[currentIndex];
                
                const underline = rotatingWordContainer.querySelector('.hand-drawn-underline');
                if (underline) {
                    restartUnderlineAnimation(underline);
                }
                
                rotatingWord.classList.remove('fade-out');
                rotatingWord.classList.add('fade-in');
                
                setTimeout(() => {
                    rotatingWord.classList.remove('fade-in');
                }, fadeDuration);
            }, fadeDuration);
        }

        /**
         * Opens the menu overlay by triggering the menu button click.
         * @returns {void}
         */
        function openMenu() {
            const menuBtn = document.querySelector(Constants.MENU_BUTTON_SELECTOR);
            if (menuBtn) {
                menuBtn.click();
                announceToScreenReader('Navigation menu opened');
            }
        }

        /**
         * Handles menu interaction: pauses rotation, opens menu, resumes after delay.
         * @returns {void}
         */
        function handleMenuInteraction() {
            pauseRotation();
            openMenu();
            setTimeout(resumeRotation, resumeDelay);
        }

        /**
         * Starts the rotation timer.
         * @param {number|null} delay - Delay before first rotation (null uses initialDelay)
         * @returns {void}
         */
        function startRotation(delay = null) {
            // Clear any existing timer
            if (rotationTimer) {
                clearInterval(rotationTimer);
                rotationTimer = null;
            }
            
            // Only start if not paused
            if (isPaused) {
                return;
            }
            
            // Use provided delay or default to initialDelay
            const firstDelay = delay !== null ? delay : initialDelay;
            
            // First rotation after delay, then continue with regular interval
            setTimeout(() => {
                if (!isPaused) {
                    updateRotatingText();
                    rotationTimer = setInterval(updateRotatingText, rotationInterval);
                }
            }, firstDelay);
        }

        /**
         * Pauses rotation when user interacts with the element.
         * @returns {void}
         */
        function pauseRotation() {
            isPaused = true;
            if (rotationTimer) {
                clearInterval(rotationTimer);
                rotationTimer = null;
            }
        }

        /**
         * Resumes rotation after user interaction.
         * @returns {void}
         */
        function resumeRotation() {
            if (isPaused) {
                isPaused = false;
                startRotation();
            }
        }

        // Click handler
        rotatingText.addEventListener('click', handleMenuInteraction);

        // Keyboard support (Enter and Space)
        rotatingText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMenuInteraction();
            }
        });

        // Pause/resume on hover/focus
        rotatingText.addEventListener('mouseenter', pauseRotation);
        rotatingText.addEventListener('focus', pauseRotation);
        rotatingText.addEventListener('mouseleave', resumeRotation);
        rotatingText.addEventListener('blur', resumeRotation);

        // Ensure we're not paused when starting and explicitly start rotation
        isPaused = false;
        startRotation(initialDelay);
    } catch (error) {
        console.error('Error initializing rotating industry:', error);
    }
}

// ============================================================================
// Banner H1 Click Handler (Industry Pages)
// ============================================================================

/**
 * Initializes click handlers for banner h1 elements on industry pages.
 * Opens the menu overlay when the h1 is clicked.
 * @returns {void}
 */
function initializeBannerH1Click() {
    try {
        const bannerH1Text = document.querySelector('.banner-h1-text');
        if (!bannerH1Text) {
            // Not an industry page, or element doesn't exist
            return;
        }

        /**
         * Opens the menu overlay by triggering the menu button click.
         * @returns {void}
         */
        function openMenu() {
            const menuBtn = document.querySelector(Constants.MENU_BUTTON_SELECTOR);
            if (menuBtn) {
                menuBtn.click();
                announceToScreenReader('Navigation menu opened');
            }
        }

        // Click handler
        bannerH1Text.addEventListener('click', openMenu);

        // Keyboard support (Enter and Space)
        bannerH1Text.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openMenu();
            }
        });
    } catch (error) {
        console.error('Error initializing banner h1 click handler:', error);
    }
}

