import {Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {create1BitBitmap} from './bitmap';
import {DomSanitizer} from '@angular/platform-browser';



@Component({
  selector: 'app-label-configurator',
  templateUrl: './label-configurator.component.html',
  styleUrls: ['./label-configurator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LabelConfiguratorComponent implements OnInit {
  taps = [1, 2];

  fields2 = {
    text1: {
      label: 'Название',
      content: 'Пиво Сибирская Корона 1л'
    },
    text2: {
      label: 'Информация',
      content: 'Креп. 5.3% Плот. 12%'
    },
    ean: {
      label: 'EAN',
      type: 'barcode',
      bcformat: 'EAN13',
      content: '211718101006'
    }
  };

  fields = {
    text1: {
      label: 'Название',
      content: 'ПИВО СВЕТЛ. Дон Живое Светлое Пастеризованное'
    },
    text2: {
      label: 'Условия хранения',
      content: 'от 4C до 15С.'
    },
    text3: {
      label: 'Состав',
      content: 'вода питьевая очищенная, солод ячменный светлый, ячмень пивоваренный, хмелепродукты, солодовый экстракт. ' +
        'Алкоголь 4,0% об. Экстракт начального сусла 10,5%. Содержание этилового спирта, образовавшегося в процессе брожения пивного ' +
        'сусла: 4,0мл/100мл и 40мл/1л пива. Пищевая ценность в 100мл пива (средн. значения): углеводов - 3,5г. Энергетическая ' +
        'ценность (калорийность): 170кДж (40ккал)'
    },
    text4: {
      label: 'Дополнительная информация',
      content: 'Качество продукции обеспечивается системой менеджмента качества, сертифицированной по международному стандарту ISO 9001\n' +
        'ТУ9184-200-01824944-2014 ЧРЕЗМЕРНОЕ УПОТРЕБЛЕНИЕ АЛКОГОЛЯ ВРЕДИТ ВАШЕМУ ЗДОРОВЬЮ Алкоголь противопоказан детям и подросткам' +
        ' до 18 лет, беременным и кормящим женщинам, лицам с заболеваниями центральной нервной системы, почек, печени и других органов' +
        'пищеварения. Содержание в продукции вредных для здоровья веществ не превышает допустимого уровня, установленнго ' +
        'ТР ТС 021.2011 "О безопасности пищевой продукции".'
    },
    text5: {
      label: 'Объем налива',
      content: '1л.'
    },
    code: {
      label: 'Штрихкод',
      type: 'barcode',
      bcformat: 'CODE128',
      content: '4600682008569'
    },
  };
  imagePath: any;
  imgURL: any;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    // this.imgURL = this.sanitizer.bypassSecurityTrustUrl(test());
  }

  getFields() {
    return Object.keys(this.fields);
  }

  toBase64(bmp): string {
    let base64cnt = '';
    for (let i = 0; i < bmp.length; i++) {
      base64cnt += String.fromCharCode(bmp[i]);
    }

    return 'data:image/x-ms-bmp;base64,' + btoa(base64cnt);
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    this.imagePath = files;

    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;

      const imageObj = new Image();
      imageObj.src = this.imgURL;

      imageObj.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = imageObj.width;
        canvas.height = imageObj.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);


        const pixels = ctx.getImageData(0, 0, imageObj.width, imageObj.height);

        for (let y = 0; y < imageObj.height; ++y) {
          for (let x = 0; x < imageObj.width; ++x) {
            const pos = (y * imageObj.width + x) * 4;

            const r = pixels.data[pos] / 255.0;
            const g = pixels.data[pos + 1] / 255.0;
            const b = pixels.data[pos + 2] / 255.0;

            // linear grayscale
            const c_linear = 0.2126 * r + 0.7152 * g + 0.0722 * b;
/*
            // threshold
            const t = Math.round(c_linear);

            const newPixelVal = Math.round(t * 255);

            pixels.data[pos] = newPixelVal;
            pixels.data[pos + 1] = newPixelVal;
            pixels.data[pos + 2] = newPixelVal;
            pixels.data[pos + 4] = 255;
            */

            pixels[pos] = c_linear < 0.5 ? 0 : 1;
          }
        }

        const bmp = create1BitBitmap(pixels); // from the red channel

        this.imgURL = this.sanitizer.bypassSecurityTrustUrl(this.toBase64(bmp));
      };
    };
  }
}
