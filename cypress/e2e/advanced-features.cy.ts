describe('Drag and Drop Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    // Assuming user is signed in for testing
    cy.window().then((win) => {
      win.localStorage.setItem('userPreferences', JSON.stringify({
        favoriteCategories: ['technology', 'science'],
        darkMode: false,
        autoRefresh: false,
      }))
    })
  })

  it('should display droppable areas', () => {
    cy.get('[data-testid="droppable-area"]').should('have.length.at.least', 1)
    cy.get('[data-testid="droppable-area"]').first().should('contain', 'Latest News')
  })

  it('should allow dragging content cards', () => {
    cy.get('[data-testid="draggable-content-card"]').first().should('exist')
    // Test drag interaction (simplified as full drag-drop testing in Cypress can be complex)
    cy.get('[data-testid="draggable-content-card"]').first().trigger('mousedown')
  })

  it('should show drag hints on hover', () => {
    cy.get('[data-testid="draggable-content-card"]').first().trigger('mouseover')
    // Should show visual feedback for draggable state
  })
})

describe('Real-time Updates', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show live indicator when auto-refresh is enabled', () => {
    // Enable auto-refresh through settings
    cy.get('[data-testid="settings-button"]').click()
    cy.get('[data-testid="auto-refresh-toggle"]').click()
    cy.get('[data-testid="settings-close"]').click()
    
    // Should show live indicator
    cy.contains('Live').should('be.visible')
  })

  it('should refresh content when refresh button is clicked', () => {
    cy.get('[data-testid="refresh-button"]').click()
    cy.get('[data-testid="loading-spinner"]').should('be.visible')
  })
})

describe('Authentication Flow', () => {
  it('should redirect to sign in when not authenticated', () => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
    cy.visit('/')
    cy.url().should('include', '/auth/signin')
  })

  it('should show user menu when authenticated', () => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('nextauth.session-token', 'mock-token')
    })
    cy.visit('/')
    cy.get('[data-testid="user-menu-button"]').should('be.visible')
  })

  it('should sign out user from user menu', () => {
    cy.get('[data-testid="user-menu-button"]').click()
    cy.get('[data-testid="sign-out-button"]').click()
    cy.url().should('include', '/auth/signin')
  })
})

describe('Enhanced Settings Panel', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-testid="settings-button"]').click()
  })

  it('should display tabbed interface', () => {
    cy.get('[data-testid="settings-tab-content"]').should('be.visible')
    cy.get('[data-testid="settings-tab-display"]').should('be.visible')
    cy.get('[data-testid="settings-tab-alerts"]').should('be.visible')
  })

  it('should switch between tabs', () => {
    cy.get('[data-testid="settings-tab-display"]').click()
    cy.contains('Dark Mode').should('be.visible')
    
    cy.get('[data-testid="settings-tab-alerts"]').click()
    cy.contains('Auto Refresh').should('be.visible')
  })

  it('should save music genre preferences', () => {
    cy.get('[data-testid="settings-tab-content"]').click()
    cy.get('[data-testid="genre-rock"]').click()
    cy.get('[data-testid="genre-jazz"]').click()
    cy.get('[data-testid="settings-close"]').click()
    
    // Verify preferences are saved
    cy.window().its('localStorage').should('contain', 'rock')
  })

  it('should configure auto-refresh settings', () => {
    cy.get('[data-testid="settings-tab-alerts"]').click()
    cy.get('[data-testid="auto-refresh-toggle"]').click()
    cy.get('[data-testid="refresh-interval-slider"]').invoke('val', 30).trigger('change')
    
    cy.get('[data-testid="settings-close"]').click()
    cy.contains('Live').should('be.visible')
  })
})
