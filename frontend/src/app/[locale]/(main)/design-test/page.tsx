export default function DesignTest() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-0 space-y-12" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Hero Section mit Gradient */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl">
            Aurora Design System
          </h1>
          <h2 className="text-7xl gradient-text">
            Buttons
          </h2>
          <p className="text-text-secondary text-lg">
            Primäre und sekundäre Button-Styles
          </p>
        </div>

        {/* Button Types */}
        <div className="space-y-6">
          <h2 className="text-3xl">Button-Typen</h2>
          
          <div className="bg-bg-primary p-8 border-depth rounded space-y-8">
            {/* Primary Buttons */}
            <div className="space-y-4">
              <h3 className="text-2xl">Primärer Button</h3>
              <p className="text-text-secondary mb-4">
                Hintergrund: #00d4ff | Text: #0f1419 | Hover: Leichtes Lift mit Schatten
              </p>
              <div className="flex gap-4 flex-wrap items-center">
                <button className="btn-base btn-primary">
                  Jetzt starten
                </button>
                <button className="btn-base btn-primary">
                  Registrieren
                </button>
                <button className="btn-base btn-primary">
                  Premium freischalten
                </button>
              </div>
              <div className="pt-4 space-y-2">
                <p className="text-text-secondary text-sm">
                  <strong>Verwendung:</strong> Primäre Call-to-Action Buttons für wichtige Aktionen wie Registrierung, Login, Zahlungen
                </p>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="space-y-4">
              <h3 className="text-2xl">Sekundärer Button</h3>
              <p className="text-text-secondary mb-4">
                Hintergrund: transparent | Text: #eff3f4 | Border: #2f3336 | Hover: Dezente Hintergrundfarbe
              </p>
              <div className="flex gap-4 flex-wrap items-center">
                <button className="btn-base btn-secondary">
                  Mehr erfahren
                </button>
                <button className="btn-base btn-secondary">
                  Abbrechen
                </button>
                <button className="btn-base btn-secondary">
                  Zurück
                </button>
              </div>
              <div className="pt-4 space-y-2">
                <p className="text-text-secondary text-sm">
                  <strong>Verwendung:</strong> Sekundäre Aktionen, Abbruch-Buttons, Navigation oder weniger wichtige Interaktionen
                </p>
              </div>
            </div>

            {/* Button Combinations */}
            <div className="space-y-4">
              <h3 className="text-2xl">Button-Kombinationen</h3>
              <p className="text-text-secondary mb-4">
                Typische Verwendung in Dialogen und Forms
              </p>
              <div className="flex gap-4 flex-wrap items-center">
                <button className="btn-base btn-secondary">
                  Abbrechen
                </button>
                <button className="btn-base btn-primary">
                  Bestätigen
                </button>
              </div>
              <div className="flex gap-4 flex-wrap items-center pt-4">
                <button className="btn-base btn-secondary">
                  Zurück
                </button>
                <button className="btn-base btn-primary">
                  Weiter
                </button>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="space-y-4">
              <h3 className="text-2xl">Button-Größen (Optional)</h3>
              <p className="text-text-secondary mb-4">
                Verschiedene Padding-Varianten für unterschiedliche Kontexte
              </p>
              <div className="flex gap-4 flex-wrap items-center">
                <button className="btn-base btn-primary text-sm" style={{ padding: '0.5rem 1.5rem' }}>
                  Klein
                </button>
                <button className="btn-base btn-primary">
                  Standard
                </button>
                <button className="btn-base btn-primary text-lg" style={{ padding: '1rem 2.5rem' }}>
                  Groß
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Farbdefinition (gekürzt) */}
        <div className="space-y-6">
          <h2 className="text-3xl">Farbpalette</h2>
          
          <div className="bg-bg-primary p-8 border-depth rounded space-y-6">
            <div className="flex gap-6 flex-wrap">
              <div className="space-y-2">
                <div className="w-24 h-24 rounded" style={{ backgroundColor: '#00d4ff' }}></div>
                <p className="text-sm">Primary</p>
                <p className="text-xs text-text-secondary">#00d4ff</p>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-24 rounded" style={{ backgroundColor: '#4d7cfe' }}></div>
                <p className="text-sm">Secondary</p>
                <p className="text-xs text-text-secondary">#4d7cfe</p>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-24 rounded" style={{ backgroundColor: '#b845ed' }}></div>
                <p className="text-sm">Tertiary</p>
                <p className="text-xs text-text-secondary">#b845ed</p>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-24 rounded border-depth" style={{ backgroundColor: '#000000' }}></div>
                <p className="text-sm">Background</p>
                <p className="text-xs text-text-secondary">#000000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Praktisches Beispiel */}
        <div className="space-y-6">
          <h2 className="text-3xl">Praktisches Beispiel</h2>
          
          <div className="bg-bg-primary p-8 border-depth rounded space-y-6">
            <h3 className="text-2xl">Registrierung</h3>
            <p className="text-text-secondary">
              Erstelle jetzt dein kostenloses Aurora-Konto und entdecke alle Features.
            </p>
            <div className="flex gap-4 flex-wrap pt-4">
              <button className="btn-base btn-secondary">
                Später
              </button>
              <button className="btn-base btn-primary">
                Kostenlos registrieren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}