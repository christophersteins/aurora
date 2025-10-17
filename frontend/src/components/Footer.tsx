import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#15202b] border-t border-[#2f3336] mt-auto">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--max-content-width)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed]">
                <span className="text-[#0f1419] font-bold text-xl">A</span>
              </div>
              <span className="ml-3 text-xl font-bold gradient-text">Aurora</span>
            </div>
            <p className="text-[#71767b] text-sm">
              Moderne, schnelle und sichere Web-Anwendung für die Zukunft.
            </p>
          </div>

          <div>
            <h3 className="text-[#e7e9ea] font-semibold mb-4">Produkt</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#e7e9ea] font-semibold mb-4">Unternehmen</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Über uns
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Karriere
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#e7e9ea] font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Nutzungsbedingungen
                </Link>
              </li>
              <li>
                <Link href="/imprint" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[#71767b] hover:text-[#00d4ff] transition text-sm">
                  Cookie-Richtlinie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#2f3336] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#71767b] text-sm">
            © {currentYear} Aurora. Alle Rechte vorbehalten.
          </p>

          <div className="flex items-center space-x-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#00d4ff] transition" aria-label="Twitter">
              <span className="text-xl">𝕏</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#00d4ff] transition" aria-label="GitHub">
              <span className="text-xl">GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#00d4ff] transition" aria-label="LinkedIn">
              <span className="text-xl">LinkedIn</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#00d4ff] transition" aria-label="Instagram">
              <span className="text-xl">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}