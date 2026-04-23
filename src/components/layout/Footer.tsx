import { Link } from 'react-router-dom'
import { Search as Share2, Mail, Phone, MapPin } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export default function Footer() {
  const { getSetting } = useSettings()
  const year = new Date().getFullYear()

  const siteName = getSetting('site_name', 'AtikTech')
  const phone = getSetting('contact_phone', '+880 1XXX-XXXXXX')
  const email = getSetting('contact_email', 'info@atiktech.com')
  const address = getSetting('contact_address', 'Dhaka, Bangladesh')

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="font-display font-bold text-lg text-white">
                {siteName.includes('Tech') ? (
                  <>Atik<span className="text-blue-400">Tech</span></>
                ) : siteName}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {getSetting('site_tagline', 'Bangladesh\'s fast-growing technology eCommerce platform.')} Quality products, fastest delivery.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Share2, href: '#', label: 'Social' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
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
            © {year} AtikTech. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            Built with <span className="text-red-400">♥</span> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}
