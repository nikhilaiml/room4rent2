'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, X } from 'lucide-react';

export default function LocationPermission() {
  const [showDialog, setShowDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation');

    if (storedLocation) {
      setUserLocation(storedLocation);
    } else {
      // Check geolocation permission status
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state !== 'granted') {
            setShowDialog(true);
          }
        }).catch(() => {
          // If permissions API fails, show dialog
          setShowDialog(true);
        });
      } else {
        // Fallback for browsers without permissions API
        setShowDialog(true);
      }
    }
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocode to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();

            const city = data.city || data.locality || 'Unknown';
            localStorage.setItem('userLocation', city);
            localStorage.setItem('locationRequested', 'true');
            setUserLocation(city);
            setShowDialog(false);
          } catch (error) {
            console.error('Error getting location:', error);
            setShowDialog(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setShowDialog(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setShowDialog(false);
    }
  };

  const denyLocation = () => {
    setShowDialog(false);
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Enable Location Services
          </DialogTitle>
          <DialogDescription>
            Allow us to access your location to show you properties in your area and provide personalized recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button onClick={requestLocation} className="flex-1">
            Allow Location
          </Button>
          <Button variant="outline" onClick={denyLocation} className="flex-1">
            Not Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}