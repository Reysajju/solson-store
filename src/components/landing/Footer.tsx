import { Mail, Phone, Facebook, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contact" className="bg-blue-900 text-white py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold mb-4">About Solson</h4>
          <p className="text-sm text-blue-200">Your trusted source for quality publications since 2020.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-orange-400">About Us</a></li>
            <li><a href="/authors" className="hover:text-orange-400">Authors</a></li>
            <li><a href="/bulk-orders" className="hover:text-orange-400">Bulk Orders</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacy" className="hover:text-orange-400">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-orange-400">Terms of Service</a></li>
            <li><a href="/returns" className="hover:text-orange-400">Returns</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Contact</h4>
          <div className="flex items-center gap-2 text-sm mb-2"><Mail className="w-4 h-4" /> info@solsonpublications.com</div>
          <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> +1 (555) 123-4567</div>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-orange-400"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-orange-400"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-orange-400"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm text-blue-300">
        <p>&copy; {new Date().getFullYear()} Solson Publications. All rights reserved.</p>
      </div>
    </footer>
  )
}
