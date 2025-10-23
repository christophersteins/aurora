'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-heading mb-6">
            Kontaktiere uns
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Hast du Fragen oder benötigst Unterstützung? Wir sind für dich da und helfen dir gerne weiter.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Cards */}
          <div className="bg-page-secondary border border-default rounded-xl p-8 text-center hover:border-primary transition-all">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-heading mb-2">E-Mail</h3>
            <p className="text-muted mb-4">Schreibe uns eine E-Mail</p>
            <a href="mailto:support@aurora.com" className="link-primary hover:underline">
              support@aurora.com
            </a>
          </div>

          <div className="bg-page-secondary border border-default rounded-xl p-8 text-center hover:border-primary transition-all">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-heading mb-2">Telefon</h3>
            <p className="text-muted mb-4">Mo-Fr von 9:00 - 18:00 Uhr</p>
            <a href="tel:+4912345678" className="link-primary hover:underline">
              +49 (0) 123 456 78
            </a>
          </div>

          <div className="bg-page-secondary border border-default rounded-xl p-8 text-center hover:border-primary transition-all">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-heading mb-2">Adresse</h3>
            <p className="text-muted mb-4">Besuche uns vor Ort</p>
            <p className="text-body">
              Beispielstraße 123<br />
              10115 Berlin
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Form */}
          <div className="bg-page-secondary border border-default rounded-2xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-heading mb-3">
                Sende uns eine Nachricht
              </h2>
              <p className="text-muted">
                Fülle das Formular aus und wir melden uns schnellstmöglich bei dir.
              </p>
            </div>

            {submitSuccess ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-heading mb-2">Nachricht gesendet!</h3>
                <p className="text-muted">
                  Vielen Dank für deine Nachricht. Wir werden uns in Kürze bei dir melden.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-body mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary transition"
                    placeholder="Dein Name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-body mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary transition"
                    placeholder="deine@email.com"
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-body mb-2">
                    Betreff *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary transition"
                    placeholder="Worum geht es?"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-body mb-2">
                    Nachricht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary transition resize-none"
                    placeholder="Deine Nachricht..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-base btn-primary flex items-center justify-center gap-2 py-4 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-button-primary border-t-transparent rounded-full animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Nachricht senden
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Response Time Card */}
            <div className="bg-page-secondary border border-default rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-heading mb-2">
                    Schnelle Antwortzeiten
                  </h3>
                  <p className="text-muted">
                    Unser Support-Team antwortet in der Regel innerhalb von 24 Stunden auf alle Anfragen.
                    Bei dringenden Anliegen erreichst du uns auch telefonisch.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Card */}
            <div className="bg-page-secondary border border-default rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-heading mb-2">
                    Häufige Fragen
                  </h3>
                  <p className="text-muted mb-4">
                    Viele Antworten findest du bereits in unserem FAQ-Bereich.
                    Schaue dort vorbei, bevor du uns kontaktierst.
                  </p>
                  <a href="/faq" className="link-primary hover:underline inline-flex items-center gap-2">
                    Zum FAQ
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-page-secondary border border-default rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-heading mb-4">
                Geschäftszeiten
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Montag - Freitag</span>
                  <span className="text-body font-medium">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Samstag</span>
                  <span className="text-body font-medium">10:00 - 16:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Sonntag</span>
                  <span className="text-body font-medium">Geschlossen</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-body">
                  <strong>Hinweis:</strong> An Feiertagen gelten abweichende Öffnungszeiten.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Support Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-heading mb-4">
            Brauchst du sofortige Hilfe?
          </h2>
          <p className="text-muted text-lg mb-6 max-w-2xl mx-auto">
            Unser Live-Chat ist während der Geschäftszeiten verfügbar.
            Erhalte sofortige Antworten auf deine Fragen.
          </p>
          <button className="btn-base btn-primary px-8 py-3 text-lg cursor-pointer inline-flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Live-Chat starten
          </button>
        </div>
      </div>
    </div>
  );
}
