'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, DollarSign, Home, Users } from 'lucide-react';

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
}

export default function PropertyFilters({ onFiltersChange, initialFilters = {} }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    propertyType: initialFilters.propertyType || '',
    forWhom: initialFilters.forWhom || '',
    minPrice: initialFilters.minPrice || 0,
    maxPrice: initialFilters.maxPrice || 50000,
    searchQuery: initialFilters.searchQuery || '',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      location: '',
      propertyType: '',
      forWhom: '',
      minPrice: 0,
      maxPrice: 50000,
      searchQuery: '',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Property Name or Location</Label>
            <Input
              id="search"
              placeholder="Search properties..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="location">City</Label>
            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                <SelectItem value="lucknow">Lucknow</SelectItem>
                <SelectItem value="varanasi">Varanasi</SelectItem>
                <SelectItem value="kanpur">Kanpur</SelectItem>
                <SelectItem value="prayagraj">Prayagraj</SelectItem>
                <SelectItem value="gorakhpur">Gorakhpur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Property Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="w-5 h-5" />
            Property Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="PG">PG</SelectItem>
                <SelectItem value="Hostel">Hostel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* For Whom */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            For
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Select value={filters.forWhom} onValueChange={(value) => handleFilterChange('forWhom', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Students">Students</SelectItem>
                <SelectItem value="Working Professionals">Working Professionals</SelectItem>
                <SelectItem value="Families">Families</SelectItem>
                <SelectItem value="Anyone">Anyone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>₹{filters.minPrice.toLocaleString()}</span>
              <span>₹{filters.maxPrice.toLocaleString()}</span>
            </div>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) => {
                handleFilterChange('minPrice', min);
                handleFilterChange('maxPrice', max);
              }}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="minPrice" className="text-xs">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="maxPrice" className="text-xs">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                  placeholder="50000"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Filters */}
      <Button onClick={resetFilters} variant="outline" className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}