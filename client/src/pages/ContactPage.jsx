import { useState } from "react";
import { Link } from "react-router-dom";
import { CLASSES } from "../constants/theme";
import UserHeader from "../components/UserHeader";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire up to a backend endpoint or email service
    setSubmitted(true);
  };

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className={`${CLASSES.heading} text-4xl font-semibold text-stone-900 mb-3`}>Get in touch</h1>
          <p className="text-stone-500 max-w-md mx-auto text-sm leading-relaxed">
            Have a question, feedback, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Info cards */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-9 h-9 rounded-xl bg-revogue-purple/10 flex items-center justify-center mb-3">
                <span className="text-lg">✉️</span>
              </div>
              <h3 className={`${CLASSES.heading} text-sm font-semibold text-stone-900 mb-1`}>Email us</h3>
              <p className="text-xs text-stone-500 mb-2">We reply within 24 hours</p>
              <a href="mailto:hello@revogue.com" className={`text-sm ${CLASSES.accentLink} font-medium`}>
                hello@revogue.com
              </a>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-9 h-9 rounded-xl bg-revogue-purple/10 flex items-center justify-center mb-3">
                <span className="text-lg">📍</span>
              </div>
              <h3 className={`${CLASSES.heading} text-sm font-semibold text-stone-900 mb-1`}>Visit us</h3>
              <p className="text-xs text-stone-500 mb-1">Kathmandu, Nepal</p>
              <p className="text-sm text-stone-700">Thamel, Kathmandu 44600</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-9 h-9 rounded-xl bg-revogue-purple/10 flex items-center justify-center mb-3">
                <span className="text-lg">🕐</span>
              </div>
              <h3 className={`${CLASSES.heading} text-sm font-semibold text-stone-900 mb-1`}>Hours</h3>
              <p className="text-sm text-stone-700">Sun – Fri: 9am – 6pm</p>
              <p className="text-sm text-stone-500">Saturday: Closed</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className={`${CLASSES.heading} text-xl font-semibold text-stone-900 mb-2`}>Message sent</h3>
                  <p className="text-sm text-stone-500 mb-6">Thanks for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className={`px-5 py-2 text-sm font-medium ${CLASSES.primaryButton} rounded-lg`}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Full name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="What's this about?"
                      className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help..."
                      className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 ${CLASSES.primaryButton} text-sm font-medium rounded-lg transition-colors`}
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
