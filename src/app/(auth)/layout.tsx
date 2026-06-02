// (auth) Route-Group — Login, Registrierung, Passwort-Reset.
//
// WICHTIG: Dieses Layout bindet bewusst KEINEN AuthProvider ein und macht
// KEINEN /me-Aufruf. Dadurch ist garantiert ausgeschlossen, dass eine
// Auth-Seite eine /me-401-Redirect-Schleife auslösen kann. Der AuthProvider
// existiert ausschließlich im (app)-Layout für die geschützten Routen.

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
