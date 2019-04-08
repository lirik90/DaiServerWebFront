import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { Codes } from '../../house';

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";
import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['../settings.css', './codes.component.css']
})
export class CodesComponent extends ChangeTemplate<Codes> implements OnInit {
  codes: Codes[];

  editorOptions = {theme: 'vs-dark', language: 'javascript'};
  editorApi: string = '';

  onEditorInit(editor)
  {
    if (!this.editorApi)
      return;
    (<any>window).monaco.languages.typescript.javascriptDefaults.addExtraLib([
      'declare class Dai_Api { static next():string }',
    ].join('\n'), 'filename/facts.d.ts');

    (<any>window).monaco.languages.typescript.javascriptDefaults.addExtraLib(this.editorApi, 'filename/api.d.ts');
    this.editorApi = null;
  }

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
    private settingsService: SettingsService,
  ) {
    super(StructType.Scripts, wsbService, houseService, Codes);
  }

  getObjects(): Codes[] {
    return this.codes;
  }

  ngOnInit() {
    this.generate_api();

    this.settingsService.getCodes().subscribe(codes => {
      this.codes = codes;
      this.fillGroupNames();
      this.fillItems();
    });
  }

  generate_api(): void
  {
    let types: any = { item: {}, group: {} };
    for (const t of this.houseService.house.itemTypes)  types.item[t.name] = t.id;
    for (const t of this.houseService.house.groupTypes) types.group[t.name] = t.id;

    var api_lines = ['var api = {',
    '  actDevice: function(group, type, newState, user_id) {},',
    '  findItem: function(items, func) {},',
    '  status: {}, checker: [],',
    '  mng: { sections: [], devices: [] },',
    '  type: ' + JSON.stringify(types) + ',',
    '};',];

    this.editorApi = api_lines.join('\n');
  }

  initItem(obj: Codes): void {
    obj.name = "";
  }

  saveObject(obj: Codes): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let text = ByteTools.saveQString(obj.text);
    let view = new Uint8Array(8 + name.length + text.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view, pos); pos += 4;
    view.set(name, pos); pos += name.length;
    ByteTools.saveInt32(obj.global_id, view, pos); pos += 4;
    view.set(text, pos); pos += text.length;
    return view;
  }

  name(obj: Codes): string
  {
    if (obj.name.length)
      return obj.name;
    return (<any>obj).d_name !== undefined ? (<any>obj).d_name : '<Empty>';
  }

  fillGroupNames(): void {
    for (let code of this.codes) {
      if (code.name.length <= 0) {
        for (const group_type of this.houseService.house.groupTypes) {
          if (code.id === group_type.code_id) {
            (<any>code).d_name = "Group: " + group_type.title;
            break;
          }
        }
      }
    }
  }

  code_select(item: ChangeInfo<Codes>): void
  {
    if (this.sel_item !== item && !item.obj.text)
      this.getCode(item);
    else
      this.select(item);
  }

  getCode(code: ChangeInfo<Codes>): void
  {
    this.settingsService.getCode(code.obj.id).subscribe(full_code => {
      const state = code.state;
      code.obj.text = full_code.text;
      this.select(code);
      code.state = state;
    });
  }

  code_save(evnt): void
  {
    for (const item of this.items)
    {
      if (item.state === ChangeState.Upsert)
      {
        this.code_item_save(item.obj);
      }
    }
    this.save(evnt);
  }
  
  code_item_save(code: Codes): void {
    this.settingsService.updateCode(code).subscribe(() => {
      console.log('code saved ' + code.id.toString());
    });
  }
}
