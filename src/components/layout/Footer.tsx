import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import logo from '@/assets/logo.png'

export default function Footer() {
  const { getSetting } = useSettings()
  const year = new Date().getFullYear()

  const siteName = getSetting('site_name', 'Atik Technology')
  const phone = getSetting('contact_phone', '+880 1XXX-XXXXXX')
  const email = getSetting('contact_email', 'atikahmed680@gmail.com')
  const address = getSetting('contact_address', 'Dhaka, Bangladesh')

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Atik Technology" className="w-9 h-9 object-contain" />
              <span className="font-display font-bold text-lg text-white">
                Atik <span className="text-blue-400">Technology</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {getSetting('site_tagline', 'Bangladesh\'s fast-growing technology eCommerce platform.')} Quality products, fastest delivery.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={getSetting('facebook_url', 'https://www.facebook.com/atiktechnology99')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a
                href={getSetting('youtube_url', 'https://www.youtube.com/channel/UC2kavCbt-HfcDIRX1ZKl7oQ')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-red-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Products', to: '/products' },
                { label: 'Categories', to: '/categories' },
                { label: 'My Orders', to: '/account/orders' },
                { label: 'My Account', to: '/account' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Information</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', to: '/p/about' },
                { label: 'Contact Us', to: '/p/contact' },
                { label: 'Privacy Policy', to: '/p/privacy' },
                { label: 'Return Policy', to: '/p/returns' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin size={15} className="text-blue-400 mt-0.5 shrink-0" />
                {address}
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Phone size={15} className="text-blue-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-blue-400 transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={15} className="text-blue-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-blue-400 transition-colors">{email}</a>
              </li>
            </ul>

            {/* Payment Badges */}
            <div className="mt-5">
              <p className="text-xs text-slate-500 mb-2">We accept</p>
              <div className="flex flex-wrap gap-2">
                {['COD', 'bKash', 'Nagad'].map(method => (
                  <span key={method} className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © {year} Atik Technology. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            Built with <span className="text-red-400">♥</span> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}
