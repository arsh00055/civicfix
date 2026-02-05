import type { LatLngTuple } from 'leaflet';

class MapService {
  private static instance: MapService;
  private geocoder: any = null;

  private constructor() {}

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  async geocodeAddress(address: string): Promise<LatLngTuple | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      return data.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  getBounds(issues: any[]): LatLngTuple[] {
    if (issues.length === 0) {
      return [[30.708335, 76.690041], [30.708335, 76.690041]];
    }

    let minLat = issues[0].latitude;
    let maxLat = issues[0].latitude;
    let minLng = issues[0].longitude;
    let maxLng = issues[0].longitude;

    issues.forEach(issue => {
      minLat = Math.min(minLat, issue.latitude);
      maxLat = Math.max(maxLat, issue.latitude);
      minLng = Math.min(minLng, issue.longitude);
      maxLng = Math.max(maxLng, issue.longitude);
    });

    return [[minLat, minLng], [maxLat, maxLng]];
  }
}

export default MapService.getInstance();