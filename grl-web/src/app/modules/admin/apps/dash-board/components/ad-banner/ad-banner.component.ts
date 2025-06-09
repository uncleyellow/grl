import { Component, OnInit } from '@angular/core';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

@Component({
  selector: 'app-ad-banner',
  template: `
    <div class="ad-container">
      <!-- AdSense Ad Unit -->
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
           data-ad-slot="YOUR_AD_SLOT_ID"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  `,
  styles: [`
    .ad-container {
      width: 100%;
      min-height: 100px;
      margin: 20px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class AdBannerComponent implements OnInit {
  constructor() { }

  ngOnInit() {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Error loading AdSense:', e);
    }
  }
} 