import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Section, DeviceItem, ParamValue } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service"
import { filter } from 'rxjs/operators';

export interface DialogData 
{
  title: ParamValue;
  storage_conditions: ParamValue;
  product_composition: ParamValue;
  more_details: ParamValue;
  product_code: ParamValue;
  product_code_type: ParamValue;
  volume: ParamValue;
}

export interface UpdateBeerInfo
{
  sct: Section;
  print_sample: DeviceItem;
  data: DialogData;
}

@Component({
  selector: 'app-update-beer-info',
  templateUrl: './update-beer-info.component.html',
  styleUrls: ['../../sections.css', './update-beer-info.component.css']
})
export class UpdateBeerInfoComponent implements OnInit 
{
  items: UpdateBeerInfo[] = [];
  
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService) { }

  ngOnInit() 
  {
    this.get_info();
  }
  
  get_info(): void
  {
    let is_first: boolean = true;
    for (let sct of this.houseService.house.sections) 
	  {
      if (is_first) 
	    {
        is_first = false;
        continue;
      }
      let data: DialogData = {} as DialogData;
      let label: UpdateBeerInfo = { sct: sct, data: data } as UpdateBeerInfo;
      for (let group of sct.groups) 
	    {
        if (group.type.name == 'label') 
		    { 
          for (let item of group.items)
		      {
            if (item.type.name == 'print_sample')
            {
              label.print_sample = item;
              break;
            }
        }
          for (let param of group.params)
		      {
            switch(param.param.name) 
			      {
              case 'title':                label.data.title = param;                  break;
              case 'storage_conditions':   label.data.storage_conditions = param;     break;
              case 'product_composition':  label.data.product_composition = param;    break;
              case 'more_details':         label.data.more_details = param;            break;
              case 'product_code':         label.data.product_code = param;           break;
              case 'product_code_type':    label.data.product_code_type = param;      break;
              case 'volume':               label.data.volume = param;      break;
            }
		      }
        } 		    
      }
      if (label.data.title !== undefined &&
          label.data.storage_conditions !== undefined &&
          label.data.product_composition !== undefined &&
          label.data.more_details !== undefined &&
          label.data.product_code !== undefined &&
          label.data.product_code_type !== undefined&&
          label.data.volume !== undefined)
	    {
        this.items.push(label);
	    }
    }
  }

  click_print_sample(item: UpdateBeerInfo): void
  {
    if (item.print_sample != undefined)
    {
      let value = item.print_sample.val.raw;
      if (value !== undefined)
	    {
        this.controlService.writeToDevItem(item.print_sample.id, value);
	    }
    }    
  }
  
  click_edit(item: UpdateBeerInfo): void
  {

    let dialog_data: DialogData = {
      title: Object.assign({}, item.data.title),
      storage_conditions: Object.assign({}, item.data.storage_conditions),
      product_composition: Object.assign({}, item.data.product_composition),
      more_details: Object.assign({}, item.data.more_details),
      product_code: Object.assign({}, item.data.product_code),
      product_code_type: Object.assign({}, item.data.product_code_type),
      volume: Object.assign({}, item.data.volume),
    } as DialogData;

    this.dialog.open(EditDialogUpdateBeerInfoComponent, 
                     {width: '80%', data: dialog_data})
    .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
      item.data.title.value = res.title.value;
      item.data.storage_conditions.value = res.storage_conditions.value;
      item.data.product_composition.value = res.product_composition.value;
      item.data.more_details.value = res.more_details.value;
      item.data.product_code.value = res.product_code.value;
      item.data.product_code_type.value = res.product_code_type.value;
      item.data.volume.value = res.volume.value;
      
      let params: ParamValue[] = [];
      params.push(item.data.title);
      params.push(item.data.storage_conditions);
      params.push(item.data.product_composition);
      params.push(item.data.more_details);
      params.push(item.data.product_code);
      params.push(item.data.product_code_type);
      params.push(item.data.volume);
      this.controlService.changeParamValues(params);
      
    });
  }
}

@Component({
  selector: 'app-edit-dialog-update-beer-info',
  templateUrl: './edit-dialog-update-beer-info.component.html',
  styleUrls: ['./update-beer-info.component.css'],
})

export class EditDialogUpdateBeerInfoComponent
{
  item: DialogData;
  
  constructor(
    public dialogRef: MatDialogRef<EditDialogUpdateBeerInfoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) 
  {
    this.item = data;
  }
}
