import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CloudFlareService } from 'src/app/core/Services/cloud-flare.service';

declare var Plyr: any;

@Component({
  selector: 'app-plyr',
  templateUrl: './plyr.component.html',
  styleUrl: './plyr.component.scss'
})
export class PlyrComponent implements AfterViewInit {

  constructor(private cloudServ: CloudFlareService) { }
  player: any;



  ngAfterViewInit() {
    this.player = new Plyr('#video_player', {
      cloudflare: {
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        customControls: true,
        noCookie: true,

        disableContextMenu: true
      }
    });
    // this.player = new Plyr('#video_player', {
    //   disableContextMenu: true

    // });

    this.player.source = {
      type: 'video',
      sources: [
        {
          // src:'https://customer-yznak3b6nkt75kru.cloudflarestream.com/233f0ddc88ee74223282bea18284830d/downloads/default.mp4'
          // src: 'https://customer-yznak3b6nkt75kru.cloudflarestream.com/eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1ZWUxYTExZTM3ODUzZGM0NjBjOGU5MTI2Y2QyYWU4In0.eyJzdWIiOiIyMzNmMGRkYzg4ZWU3NDIyMzI4MmJlYTE4Mjg0ODMwZCIsImtpZCI6IjQ1ZWUxYTExZTM3ODUzZGM0NjBjOGU5MTI2Y2QyYWU4IiwiZXhwIjoiMTczMTk1Njk5OSIsIm5iZiI6IjE3MzE5NDk3OTkifQ.H_FNRz-XciukrWAc82R4vMJsGa8ZirCTits2o5jV52qZdeNjl_5vmtrBmC9g76N14RKJ3XwJ9daxChgofXsbQwmNiMye_p45hTPuRP_t-bfFS7EPG1LwxQBgDuatrBLdeO_U7GjXbE9tcoEhr9pWt3Q-WqHXgsEhBlEkrw_J1rXP0uGLdEQ8ddFqGP3EsCHMcHgntkEEsgs939_pWtj99rprCnEKXXiSyoe77qK_IjRI34Sxara3aeo7KI38lL-dKXJ1hNkTaVQtRpyrLNBZD3xgZK-IjbcO-bkL13FElwUbPcE-229LFI3Ns7ONO7pymWkA3NN4WDeEDdsW0xRSlA',
          src: 'https://customer-yznak3b6nkt75kru.cloudflarestream.com/eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1ZWUxYTExZTM3ODUzZGM0NjBjOGU5MTI2Y2QyYWU4In0.eyJzdWIiOiIyMzNmMGRkYzg4ZWU3NDIyMzI4MmJlYTE4Mjg0ODMwZCIsImtpZCI6IjQ1ZWUxYTExZTM3ODUzZGM0NjBjOGU5MTI2Y2QyYWU4IiwiZXhwIjoiMTczMTk2ODQ5NiIsIm5iZiI6IjE3MzE5NjEyOTYifQ.fhAVtys7E-KsYPrVYhNs3IV-P9F95QG_ofjCR2HKW2SLjPH7vJ21BtMnrTrVpRcSf4-m-26RibiO1509iDimfLYtL9MQwI10Aq92xXXO529CmhC9WUSLVjNTX8877CM1cTxI_TvTYUD5uecPKpINNIfwa6wvP4njzk9x4uaC7Szu1XskWG4kspTeEMUZR4dqHP9YS0SBiVkAb0dWgFqcMhiWeFub-BISiMdm_dm8T5TXp3bAAE2ckNvpoQTSKxbJ0OMe9jcUj063KL3nAldITCA2oc-etfLtt_emGBC_0LrVEYKnmpkA4iLfqKrHGxMDoVgK3aGZhXX3dvzlD2gMQw/downloads/default.mp4',

          // src: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1ZWUxYTExZTM3ODUzZGM0NjBjOGU5MTI2Y2QyYWU4In0.eyJzdWIiOiIyMzNmMGRkYzg4ZWU3NDIyMzI4MmJlYTE4Mjg0ODMwZCIsImtpZCI6IjQ1ZWUxYTExZTM3ODUzZGM0NjBjOGU5MTI2Y2QyYWU4IiwiZXhwIjoiMTczMjAxMDcyMSIsIm5iZiI6IjE3MzIwMDM1MjEifQ.gfgUK6v3k1A2-T6NpUr2_9kvE24RjbIkd2i5P-LFIgv9bFbeu7NOo3_dsGqCjFj9GgF0UW1RibntwRYDWGOlfbsUB4lo3WZwYHq59h-iKMW9mHgTvj7Bs4MTeyHKASq-m6D3DtyQFUdhw37DExbqld3iiMhwur0y8Ed17MrB3OaJF5Q3Zu0qMl68tt51okb5gNsi7NnETTwW5z86XbxGXMRBG8wn7KcIxJo6rTp-BEOaXiP0BR-kIAwj3PPmyLSUUxAhIAHI9_udkJPqIk12xrGO-ZcbIFNodrm2S_xb5bwcfb2Zyiw34UV0QExHVs8_18rlWCs15OJCjwx0yP2cKA.mp4'
          type: 'video/mp4'

        },
      ]
    };

    this.player.on('ended', () => {
      this.player.stop()
    });
  }
}