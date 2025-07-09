import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { environment } from 'environments/environment.prod';
import * as L from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { ContactComponent } from 'app/modules/admin/apps/dash-board/contact/contact.component';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

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
  duongBo
  // Ga Hà Nội coordinates
  // private hanoiStation = L.latLng(21.0242579 , 105.8384487);

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
    // { name: 'Ga Hà Nội', coordinates: this.hanoiStation },
    { name: 'Ga Đông Anh', coordinates: this.dongAnhStation },
    { name: 'Ga Vinh', coordinates: this.vinhStation },
    { name: 'Ga Da Nang', coordinates: this.daNangStation },
    { name: 'Ga Dieu Tri', coordinates: this.dieuTriStation },
    { name: 'Ga Trang Bom', coordinates: this.trangBomStation },
    { name: 'Ga Giap Bat', coordinates: this.giapBatStation },
    { name: 'Ga Kim Lien', coordinates: this.kimLienStation },
    { name: 'Ga Sóng Thần', coordinates:L.latLng(10.8779164,106.7511083) },
  ];


  private citys = [
    { name: 'Bắc Giang', coordinates:L.latLng(21.291714,106.1694926) },
    { name: 'Lạng Sơn', coordinates:L.latLng(21.855704,106.6644324) },
    { name: 'Bắc Ninh', coordinates:L.latLng(21.1740801,105.9996102) },
    { name: 'Hà Nam', coordinates:L.latLng(20.533893,105.8107956) },
    { name: 'Hà Nội', coordinates:L.latLng(21.0227784,105.8163212) },
    { name: 'Hòa Bình', coordinates:L.latLng(20.7093913,105.0165149) },
    { name: 'Hải Dương', coordinates:L.latLng(20.9408946,106.2464026) },
    { name: 'Hải Phòng', coordinates:L.latLng(20.8468121,106.6574613) },
    { name: 'Hưng Yên', coordinates:L.latLng(20.6656158,105.9854631) },
    { name: 'Nam Định', coordinates:L.latLng(20.417757,106.1668969) },
    { name: 'Phú Thọ', coordinates:L.latLng(21.4157109,105.1881671) },
    { name: 'Thanh hóa', coordinates:L.latLng(19.8088549,105.7084824) },
    { name: 'Vĩnh Phúc', coordinates:L.latLng(21.3642123,105.3925375) },
    { name: 'Thái Nguyên', coordinates:L.latLng(21.5774523,105.7622043) },
    { name: 'Ninh Bình', coordinates:L.latLng(20.2451952,105.9341661) },
    { name: 'Quảng Ninh', coordinates:L.latLng(21.1759344,106.9327144) },
    { name: 'Sơn La', coordinates:L.latLng(21.3447457,103.8328439) },
    { name: 'Thái Bình', coordinates:L.latLng(20.4530169,106.3033668) },
    { name: 'Nghệ An', coordinates:L.latLng(19.2732923,104.1800443) },
    { name: 'Lào Cai', coordinates:L.latLng(22.4185877,103.896914) },
    { name: 'Hà Tĩnh', coordinates:L.latLng(18.3543214,105.8605449) },
    { name: 'Đà Nẵng', coordinates:L.latLng(16.0670082,107.9134761) },
    { name: 'Quảng Nam', coordinates:L.latLng(15.5096308,107.6444499) },
    { name: 'Huế', coordinates:L.latLng(16.4534687,107.5358278) },
    { name: 'Quảng Trị', coordinates:L.latLng(16.7344412,106.6224288) },
    { name: 'Quảng Bình', coordinates:L.latLng(17.5060448,105.9706928) },
    { name: 'Gia Lai', coordinates:L.latLng(13.799897,107.5017172) },
    { name: 'Bình Định', coordinates:L.latLng(14.1096504,108.6557665) },
    { name: 'Quảng Ngãi', coordinates:L.latLng(15.153854,108.8010613) },
    { name: 'Khánh Hòa', coordinates:L.latLng(12.3191983,108.7397957) },
    { name: 'Bình Dương', coordinates:L.latLng(11.1828232,106.316194) },
    { name: 'Cần Thơ', coordinates:L.latLng(10.1227451,105.3704601) },
    { name: 'Đồng Nai', coordinates:L.latLng(11.0526864,106.833893) },
    { name: 'Bình Thuận', coordinates:L.latLng(11.0198501,107.8514869) },
    { name: 'Hồ Chí Minh', coordinates:L.latLng(10.7552921,106.3648924) },
    { name: 'Long An', coordinates:L.latLng(10.714293,105.7932022) },
    { name: 'Vĩnh Long', coordinates:L.latLng(10.2519714,105.8978079) },
    { name: 'Tiền Giang', coordinates:L.latLng(10.3892834,105.9858764) },
    { name: 'Vũng Tàu', coordinates:L.latLng(10.4034969,107.040478) },
    { name: 'Bến Tre', coordinates:L.latLng(10.2374763,106.3342659) },
    { name: 'Đồng Tháp', coordinates:L.latLng(10.554273,105.2344053) },
    { name: 'Kiên Giang', coordinates:L.latLng(9.8976281,103.8373803) },
    { name: 'An Giang', coordinates:L.latLng(10.573527,104.846507) },
    { name: 'Cà Mau', coordinates:L.latLng(9.1753645,105.1871716) },
    { name: 'Bạc Liêu', coordinates:L.latLng(9.2684649,105.7118445) },
    { name: 'Sóc Trăng', coordinates:L.latLng(9.6097884,105.9365263) },
    { name: 'Tây Ninh', coordinates:L.latLng(11.3659443,106.0883681) },
    { name: 'Lâm Đồng', coordinates:L.latLng(11.7667839,107.6685157) },
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

  // Add property for distance warning
  showDistanceWarning: boolean = false;

  // Add properties for individual price display
  trainPrice: number = 0;
  roadPrice: number = 0;
  basePriceFromData: number = 0;

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
      transportType: ['both', Validators.required], // New control for transport type
      // New controls for Hàng Lẻ
      looseCargoType: ['full_carriage', Validators.required], // Default to Nguyên toa
      weightKg: [null, [Validators.min(1000)]],
      volumeM3: [null, [Validators.min(3)]],
      transportTypeLoose: ['warehouse_to_warehouse', Validators.required], // Default for loose cargo
      pickupStation: [''], // For station-to-station or warehouse-to-station
      deliveryStation: ['', Validators.required], // For station-to-station or warehouse-to-station
    });

    // Subscribe to changes in goodsType to manage validators
    this.totalsForm.get('looseCargoType')?.valueChanges.subscribe(value => {
        this.onLooseCargoTypeChange(value);
    });
  }

  ngOnInit(): void {
    this.fetchTotals();
    this.fetchFLC();
    this.fetchCuocDuongBo()
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
      // this.hanoiStationMarker = L.marker(this.hanoiStation, { icon: hanoiIcon })
      //   .bindPopup('Ga Hà Nội')
      //   .addTo(this.map);

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
  nearestStation2
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
    for (const city of this.citys) {
      const distance = point.distanceTo(city.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        this.nearestStation2 = city;
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
  findNearestCity(point: L.LatLng): any{
    let nearestStation = null;
    let minDistance = Infinity;
    
    for (const station of  this.citys) {
      const distance = point.distanceTo(station.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
      }
    }
    return nearestStation;
  }
  nearestCity
  private calculateDeliveryDistance(latlng: L.LatLng): void {
    // Find nearest station
    this.nearestDeliveryStation = this.findNearestStation(latlng);
    this.nearestCity = this.findNearestCity(latlng);
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
    const transportTypeLoose = this.totalsForm.get('transportTypeLoose')?.value;
    if (transportTypeLoose !== 'warehouse_to_station' && transportTypeLoose !== 'warehouse_to_warehouse') {
      // Only perform address search if transport type requires it
      return;
    }

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
    const transportTypeLoose = this.totalsForm.get('transportTypeLoose')?.value;
    if (transportTypeLoose !== 'warehouse_to_warehouse') {
      // Only perform delivery address search if transport type requires it
      return;
    }

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

  
  fetchCuocDuongBo(){
    const headers = new HttpHeaders(environment.api.headers);
    this.http.get<any[]>(`${environment.api.url}/duongBo`,{headers}).subscribe({
      next: (data) => {
        // debugger
        this.duongBo = data;
        console.log('duongBo Data fetched and assigned to this.duongBo:', this.duongBo);
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
    // We specifically removed the check for pickupPoint/deliveryPoint here because
    // for 'station_to_station' they will be null, and we handle those cases inside the odd cargo logic.
    if (!this.totalsData || this.totalsData.length === 0 || !this.duongBo || this.duongBo.length === 0 || !this.flcData || this.flcData.length === 0) {
      console.log('[calculateTotal] Early Exit: Not enough data yet. totalsData:', this.totalsData, 'pickupPoint:', this.pickupPoint, 'deliveryPoint:', this.deliveryPoint, 'duongBo:', this.duongBo, 'flcData:', this.flcData);
      return; // Not enough data yet
    }

    console.log('--- calculateTotal Start ---');
    console.log('  Current Goods Type:', this.goodsType);
    console.log('  Current Transport Type (Even):', this.totalsForm.get('transportType')?.value);
    console.log('  Current Loose Transport Type (Odd):', this.totalsForm.get('transportTypeLoose')?.value);
    console.log('  Current Nearest Pickup Station (raw): ', this.nearestPickupStation?.name);
    console.log('  Current Nearest Delivery Station (raw): ', this.nearestDeliveryStation?.name);
    console.log('  Full totalsData array from API (Train Cargo - Even):', this.totalsData);
    console.log('  Full duongBo array from API (Road Cargo - Even):', this.duongBo);
    console.log('  Full flcData array from API (Loose Cargo - Odd):', this.flcData);


    this.trainPrice = 0; // Price for train transport (even cargo)
    this.roadPrice = 0;  // Price for road transport (even cargo)
    this.basePriceFromData = 0; // Price per unit for loose cargo

    const numberOfContainers = this.totalsForm.get('numberOfContainers')?.value || 1;
    const containerType = this.totalsForm.get('containerType')?.value;
    const selectedContainerTypeNormalized = this.normalizeString(containerType || '');
    const transportType = this.totalsForm.get('transportType')?.value; // Get selected transport type for even cargo

    // Common checks for Even Cargo
    if (this.goodsType === 'even' && (!selectedContainerTypeNormalized || !numberOfContainers || numberOfContainers < 1)) {
        console.log('[calculateTotal] Early Exit (Even Cargo): Container type not selected or invalid number of containers. selectedContainerTypeNormalized:', selectedContainerTypeNormalized, 'numberOfContainers:', numberOfContainers);
        this.totalPrice = 0;
        return;
    }

    if (this.goodsType === 'even') {
      console.log('  Processing Hàng Chẵn (Container) calculations.');
      console.log('  Selected Container Type (raw): ', containerType);
      console.log('  Selected Container Type (normalized): ', selectedContainerTypeNormalized);
      console.log('  Number of Containers:', numberOfContainers);

      // --- Calculate Train Price (from totalsData) ---
      if ((transportType === 'train' || transportType === 'both') && this.nearestPickupStation && this.nearestDeliveryStation && this.totalsData.length > 0) {
        console.log('  Attempting to calculate Train Price...');
        const matchedTrainRoute = this.totalsData.find((route) => {
          const normalizedPickupStationName = this.normalizeString(this.nearestPickupStation.name);
          const normalizedDeliveryStationName = this.normalizeString(this.nearestDeliveryStation.name);
          const normalizedRouteGa = this.normalizeString(route.ga);
          const normalizedRouteViTri = this.normalizeString(route.viTriLayNhanHang);
          const normalizedRouteContainerType = this.normalizeString(route.loaiCont || '');

          const stationMatch = (normalizedRouteGa === normalizedPickupStationName && normalizedRouteViTri === normalizedDeliveryStationName);
                               

          const containerTypeMatch = normalizedRouteContainerType === selectedContainerTypeNormalized;
          
          return stationMatch && containerTypeMatch;
        });

        if (matchedTrainRoute) {
          console.log('  SUCCESS (Train Cargo): Matched train route found:', matchedTrainRoute);
          const soTienString = matchedTrainRoute.soTien;
          this.trainPrice = Number(soTienString.replace(/[^0-9]/g, '')) || 0;
          console.log('  Calculated trainPrice per container:', this.trainPrice);
        } else {
          console.log('  FAIL (Train Cargo): No matched train route found.');
        }
      } else if (transportType === 'train' || transportType === 'both') {
        console.log('  Conditions for finding train price not met or not selected.');
      }

      // --- Calculate Road Price (from duongBo) ---
      if ((transportType === 'road' || transportType === 'both') && this.nearestPickupStation && this.nearestDeliveryStation && this.duongBo.length > 0) {
        console.log('  Attempting to calculate Road Price...');
        const matchedRoadRoute = this.duongBo.find((route) => {
          const normalizedPickupStationName = this.normalizeString(this.nearestPickupStation.name);
          const normalizedDeliveryStationName = this.normalizeString(this.nearestCity.name);
          const normalizedRouteGa = this.normalizeString(route.ga);
          const normalizedRouteViTri = this.normalizeString(route.viTriLayNhanHang);
          const normalizedRouteContainerType = this.normalizeString(route.loaiCont || '');

          const stationMatch = (normalizedRouteGa === normalizedPickupStationName && normalizedRouteViTri === normalizedDeliveryStationName)
                               

          const containerTypeMatch = normalizedRouteContainerType === selectedContainerTypeNormalized;

          return stationMatch && containerTypeMatch;
        });
        debugger
        if (matchedRoadRoute) {
          console.log('  SUCCESS (Road Cargo): Matched road route found:', matchedRoadRoute);
          const donViTinhString = matchedRoadRoute.donViTinh;
          this.roadPrice = Number(donViTinhString.replace(/[^0-9]/g, '')) || 0; // Assuming donViTinh is the price
          console.log('  Calculated roadPrice per container:', this.roadPrice);
        } else {
          console.log('  FAIL (Road Cargo): No matched road route found.');
        }
      } else if (transportType === 'road' || transportType === 'both') {
        console.log('  Conditions for finding road price not met or not selected.');
      }

      // --- Final Total Price for Even Cargo ---
      if (transportType === 'train') {
        this.totalPrice = this.trainPrice * numberOfContainers;
        console.log('  Final totalPrice (Train only):', this.totalPrice);
      } else if (transportType === 'road') {
        this.totalPrice = this.roadPrice * numberOfContainers;
        console.log('  Final totalPrice (Road only):', this.totalPrice);
      } else if (transportType === 'both') {
        this.totalPrice = (this.trainPrice + this.roadPrice) * numberOfContainers;
        console.log('  Final totalPrice (Train + Road):', this.totalPrice);
      }

    } else { // goodsType === 'odd' (Hàng Lẻ)
      const looseCargoType = this.totalsForm.get('looseCargoType')?.value;
      const weightKg = this.totalsForm.get('weightKg')?.value;
      const volumeM3 = this.totalsForm.get('volumeM3')?.value;
      const transportTypeLoose = this.totalsForm.get('transportTypeLoose')?.value;
      const pickupStationName = this.totalsForm.get('pickupStation')?.value;
      const deliveryStationName = this.totalsForm.get('deliveryStation')?.value;

      this.showDistanceWarning = false; // Reset warning for loose cargo

      console.log('  Selected Loose Cargo Type:', looseCargoType);
      console.log('  Selected Loose Transport Type:', transportTypeLoose);
      console.log('  Weight (Kg):', weightKg);
      console.log('  Volume (m3):', volumeM3);
      console.log('  Pickup Station (selected):', pickupStationName);
      console.log('  Delivery Station (selected):', deliveryStationName);


      if (!looseCargoType || 
          (looseCargoType === 'kg' && (!weightKg || weightKg < 1000)) || 
          (looseCargoType === 'm3' && (!volumeM3 || volumeM3 < 3)) ) {
        console.log('[calculateTotal] Early Exit (Odd Cargo): Loose cargo type not selected or invalid weight/volume.');
        this.totalPrice = 0;
        return;
      }

      let quantity = 0;
      let calculatedPickupStationName: string | null = null;
      let calculatedDeliveryStationName: string | null = null;

      // Handle station and distance logic based on transportTypeLoose
      if (transportTypeLoose === 'station_to_station') {
          if (!pickupStationName || !deliveryStationName) {
              console.log('[calculateTotal] Early Exit (Station-to-Station): Pickup or Delivery station not selected.');
              this.totalPrice = 0;
              return;
          }
          calculatedPickupStationName = pickupStationName;
          calculatedDeliveryStationName = deliveryStationName;
          this.pickupDistance = 0; // No road distance for station to station
          this.deliveryDistance = 0; // No road distance for station to station
          this.showDistanceWarning = false; // No road distance to warn about

          // Update nearest stations for display/map if needed
          this.nearestPickupStation = this.stations.find(s => s.name === pickupStationName);
          this.nearestDeliveryStation = this.stations.find(s => s.name === deliveryStationName);

          // Clear existing markers/routes and add new ones for stations if map is initialized
          this.resetLooseCargoMapPoints(); // Reset everything
          if (this.map && this.nearestPickupStation && this.nearestDeliveryStation) {
            const stationIcon = L.divIcon({
                html: '<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [16, 16],
                className: 'custom-marker'
            });
            L.marker(this.nearestPickupStation.coordinates, { icon: stationIcon }).bindPopup(`Ga lấy hàng: ${this.nearestPickupStation.name}`).addTo(this.map);
            L.marker(this.nearestDeliveryStation.coordinates, { icon: stationIcon }).bindPopup(`Ga trả hàng: ${this.nearestDeliveryStation.name}`).addTo(this.map);
          }


      } else if (transportTypeLoose === 'warehouse_to_station') {
          // pickupAddress is handled by onAddressSearch -> calculatePickupDistance
          // which sets this.nearestPickupStation and this.pickupDistance
          if (!this.nearestPickupStation || !deliveryStationName) {
              console.log('[calculateTotal] Early Exit (Warehouse-to-Station): Pickup address not set or delivery station not selected.');
              this.totalPrice = 0;
              return;
          }
          calculatedPickupStationName = this.nearestPickupStation.name;
          calculatedDeliveryStationName = deliveryStationName;
          this.deliveryDistance = 0; // No road distance for delivery to station

          // Check 20km warning for pickup distance
          if (this.pickupDistance > 20) {
              this.showDistanceWarning = true;
              this.totalPrice = 0;
              return;
          }
          // Update nearest delivery station for display/map
          this.nearestDeliveryStation = this.stations.find(s => s.name === deliveryStationName);
          if (this.map && this.nearestDeliveryStation) {
            const stationIcon = L.divIcon({
                html: '<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [16, 16],
                className: 'custom-marker'
            });
            // Ensure delivery marker from address search is removed if it existed.
            // Then add station marker.
            if (this.deliveryMarker) { this.map.removeLayer(this.deliveryMarker); }
            L.marker(this.nearestDeliveryStation.coordinates, { icon: stationIcon }).bindPopup(`Ga trả hàng: ${this.nearestDeliveryStation.name}`).addTo(this.map);
          }


      } else if (transportTypeLoose === 'warehouse_to_warehouse') {
          // pickupAddress and deliveryAddress are handled by their respective search functions
          // which set this.nearestPickupStation, this.nearestDeliveryStation, pickupDistance, deliveryDistance
          if (!this.nearestPickupStation || !this.nearestDeliveryStation) {
              console.log('[calculateTotal] Early Exit (Warehouse-to-Warehouse): Pickup or delivery address not set.');
              this.totalPrice = 0;
              return;
          }
          calculatedPickupStationName = this.nearestPickupStation.name;
          calculatedDeliveryStationName = this.nearestDeliveryStation.name;

          // Check 20km warning for both distances
          if (this.pickupDistance > 20 || this.deliveryDistance > 20) {
              this.showDistanceWarning = true;
              this.totalPrice = 0;
              return;
          }
      } else {
        console.log('[calculateTotal] Early Exit (Odd Cargo): Invalid transport type selected.');
        this.totalPrice = 0;
        return;
      }

      // Proceed with price calculation only if no early exit
      if (calculatedPickupStationName && calculatedDeliveryStationName && this.flcData.length > 0) {
          console.log('  Debug - calculatedPickupStationName:', calculatedPickupStationName);
          console.log('  Debug - calculatedDeliveryStationName:', calculatedDeliveryStationName);
          console.log('  Debug - flcData for search:', this.flcData);

          // Define normalized station names once for use in nested find calls
          const normalizedPickupStationName = this.normalizeString(calculatedPickupStationName || '');
          const normalizedDeliveryStationName = this.normalizeString(calculatedDeliveryStationName || '');

          const matchedLooseRoute = this.flcData.find((route) => { // Removed index here, as it's not used
              const normalizedRouteGa = this.normalizeString(route.ga);
              const normalizedRouteViTri = this.normalizeString(route.viTriLayNhanHang);

              const stationMatch = (normalizedRouteGa === normalizedPickupStationName && normalizedRouteViTri === normalizedDeliveryStationName) ||
                                   (normalizedRouteViTri === normalizedPickupStationName && normalizedRouteGa === normalizedDeliveryStationName);

              return stationMatch;
          });

          if (matchedLooseRoute) {
              console.log('  SUCCESS (Odd Cargo): Matched loose route found:', matchedLooseRoute);
              
              let pricePerUnit = 0;

              if (looseCargoType === 'full_carriage') {
                  // For full carriage, directly use nguyenToa from the matchedLooseRoute
                  pricePerUnit = Number(this.normalizeString(matchedLooseRoute.nguyenToa || '').replace(/[^0-9]/g, '')) || 0;
                  quantity = 1; // Quantity is always 1 for full carriage (per container)

              } else if (looseCargoType === 'kg') {
                  pricePerUnit = Number(this.normalizeString(matchedLooseRoute.dongKg || '').replace(/[^0-9]/g, '')) || 0;
                  quantity = weightKg;
              } else if (looseCargoType === 'm3') {
                  pricePerUnit = Number(this.normalizeString(matchedLooseRoute.metKhoi || '').replace(/[^0-9]/g, '')) || 0;
                  quantity = volumeM3;
              }
              this.basePriceFromData = pricePerUnit; // basePriceFromData will be the price per unit
              console.log('  Calculated basePriceFromData (price per unit) for Loose Cargo:', this.basePriceFromData);

          } else {
              console.log('  FAIL (Odd Cargo): No matched loose route found for given stations. (matchedLooseRoute is undefined/null)');
              this.totalPrice = 0; // If no route found, price is 0
              return;
          }
      }
      this.totalPrice = this.basePriceFromData * quantity;
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

  // New: Reset map points specific to loose cargo
  resetLooseCargoMapPoints(): void {
    if (this.pickupMarker) { this.map.removeLayer(this.pickupMarker); }
    if (this.deliveryMarker) { this.map.removeLayer(this.deliveryMarker); }
    if (this.routeLine) { this.map.removeLayer(this.routeLine); }
    if (this.deliveryRouteLine) { this.map.removeLayer(this.deliveryRouteLine); }
    
    this.pickupPoint = null;
    this.deliveryPoint = null;
    this.pickupDistance = 0;
    this.deliveryDistance = 0;
    this.nearestPickupStation = null;
    this.nearestDeliveryStation = null;
    this.showDistanceWarning = false;
  }

  // Handler for loose cargo type change
  onLooseCargoTypeChange(selectedType?: string): void {
    const weightKgControl = this.totalsForm.get('weightKg');
    const volumeM3Control = this.totalsForm.get('volumeM3');

    // Clear all validators and values initially
    weightKgControl?.clearValidators();
    volumeM3Control?.clearValidators();

    weightKgControl?.setValue(null);
    volumeM3Control?.setValue(null);

    if (selectedType === 'kg') {
      weightKgControl?.setValidators([Validators.required, Validators.min(1000)]);
    } else if (selectedType === 'm3') {
      volumeM3Control?.setValidators([Validators.required, Validators.min(3)]);
    } else if (selectedType === 'full_carriage') {
      // containerTypeLooseControl?.setValidators(Validators.required); // REMOVED
    }
    
    weightKgControl?.updateValueAndValidity();
    volumeM3Control?.updateValueAndValidity();
    // containerTypeLooseControl?.updateValueAndValidity(); // REMOVED
    this.calculateTotal();
  }

  // New: Handler for loose cargo transport type change
  onTransportTypeLooseChange(): void {
    const transportTypeLoose = this.totalsForm.get('transportTypeLoose')?.value;
    const pickupAddressControl = this.totalsForm.get('pickupAddress');
    const deliveryAddressControl = this.totalsForm.get('deliveryAddress');
    const pickupStationControl = this.totalsForm.get('pickupStation');
    const deliveryStationControl = this.totalsForm.get('deliveryStation');
    // const containerTypeLooseControl = this.totalsForm.get('containerTypeLoose'); // REMOVED

    // Clear all validators and values related to location for loose cargo
    pickupAddressControl?.clearValidators();
    deliveryAddressControl?.clearValidators();
    pickupStationControl?.clearValidators();
    deliveryStationControl?.clearValidators();
    // containerTypeLooseControl?.clearValidators(); // REMOVED

    pickupAddressControl?.setValue('');
    deliveryAddressControl?.setValue('');
    pickupStationControl?.setValue('');
    deliveryStationControl?.setValue('');
    // containerTypeLooseControl?.setValue(''); // REMOVED

    pickupAddressControl?.updateValueAndValidity();
    deliveryAddressControl?.updateValueAndValidity();
    pickupStationControl?.updateValueAndValidity();
    deliveryStationControl?.updateValueAndValidity();
    // containerTypeLooseControl?.updateValueAndValidity(); // REMOVED

    this.resetLooseCargoMapPoints(); // Reset map markers and distances

    switch (transportTypeLoose) {
      case 'station_to_station':
        pickupStationControl?.setValidators(Validators.required);
        deliveryStationControl?.setValidators(Validators.required);
        break;
      case 'warehouse_to_station':
        pickupAddressControl?.setValidators(Validators.required);
        deliveryStationControl?.setValidators(Validators.required);
        break;
      case 'warehouse_to_warehouse':
        pickupAddressControl?.setValidators(Validators.required);
        deliveryAddressControl?.setValidators(Validators.required);
        break;
    }

    pickupAddressControl?.updateValueAndValidity();
    deliveryAddressControl?.updateValueAndValidity();
    pickupStationControl?.updateValueAndValidity();
    deliveryStationControl?.updateValueAndValidity();
    // containerTypeLooseControl?.updateValueAndValidity(); // REMOVED

    this.calculateTotal(); // Recalculate total after changing transport type
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

    this.http.post(`${environment.api.url}/contact_customer`, formData, {headers}).subscribe({
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

  // Handler for goods type change (Even/Odd)
  onGoodsTypeChange(type: 'even' | 'odd'): void {
    this.goodsType = type;

    const containerTypeControl = this.totalsForm.get('containerType');
    const numberOfContainersControl = this.totalsForm.get('numberOfContainers');
    const transportTypeControl = this.totalsForm.get('transportType'); // For even cargo
    
    const looseCargoTypeControl = this.totalsForm.get('looseCargoType');
    const weightKgControl = this.totalsForm.get('weightKg');
    const volumeM3Control = this.totalsForm.get('volumeM3');
    const transportTypeLooseControl = this.totalsForm.get('transportTypeLoose'); // For odd cargo
    const pickupStationControl = this.totalsForm.get('pickupStation');
    const deliveryStationControl = this.totalsForm.get('deliveryStation');
    const pickupAddressControl = this.totalsForm.get('pickupAddress');
    const deliveryAddressControl = this.totalsForm.get('deliveryAddress');


    // Clear all validators and values for both cargo types initially
    containerTypeControl?.clearValidators();
    numberOfContainersControl?.clearValidators();
    transportTypeControl?.clearValidators();

    looseCargoTypeControl?.clearValidators();
    weightKgControl?.clearValidators();
    volumeM3Control?.clearValidators();
    transportTypeLooseControl?.clearValidators();
    pickupStationControl?.clearValidators();
    deliveryStationControl?.clearValidators();
    pickupAddressControl?.clearValidators();
    deliveryAddressControl?.clearValidators();


    containerTypeControl?.setValue('');
    numberOfContainersControl?.setValue(null);
    transportTypeControl?.setValue('both'); // Reset to default for even cargo
    
    looseCargoTypeControl?.setValue('');
    weightKgControl?.setValue(null);
    volumeM3Control?.setValue(null);
    transportTypeLooseControl?.setValue('warehouse_to_warehouse'); // Reset to default for loose cargo
    pickupStationControl?.setValue('');
    deliveryStationControl?.setValue('');
    pickupAddressControl?.setValue('');
    deliveryAddressControl?.setValue('');


    if (this.goodsType === 'even') {
        containerTypeControl?.setValidators(Validators.required);
        numberOfContainersControl?.setValidators([Validators.required, Validators.min(1)]);
        numberOfContainersControl?.setValue(1); // Set default for even cargo
        transportTypeControl?.setValidators(Validators.required); // Ensure transportType is required for even cargo

        // Clear loose cargo specific validators
        looseCargoTypeControl?.setValue(null);
        weightKgControl?.setValue(null);
        volumeM3Control?.setValue(null);
        transportTypeLooseControl?.setValue(null);
        pickupStationControl?.setValue(null);
        deliveryStationControl?.setValue(null);
        pickupAddressControl?.setValue(null);
        deliveryAddressControl?.setValue(null);


    } else { // goodsType === 'odd'
        looseCargoTypeControl?.setValidators(Validators.required);
        looseCargoTypeControl?.setValue('full_carriage'); // Set default for odd cargo
        transportTypeLooseControl?.setValidators(Validators.required); // Ensure transportTypeLoose is required
        transportTypeLooseControl?.setValue('warehouse_to_warehouse'); // Default transport for odd cargo
        this.onLooseCargoTypeChange('full_carriage'); // Call to set initial validators for loose cargo type
        this.onTransportTypeLooseChange(); // Call to set initial validators for loose transport type

        // Clear even cargo specific validators
        containerTypeControl?.setValue(null);
        numberOfContainersControl?.setValue(null);
        transportTypeControl?.setValue(null); // Clear transport type for even cargo
    }

    // Update validity for all controls
    containerTypeControl?.updateValueAndValidity();
    numberOfContainersControl?.updateValueAndValidity();
    transportTypeControl?.updateValueAndValidity();
    looseCargoTypeControl?.updateValueAndValidity();
    weightKgControl?.updateValueAndValidity();
    volumeM3Control?.updateValueAndValidity();
    transportTypeLooseControl?.updateValueAndValidity();
    pickupStationControl?.updateValueAndValidity();
    deliveryStationControl?.updateValueAndValidity();
    pickupAddressControl?.updateValueAndValidity();
    deliveryAddressControl?.updateValueAndValidity();


    this.resetMap(); // Reset map markers and distances
    this.calculateTotal(); // Recalculate total after changing goods type
  }

  async exportToPDF(): Promise<void> {
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;
    const logoBase64 = await this.getBase64ImageFromUrl('assets/green-line/ContainerService/GREENLINES_LOGO-01.png');
    const formValue = this.totalsForm.value;
    const isEven = this.goodsType === 'even';
    const rows: any[] = [];
  
    const recipientName = formValue.recipientName || 'Quý khách hàng';
    const note = formValue.note || 'Đơn giá trên chưa bao gồm VAT 10%. Báo giá có hiệu lực trong vòng 07 ngày.';
  
    // Thêm logo, địa chỉ công ty và phần "Kính gửi"
    const headerSection = [
      {
        columns: [
          {
            image: 'logo',
            width: 300,
            height: 80, // <-- tăng số này lên
            margin: [0, 0, 0, 10]
          },
          [
            { text: 'HANOI HEAD OFFICE', bold: true, fontSize: 10 },
            { text: 'Số 91 Lê Duẩn, Hoàn Kiếm, Hà Nội', fontSize: 10 },
            { text: 'TEL: 34-5377251', fontSize: 10 },
            { text: 'FAX:34-5377352', fontSize: 10 }
          ]
        ]
      },
      // Thêm ở đầu content
{ 
  text: `Hà Nội, ngày ${new Date().toLocaleDateString('vi-VN')}`, 
  alignment: 'right', 
  fontSize: 11, 
  margin: [0, 0, 0, 5] 
},
      { text: 'BÁO GIÁ VẬN CHUYỂN', style: 'header', margin: [0, 0, 0, 10] },
      { text: `Kính gửi: ${recipientName}`, fontSize: 12, italics: true, margin: [0, 10, 0, 5] },
      { text: 'Công ty TNHH NR Greenlines Logictis xin gửi lời cảm ơn tới Quý Khách hàng vì đã tin tưởng và sử dụng dịch vụ vận tải đường sắt của chúng tôi. Căn cứ nhu cầu vận chuyển hàng hóa của Quý Khách hàng, chúng tôi xin gửi báo giá cước vận chuyển hàng hóa cụ thể như sau:', italics: true, fontSize: 11 },
    ];
  
    // Tạo bảng dữ liệu như cũ...
    if (isEven) {
      rows.push(['Loại hàng', 'Container']);
      if (formValue.pickupAddress) rows.push(['Địa chỉ lấy hàng', formValue.pickupAddress]);
      if (formValue.deliveryAddress) rows.push(['Địa chỉ trả hàng', formValue.deliveryAddress]);
      if (formValue.containerType) rows.push(['Loại container', formValue.containerType]);
      if (formValue.numberOfContainers) rows.push(['Số lượng container', formValue.numberOfContainers]);
      if (formValue.transportType) {
        let transportTypeText = formValue.transportType === 'train' ? 'Đường tàu' : formValue.transportType === 'road' ? 'Đường bộ' : 'Cả hai';
        rows.push(['Loại hình vận chuyển', transportTypeText]);
      }
      if (this.pickupDistance) rows.push(['Khoảng cách lấy hàng', this.pickupDistance.toFixed(2) + ' km']);
      if (this.deliveryDistance) rows.push(['Khoảng cách trả hàng', this.deliveryDistance.toFixed(2) + ' km']);
      // if (formValue.transportType === 'train' || formValue.transportType === 'both') {
      //   if (this.trainPrice) rows.push(['Giá đường tàu', this.trainPrice.toLocaleString() + ' VND']);
      // }
      // if (formValue.transportType === 'road' || formValue.transportType === 'both') {
      //   if (this.roadPrice) rows.push(['Giá đường bộ', this.roadPrice.toLocaleString() + ' VND']);
      // }
      if (this.totalPrice) rows.push(['Tổng cộng', this.totalPrice.toLocaleString() + ' VND']);
    } else {
      rows.push(['Loại hàng', 'Hàng lẻ']);
      let looseType = '';
      if (formValue.transportTypeLoose === 'station_to_station') looseType = 'Từ ga đến ga';
      else if (formValue.transportTypeLoose === 'warehouse_to_station') looseType = 'Từ kho đến ga';
      else if (formValue.transportTypeLoose === 'warehouse_to_warehouse') looseType = 'Từ kho đến kho';
      if (looseType) rows.push(['Loại hình vận chuyển', looseType]);
      if (formValue.transportTypeLoose === 'station_to_station') {
        if (formValue.pickupStation) rows.push(['Ga lấy hàng', formValue.pickupStation]);
        if (formValue.deliveryStation) rows.push(['Ga trả hàng', formValue.deliveryStation]);
      } else if (formValue.transportTypeLoose === 'warehouse_to_station') {
        if (formValue.pickupAddress) rows.push(['Địa chỉ lấy hàng', formValue.pickupAddress]);
        if (formValue.deliveryStation) rows.push(['Ga trả hàng', formValue.deliveryStation]);
        if (this.pickupDistance) rows.push(['Khoảng cách lấy hàng', this.pickupDistance.toFixed(2) + ' km']);
      } else if (formValue.transportTypeLoose === 'warehouse_to_warehouse') {
        if (formValue.pickupAddress) rows.push(['Địa chỉ lấy hàng', formValue.pickupAddress]);
        if (formValue.deliveryAddress) rows.push(['Địa chỉ trả hàng', formValue.deliveryAddress]);
        if (this.pickupDistance) rows.push(['Khoảng cách lấy hàng', this.pickupDistance.toFixed(2) + ' km']);
        if (this.deliveryDistance) rows.push(['Khoảng cách trả hàng', this.deliveryDistance.toFixed(2) + ' km']);
      }
      let looseCargoType = '';
      if (formValue.looseCargoType === 'full_carriage') looseCargoType = 'Nguyên toa';
      else if (formValue.looseCargoType === 'kg') looseCargoType = 'Kg';
      else if (formValue.looseCargoType === 'm3') looseCargoType = 'Mét khối';
      if (looseCargoType) rows.push(['Loại hàng lẻ', looseCargoType]);
      if (formValue.looseCargoType === 'kg' && formValue.weightKg) rows.push(['Số Kg', formValue.weightKg]);
      if (formValue.looseCargoType === 'm3' && formValue.volumeM3) rows.push(['Số mét khối', formValue.volumeM3]);
      if (this.basePriceFromData > 0) rows.push(['Đơn giá', this.basePriceFromData.toLocaleString() + ' VND']);
      if (this.totalPrice) rows.push(['Tổng cộng', this.totalPrice.toLocaleString() + ' VND']);
    }
  
    const docDefinition = {
      content: [
        ...headerSection,
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              ['Thông tin', 'Giá trị'],
              ...rows
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#10b981' : null;
            },
            hLineWidth: function () { return 0.5; },
            vLineWidth: function () { return 0.5; },
          }
        },
        { text: '\nGhi chú:', bold: true, margin: [0, 20, 0, 5] },
        { text: '1. Đơn gía chưa bao gồm thuế GTGT và các phụ phí phát sinh (nếu có)', italics: true, fontSize: 11 },
        { text: '2. Cước vận chuyển sẽ thay đổi theo biến động của giá dầu DO 0,05S (+/- 10%)', italics: true, fontSize: 11 },
        { text: '3. Gía dầu DO 0,05S hiện tại: 18.380 VND/litre', italics: true, fontSize: 11 },
        { text: '4. Bảo hiểm hàng hóa được mua bởi chủ hàng', italics: true, fontSize: 11 },
        { text: '5. Tải trọng hàng xếp: không quá 28 Tons/cont 40HC', italics: true, fontSize: 11 },
        { text: '6. Người liên hệ:  Ms Giang - 0902161639', italics: true, fontSize: 11 },
        { text: '7. Báo giá có hiệu lực trong vòng 1 tháng kể từ ngày báo giá', italics: true, fontSize: 11 },
        { text: note, italics: true, fontSize: 11 },
        { text: 'Công ty TNHH NR Greenlines Logictis', italics: true, fontSize: 11 },

      ],
      
      images: {
        logo: logoBase64
      },
      styles: {
        header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 16, alignment: 'center', margin: [0, 0, 0, 10] },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12
      }
    };
    pdfMake.createPdf(docDefinition).download('bao-gia-greenlines.pdf');
  }

  getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        let dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = imageUrl;
    });
  }
  
}