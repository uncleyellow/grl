import { NgModule } from '@angular/core';
import { TranslocoModule, TRANSLOCO_CONFIG, TRANSLOCO_LOADER } from '@ngneat/transloco';
import { HttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';

@NgModule({
  imports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: {
        availableLangs: ['en', 'tr', 'jb'], // Danh sách ngôn ngữ có sẵn
        defaultLang: 'en', // Ngôn ngữ mặc định
        reRenderOnLangChange: true, // Cho phép re-render khi thay đổi ngôn ngữ
        prodMode: false // Để `true` nếu muốn tắt log khi build production
      }
    },
    {
      provide: TRANSLOCO_LOADER,
      useClass: TranslocoHttpLoader
    }
  ],
  exports: [TranslocoModule]
})
export class TranslocoRootModule {}
