// ============================================================================
// Application Configuration
// ============================================================================

/**
 * Configuration object for the Copper Tech website.
 * Centralizes component paths, project cards, container selectors, and error messages.
 *
 * @typedef {Object} AppConfig
 * @property {Object.<string, string>} components - Component paths mapped to their placeholder element IDs.
 *   Keys are element IDs (e.g., 'nav-placeholder'), values are relative file paths.
 * @property {string[]} projectCards - Array of project card file paths to be loaded dynamically.
 *   Files are loaded in order and inserted into the project cards container.
 * @property {Object.<string, string>} selectors - CSS selectors for container elements.
 * @property {string} selectors.projectCardsList - CSS selector for the project cards list container.
 * @property {Object.<string, string>} messages - User-facing error messages.
 * @property {string} messages.componentLoadError - Error message displayed when a component fails to load.
 * @property {string} messages.projectCardLoadError - Error message displayed when a project card fails to load.
 *
 * @example
 * // Access component paths
 * const navPath = AppConfig.components['nav-placeholder'];
 *
 * // Add a new project card
 * AppConfig.projectCards.push('components/project-new.html');
 *
 * // Get error message
 * const errorMsg = AppConfig.messages.componentLoadError;
 */
const AppConfig = {
    /**
     * Component paths mapped to their placeholder element IDs.
     * @type {Object.<string, string>}
     */
    components: {
        'nav-placeholder': 'components/nav.html',
        'footer-placeholder': 'components/footer.html',
        'cta-placeholder': 'components/cta.html'
    },

    /**
     * Project card file paths (loaded into .project-cards-list container).
     * To add a new project: add the file path to this array.
     * @type {string[]}
     */
    projectCards: [
        'components/project-navy-pacific.html',
        'components/project-camper-van.html'
    ],

    /**
     * Container selectors for dynamically loaded content.
     * @type {Object.<string, string>}
     */
    selectors: {
        /** CSS selector for the project cards list container */
        projectCardsList: '.project-cards-list'
    },

    /**
     * User-facing error messages for component loading failures.
     * @type {Object.<string, string>}
     */
    messages: {
        /** Error message displayed when a standard component fails to load */
        componentLoadError: 'Component failed to load. Please refresh the page.',
        /** Error message displayed when a project card fails to load */
        projectCardLoadError: 'Failed to load project card. Some projects may not be displayed.'
    },

    /**
     * Configuration for the rotating industry heading feature.
     * @type {Object}
     */
    rotatingIndustry: {
        /** Array of industry names to rotate through */
        industries: [
            'Military & Defense',
            'Remote Businesses',
            'Residential Homes',
            'Emergency Response',
            'Job Sites'
        ],
        /** Rotation interval in milliseconds */
        rotationInterval: 3500,
        /** Initial delay before first rotation in milliseconds */
        initialDelay: 2000,
        /** Fade animation duration in milliseconds */
        fadeDuration: 300,
        /** Underline animation duration in milliseconds */
        underlineDuration: 600,
        /** Delay before resuming rotation after menu interaction in milliseconds */
        resumeDelay: 2000
    }
};


