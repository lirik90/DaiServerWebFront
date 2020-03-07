import { Component, ViewChild, ElementRef, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ISubscription } from "rxjs/Subscription";

import { ByteMessage, ByteTools } from '../../../web-socket.service';
import { ControlService, WebSockCmd } from "../../control.service";
import { Device_Item } from '../../scheme';

@Component({
  selector: 'app-video-stream-dialog',
  templateUrl: './video-stream-dialog.component.html',
  styleUrls: ['./video-stream-dialog.component.css']
})
export class VideoStreamDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvas', { static: true })
    canvas: ElementRef<HTMLCanvasElement>;
  
    width: number = 800;
    height: number = 600;
    image_data: ImageData;
  
    timer_id: any;

    private ctx: CanvasRenderingContext2D;
  
    sub: ISubscription;
  
    constructor(
      private controlService: ControlService,
      public dialogRef: MatDialogRef<VideoStreamDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: Device_Item)
    {
      if (!data.val)
        return;
    }
  
    ngOnInit(): void {
        this.ctx = this.canvas.nativeElement.getContext('2d');
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
        this.sub = this.controlService.stream_msg.subscribe((msg: ByteMessage) => {
            if (msg.cmd == WebSockCmd.WS_STREAM_DATA) {
                this.draw_frame(msg.data);
            } else /*if (msg.cmd === WebSockCmd.WS_STREAM_TOGGLE)*/ {
                this.stream_toggled(msg.data);
            }
        });

        console.log("WebSockCmd.WS_STREAM_DATA", WebSockCmd.WS_STREAM_DATA);
        console.log("WebSockCmd.WS_STREAM_TOGGLE", WebSockCmd.WS_STREAM_TOGGLE);
        this.timer_id = setTimeout(() => this.stream_start_timeout(), 3000);
        this.controlService.stream_toggle(this.data.id, true);
    }

    ngOnDestroy(): void
    {
        this.controlService.stream_toggle(this.data.id, false);
        this.sub.unsubscribe();
    }

    ngAfterViewInit(): void {
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    draw_frame(data: ArrayBuffer): void 
    {
        let view = new Uint8Array(data);
        let pos = 0;
        const dev_item_id = ByteTools.parseUInt32(view, pos)[1]; pos += 4;
        if (this.data.id !== dev_item_id)
        {
            console.warn("Unknown stream device", dev_item_id, this.data.id);
            return;
        }

        // pos += 4; // QByteArray size
        const width = ByteTools.parseUInt32(view, pos)[1]; pos += 4;
        const height = ByteTools.parseUInt32(view, pos)[1]; pos += 4;

        if (this.width !== width || this.height !== height || !this.image_data)
        {
            this.width = width;
            this.height = height;
            this.image_data = this.ctx.createImageData(width, height);
            for (var i = 3; i < this.image_data.data.length; i += 4) {
                this.image_data.data[i] = 0xff;
            }
        }

        let img = this.image_data.data;
        for (var i = 0; i < img.length; i += 4) {
            img[i]     = view[pos]; // red
            img[i + 1] = view[pos + 1]; // green
            img[i + 2] = view[pos + 2]; // blue
            pos += 3;
        }
        this.ctx.putImageData(this.image_data, 0, 0, 0, 0, width, height);
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
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
