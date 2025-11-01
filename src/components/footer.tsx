import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Mail, Phone, MapPin, Youtube, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';


export default function Footer() {
  return (
    <footer className="bg-cyan-50 text-gray-800 pt-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        <div className="md:col-span-2 lg:col-span-1">
          <Image src={placeholderImages.footer.logo.src} alt="RoomLelo Logo" width={60} height={60} className="mb-4" data-ai-hint={placeholderImages.footer.logo.hint} />
          <p className="text-sm">
            RoomLelo is an online home rental aggregation platform executing tech based solutions for individuals in need of independent and comfortable living spaces.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/properties" className="hover:text-primary">Explore Property</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Help Center</Link></li>
            <li><Link href="/about" className="hover:text-primary">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-1 flex-shrink-0 text-primary" /> contact@roomlelo.in</li>
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-1 flex-shrink-0 text-primary" /> +91-76676 51878</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" /> D-63/319c, Laharatara, Varanasi</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Install App</h4>
          <Link href="#">
            <Image src={placeholderImages.footer.playStore.src} alt="Get it on Google Play" width={150} height={50} data-ai-hint={placeholderImages.footer.playStore.hint}/>
          </Link>
          <div className="flex space-x-4 mt-4">
            <Link href="#"><Instagram className="w-6 h-6 hover:text-primary" /></Link>
            <Link href="#"><Facebook className="w-6 h-6 hover:text-primary" /></Link>
            <Link href="#"><Linkedin className="w-6 h-6 hover:text-primary" /></Link>
            <Link href="#"><Twitter className="w-6 h-6 hover:text-primary" /></Link>
            <Link href="#"><Youtube className="w-6 h-6 hover:text-primary" /></Link>
          </div>
        </div>
      </div>
      <div className="mt-8 py-4 border-t border-gray-300">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm px-4 text-center md:text-left">
          <p>&copy; 2025 RoomLelo. All rights reserved</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href="#" className="hover:text-primary">Booking Policy</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">General Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
