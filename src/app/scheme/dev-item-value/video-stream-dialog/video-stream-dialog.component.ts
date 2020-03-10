import { Component, ViewChild, ElementRef, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ISubscription } from "rxjs/Subscription";

import { ByteMessage, ByteTools } from '../../../web-socket.service';
import { ControlService, WebSockCmd } from "../../control.service";
import { Device_Item, Log_Value } from '../../scheme';

var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = (input.length/4) * 3;
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);

		return ab;
	},

	removePaddingChars: function(input){
		var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
		if(lkey == 64){
			return input.substring(0,input.length - 1);
		}
		return input;
	},

    decode: function (input, arrayBuffer: ArrayBuffer = undefined) {
		//get last chars to see if are valid
		input = this.removePaddingChars(input);
		input = this.removePaddingChars(input);

		var bytes = (input.length / 4) * 3;

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}

		return uarray;
	}
}

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
export class VideoStreamDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvas', { static: true })
    canvas: ElementRef<HTMLCanvasElement>;
  
    name: string;

    width: number = 800;
    height: number = 600;
    image_data: ImageData;
  
    timer_id: any;

    private ctx: CanvasRenderingContext2D;
  
    sub: ISubscription;
  
    constructor(
      private controlService: ControlService,
      public dialogRef: MatDialogRef<VideoStreamDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: VideoStreamParam)
    {
    }
  
    ngOnInit(): void {
        this.ctx = this.canvas.nativeElement.getContext('2d');
        if (this.data.isImg)
            this.fillImg();
        else
            this.initVideo();
    }

    fillImg(): void {
        const obj = (<any>this.data.img)
        this.name = (obj.item.name || obj.item.type.title) + ' ' + obj.date.toString();

        const data = this.data.img.raw_value.slice(4);
        const view = Base64Binary.decode(data);
        this.draw_img(view);
    }

    initVideo(): void {
        this.name = this.data.devItem.name || this.data.devItem.type.name;
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
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
        if (this.data.devItem.id !== dev_item_id)
        {
            console.warn("Unknown stream device", dev_item_id, this.data.devItem.id);
            return;
        }

        // pos += 4; // QByteArray size
        this.draw_img(view, pos);
    }

    draw_img(view: Uint8Array, pos: number = 0)
    {
        const width = ByteTools.parseUInt32(view, pos)[1]; pos += 4;
        const height = ByteTools.parseUInt32(view, pos)[1]; pos += 4;

        if (this.width !== width || this.height !== height || !this.image_data)
        {
            this.width = width;
            this.height = height;
            this.canvas.nativeElement.width = width;
            this.canvas.nativeElement.height = height;
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
