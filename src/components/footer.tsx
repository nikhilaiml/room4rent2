import Link from 'next/link';
import { Button } from './ui/button';
import { Youtube, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Input } from './ui/input';
import { Logo } from './logo';


export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 pt-16">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-4">
        <div className="md:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Logo className="h-12 text-white" />
          </Link>
          <p className="text-sm">
            room4rent is an online home rental aggregation platform executing tech based solutions for individuals in need of independent and comfortable living spaces.
          </p>
          <div className="flex space-x-3 mt-6">
            <Link href="#" className="p-2 bg-gray-700 rounded-full hover:bg-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
            <Link href="#" className="p-2 bg-gray-700 rounded-full hover:bg-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="p-2 bg-gray-700 rounded-full hover:bg-primary transition-colors"><Linkedin className="w-5 h-5" /></Link>
            <Link href="#" className="p-2 bg-gray-700 rounded-full hover:bg-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
            <Link href="#" className="p-2 bg-gray-700 rounded-full hover:bg-primary transition-colors"><Youtube className="w-5 h-5" /></Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Navigator</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-primary">About us</Link></li>
            <li><Link href="/properties" className="hover:text-primary">Properties</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact us</Link></li>
            <li><Link href="/dashboard" className="hover:text-primary">My Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-primary">Terms of Use</Link></li>
            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/list-property" className="hover:text-primary">List your property</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Sign up for our newsletter to get the latest news and offers.</p>
          <div className="flex">
            <Input type="email" placeholder="Your email..." className="bg-gray-700 border-gray-600 rounded-r-none text-white placeholder:text-gray-400" />
            <Button type="submit" className="rounded-l-none">Subscribe</Button>
          </div>
        </div>
      </div>
      <div className="mt-12 py-4 border-t border-gray-700">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} room4rent. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
