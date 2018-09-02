import { Component, Input, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ControlService } from "../control.service";
import { AuthenticationService } from "../../authentication.service";
import { DeviceItem, ItemTypeRegister } from '../house';

@Component({
  selector: 'app-dev-item-value',
  templateUrl: './dev-item-value.component.html',
  styleUrls: ['./dev-item-value.component.css']
})
export class DevItemValueComponent implements OnInit {

  @Input() item: DeviceItem;

  cantChange: boolean;
  is_toggle: boolean;
  is_holding: boolean;

  constructor(
    public dialog: MatDialog,
    private controlService: ControlService,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.cantChange = !this.authService.canChangeItemState();
    this.is_toggle = this.item.type.registerType == ItemTypeRegister.Coils;
    this.is_holding = this.item.type.registerType == ItemTypeRegister.HoldingRegisters;
  }

  get sign_available(): boolean {
    return !this.is_toggle && this.item.value !== null && this.item.type.sign !== undefined && this.item.type.sign.name.length > 0;
  }

  get text_value(): string {
    const val = this.item.value;
    if (val === undefined || val === null)
      return 'Не подключено';
    if (typeof(val) === 'object') {
      return val[this.item.raw_value];
    }
    return val;
  }

  write(value: number | boolean): void {
    if (value !== undefined)
      this.controlService.writeToDevItem(this.item.id, value);
  }

  openDialog(): void {
    if (this.cantChange || !this.is_holding)
      return;

    let dialogRef = this.dialog.open(HoldingRegisterDialogComponent, {
      width: '80%',
      data: this.item
    });

    dialogRef.afterClosed().subscribe(result => this.write(result));
  }
}

@Component({
  selector: 'app-holding-register-dialog',
  templateUrl: './holding-register-dialog.component.html',
  styleUrls: ['./dev-item-value.component.css']
})
export class HoldingRegisterDialogComponent {
  value: any;
  values: any[];
  private _max: number = 100;
  get max(): number {
    if (this.value > this._max)
      this._max = this.value;
    return this._max;
  }

  constructor(
    public dialogRef: MatDialogRef<HoldingRegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeviceItem) 
  {
    if (typeof(data.value) === 'object') {
      this.value = data.raw_value;
      this.values = data.value;
    }
    else
      this.value = data.value;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
