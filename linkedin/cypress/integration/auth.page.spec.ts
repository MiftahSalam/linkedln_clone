describe('My First Test', () => {
  it('shoutl redirected to auth page if not signed in', () => {
    cy.visit('/');
    cy.url().should('includes', 'auth');
  });
  it("should have disabled sign in  button", () => {
    cy.get('ion-button').get("ion-button").should('contain', "Sign in").should('have.attr', "disabled")
  });
  it("should have disabled register button", () => {
    cy.get('ion-text.toggle-auth-mode').click();
    cy.get("ion-button").should('contain', "Join").should('have.attr', "disabled")
  });
  it("should register and toggle to login form", () => {
    cy.fixture('user').then((newUser) => {
      const { firstName, lastName, email, password } = newUser;

      cy.register(firstName, lastName, email, password);
      cy.get("ion-button").should('contain', "Sign in")
    })
  });
  it("should login and go to /home", () => {
    cy.fixture('user').then((user) => {
      cy.get("ion-button").should("not.have.attr", "disabled");
      cy.get("ion-button").click();
      cy.url().should('not.include', "auth");
      cy.url().should('include', "home")
    })
  });
  it("should log out and go to auth login form", () => {
    cy.get("ion-col.popover-menu").click();
    cy.get("p.sign-out").click();
    cy.url().should("not.include", "home");
    cy.url().should("include", "auth");
  })
})
