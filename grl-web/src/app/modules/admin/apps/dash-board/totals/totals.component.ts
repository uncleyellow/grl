import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { environment } from 'environments/environment.prod';
import * as L from 'leaflet';

declare const google: any;

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.scss']
})
export class TotalsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() activeLang: string = 'en';
  @ViewChild('map') mapContainer: ElementRef;
  @ViewChild('originInput') originInput: ElementRef;
  @ViewChild('destinationInput') destinationInput: ElementRef;

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
  private hanoiStation = L.latLng(21.024350, 105.841420);
  
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
  
  // Thêm biến cho khoảng cách
  pickupDistance: number = 0;  // Khoảng cách từ điểm lấy hàng đến ga HN
  deliveryDistance: number = 0; // Khoảng cách từ ga HN đến điểm trả hàng

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.totalsForm = this.fb.group({
      route: ['', Validators.required],
      transportType: ['both', Validators.required],
      pickupAddress: [''],
      deliveryAddress: [''] // Thêm control cho địa chỉ trả hàng
    });
  }

  ngOnInit(): void {
    this.fetchTotals();
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

  ngOnDestroy() {}

  ngAfterViewInit(): void {
    // Đợi một tick để đảm bảo view đã được render
    setTimeout(() => {
      this.initializeMap();
    });
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
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container not found');
      return;
    }

    try {
      // Khởi tạo map
      this.map = L.map(this.mapContainer.nativeElement).setView([21.0285, 105.8542], 10);
      
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

  private calculatePickupDistance(latlng: L.LatLng): void {
    const url = `https://router.project-osrm.org/route/v1/driving/${latlng.lng},${latlng.lat};${this.hanoiStation.lng},${this.hanoiStation.lat}?overview=full&geometries=geojson`;
    
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
          
          this.calculateTotal();
        }
      })
      .catch(error => {
        console.error('Error calculating pickup route:', error);
        this.pickupDistance = latlng.distanceTo(this.hanoiStation) / 1000;
        this.calculateTotal();
      });
  }

  private calculateDeliveryDistance(latlng: L.LatLng): void {
    const url = `https://router.project-osrm.org/route/v1/driving/${this.hanoiStation.lng},${this.hanoiStation.lat};${latlng.lng},${latlng.lat}?overview=full&geometries=geojson`;
    
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
          
          this.calculateTotal();
        }
      })
      .catch(error => {
        console.error('Error calculating delivery route:', error);
        this.deliveryDistance = latlng.distanceTo(this.hanoiStation) / 1000;
        this.calculateTotal();
      });
  }

  onAddressSearch(): void {
    const address = this.totalsForm.get('pickupAddress')?.value;
    if (!address) return;

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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching totals:', error);
        this.loading = false;
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

  calculateTotal() {
    if (!this.selectedRoute) {
      this.totalPrice = 0;
      return;
    }

    const transportType = this.totalsForm.get('transportType')?.value;
    const roadPricePerKm = Number(this.selectedRoute.duongBo) || 0;
    const railPrice = Number(this.selectedRoute.duongTau) || 0;
    
    switch(transportType) {
        case 'both':
            // Cả đường bộ và đường tàu
            this.totalPrice = (this.pickupDistance + this.deliveryDistance) * roadPricePerKm + railPrice;
            break;
        case 'road':
            // Chỉ đường bộ
            this.totalPrice = (this.pickupDistance + this.deliveryDistance) * roadPricePerKm;
            break;
        case 'rail':
            // Chỉ đường tàu
            this.totalPrice = railPrice;
            break;
        default:
            this.totalPrice = 0;
    }
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
}