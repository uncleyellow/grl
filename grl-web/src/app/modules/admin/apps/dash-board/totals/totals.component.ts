import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { environment } from 'environments/environment.prod';
import * as L from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { ContactComponent } from 'app/modules/admin/apps/dash-board/contact/contact.component';

declare const google: any;

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.scss']
})
export class TotalsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() activeLang: string = 'en';
  @ViewChild('originInput') originInput: ElementRef;
  @ViewChild('destinationInput') destinationInput: ElementRef;

  // Use a setter for mapContainer to ensure it's available when initializeMap is called
  private _mapContainer: ElementRef;
  @ViewChild('map')
  set mapContainer(element: ElementRef) {
    if (element) {
      this._mapContainer = element;
      // Use a small setTimeout to ensure the element is fully rendered and visible in DOM
      // This helps with issues where Leaflet needs element dimensions
      setTimeout(() => {
        if (this._mapContainer?.nativeElement) {
          // Initialize map only if it hasn't been initialized yet, or needs re-initialization
          // Check if map instance exists AND if its container is still attached to the DOM
          if (!this.map || !this.map.getContainer()) {
            this.initializeMap();
          }
        } else {
          console.warn('Map container nativeElement still not available after timeout in setter.');
        }
      }, 0); // A small delay, often 0ms is enough to push to end of event queue
    }
  }
  get mapContainer(): ElementRef {
    return this._mapContainer;
  }

  totalsForm: FormGroup;
  totalsData: any[] = [];
  selectedRoute: any;
  totalPrice: number = 0;
  loading: boolean = false;
  distance: number = 0;

  // Mapbox config
  mapStyle = 'mapbox://styles/mapbox/streets-v11';
  center: [number, number] = [105.8542, 21.0285]; // Hà Nội
  
  zoom = 6;
  
  // Ga Hà Nội coordinates
  private hanoiStation = L.latLng(21.0242579 , 105.8384487);

  // Ga Đông Anh coordinates
  private dongAnhStation = L.latLng(21.1535125 , 105.8498434);
  
  // Ga Vinh coordinates
  private vinhStation = L.latLng(18.6881622 , 105.661454);

  // Ga Da Nang coordinates
  private daNangStation = L.latLng(16.0716532 , 108.20674);

  // Ga Dieu Tri coordinates
  private dieuTriStation = L.latLng(13.8071374 , 109.1411505);

  // Ga Trang Bom coordinates
  private trangBomStation = L.latLng(10.9449467 , 106.9917843);

  // Ga Giap Bat coordinates
  private giapBatStation = L.latLng(20.9762103 , 105.8381601);

  // Ga Kim Lien coordinates
  private kimLienStation = L.latLng(16.1327551 , 108.1178667);

  // Array of all stations
  private stations = [
    { name: 'Ga Hà Nội', coordinates: this.hanoiStation },
    { name: 'Ga Đông Anh', coordinates: this.dongAnhStation },
    { name: 'Ga Vinh', coordinates: this.vinhStation },
    { name: 'Ga Da Nang', coordinates: this.daNangStation },
    { name: 'Ga Dieu Tri', coordinates: this.dieuTriStation },
    { name: 'Ga Trang Bom', coordinates: this.trangBomStation },
    { name: 'Ga Giap Bat', coordinates: this.giapBatStation },
    { name: 'Ga Kim Lien', coordinates: this.kimLienStation }
  ];

  // Điểm lấy hàng
  private pickupPoint: L.LatLng | null = null;

  private map: L.Map;
  private pickupMarker: L.Marker;
  private hanoiStationMarker: L.Marker;
  private routeLine: L.Polyline;

  // Thêm biến cho điểm trả hàng
  private deliveryPoint: L.LatLng | null = null;
  private deliveryMarker: L.Marker;
  private deliveryRouteLine: L.Polyline;
  private nearestPickupStation: any = null;
  private nearestDeliveryStation: any = null;
  
  // Thêm biến cho khoảng cách
  pickupDistance: number = 0;  // Khoảng cách từ điểm lấy hàng đến ga gần nhất
  deliveryDistance: number = 0; // Khoảng cách từ điểm trả hàng đến ga gần nhất

  // Thêm biến để lưu các loại container động
  containerTypes: string[] = [];

  // Store original input location names
  private pickupLocationName: string | null = null;
  private deliveryLocationName: string | null = null;

  // Add goodsType to toggle between even/odd cargo
  goodsType: 'even' | 'odd' = 'even'; // Default to even

  // Add FLC data storage
  flcData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private _matDialog: MatDialog
  ) {
    this.totalsForm = this.fb.group({
      pickupAddress: [''],
      deliveryAddress: [''],
      numberOfContainers: [1, [Validators.required, Validators.min(1)]],
      containerType: ['', Validators.required],
      // New controls for Hàng Lẻ
      looseCargoType: ['full_carriage', Validators.required], // Default to Nguyên toa
      weightKg: [null, [Validators.min(1000)]],
      volumeM3: [null, [Validators.min(3)]]
    });

    // Subscribe to changes in goodsType to manage validators
    this.totalsForm.get('looseCargoType')?.valueChanges.subscribe(value => {
        this.onLooseCargoTypeChange(value);
    });
  }

  ngOnInit(): void {
    this.fetchTotals();
    this.fetchFLC();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeLang']) {
      const currentLang = changes['activeLang'].currentValue;
      const previousLang = changes['activeLang'].previousValue;
      
      if (currentLang !== previousLang) {
        this.onLanguageChange(currentLang);
      }
    }
  }

  ngOnDestroy() {
    // Clean up map instance to prevent memory leaks
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  ngAfterViewInit(): void {
    // No setTimeout needed here anymore, the setter for mapContainer handles it.
    // The map will be initialized when this.mapContainer is set by @ViewChild.
    // If the map div is part of an *ngIf, the setter will be triggered when it becomes visible.
  }

  onLanguageChange(newLang: string) {
    // This function will be called whenever the language changes
    console.log('Language changed to:', newLang);
    // Add your language change logic here
    if(newLang === 'tr'){
      // Turkish language logic
    }
    else{
      // Default language logic
    }
  }

  private initializeMap(): void {
    // Destroy existing map instance if it exists to prevent errors on re-initialization
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    if (!this._mapContainer?.nativeElement) {
      console.error('initializeMap: Map container native element is not available.');
      return;
    }

    // Check if the map container has actual dimensions. Leaflet needs this.
    const mapElement = this._mapContainer.nativeElement;
    if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
        console.warn('initializeMap: Map container has zero dimensions. Retrying...');
        setTimeout(() => this.initializeMap(), 100); // Retry after 100ms
        return;
    }

    try {
      // Use _mapContainer here as it's the directly assigned variable from the setter
      this.map = L.map(this._mapContainer.nativeElement).setView([21.0285, 105.8542], 10);
      
      // Thêm tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Custom icon cho các marker
      const hanoiIcon = L.divIcon({
        html: '<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        className: 'custom-marker'
      });

      const pickupIcon = L.divIcon({
        html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        className: 'custom-marker'
      });

      const deliveryIcon = L.divIcon({
        html: '<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        className: 'custom-marker'
      });

      // Thêm marker cho Ga Hà Nội
      this.hanoiStationMarker = L.marker(this.hanoiStation, { icon: hanoiIcon })
        .bindPopup('Ga Hà Nội')
        .addTo(this.map);

      // Xử lý sự kiện click trên map
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        // Kiểm tra xem đang chọn điểm lấy hay trả hàng
        const isPickup = !this.pickupPoint || (this.pickupPoint && !this.deliveryPoint); 

        if (isPickup && !this.pickupPoint) {
          // Xử lý chọn điểm lấy hàng
          if (this.pickupMarker) {
            this.map.removeLayer(this.pickupMarker);
          }
          if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
          }

          this.pickupPoint = e.latlng;
          this.pickupMarker = L.marker(e.latlng, { icon: pickupIcon })
            .bindPopup('Điểm lấy hàng')
            .addTo(this.map);

          this.calculatePickupDistance(e.latlng);
        } else if (this.pickupPoint && !this.deliveryPoint) {
          // Xử lý chọn điểm trả hàng
          if (this.deliveryMarker) {
            this.map.removeLayer(this.deliveryMarker);
          }
          if (this.deliveryRouteLine) {
            this.map.removeLayer(this.deliveryRouteLine);
          }

          this.deliveryPoint = e.latlng;
          this.deliveryMarker = L.marker(e.latlng, { icon: deliveryIcon })
            .bindPopup('Điểm trả hàng')
            .addTo(this.map);

          this.calculateDeliveryDistance(e.latlng);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private findNearestStation(point: L.LatLng): any {
    let nearestStation = null;
    let minDistance = Infinity;

    for (const station of this.stations) {
      const distance = point.distanceTo(station.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
      }
    }

    return nearestStation;
  }

  private calculatePickupDistance(latlng: L.LatLng): void {
    // Find nearest station
    this.nearestPickupStation = this.findNearestStation(latlng);
    
    const url = `https://router.project-osrm.org/route/v1/driving/${latlng.lng},${latlng.lat};${this.nearestPickupStation.coordinates.lng},${this.nearestPickupStation.coordinates.lat}?overview=full&geometries=geojson`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          this.pickupDistance = data.routes[0].distance / 1000;
          
          if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
          }
          
          // Tạo polyline với style giống ảnh (màu xanh đậm)
          this.routeLine = L.polyline(
            data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]), 
            {
              color: '#1e40af',
              weight: 4,
              opacity: 0.8
            }
          ).addTo(this.map);

          // Add marker for nearest station
          const stationIcon = L.divIcon({
            html: '<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [16, 16],
            className: 'custom-marker'
          });

          L.marker(this.nearestPickupStation.coordinates, { icon: stationIcon })
            .bindPopup(`Ga gần nhất: ${this.nearestPickupStation.name}`)
            .addTo(this.map);
          
          this.calculateTotal();
        }
      })
      .catch(error => {
        console.error('Error calculating pickup route:', error);
        this.pickupDistance = latlng.distanceTo(this.nearestPickupStation.coordinates) / 1000;
        this.calculateTotal();
      });
  }

  private calculateDeliveryDistance(latlng: L.LatLng): void {
    // Find nearest station
    this.nearestDeliveryStation = this.findNearestStation(latlng);
    
    const url = `https://router.project-osrm.org/route/v1/driving/${latlng.lng},${latlng.lat};${this.nearestDeliveryStation.coordinates.lng},${this.nearestDeliveryStation.coordinates.lat}?overview=full&geometries=geojson`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          this.deliveryDistance = data.routes[0].distance / 1000;
          
          if (this.deliveryRouteLine) {
            this.map.removeLayer(this.deliveryRouteLine);
          }
          
          // Tạo polyline cho delivery route
          this.deliveryRouteLine = L.polyline(
            data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]), 
            {
              color: '#dc2626',
              weight: 4,
              opacity: 0.8
            }
          ).addTo(this.map);

          // Add marker for nearest station
          const stationIcon = L.divIcon({
            html: '<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [16, 16],
            className: 'custom-marker'
          });

          L.marker(this.nearestDeliveryStation.coordinates, { icon: stationIcon })
            .bindPopup(`Ga gần nhất: ${this.nearestDeliveryStation.name}`)
            .addTo(this.map);
          
          this.calculateTotal();
        }
      })
      .catch(error => {
        console.error('Error calculating delivery route:', error);
        this.deliveryDistance = latlng.distanceTo(this.nearestDeliveryStation.coordinates) / 1000;
        this.calculateTotal();
      });
  }

  onAddressSearch(): void {
    const address = this.totalsForm.get('pickupAddress')?.value;
    if (!address) return;

    this.pickupLocationName = address; // Store the original input address

    // Sử dụng Nominatim API để tìm tọa độ
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=vn&limit=1`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const latlng = L.latLng(lat, lon);
          
          this.map.setView(latlng, 13);
          
          if (this.pickupMarker) {
            this.map.removeLayer(this.pickupMarker);
          }
          if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
          }

          const pickupIcon = L.divIcon({
            html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [16, 16],
            className: 'custom-marker'
          });

          this.pickupPoint = latlng;
          this.pickupMarker = L.marker(latlng, { icon: pickupIcon })
            .bindPopup('Điểm lấy hàng')
            .addTo(this.map);

          this.calculatePickupDistance(latlng);
        }
      })
      .catch(error => {
        console.error('Error searching pickup address:', error);
      });
  }

  onDeliveryAddressSearch(): void {
    const address = this.totalsForm.get('deliveryAddress')?.value;
    if (!address) return;

    this.deliveryLocationName = address; // Store the original input address

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=vn&limit=1`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const latlng = L.latLng(lat, lon);
          
          this.map.setView(latlng, 13);
          
          if (this.deliveryMarker) {
            this.map.removeLayer(this.deliveryMarker);
          }
          if (this.deliveryRouteLine) {
            this.map.removeLayer(this.deliveryRouteLine);
          }

          const deliveryIcon = L.divIcon({
            html: '<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [16, 16],
            className: 'custom-marker'
          });

          this.deliveryPoint = latlng;
          this.deliveryMarker = L.marker(latlng, { icon: deliveryIcon })
            .bindPopup('Điểm trả hàng')
            .addTo(this.map);

          this.calculateDeliveryDistance(latlng);
        }
      })
      .catch(error => {
        console.error('Error searching delivery address:', error);
      });
  }

  fetchTotals() {
    this.loading = true;
    const headers = new HttpHeaders(environment.api.headers);

    this.http.get<any[]>(`${environment.api.url}/totals`,{headers}).subscribe({
      next: (data) => {
        debugger
        this.totalsData = data;
        // Extract unique container types for the dropdown
        const uniqueContainerTypes = new Set<string>();
        data.forEach(item => {
          if (item.loaiCont) {
            uniqueContainerTypes.add(item.loaiCont);
          }
        });
        this.containerTypes = Array.from(uniqueContainerTypes).sort();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching totals:', error);
        this.loading = false;
      }
    });

  }

  fetchFLC(){
    const headers = new HttpHeaders(environment.api.headers);
    this.http.get<any[]>(`${environment.api.url}/flc`,{headers}).subscribe({
      next: (data) => {
        this.flcData = data;
        console.log('FLC Data fetched and assigned to this.flcData:', this.flcData);
      },
      error: (error) => {
        console.error('Error fetching FLC totals:', error);
      }
    });
  }

  onRouteChange() {
    const selectedRouteName = this.totalsForm.get('route')?.value;
    this.selectedRoute = this.totalsData.find(route => route.chuyen === selectedRouteName);
    this.calculateTotal();
  }

  onTransportTypeChange() {
    this.calculateTotal();
  }

  private normalizeString(str: string): string {
    const normalized = str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    console.log(`normalizeString: Input: '${str}', Output: '${normalized}'`);
    return normalized;
  }

  calculateTotal() {
    this.totalPrice = 0; // Always reset

    // Ensure all necessary data is loaded before attempting calculations
    if (!this.totalsData || this.totalsData.length === 0 || !this.pickupPoint || !this.deliveryPoint) {
      console.log('[calculateTotal] Early Exit: Not enough data yet. totalsData:', this.totalsData, 'pickupPoint:', this.pickupPoint, 'deliveryPoint:', this.deliveryPoint);
      return; // Not enough data yet
    }

    console.log('--- calculateTotal Start ---');
    console.log('  Current Goods Type:', this.goodsType);
    console.log('  Current Nearest Pickup Station (raw): ', this.nearestPickupStation?.name);
    console.log('  Current Nearest Delivery Station (raw): ', this.nearestDeliveryStation?.name);
    console.log('  Full totalsData array from API:', this.totalsData);

    let basePriceFromData = 0;

    if (this.goodsType === 'even') {
      // Logic for Hàng Chẵn (Container)
      const numberOfContainers = this.totalsForm.get('numberOfContainers')?.value || 1;
      const containerType = this.totalsForm.get('containerType')?.value;
      const selectedContainerTypeNormalized = this.normalizeString(containerType || '');

      if (!selectedContainerTypeNormalized) {
        console.log('[calculateTotal] Early Exit (Even Cargo): Container type not selected or empty after normalization. selectedContainerTypeNormalized:', selectedContainerTypeNormalized);
        return;
      }

      console.log('  Selected Container Type (raw): ', containerType);
      console.log('  Selected Container Type (normalized): ', selectedContainerTypeNormalized);
      console.log('  Number of Containers:', numberOfContainers);

      // Find base price from totalsData based on nearest stations and container type
      if (this.nearestPickupStation && this.nearestDeliveryStation && this.totalsData.length > 0) {
        const matchedRoute = this.totalsData.find((route, index) => {
          console.log(`  [Even Route ${index}] Comparing with route object:`, route);

          const normalizedPickupStationName = this.normalizeString(this.nearestPickupStation.name);
          const normalizedDeliveryStationName = this.normalizeString(this.nearestDeliveryStation.name);
          const normalizedRouteGa = this.normalizeString(route.ga);
          const normalizedRouteViTri = this.normalizeString(route.viTriLayNhanHang);
          const normalizedRouteContainerType = this.normalizeString(route.loaiCont || '');

          console.log('    normalizedPickupStationName:', normalizedPickupStationName);
          console.log('    normalizedDeliveryStationName:', normalizedDeliveryStationName);
          console.log('    normalizedRouteGa:', normalizedRouteGa);
          console.log('    normalizedRouteViTri:', normalizedRouteViTri);
          console.log('    normalizedRouteContainerType:', normalizedRouteContainerType);

          const stationMatch = (normalizedRouteGa === normalizedPickupStationName && normalizedRouteViTri === normalizedDeliveryStationName) ||
                               (normalizedRouteViTri === normalizedPickupStationName && normalizedRouteGa === normalizedDeliveryStationName);

          const containerTypeMatch = normalizedRouteContainerType === selectedContainerTypeNormalized;
          
          const finalMatch = stationMatch && containerTypeMatch;

          console.log('    Station Match Result:', stationMatch);
          console.log('    Container Type Match Result:', containerTypeMatch);
          console.log('    Final Match Result for this route:', finalMatch);
          
          return finalMatch;
        });

        console.log('  Result of Array.prototype.find for matchedRoute (Even Cargo): ', matchedRoute);

        if (matchedRoute) {
          console.log('  SUCCESS (Even Cargo): Matched route found:', matchedRoute);
          const soTienString = matchedRoute.soTien;
          basePriceFromData = Number(soTienString.replace(/[^0-9]/g, '')) || 0;
          console.log('  Calculated basePriceFromData (from soTien) for Even Cargo:', basePriceFromData);
        } else {
          console.log('  FAIL (Even Cargo): No matched route found after iterating through all totalsData. (matchedRoute is undefined/null)');
        }
      } else {
        console.log('  Conditions for finding base price for EVEN cargo from totalsData not met.');
      }

      this.totalPrice = basePriceFromData * numberOfContainers;

    } else { // goodsType === 'odd' (Hàng Lẻ)
      const looseCargoType = this.totalsForm.get('looseCargoType')?.value;
      const weightKg = this.totalsForm.get('weightKg')?.value;
      const volumeM3 = this.totalsForm.get('volumeM3')?.value;

      console.log('  Selected Loose Cargo Type:', looseCargoType);
      console.log('  Weight (Kg):', weightKg);
      console.log('  Volume (m3):', volumeM3);

      if (!looseCargoType || 
          (looseCargoType === 'kg' && (!weightKg || weightKg < 1000)) || 
          (looseCargoType === 'm3' && (!volumeM3 || volumeM3 < 3)) ) {
        console.log('[calculateTotal] Early Exit (Odd Cargo): Loose cargo type not selected or invalid weight/volume.');
        this.totalPrice = 0;
        return;
      }

      let quantity = 0;

      if (this.nearestPickupStation && this.nearestDeliveryStation && this.flcData.length > 0) { // Use flcData here
        console.log('  Debug - nearestPickupStation.name:', this.nearestPickupStation.name);
        console.log('  Debug - nearestDeliveryStation.name:', this.nearestDeliveryStation.name);
        console.log('  Debug - flcData for search:', this.flcData);

          const matchedLooseRoute = this.flcData.find((route, index) => { // Search in flcData
              console.log(`  [Loose Route ${index}] Comparing with route object:`, route);

              const normalizedPickupStationName = this.normalizeString(this.nearestPickupStation.name);
              const normalizedDeliveryStationName = this.normalizeString(this.nearestDeliveryStation.name);
              const normalizedRouteGa = this.normalizeString(route.ga);
              const normalizedRouteViTri = this.normalizeString(route.viTriLayNhanHang);

              console.log('    normalizedPickupStationName:', normalizedPickupStationName);
              console.log('    normalizedDeliveryStationName:', normalizedDeliveryStationName);
              console.log('    normalizedRouteGa:', normalizedRouteGa);
              console.log('    normalizedRouteViTri:', normalizedRouteViTri);

              const stationMatch = (normalizedRouteGa === normalizedPickupStationName && normalizedRouteViTri === normalizedDeliveryStationName) ||
                                   (normalizedRouteViTri === normalizedPickupStationName && normalizedRouteGa === normalizedDeliveryStationName);
              
              // No direct typeMatch needed here, as we pick the specific rate later
              const finalLooseMatch = stationMatch;

              console.log('    Station Match Result (Loose): ', stationMatch);
              console.log('    Final Match Result for this loose route (Station only):', finalLooseMatch);

              return finalLooseMatch;
          });

          console.log('  Result of Array.prototype.find for matchedLooseRoute:', matchedLooseRoute);

          if (matchedLooseRoute) {
              console.log('  SUCCESS (Odd Cargo): Matched loose route found:', matchedLooseRoute);
              
              let pricePerUnit = 0;

              if (looseCargoType === 'full_carriage') {
                  pricePerUnit = Number(this.normalizeString(matchedLooseRoute.nguyenToa || '').replace(/[^0-9]/g, '')) || 0;
                  quantity = 1; // For full carriage, quantity is 1 unit
              } else if (looseCargoType === 'kg') {
                  pricePerUnit = Number(this.normalizeString(matchedLooseRoute.dongKg || '').replace(/[^0-9]/g, '')) || 0;
                  quantity = weightKg;
              } else if (looseCargoType === 'm3') {
                  console.log('Debug - raw matchedLooseRoute.metKhoi for m3:', matchedLooseRoute.metKhoi);
                  pricePerUnit = Number(this.normalizeString(matchedLooseRoute.metKhoi || '').replace(/[^0-9]/g, '')) || 0;
                  quantity = volumeM3;
              }

              basePriceFromData = pricePerUnit; // basePriceFromData will be the price per unit
              console.log('  Calculated basePriceFromData (price per unit) for Loose Cargo:', basePriceFromData);

          } else {
              console.log('  FAIL (Odd Cargo): No matched loose route found. (matchedLooseRoute is undefined/null)');
          }
      } else {
          console.log('  Conditions for finding base price for ODD cargo from totalsData not met.');
      }

      this.totalPrice = basePriceFromData * quantity;
    }

    console.log('  Final totalPrice calculated:', this.totalPrice);
    console.log('--- calculateTotal End ---');
  }

  // Method to open contact dialog
  openContactDialog(): void {
    this._matDialog.open(ContactComponent, {
      width: '900px',
      panelClass: 'contact-form-dialog',
      data: { isDialog: true }
    });
  }

  // Reset map để chọn lại điểm
  resetMap() {
    if (this.pickupMarker) {
      this.map.removeLayer(this.pickupMarker);
    }
    if (this.deliveryMarker) {
      this.map.removeLayer(this.deliveryMarker);
    }
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }
    if (this.deliveryRouteLine) {
      this.map.removeLayer(this.deliveryRouteLine);
    }
    
    this.pickupPoint = null;
    this.deliveryPoint = null;
    this.pickupDistance = 0;
    this.deliveryDistance = 0;
    this.calculateTotal();
  }

  onSubmit() {
    if (this.totalsForm.invalid) return;
  
    this.loading = true;
    const formData = {
      ...this.totalsForm.value,
      pickupDistance: this.pickupDistance,
      deliveryDistance: this.deliveryDistance,
      totalPrice: this.totalPrice
    };
    const headers = new HttpHeaders(environment.api.headers);

    this.http.post(`${environment.api.url}/contact_customer`,{headers} ,formData).subscribe({
      next: (res) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Gửi thành công!",
          showConfirmButton: false,
          timer: 1500
        });
        this.totalsForm.reset();
        this.resetMap();
        this.loading = false;
      },
      error: (err) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Có lỗi xảy ra!",
          showConfirmButton: false,
          timer: 1500
        });
        console.error(err);
        this.loading = false;
      },
    });
  }

  // Handler for loose cargo type change
  onLooseCargoTypeChange(selectedType: string): void {
    const weightKgControl = this.totalsForm.get('weightKg');
    const volumeM3Control = this.totalsForm.get('volumeM3');

    weightKgControl?.clearValidators();
    volumeM3Control?.clearValidators();
    weightKgControl?.updateValueAndValidity();
    volumeM3Control?.updateValueAndValidity();

    if (selectedType === 'kg') {
      weightKgControl?.setValidators([Validators.required, Validators.min(1000)]);
      volumeM3Control?.setValue(null);
    } else if (selectedType === 'm3') {
      volumeM3Control?.setValidators([Validators.required, Validators.min(3)]);
      weightKgControl?.setValue(null);
    } else if (selectedType === 'full_carriage') {
      weightKgControl?.setValue(null);
      volumeM3Control?.setValue(null);
    }
    weightKgControl?.updateValueAndValidity();
    volumeM3Control?.updateValueAndValidity();
    this.calculateTotal();
  }

  // Add this new method
  onGoodsTypeChange(type: 'even' | 'odd'): void {
    this.goodsType = type;

    // Map destruction and re-initialization is no longer needed here
    // because the map container is outside the *ngIf forms.
    // if (this.map) {
    //     this.map.remove();
    //     this.map = null; 
    // }

    const containerTypeControl = this.totalsForm.get('containerType');
    const numberOfContainersControl = this.totalsForm.get('numberOfContainers');
    const looseCargoTypeControl = this.totalsForm.get('looseCargoType');
    const weightKgControl = this.totalsForm.get('weightKg');
    const volumeM3Control = this.totalsForm.get('volumeM3');

    // Clear all validators and values for both cargo types initially
    containerTypeControl?.clearValidators();
    numberOfContainersControl?.clearValidators();
    looseCargoTypeControl?.clearValidators();
    weightKgControl?.clearValidators();
    volumeM3Control?.clearValidators();

    containerTypeControl?.setValue(null);
    numberOfContainersControl?.setValue(null);
    looseCargoTypeControl?.setValue(null);
    weightKgControl?.setValue(null);
    volumeM3Control?.setValue(null);

    if (this.goodsType === 'even') {
        containerTypeControl?.setValidators(Validators.required);
        numberOfContainersControl?.setValidators([Validators.required, Validators.min(1)]);
        numberOfContainersControl?.setValue(1); // Set default for even cargo
        looseCargoTypeControl?.setValue(null); // Ensure loose cargo type is cleared
    } else { // goodsType === 'odd'
        looseCargoTypeControl?.setValidators(Validators.required);
        looseCargoTypeControl?.setValue('full_carriage'); // Set default for odd cargo
        // Call the loose cargo type change handler to set specific validators for kg/m3 if default changes
        this.onLooseCargoTypeChange('full_carriage');
        containerTypeControl?.setValue(null); // Ensure container type is cleared
        numberOfContainersControl?.setValue(null); // Ensure container count is cleared
    }

    containerTypeControl?.updateValueAndValidity();
    numberOfContainersControl?.updateValueAndValidity();
    looseCargoTypeControl?.updateValueAndValidity();
    weightKgControl?.updateValueAndValidity();
    volumeM3Control?.updateValueAndValidity();

    // No need to re-initialize map here, it's always present in DOM. 
    // Only reset map markers/routes.
    this.resetMap(); 

    this.calculateTotal(); // Recalculate total after changing goods type
  }
}