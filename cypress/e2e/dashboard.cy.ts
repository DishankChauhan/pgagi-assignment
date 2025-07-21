describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the header with title', () => {
    cy.contains('Content Dashboard').should('be.visible')
  })

  it('should have a search input', () => {
    cy.get('input[placeholder*="Search"]').should('be.visible')
  })

  it('should toggle sidebar', () => {
    // Check if sidebar is visible initially
    cy.get('[data-testid="sidebar"]').should('be.visible')
    
    // Click sidebar toggle button
    cy.get('button').first().click()
    
    // Sidebar should be hidden
    cy.get('[data-testid="sidebar"]').should('not.be.visible')
  })

  it('should toggle dark mode', () => {
    // Click dark mode toggle
    cy.get('button[title="Toggle dark mode"]').click()
    
    // Check if dark theme is applied
    cy.get('html').should('have.attr', 'data-theme', 'dark')
  })

  it('should open settings panel', () => {
    // Click settings button
    cy.get('button[title="Settings"]').click()
    
    // Settings panel should be visible
    cy.contains('Settings').should('be.visible')
  })
})

describe('Content Feed', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display personalized feed by default', () => {
    cy.contains('Personalized Feed').should('be.visible')
  })

  it('should navigate between sections', () => {
    // Navigate to trending
    cy.contains('Trending').click()
    cy.contains('Trending Content').should('be.visible')

    // Navigate to favorites
    cy.contains('Favorites').click()
    cy.contains('Your Favorites').should('be.visible')

    // Navigate to search
    cy.contains('Search').click()
    cy.contains('Search Content').should('be.visible')
  })
})

describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should perform search from header', () => {
    // Type in search input
    cy.get('input[placeholder*="Search"]').type('technology{enter}')
    
    // Should navigate to search section or show results
    cy.contains('Search').should('be.visible')
  })

  it('should perform search from search section', () => {
    // Navigate to search section
    cy.contains('Search').click()
    
    // Type in search input and submit
    cy.get('input[placeholder*="Search"]').type('music{enter}')
    
    // Results should be displayed or loading indicator
    cy.get('body').should('contain.text', 'Search')
  })
})

describe('User Preferences', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should open and close settings panel', () => {
    // Open settings
    cy.get('button[title="Settings"]').click()
    cy.contains('Settings').should('be.visible')
    
    // Close settings
    cy.get('button').contains('×').click()
    cy.contains('Settings').should('not.exist')
  })

  it('should toggle categories in settings', () => {
    // Open settings
    cy.get('button[title="Settings"]').click()
    
    // Toggle a category checkbox
    cy.contains('Sports').parent().find('input[type="checkbox"]').click()
    
    // Checkbox state should change
    cy.contains('Sports').parent().find('input[type="checkbox"]').should('be.checked')
  })
})
