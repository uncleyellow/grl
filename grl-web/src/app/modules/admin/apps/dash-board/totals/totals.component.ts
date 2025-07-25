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
  shippingDate
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
  private vinhStation = L.latLng(18.687331,105.6596957);

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
    { name: 'Ga Trang Bom', coordinates: this.trangBomStation },
    // { name: 'Ga Giap Bat', coordinates: this.giapBatStation },
    { name: 'Ga Kim Lien', coordinates: this.kimLienStation },
    { name: 'Ga Dieu Tri', coordinates: L.latLng(13.8072986,109.14122) },
    // { name: 'Ga Sóng Thần', coordinates:L.latLng(10.8779164,106.7511083) },

    // { name: 'Bắc Giang', coordinates:L.latLng(21.291714,106.1694926) },
    // { name: 'Lạng Sơn', coordinates:L.latLng(21.855704,106.6644324) },
    // { name: 'Bắc Ninh', coordinates:L.latLng(21.1740801,105.9996102) },
    // { name: 'Hà Nam', coordinates:L.latLng(20.533893,105.8107956) },
    // { name: 'Hà Nội', coordinates:L.latLng(21.0227784,105.8163212) },
    // { name: 'Hòa Bình', coordinates:L.latLng(20.7093913,105.0165149) },
    // { name: 'Hải Dương', coordinates:L.latLng(20.9408946,106.2464026) },
    // { name: 'Hải Phòng', coordinates:L.latLng(20.8468121,106.6574613) },
    // { name: 'Hưng Yên', coordinates:L.latLng(20.6656158,105.9854631) },
    // { name: 'Nam Định', coordinates:L.latLng(20.417757,106.1668969) },
    // { name: 'Phú Thọ', coordinates:L.latLng(21.4157109,105.1881671) },
    // { name: 'Thanh hóa', coordinates:L.latLng(19.8088549,105.7084824) },
    // { name: 'Vĩnh Phúc', coordinates:L.latLng(21.3642123,105.3925375) },
    // { name: 'Thái Nguyên', coordinates:L.latLng(21.5774523,105.7622043) },
    // { name: 'Ninh Bình', coordinates:L.latLng(20.2451952,105.9341661) },
    // { name: 'Quảng Ninh', coordinates:L.latLng(21.1759344,106.9327144) },
    // { name: 'Sơn La', coordinates:L.latLng(21.3447457,103.8328439) },
    // { name: 'Thái Bình', coordinates:L.latLng(20.4530169,106.3033668) },
    // { name: 'Nghệ An', coordinates:L.latLng(19.2732923,104.1800443) },
    // { name: 'Lào Cai', coordinates:L.latLng(22.4185877,103.896914) },
    // { name: 'Hà Tĩnh', coordinates:L.latLng(18.3543214,105.8605449) },
    // { name: 'Đà Nẵng', coordinates:L.latLng(16.0670082,107.9134761) },
    // { name: 'Quảng Nam', coordinates:L.latLng(15.5096308,107.6444499) },
    // { name: 'Huế', coordinates:L.latLng(16.4534687,107.5358278) },
    // { name: 'Quảng Trị', coordinates:L.latLng(16.7344412,106.6224288) },
    // { name: 'Quảng Bình', coordinates:L.latLng(17.5060448,105.9706928) },
    // { name: 'Gia Lai', coordinates:L.latLng(13.799897,107.5017172) },
    // { name: 'Bình Định', coordinates:L.latLng(14.1096504,108.6557665) },
    // { name: 'Quảng Ngãi', coordinates:L.latLng(15.153854,108.8010613) },
    // { name: 'Khánh Hòa', coordinates:L.latLng(12.3191983,108.7397957) },
    // { name: 'Bình Dương', coordinates:L.latLng(11.1828232,106.316194) },
    // { name: 'Cần Thơ', coordinates:L.latLng(10.1227451,105.3704601) },
    // { name: 'Đồng Nai', coordinates:L.latLng(11.0526864,106.833893) },
    // { name: 'Bình Thuận', coordinates:L.latLng(11.0198501,107.8514869) },
    // { name: 'Hồ Chí Minh', coordinates:L.latLng(10.7552921,106.3648924) },
    // { name: 'Long An', coordinates:L.latLng(10.714293,105.7932022) },
    // { name: 'Vĩnh Long', coordinates:L.latLng(10.2519714,105.8978079) },
    // { name: 'Tiền Giang', coordinates:L.latLng(10.3892834,105.9858764) },
    // { name: 'Vũng Tàu', coordinates:L.latLng(10.4034969,107.040478) },
    // { name: 'Bến Tre', coordinates:L.latLng(10.2374763,106.3342659) },
    // { name: 'Đồng Tháp', coordinates:L.latLng(10.554273,105.2344053) },
    // { name: 'Kiên Giang', coordinates:L.latLng(9.8976281,103.8373803) },
    // { name: 'An Giang', coordinates:L.latLng(10.573527,104.846507) },
    // { name: 'Cà Mau', coordinates:L.latLng(9.1753645,105.1871716) },
    // { name: 'Bạc Liêu', coordinates:L.latLng(9.2684649,105.7118445) },
    // { name: 'Sóc Trăng', coordinates:L.latLng(9.6097884,105.9365263) },
    // { name: 'Tây Ninh', coordinates:L.latLng(11.3659443,106.0883681) },
    // { name: 'Lâm Đồng', coordinates:L.latLng(11.7667839,107.6685157) },
  ];

  // Thêm mảng chỉ chứa 2 ga FLC đặc biệt
  private allowedFLCStations = [
    { name: 'Ga Giáp Bát', coordinates: L.latLng(20.9762103, 105.8381601) },
    { name: 'Ga Sóng Thần', coordinates: L.latLng(10.8779164, 106.7511083) }
  ];

  private citys = [
    { name: 'Ga Dieu Tri', coordinates: this.dieuTriStation },
    { name: 'Bac Giang', coordinates:L.latLng(21.291714,106.1694926) },
    { name: 'Lạng Sơn', coordinates:L.latLng(21.855704,106.6644324) },
    { name: 'Bắc Ninh', coordinates:L.latLng(21.1740801,105.9996102) },
    { name: 'Hà Nam', coordinates:L.latLng(20.533893,105.8107956) },
    { name: 'Hà Nội', coordinates:L.latLng(21.0227784,105.8163212) },
    { name: 'Hòa Bình', coordinates:L.latLng(20.7093913,105.0165149) },
    { name: 'Hải Dương', coordinates:L.latLng(20.9408946,106.2464026) },
    { name: 'Hai Phong', coordinates:L.latLng(20.8468121,106.6574613) },
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
    { name: 'Đà Nẵng', coordinates:L.latLng(16.0165913,108.2021645) },
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
    { name: 'Ho Chi Minh', coordinates:L.latLng(10.7552921,106.3648924) },
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

  // Thêm biến cho city gần pickup và delivery
  private nearestPickupCity: any = null;
  private nearestDeliveryCity: any = null;

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
    this.fetchCuocDuongBo();
    this.totalsForm.get('transportType')?.setValue('both');
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
    // Lấy địa chỉ nhập vào
    const pickupAddress = (this.totalsForm.get('pickupAddress')?.value || '').toString().toLowerCase().trim();

    // Nếu địa chỉ là đúng "ga vinh" thì set khoảng cách = 0, không fetch route
    if (pickupAddress === 'ga vinh') {
      this.nearestPickupStation = this.stations.find(st => this.normalizeString(st.name).includes('vinh'));
      this.pickupDistance = 0;
      this.nearestPickupCity = this.findNearestCity(latlng);

      // Xóa route line nếu có
      if (this.routeLine) {
        this.map.removeLayer(this.routeLine);
        this.routeLine = null;
      }
      // Xóa marker nếu có, vẽ lại marker tại ga vinh
      if (this.pickupMarker) {
        this.map.removeLayer(this.pickupMarker);
        this.pickupMarker = null;
      }
      const pickupIcon = L.divIcon({
        html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        className: 'custom-marker'
      });
      this.pickupMarker = L.marker(this.nearestPickupStation.coordinates, { icon: pickupIcon })
        .bindPopup('Điểm lấy hàng: Ga Vinh')
        .addTo(this.map);

      // Marker cho ga vinh
      const stationIcon = L.divIcon({
        html: '<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        className: 'custom-marker'
      });
      L.marker(this.nearestPickupStation.coordinates, { icon: stationIcon })
        .bindPopup(`Ga gần nhất: ${this.nearestPickupStation.name}`)
        .addTo(this.map);

      this.calculateTotal();
      return;
    }

    // Nếu địa chỉ có chữ 'vinh' thì ép nearest station là Ga Vinh
    if (pickupAddress.includes('vinh')) {
      this.nearestPickupStation = this.stations.find(st => this.normalizeString(st.name).includes('vinh'));
    } else {
      this.nearestPickupStation = this.findNearestStation(latlng);
    }
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
    // ... giữ nguyên logic nearestPickupStation ...
    this.nearestPickupCity = this.findNearestCity(latlng);
    // ... giữ nguyên phần còn lại ...
    // (không gán this.nearestCity ở đây nữa)
    // ...
  }
  findNearestCity(point: L.LatLng): any{
    debugger
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
    // Lấy địa chỉ nhập vào
    const deliveryAddress = (this.totalsForm.get('deliveryAddress')?.value || '').toString().toLowerCase().trim();

    // Nếu địa chỉ là đúng "ga vinh" thì set khoảng cách = 0, không fetch route
    if (deliveryAddress === 'ga vinh') {
      this.nearestDeliveryStation = this.stations.find(st => this.normalizeString(st.name).includes('vinh'));
      this.deliveryDistance = 0;
      this.nearestDeliveryCity = this.findNearestCity(latlng);
      // Xóa route line nếu có
      if (this.deliveryRouteLine) {
        this.map.removeLayer(this.deliveryRouteLine);
        this.deliveryRouteLine = null;
      }
      // Xóa marker nếu có, vẽ lại marker tại ga vinh
      if (this.deliveryMarker) {
        this.map.removeLayer(this.deliveryMarker);
        this.deliveryMarker = null;
      }
      const deliveryIcon = L.divIcon({
        html: '<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        className: 'custom-marker'
      });
      this.deliveryMarker = L.marker(this.nearestDeliveryStation.coordinates, { icon: deliveryIcon })
        .bindPopup('Điểm trả hàng: Ga Vinh')
        .addTo(this.map);

      // Marker cho ga vinh
      const stationIcon = L.divIcon({
        html: '<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        className: 'custom-marker'
      });
      L.marker(this.nearestDeliveryStation.coordinates, { icon: stationIcon })
        .bindPopup(`Ga gần nhất: ${this.nearestDeliveryStation.name}`)
        .addTo(this.map);

      this.calculateTotal();
      return;
    }

    // Nếu địa chỉ có chữ 'vinh' thì ép nearest station là Ga Vinh
    if (deliveryAddress.includes('vinh')) {
      this.nearestDeliveryStation = this.stations.find(st => this.normalizeString(st.name).includes('vinh'));
    } else {
      this.nearestDeliveryStation = this.findNearestStation(latlng);
    }
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

    this.nearestDeliveryCity = this.findNearestCity(latlng);
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
        // console.log('FLC Data fetched and assigned to this.flcData:', this.flcData);
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
        // console.log('duongBo Data fetched and assigned to this.duongBo:', this.duongBo);
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
    // console.log(`normalizeString: Input: '${str}', Output: '${normalized}'`);
    return normalized;
  }

  private normalizeLocationName(str: string): string {
    // Loại bỏ các tiền tố phổ biến
    return this.normalizeString(
      str
        .replace(/^(cảng|thành phố|tp\\.?|tỉnh|quận|huyện)\\s+/i, '')
        .replace(/\\s+/g, ' ')
        .trim()
    );
  }

  calculateTotal() {
    this.totalPrice = 0; // Always reset

    // Ensure all necessary data is loaded before attempting calculations
    if (!this.totalsData || this.totalsData.length === 0 || !this.duongBo || this.duongBo.length === 0 || !this.flcData || this.flcData.length === 0) {
      return; // Not enough data yet
    }

    this.trainPrice = 0; // Price for train transport (even cargo)
    this.roadPrice = 0;  // Price for road transport (even cargo)
    this.basePriceFromData = 0; // Price per unit for loose cargo

    const numberOfContainers = this.totalsForm.get('numberOfContainers')?.value || 1;
    const containerType = this.totalsForm.get('containerType')?.value;
    const selectedContainerTypeNormalized = this.normalizeString(containerType || '');
    const transportType = this.totalsForm.get('transportType')?.value; // Get selected transport type for even cargo

    // Lấy pickupAddress và deliveryAddress để kiểm tra
    const pickupAddress = (this.totalsForm.get('pickupAddress')?.value || '').toString().trim().toLowerCase();
    const deliveryAddress = (this.totalsForm.get('deliveryAddress')?.value || '').toString().trim().toLowerCase();
    const pickupIsStation = pickupAddress.startsWith('ga');
    const deliveryIsStation = deliveryAddress.startsWith('ga');
    const bothIsStation = pickupIsStation && deliveryIsStation;

    // Common checks for Even Cargo
    if (this.goodsType === 'even' && (!selectedContainerTypeNormalized || !numberOfContainers || numberOfContainers < 1)) {
        this.totalPrice = 0;
        return;
    }

    if (this.goodsType === 'even') {
      let pickupToStationRoadPrice = 0;
      let stationToDeliveryRoadPrice = 0;
      let trainPrice = 0;

      // Nếu cả hai đều là ga thì chỉ tính giá đường sắt
      if (bothIsStation) {
        // 2. Giá đường sắt: ga gần nhất -> ga trả hàng
        if (this.nearestPickupStation && this.nearestDeliveryStation && this.totalsData.length > 0) {
          const normalizedPickupStationName = this.normalizeString(this.nearestPickupStation.name);
          const normalizedDeliveryStationName = this.normalizeString(this.nearestDeliveryStation.name);
          const matchedTrainRoute = this.totalsData.find((route) => {
            const normalizedRouteGa = this.normalizeString(route.ga);
            const normalizedRouteDelivery = this.normalizeString(route.viTriLayNhanHang);
            const normalizedRouteContainerType = this.normalizeString(route.loaiCont || '');
            return (
              normalizedRouteGa === normalizedPickupStationName &&
              normalizedRouteDelivery === normalizedDeliveryStationName &&
              normalizedRouteContainerType === selectedContainerTypeNormalized
            );
          });
          if (matchedTrainRoute) {
            trainPrice = Number(matchedTrainRoute.soTien.replace(/[^0-9]/g, '')) || 0;
            this.shippingDate = matchedTrainRoute.ngayVanChuyen || 0
            console.log('hợp với',matchedTrainRoute)
          }
        }
        // Tổng tiền chỉ là giá đường sắt * số lượng container
        this.totalPrice = trainPrice * numberOfContainers;
        console.log('Chỉ tính giá đường sắt:', trainPrice, 'Tổng:', this.totalPrice);
      } else {
        // 1. Giá đường bộ: điểm lấy hàng -> ga gần nhất
        if (this.nearestPickupStation && this.nearestPickupCity && this.duongBo.length > 0) {
          const normalizedStation = this.normalizeLocationName(this.nearestPickupStation.name);
          const normalizedCity = this.normalizeLocationName(this.nearestPickupCity.name);
          const matchedPickupRoad = this.duongBo.find((route) => {
            const normalizedRouteGa = this.normalizeLocationName(route.ga);
            const normalizedRouteDelivery = this.normalizeLocationName(route.viTriLayNhanHang);
            const normalizedRouteContainerType = this.normalizeString(route.loaiCont || '');
            return (
              normalizedRouteGa === normalizedStation &&
              normalizedRouteDelivery === normalizedCity &&
              normalizedRouteContainerType === selectedContainerTypeNormalized
            );
          });
          if (matchedPickupRoad) {
            pickupToStationRoadPrice = Number(matchedPickupRoad.donViTinh.replace(/[^0-9]/g, '')) || 0;
            console.log('hợp với',matchedPickupRoad)
          }
        }
        // 2. Giá đường sắt: ga gần nhất -> ga trả hàng
        if (this.nearestPickupStation && this.nearestDeliveryStation && this.totalsData.length > 0) {
          const normalizedPickupStationName = this.normalizeString(this.nearestPickupStation.name);
          const normalizedDeliveryStationName = this.normalizeString(this.nearestDeliveryStation.name);
          const matchedTrainRoute = this.totalsData.find((route) => {
            const normalizedRouteGa = this.normalizeString(route.ga);
            const normalizedRouteDelivery = this.normalizeString(route.viTriLayNhanHang);
            const normalizedRouteContainerType = this.normalizeString(route.loaiCont || '');
            return (
              normalizedRouteGa === normalizedPickupStationName &&
              normalizedRouteDelivery === normalizedDeliveryStationName &&
              normalizedRouteContainerType === selectedContainerTypeNormalized
            );
          });
          if (matchedTrainRoute) {
            trainPrice = Number(matchedTrainRoute.soTien.replace(/[^0-9]/g, '')) || 0;
            this.shippingDate = matchedTrainRoute.ngayVanChuyen || 0
            console.log('hợp với',matchedTrainRoute)
          }
        }
        // 3. Giá đường bộ: ga trả hàng -> điểm trả hàng
        if (this.nearestDeliveryStation && this.nearestDeliveryCity && this.duongBo.length > 0) {
          const normalizedStation = this.normalizeString(this.nearestDeliveryStation.name);
          const normalizedCity = this.normalizeLocationName(this.nearestDeliveryCity.name);
          const matchedDeliveryRoad = this.duongBo.find((route) => {
            const normalizedRouteGa = this.normalizeString(route.ga);
            const normalizedRouteDelivery = this.normalizeLocationName(route.viTriLayNhanHang);
            const normalizedRouteContainerType = this.normalizeString(route.loaiCont || '');
            return (
              normalizedRouteGa === normalizedStation &&
              normalizedRouteDelivery === normalizedCity &&
              normalizedRouteContainerType === selectedContainerTypeNormalized
            );
          });
          if (matchedDeliveryRoad) {
            stationToDeliveryRoadPrice = Number(matchedDeliveryRoad.donViTinh.replace(/[^0-9]/g, '')) || 0;
            console.log('hợp với',matchedDeliveryRoad)
          }
        }
        // Tổng tiền = (giá 1 + giá 2 + giá 3) * số lượng container
        if(trainPrice == 0){
          this.totalPrice = (pickupToStationRoadPrice + trainPrice + stationToDeliveryRoadPrice) * numberOfContainers / 2;  
          console.log('giá 1',pickupToStationRoadPrice)
          console.log('giá 2',trainPrice)
          console.log('giá 3',stationToDeliveryRoadPrice)
        }
        else{
          this.totalPrice = (pickupToStationRoadPrice + trainPrice + stationToDeliveryRoadPrice) * numberOfContainers;
          console.log('giá 1',pickupToStationRoadPrice)
          console.log('giá 2',trainPrice)
          console.log('giá 3',stationToDeliveryRoadPrice)
        }
      }
    } else { // goodsType === 'odd' (Hàng Lẻ)
      const allowedStations = ['Ga Giáp Bát', 'Ga Sóng Thần'];
      const looseCargoType = this.totalsForm.get('looseCargoType')?.value;
      const weightKg = this.totalsForm.get('weightKg')?.value;
      const volumeM3 = this.totalsForm.get('volumeM3')?.value;
      const transportTypeLoose = this.totalsForm.get('transportTypeLoose')?.value;
      let pickupStationName = this.totalsForm.get('pickupStation')?.value;
      let deliveryStationName = this.totalsForm.get('deliveryStation')?.value;
      let matchedLooseRoute = null;
      let quantity = 0;
      this.showDistanceWarning = false;

      // Chỉ cho phép chọn đúng 2 ga này khi là station_to_station
      if (transportTypeLoose === 'station_to_station') {
        if (!allowedStations.includes(pickupStationName) || !allowedStations.includes(deliveryStationName) || pickupStationName === deliveryStationName) {
          this.totalPrice = 0;
          return;
        }
        // Tìm đúng chiều, giá mỗi chiều có thể khác nhau
        matchedLooseRoute = this.flcData.find(route =>
          this.normalizeString(route.ga) === this.normalizeString(pickupStationName) &&
          this.normalizeString(route.viTriLayNhanHang) === this.normalizeString(deliveryStationName)
        );
        if (!matchedLooseRoute) {
          this.totalPrice = 0;
          return;
        }
      }
      // warehouse_to_station: địa chỉ lấy hàng, ga trả hàng là 1 trong 2 ga, tìm giá đúng chiều
      else if (transportTypeLoose === 'warehouse_to_station') {
        // Tìm ga gần nhất từ allowedFLCStations cho pickupPoint
        if (!this.pickupPoint) {
          this.totalPrice = 0;
          return;
        }
        const pickupNearest = this.allowedFLCStations
          .map(station => ({
            ...station,
            dist: this.pickupPoint.distanceTo(station.coordinates)
          }))
          .reduce((prev, curr) => (curr.dist < prev.dist ? curr : prev));
        pickupStationName = pickupNearest?.name;
        // Ga trả hàng là ga còn lại
        deliveryStationName = allowedStations.find(name => name !== pickupStationName);
        // Gán lại vào form nếu muốn đồng bộ UI
        this.totalsForm.get('pickupStation')?.setValue(pickupStationName);
        this.totalsForm.get('deliveryStation')?.setValue(deliveryStationName);
        // Tìm giá Từ kho -> Ga ...
        matchedLooseRoute = this.flcData.find(route =>
          this.normalizeString(route.ga) === this.normalizeString('Từ kho') &&
          this.normalizeString(route.viTriLayNhanHang) === this.normalizeString(deliveryStationName)
        );
        if (!matchedLooseRoute) {
          this.totalPrice = 0;
          return;
        }
      }
      // warehouse_to_warehouse: chỉ tính giá từ kho đến ga gần nhất (pickup) và từ ga gần nhất (delivery) đến kho
      else if (transportTypeLoose === 'warehouse_to_warehouse') {
        if (!this.pickupPoint || !this.deliveryPoint) {
          this.totalPrice = 0;
          return;
        }
        // Tìm ga gần nhất cho pickupPoint
        const pickupNearest = this.allowedFLCStations
          .map(station => ({
            ...station,
            dist: this.pickupPoint.distanceTo(station.coordinates)
          }))
          .reduce((prev, curr) => (prev == null || curr.dist < prev.dist ? curr : prev));
        // Tìm ga gần nhất cho deliveryPoint
        const deliveryNearest = this.allowedFLCStations
          .map(station => ({
            ...station,
            dist: this.deliveryPoint.distanceTo(station.coordinates)
          }))
          .reduce((prev, curr) => (prev == null || curr.dist < prev.dist ? curr : prev));

        // Lấy giá từ kho -> ga gần nhất (pickup)
        const matchedPickupRoute = this.flcData.find(route =>
          this.normalizeString(route.ga) === this.normalizeString('Từ kho') &&
          this.normalizeString(route.viTriLayNhanHang) === this.normalizeString(pickupNearest.name)
        );
        // Lấy giá từ ga gần nhất (delivery) -> kho
        const matchedDeliveryRoute = this.flcData.find(route =>
          this.normalizeString(route.ga) === this.normalizeString(deliveryNearest.name) &&
          this.normalizeString(route.viTriLayNhanHang) === this.normalizeString('Kho')
        );

        // Nếu không có route nào thì không tính giá
        if (!matchedPickupRoute && !matchedDeliveryRoute) {
          this.totalPrice = 0;
          return;
        }

        // Xử lý số lượng
        if (!looseCargoType || 
            (looseCargoType === 'kg' && (!weightKg || weightKg < 1000)) || 
            (looseCargoType === 'm3' && (!volumeM3 || volumeM3 < 3)) ) {
          this.totalPrice = 0;
          return;
        }

        let pricePerUnitPickup = 0;
        let pricePerUnitDelivery = 0;
        let quantity = 0;
        if (looseCargoType === 'full_carriage') {
          pricePerUnitPickup = matchedPickupRoute ? Number((matchedPickupRoute.nguyenToa || '').replace(/[^0-9]/g, '')) || 0 : 0;
          pricePerUnitDelivery = matchedDeliveryRoute ? Number((matchedDeliveryRoute.nguyenToa || '').replace(/[^0-9]/g, '')) || 0 : 0;
          quantity = 1;
        } else if (looseCargoType === 'kg') {
          pricePerUnitPickup = matchedPickupRoute ? Number((matchedPickupRoute.dongKg || '').replace(/[^0-9]/g, '')) || 0 : 0;
          pricePerUnitDelivery = matchedDeliveryRoute ? Number((matchedDeliveryRoute.dongKg || '').replace(/[^0-9]/g, '')) || 0 : 0;
          quantity = weightKg;
        } else if (looseCargoType === 'm3') {
          pricePerUnitPickup = matchedPickupRoute ? Number((matchedPickupRoute.metKhoi || '').replace(/[^0-9]/g, '')) || 0 : 0;
          pricePerUnitDelivery = matchedDeliveryRoute ? Number((matchedDeliveryRoute.metKhoi || '').replace(/[^0-9]/g, '')) || 0 : 0;
          quantity = volumeM3;
        }
        // Hiển thị giá cơ bản là giá pickup (nếu có), nếu không thì lấy giá delivery
        this.basePriceFromData = pricePerUnitPickup > 0 ? pricePerUnitPickup : pricePerUnitDelivery;
        // Tổng giá là cộng cả 2 chiều (nếu có)
        this.totalPrice = (pricePerUnitPickup + pricePerUnitDelivery) * quantity;
      } else {
        this.totalPrice = 0;
        return;
      }
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
    this.totalsForm.get('transportType')?.setValue('both');
  }

  async exportToPDF(): Promise<void> {
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;
    const logoBase64 = await this.getBase64ImageFromUrl('assets/green-line/ContainerService/GREENLINES_LOGO-01.png');
    const formValue = this.totalsForm.value;
    const isEven = this.goodsType === 'even';
    const rows: any[] = [];
  
    const recipientName = formValue.recipientName || 'Quý khách hàng';
    const note = formValue.note || '8. Đơn giá trên chưa bao gồm VAT 8%.';
  
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
            // { text: 'HANOI HEAD OFFICE', bold: true, fontSize: 10 },
            { text: '\n95-97 Lê Duẩn, Phường Cửa Nam, Hà Nội', fontSize: 10 },
            { text: '\nĐiện thoại:+84902161639     Email:info@nrgreenlines.com.vn', fontSize: 10 },
            // { text: 'FAX.84-4-35772752', fontSize: 10 }
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
      { text: `Kính gửi: ${recipientName}`, fontSize: 12, margin: [0, 10, 0, 5],bold: true },
      { text: 'Công ty TNHH NR Greenlines Logistics xin gửi lời cảm ơn tới Quý Khách hàng vì đã tin tưởng và sử dụng dịch vụ vận tải đường sắt của chúng tôi. Căn cứ nhu cầu vận chuyển hàng hóa của Quý Khách hàng, chúng tôi xin gửi báo giá cước vận chuyển hàng hóa cụ thể như sau:', fontSize: 11 },
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
        rows.push(['Loại hình vận chuyển', 'Đường sắt kết hợp đường bộ']);
      }
      if (this.shippingDate) rows.push(['Thời gian vận chuyển', this.shippingDate + ' ngày']);
      if (this.pickupDistance) rows.push(['Khoảng cách lấy hàng', this.pickupDistance.toFixed(2) + ' km']);
      if (this.deliveryDistance) rows.push(['Khoảng cách trả hàng', this.deliveryDistance.toFixed(2) + ' km']);
      // if (formValue.transportType === 'train' || formValue.transportType === 'both') {
      //   if (this.trainPrice) rows.push(['Giá đường tàu', this.trainPrice.toLocaleString() + ' VND']);
      // }
      // if (formValue.transportType === 'road' || formValue.transportType === 'both') {
      //   if (this.roadPrice) rows.push(['Giá đường bộ', this.roadPrice.toLocaleString() + ' VND']);
      // }
      if (this.totalPrice) rows.push([
        { text: 'Tổng cộng', bold: true, alignment: 'center' },
        { text: this.totalPrice.toLocaleString() + ' VND', bold: true, alignment: 'center' }
      ]);
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
      if (this.totalPrice) rows.push([
        { text: 'Tổng cộng', bold: true },
        { text: this.totalPrice.toLocaleString() + ' VND', bold: true }
      ]);
    }
  
    const docDefinition = {
      content: [
        ...headerSection,
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              [
                { text: 'Thông tin', style: 'tableHeader' },
                { text: 'Giá trị', style: 'tableHeader' }
              ],
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
        { text: '1. Đơn giá chưa bao gồm thuế GTGT và các phụ phí phát sinh (nếu có)', fontSize: 11 },
        { text: '2. Cước vận chuyển sẽ thay đổi theo biến động của giá dầu DO 0,05S (+/- 10%)', fontSize: 11 },
        { text: '3. Gía dầu DO 0,05S hiện tại: 18.380 VND/litre', fontSize: 11 },
        { text: '4. Bảo hiểm hàng hóa được mua bởi chủ hàng', fontSize: 11 },
        { text: '5. Tải trọng hàng xếp: không quá 28 Tons/cont 40HC',  fontSize: 11 },
        { text: '6. Người liên hệ:  Ms Giang - 0902161639',  fontSize: 11 },
        { text: '7. Báo giá có hiệu lực trong vòng 1 tháng kể từ ngày báo giá',  fontSize: 11 },
        { text: note,  fontSize: 11 },
        { text: '',  fontSize: 11 },
        { text: '',  fontSize: 11 },
        { text: '\nCông ty TNHH NR Greenlines Logistics', fontSize: 11, alignment: 'right',bold:true },

      ],
      
      images: {
        logo: logoBase64
      },
      styles: {
        header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 16, alignment: 'center', margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, alignment: 'center', fontSize: 13 }
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