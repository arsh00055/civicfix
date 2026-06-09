/** Test credentials from process.env (wired in cypress.config.ts). Never commit real values. */

export function getCitizenCredentials(): { email: string; password: string } {
  const email = Cypress.env('CITIZEN_EMAIL') as string | undefined;
  const password = Cypress.env('CITIZEN_PASSWORD') as string | undefined;
  if (!email || !password) {
    throw new Error(
      'Set CYPRESS_CITIZEN_EMAIL and CYPRESS_CITIZEN_PASSWORD (see cypress.env.example.json)',
    );
  }
  return { email, password };
}

export function getVolunteerCredentials(): { email: string; password: string } {
  const email = Cypress.env('VOLUNTEER_EMAIL') as string | undefined;
  const password = Cypress.env('VOLUNTEER_PASSWORD') as string | undefined;
  if (!email || !password) {
    throw new Error(
      'Set CYPRESS_VOLUNTEER_EMAIL and CYPRESS_VOLUNTEER_PASSWORD (see cypress.env.example.json)',
    );
  }
  return { email, password };
}
