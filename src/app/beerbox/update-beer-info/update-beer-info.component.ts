import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Section, DeviceItem, ParamValue } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service"
import { filter } from 'rxjs/operators';

export interface DialogData 
{
  title: string;
  storage_conditions: string;
  product_composition: string;
  more_details: string;
  product_code: string;
  product_code_type: number;
}

@Component({
  selector: 'app-update-beer-info',
  templateUrl: './update-beer-info.component.html',
  styleUrls: ['../../sections.css', './update-beer-info.component.css']
})
export class UpdateBeerInfoComponent implements OnInit 
{
  items: any[] = [];
  
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
      let label: any = { sct };
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
              case 'title':                label.title = param;                  break;
              case 'storage_conditions':   label.storage_conditions = param;     break;
              case 'product_composition':  label.product_composition = param;    break;
              case 'more_details':         label.more_details = param;            break;
              case 'product_code':         label.product_code = param;           break;
              case 'product_code_type':    label.product_code_type = param;      break;
            }
		      }
        } 		    
      }
      if (label.title !== undefined &&
          label.storage_conditions !== undefined &&
          label.product_composition !== undefined &&
          label.more_details !== undefined &&
          label.product_code !== undefined &&
          label.product_code_type !== undefined)
	    {
        this.items.push(label);
	    }
    }
  }

  click_print_sample(item: any): void
  {
    if (item.print_sample != undefined)
    {
      let value = item.print_sample.raw_value;
      if (value !== undefined)
	    {
        this.controlService.writeToDevItem(item.print_sample.id, value);
	    }
    }    
  }
  
  click_edit(item: any): void
  {
    this.dialog.open(EditDialogUpdateBeerInfoComponent, 
                     {width: '80%', data: {title: item.title.value,
                                           storage_conditions: item.storage_conditions.value,
                                           product_composition: item.product_composition.value,
                                           more_details: item.more_details.value,
                                           product_code: item.product_code.value,
                                           product_code_type: item.product_code_type.value}})
    .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
      item.title.value = res.title;
      item.storage_conditions.value = res.storage_conditions;
      item.product_composition.value = res.product_composition;
      item.more_details.value = res.more_details;
      item.product_code.value = res.product_code;
      item.product_code_type.value = res.product_code_type;
      
      let params: ParamValue[] = [];
      params.push(item.title);
      params.push(item.storage_conditions);
      params.push(item.product_composition);
      params.push(item.more_details);
      params.push(item.product_code);
      params.push(item.product_code_type);
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
