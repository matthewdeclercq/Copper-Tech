// ============================================================================
// Application Configuration
// ============================================================================

/**
 * Configuration object for the Copper Tech website
 * Centralizes component paths, project cards, and container selectors
 */

const AppConfig = {
    // Component paths mapped to their placeholder element IDs
    components: {
        'nav-placeholder': 'components/nav.html',
        'footer-placeholder': 'components/footer.html',
        'cta-placeholder': 'components/cta.html'
    },

    // Project card file paths (loaded into .project-cards-list container)
    // To add a new project: add the file path to this array
    projectCards: [
        'components/project-navy-pacific.html',
        'components/project-camper-van.html'
    ],

    // Container selectors
    selectors: {
        projectCardsList: '.project-cards-list'
    },

    // Error messages
    messages: {
        componentLoadError: 'Component failed to load. Please refresh the page.',
        projectCardLoadError: 'Failed to load project card. Some projects may not be displayed.'
    }
};


