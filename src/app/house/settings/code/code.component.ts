import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { HouseService } from "../../house.service";
import { ControlService } from "../../control.service";
import { Codes } from '../../house';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.css']
})
export class CodeComponent implements OnInit {
  codes: Codes[];
  code: Codes;
  name: string;

  editorOptions = {theme: 'vs-dark', language: 'javascript'};

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
  ) { }

  ngOnInit() {
    this.getCodes();

    const codeId = +this.route.snapshot.paramMap.get('codeId');
    this.getCode(codeId);
  }

  fillGroupNames(): void {
    for (let code of this.codes) {
      if (code.name.length <= 0) {
        for (const group_type of this.houseService.house.groupTypes) {
          if (code.id === group_type.code_id) {
            code.name = "Group: " + group_type.title;
            break;
          }
        }
      }
    }

    if (this.code && !this.name)
      this.setCodeName();
  }

  setCodeName(): void {
    if (!this.codes || !this.code)
      return;

    for (let code of this.codes) {
      if (code.id == this.code.id) {
        this.name = code.name;
        break;
      }
    }
  }

  getCodes(): void {
    this.houseService.getCodes().subscribe(codes => { 
      this.codes = codes;
      this.fillGroupNames();
    });
  }

  getCode(codeId: number): void {
    if (codeId)
      this.houseService.getCode(codeId).subscribe(code => {
        this.code = code;
        this.setCodeName();
      });
  }

  save(): void {
    this.houseService.updateCode(this.code).subscribe(() => {
      this.controlService.changeCode(this.code);
      this.code = undefined;
    });
  }
}

@Component({
  selector: 'app-codes',
  template: '<ul><li *ngFor="let code of codes" routerLink="/house/{{houseId}}/settings/code/{{code.id}}">{{code.id}} {{code.name}}</li></ul>',
  //  styleUrls: ['./code.component.css']
})
export class CodesComponent implements OnInit {

  houseId: number;
  codes: Codes[];

  constructor(private houseService: HouseService) { }

  ngOnInit() {
    this.houseId = this.houseService.house.id;
    this.getCodes();
  }

  fillGroupNames(): void {
    for (let code of this.codes) {
      if (code.name.length <= 0) {
        for (const group_type of this.houseService.house.groupTypes) {
          if (code.id === group_type.code_id) {
            code.name = "Group: " + group_type.title;
            break;
          }
        }
      }
    }
  }

  getCodes(): void {
    this.houseService.getCodes().subscribe(codes => { 
      this.codes = codes;
      this.fillGroupNames();
    });
  }
}
