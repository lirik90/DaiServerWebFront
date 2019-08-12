import {Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';



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
  constructor() { }

  ngOnInit() { }

  getFields() {
    return Object.keys(this.fields);
  }

  test() {

  }
}
