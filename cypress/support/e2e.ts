// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('uncaught:exception', (err) => {
    if(
        err.message.includes('Hydration') ||
        err.message.includes('hydration') ||
        err.message.includes('ResizeObserver loop')
    ) {
        return false;
    }

    return true;
})