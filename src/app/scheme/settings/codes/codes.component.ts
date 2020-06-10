import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs';

import { SchemeService } from '../../scheme.service';
import { Codes } from '../../scheme';

import { ByteTools, WebSocketBytesService } from '../../../web-socket.service';

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from '../settings';
import { SettingsService } from '../settings.service';

import { WebSockCmd } from '../../control.service';
import { MatPaginator } from '@angular/material/paginator';

import { MetadataService } from './services/metadata.service';

@Component({
  selector: 'app-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['../settings.css'/*, '../../../../assets/anonymous/stylesheet.css'*/, './codes.component.css']
})
export class CodesComponent extends ChangeTemplate<Codes> implements OnInit {
  codes: Codes[];

    metadata$ = this.metadataService.getMetadata();

  @ViewChild('codeEditor', {static: true}) editor;
  private newOpened = false;

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
    private settingsService: SettingsService,
      private metadataService: MetadataService
  ) {
    super(StructType.Scripts, wsbService, schemeService, Codes);
  }

  getObjects(): Codes[] {
    return this.codes;
  }

  ngOnInit() {
    this.settingsService.getCodes().subscribe(codes => {
      this.codes = codes;
      this.fillItems();
    });
  }

  initItem(obj: Codes): void {
    obj.name = '';
  }

  saveObject(obj: Codes): Uint8Array {
    const name = ByteTools.saveQString(obj.name);
    const text = ByteTools.saveQString(obj.text, false);
    const view = new Uint8Array(8 + name.length + text.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view, pos); pos += 4;
    view.set(name, pos); pos += name.length;
    ByteTools.saveInt32(obj.global_id, view, pos); pos += 4;
    view.set(text, pos); pos += text.length;
    return view;
  }

  name(obj: Codes): string {
    if (obj.name.length) {
      return obj.name;
    }
    return (<any>obj).d_name !== undefined ? (<any>obj).d_name : '<Empty>';
  }

  code_select(item: ChangeInfo<Codes>): void {
    if (this.sel_item !== item && !item.obj.text) {
      this.getCode(item);
    } else {
      this.select(item);
    }
  }

  select(item: ChangeInfo<Codes>): void {
    super.select(item);

    if (item.obj.text) {
      this.editor.setText(this.sel_item.obj.text);
      this.newOpened = true;
    }
  }

  getCode(code: ChangeInfo<Codes>): void {
    this.settingsService.getCode(code.obj.id).subscribe(full_code => {
      const state = code.state;
      code.obj.text = full_code.text;
      this.select(code);
      code.state = state;
    });
  }

  code_save(evnt): void {
    const code_arr: Observable<any>[] = [];

    for (const item of this.items) {
      if (item.state === ChangeState.Upsert) {
        if (item.obj.id) {
          code_arr.push(this.settingsService.updateCode(item.obj));
        } else {
          console.error('Insert code isn\'t implemented');
        }
      } else if (item.state === ChangeState.Delete) {
        console.error('Delete code isn\'t implemented');
      }
    }

    if (code_arr.length) {
      forkJoin(...code_arr).subscribe(() => {
        this.save2(evnt);
      });
    } else {
      console.warn('code_arr empty');
      this.save2(evnt);
    }

    const elem = document.getElementById('editor-pane');
    elem.classList.remove('editor-pane-fullscreen');

    this.editor.adjustSize();
    setTimeout(() => { this.editor.adjustSize(); }, 200);
  }

  fullscreenToggle() {
    const elem = document.getElementById('editor-pane');
    elem.classList.toggle('editor-pane-fullscreen');

    this.editor.adjustSize();
    setTimeout(() => { this.editor.adjustSize(); }, 200);

    /*
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    */
  }

  wasChanged() {
    if (this.newOpened) {
      this.newOpened = false;
      return;
    }

    this.sel_item.obj.text = this.editor.script;
    this.itemChanged();
  }
}
