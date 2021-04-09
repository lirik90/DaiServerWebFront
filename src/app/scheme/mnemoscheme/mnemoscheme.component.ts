import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SchemeService} from '../scheme.service';
import {Device_Item, Mnemoscheme} from '../scheme';
import {ControlService} from '../control.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-mnemoscheme',
    templateUrl: './mnemoscheme.component.html',
    styleUrls: ['./mnemoscheme.component.css']
})
export class MnemoschemeComponent implements OnInit {
    @ViewChild('svgElement', { read: ElementRef }) svg: ElementRef<SVGElement>;

    selected: number;
    mnemoscheme: Mnemoscheme[];
    private updateValues$: Subscription;

    constructor(private controlService: ControlService, private schemeService: SchemeService) {
    }

    ngOnInit(): void {
        this.schemeService.getMnemoscheme()
            .subscribe(r => {
                this.mnemoscheme = r;
                if (this.mnemoscheme.length > 0) {
                    this.select(this.mnemoscheme[0].id);
                }
            });
    }

    select(id: number) {
        if (this.updateValues$) {
            this.updateValues$.unsubscribe();
        }

        this.selected = id;

        this.schemeService.getMnemoschemeImage()
            .subscribe((text) => {
                this.svg.nativeElement.innerHTML = text;
                setTimeout(() => {
                    this.updateValues();
                    this.updateValues$ = this.controlService.dev_item_changed.subscribe(() => this.updateValues());
                }, 100);
            });
    }

    private updateValues() {
        // console.group('#updateValues');
        const imgItems = document.querySelectorAll('[data-device-item-id]');
        imgItems.forEach((elem) => {
            const devItemId = +elem.getAttribute('data-device-item-id');
            const isCssAnim = elem.hasAttribute('data-css-anim-if-value');
            const isSmilAnim = elem.hasAttribute('data-smil-anim-if-value');
            const isShow = elem.hasAttribute('data-show-if-value');
            const isValueBinding = elem.hasAttribute('data-value');

            const devItem = this.schemeService.devItemById(devItemId);
            const { value } = devItem.val;

            // console.log(devItem.name || devItem.type.title || devItem.type.name, value);

            if (isCssAnim) {
                const cssAnimEnableValue = elem.getAttribute('data-css-anim-if-value');
                if (cssAnimEnableValue == value) {
                    // console.log('Start CssAnim');
                    MnemoschemeComponent.startCssAnimation(elem);
                } else {
                    // console.log('Stop CssAnim');
                    MnemoschemeComponent.stopCssAnimation(elem);
                }
            }

            if (isSmilAnim) {
                const smilAnimEnableValue = elem.getAttribute('data-smil-anim-if-value');
                if (smilAnimEnableValue == value) {
                    // console.log('Start SMIL');
                    MnemoschemeComponent.startSmilAnimation(elem);
                } else {
                    // console.log('Stop SMIL');
                    MnemoschemeComponent.stopSmilAnimation(elem);
                }
            }

            if (isShow) {
                const showIfValue = elem.getAttribute('data-show-if-value');
                if (showIfValue == value) {
                    // console.log('Show');
                    MnemoschemeComponent.showElement(elem);
                } else {
                    // console.log('Hide');
                    MnemoschemeComponent.hideElement(elem);
                }
            }

            if (isValueBinding) {
                let binding = '';
                if (!value) {
                    binding = '?';
                } else {
                    const sign = devItem.type.sign?.name || '';
                    binding = `${value}${sign}`;
                }

                elem.innerHTML = binding;
            }
        });

        // console.groupEnd();
    }

    private static startCssAnimation(elem: Element) {
        const animations = elem.getAnimations();
        animations.forEach(anim => {
            if (anim.playState !== 'running') {
                anim.play();
            }
        });
    }

    private static stopCssAnimation(elem: Element) {
        const animations = elem.getAnimations();
        animations.forEach(anim => anim.cancel());
    }

    private static startSmilAnimation(elem: Element) {
        elem.childNodes.forEach((child) => {
            if (child.nodeName.indexOf('animate') >= 0) {
                const anim = child as SVGAnimationElement;
                if (!anim.hasAttribute('data-anim-started')) {
                    anim.setAttribute('data-anim-started', '1');
                    (<any>anim).beginElement();
                }
            }
        });
    }

    private static stopSmilAnimation(elem: Element) {
        elem.childNodes.forEach((child) => {
            if (child.nodeName.indexOf('animate') >= 0) {
                const anim = child as SVGAnimationElement;
                if (anim.hasAttribute('data-anim-started')) {
                    anim.removeAttribute('data-anim-started');
                    (<any>anim).endElement();
                }
            }
        });
    }

    private static showElement(elem: Element) {
        elem.classList.remove('hidden');
    }

    private static hideElement(elem: Element) {
        elem.classList.add('hidden');
    }
}
