import {
  Component, ComponentFactory,
  ComponentFactoryResolver, ComponentRef,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {create1BitBitmap} from './bitmap';
import {DomSanitizer} from '@angular/platform-browser';
import {HouseService} from '../../house/house.service';

/*
@Component({
  selector: "alert",
  template: `Hello!`
})
class TestCompComponent {

}
 */

@Component({
  selector: 'app-label-configurator',
  templateUrl: './label-configurator.component.html',
  styleUrls: ['./label-configurator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LabelConfiguratorComponent implements OnInit {
  taps = [1, 2];

  layout = {
    title: {
      type: 'text'
    }
  };

  @ViewChild('previewContainer', { read: ViewContainerRef }) container;
  componentRef: ComponentRef<any>;

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

  opts = [
    {text: 'EAN-13', val: '1'},
    {text: 'Code-128', val: '2'},
    {text: 'QR', val: '3'},
  ];

  fields: any;
  imagePath: any;
  imgURL: any;
  constructor(
    private sanitizer: DomSanitizer,
    private houseService: HouseService,
  ) { }

  ngOnInit() {
    this.initFields();
    this.renderPreview();
  }
/*
  createComponent(type) {
    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(AlertComponent);
    this.componentRef = this.container.createComponent(factory);
  }

 */

  renderPreview() {

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

  private initFields() {
    const labelgrp = this.houseService.house.sections[1].groups.filter(g => g.type.name === 'label')[0];
    this.fields = labelgrp.params;
  }

  getField(fieldName: string) {
    return this.fields.filter(f => f.param.name === fieldName)[0];
  }

  changeField(f, val) {
    f.value = val;
  }

  getBarcodeType(fieldname: string) {
    const type = this.getField(fieldname).value;
    return type === '1' ? 'EAN13' : 'CODE128';
  }
}
