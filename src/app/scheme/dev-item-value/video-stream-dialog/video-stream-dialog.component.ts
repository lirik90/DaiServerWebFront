import { Component, ViewChild, ElementRef, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISubscription } from "rxjs/Subscription";

import { ByteMessage, ByteTools } from '../../../web-socket.service';
import { ControlService, WebSockCmd } from "../../control.service";
import { Device_Item, Log_Value } from '../../scheme';

export interface VideoStreamParam {
    isImg: boolean;
    devItem: Device_Item;
    img: Log_Value;
}

@Component({
  selector: 'app-video-stream-dialog',
  templateUrl: './video-stream-dialog.component.html',
  styleUrls: ['./video-stream-dialog.component.css']
})
export class VideoStreamDialogComponent implements OnInit, OnDestroy {
    @ViewChild('image', { static: true })
    img: ElementRef;
  
    name: string;

    width: number = 800;
    height: number = 600;
    image_data: ImageData;
  
    timer_id: any;

    sub: ISubscription;
  
    constructor(
      private controlService: ControlService,
      public dialogRef: MatDialogRef<VideoStreamDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: VideoStreamParam)
    {
    }
  
    ngOnInit(): void {
        if (this.data.isImg)
            this.fillImg();
        else
            this.initVideo();
    }

    fillImg(): void {
        const obj = (<any>this.data.img)
        this.name = (obj.item.name || obj.item.type.title) + ' ' + obj.date.toString();

        const jpeg_str = atob(this.data.img.raw_value.slice(4)); // 4 is "img:AAAAaa..."
        const jpeg_data = new Uint8Array(jpeg_str.length);
        for (let i = 0; i < jpeg_str.length; ++i)
            jpeg_data[i] = jpeg_str[i].charCodeAt(0);
        this.set_data(jpeg_data);
    }

    initVideo(): void {
        this.name = this.data.devItem.name || this.data.devItem.type.name;
    
        this.sub = this.controlService.stream_msg.subscribe((msg: ByteMessage) => {
            if (msg.cmd == WebSockCmd.WS_STREAM_DATA) {
                this.draw_frame(msg.data);
            } else /*if (msg.cmd === WebSockCmd.WS_STREAM_TOGGLE)*/ {
                this.stream_toggled(msg.data);
            }
        });

        this.timer_id = setTimeout(() => this.stream_start_timeout(), 3000);
        this.controlService.stream_toggle(this.data.devItem.id, true);
    }

    ngOnDestroy(): void
    {
        if (!this.data.isImg) {
            this.controlService.stream_toggle(this.data.devItem.id, false);
            this.sub.unsubscribe();
        }
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    draw_frame(data: ArrayBuffer): void 
    {
        let view = new Uint8Array(data);
        let pos = 0;
        const dev_item_id = ByteTools.parseUInt32(view, pos)[1]; pos += 4;
        if (this.data.devItem.id !== dev_item_id)
        {
            console.warn("Unknown stream device", dev_item_id, this.data.devItem.id);
            return;
        }

        const jpeg_data = view.slice(4);
        this.set_data(jpeg_data);
    }

    set_data(jpeg_data: Uint8Array): void
    {
        const blob = new Blob( [ jpeg_data ], { type: "image/jpeg" } );
        const url_creator = window.URL || window.webkitURL;
        const image_url = url_creator.createObjectURL( blob );
        this.img.nativeElement.src = image_url;
    }

    stream_toggled(data: ArrayBuffer): void 
    {
        let view = new Uint8Array(data);
        let pos = 0;
        const user_id = ByteTools.parseUInt32(view, pos)[1]; pos += 4;
        const dev_item_id = ByteTools.parseUInt32(view, pos)[1]; pos += 4;
        const state = view[pos] == 1; pos += 1;

        console.log("Stream toggled:", dev_item_id, state);

        if (state)
            clearTimeout(this.timer_id);
    }

    stream_start_timeout(): void
    {
    }
}
