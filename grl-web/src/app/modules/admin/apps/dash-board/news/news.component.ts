import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'environments/environment.prod'; // Nếu file cách xa


interface News {
  id: string;
  imageUrl: string;
  title: string;
  shortContent: string;
  fullContent: string;
  createdAt: string;
}
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, OnDestroy {
  @ViewChild('newsDialog') newsDialog: any;
  
  partners = [
    { name: 'TOYOTA', image: 'https://logos-world.net/wp-content/uploads/2020/04/Toyota-Logo.png' },
    { name: 'HYUNDAI', image: 'https://hyundaiankhanh.vn/wp-content/uploads/2022/09/y-nghia-logo-hyundai.jpg' },
    { name: 'LEXUS', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvdnpaHwz28vdlLf-L14FxrDRyhad-dLKHeQ&s' },
    { name: 'MITSUBISHI', image: 'https://banner2.cleanpng.com/20180802/tis/93ab2819be4d519df77ba9e99d998e02.webp' },
    { name: 'HONDA', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
    { name: 'KIA', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3jE-rSCC1tz9wmA7vH9GnAxhSvRwAt_tS3A&s' },
    { name: 'PORSCHE', image: 'https://banner2.cleanpng.com/20180616/tfg/aa6hgdjs5.webp' },
    { name: 'SHARP', image: 'https://banner2.cleanpng.com/20180527/pli/avqya0slo.webp' },
    { name: 'ISUZU', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpVcoU-SAXSbSi9jmBo3KJw7O2Ew2-6EpO_w&s' },
    { name: 'YAMAHA', image: 'https://banner2.cleanpng.com/20180426/xqw/aveyo53j8.webp' },
    { name: 'MITSUBA', image: 'https://media.licdn.com/dms/image/v2/C4E0BAQHKVGccRZS2Jw/company-logo_200_200/company-logo_200_200/0/1631324389777?e=2147483647&v=beta&t=1GFW6LOHayN_z3VwRaY3Z_PuXLIbS_4Qa5irGtGVK3U' }
];

  

  feedbacks = [
    { text: "Green Line Logistics has proven to be flexible and dependable, constantly delivering exceptional transportation solutions.", author: "Julian Lambert", company: "Pacific Tech" },
    { text: "Their transparency and willingness to collaborate directly with our team have significantly enhanced our service quality.", author: "Cameron Jolley", company: "Priority One" },
    { text: "Green Line Logistics has been a partner we can truly trust for reliable and consistent service.", author: "Nathan Wright", company: "Arrive Logistics" },
    { text: "Green Line Logistics has been a partner we can truly trust for reliable and consistent service.", author: "Nathan Wright", company: "Arrive Logistics" },
    { text: "Green Line Logistics has been a partner we can truly trust for reliable and consistent service.", author: "Nathan Wright", company: "Arrive Logistics" },
    { text: "Green Line Logistics has been a partner we can truly trust for reliable and consistent service.", author: "Nathan Wright", company: "Arrive Logistics" },
    { text: "Green Line Logistics has been a partner we can truly trust for reliable and consistent service.", author: "Nathan Wright", company: "Arrive Logistics" },
  ];


  expandedNewsIndex: number | null = null;
  newsList: News[] = [];
  currentIndex = 0;
  startIndex = 0;
  private autoScrollInterval: any;
  private isHovered = false;
  private readonly SCROLL_INTERVAL = 50; // 50ms for smooth animation
  private readonly SCROLL_STEP = 0.5; // 0.5px per step
  private currentPosition = 0;
  private readonly ITEM_WIDTH = 256; // Width of each item including gap
  isMobile = false;
  itemsPerPageMobile = 2;
  itemsPerPageDesktop = 5;

  selectedNews: News | null = null;
  dialogRef: any;

constructor(
  private http: HttpClient,
  private dialog: MatDialog
){
  this.checkScreenSize();
  window.addEventListener('resize', () => this.checkScreenSize());
}
ngOnInit() {
  this.getNews();
  this.startAutoScroll();
}

ngOnDestroy() {
  this.stopAutoScroll();
  window.removeEventListener('resize', () => this.checkScreenSize());
}

checkScreenSize() {
  this.isMobile = window.innerWidth < 768;
}

get itemsPerPage() {
  return this.isMobile ? this.itemsPerPageMobile : this.itemsPerPageDesktop;
}

startAutoScroll() {
  if (!this.autoScrollInterval) {
    this.autoScrollInterval = setInterval(() => {
      if (!this.isHovered) {
        this.currentPosition += this.SCROLL_STEP;
        if (this.currentPosition >= this.ITEM_WIDTH) {
          this.currentPosition = 0;
          // Move first item to end
          const firstPartner = this.partners.shift();
          if (firstPartner) {
            this.partners.push(firstPartner);
          }
        }
        this.startIndex = this.currentPosition;
      }
    }, this.SCROLL_INTERVAL);
  }
}

stopAutoScroll() {
  if (this.autoScrollInterval) {
    clearInterval(this.autoScrollInterval);
    this.autoScrollInterval = null;
  }
}

getNews() {
  const headers = new HttpHeaders(environment.api.headers);

  this.http.get<News[]>(`${environment.api.url}/news`, { headers }).subscribe(
    (data) => {
      // Chỉnh sửa imageUrl để hiển thị ảnh hợp lệ nếu dữ liệu không phải URL
      this.newsList = data.map(news => ({
        ...news,
        imageUrl: this.isValidUrl(news.imageUrl) ? news.imageUrl : 'https://via.placeholder.com/300'
      }));
    },
    (error) => {
      console.error('Lỗi khi lấy dữ liệu tin tức:', error);
    }
  );
}


isValidUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
  get pagedFeedbacks() {
    return this.feedbacks;
  }

  toggleExpand(index: number) {
    this.expandedNewsIndex = this.expandedNewsIndex === index ? null : index;
  }

  next() {
    if (this.startIndex + this.itemsPerPage < this.partners.length) {
      this.startIndex += 1;
    } else {
      this.startIndex = 0; // Reset to beginning when reaching the end
    }
  }

  prev() {
    if (this.startIndex > 0) {
      this.startIndex -= 1;
    } else {
      this.startIndex = this.partners.length - this.itemsPerPage; // Go to end when at beginning
    }
  }

  // Pause auto-scroll when hovering over the partners section
  onPartnersHover(): void {
    // Animation is handled by CSS
  }

  // Resume auto-scroll when mouse leaves the partners section
  onPartnersLeave(): void {
    // Animation is handled by CSS
  }

  openNewsDialog(news: News): void {
    this.selectedNews = news;
    this.dialogRef = this.dialog.open(this.newsDialog, {
      width: '90%',
      maxWidth: '1200px',
      panelClass: 'news-dialog'
    });
  }

  closeNewsDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
