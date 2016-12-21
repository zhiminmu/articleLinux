/**
 * Created by xflin on 2016/1/25.
 */
importScripts("../lib/Decoder.js");
var AvcDecoder = (function () {
    var defaultConfig = {
        filter: "original",
        filterHorLuma: "optimized",
        filterVerLumaEdge: "optimized",
        getBoundaryStrengthsA: "optimized"
    };
    //var avc;// = new Avc();

    function AvcDecoder(worker) {
        var _this = this;
        this.index = 0;
        this.rgb_mode = false;
        this.frame_counter = 0;
        this.MAX_NALU_SIZE = 1024 * 1024;
        this.worker = worker;

        //this.avc = new Decoder();
        //this.avc.configure(defaultConfig);
        //this.avc.onPictureDecoded = onPictureDecoded;

        this.worker.onmessage = function (e) {
            _this._init(e.data);
        };
    }
    AvcDecoder.prototype._init = function (cfg) {
        var _this = this;
        if (cfg instanceof Uint8Array) {
            this._decode(cfg);
        }
        else {
            this.rgb_mode = cfg.rgb || false;
            this.index = cfg.index || 0;

            this.avc = new Decoder({rgb:this.rgb_mode,sliceMode:true,worker:this.worker});
            this.avc.onPictureDecoded = this._onPictureDecoded;
        }
        this.worker.onmessage = function (e) {
            _this._decode(e.data);
        };
    };
    AvcDecoder.prototype._decode = function (data,parInfo) {
        if(this.avc)
            this.avc.decode(data,parInfo);
    };
    AvcDecoder.prototype._onPictureDecoded=function(buffer, width, height, infos) {
        //document.getElementById('counter').innerHTML = ++frameN;
        // if(++frameN%5){
        // return;
        // }
        if(this.frame_counter <= 1) {
            this.worker.postMessage({ width: width, height:height });
        }

        this.worker.postMessage({ index: this.index, buf:buffer });
/*
        //this.frame_counter++;
        var numBytes = width*height*4;


        var outputData = new ArrayBuffer(numBytes);
        var outputDataU8 = new Uint8Array(outputData);
        //var outputData = ez_output.data;

        var lumaSize = width * height;
        var chromaSize = lumaSize >> 2;
        var pbBufY = buffer.subarray(0, lumaSize);
        var pbBufU = buffer.subarray(lumaSize, lumaSize + chromaSize);
        var pbBufV = buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize);

        for (var h=0;h<height;h++) {
            for (var w=0;w<width;w++) {
                var rgbPointer = h*width+w;
                var chIndex = Math.floor(h / 2) * Math.floor(width / 2) + Math.floor(w / 2);
                var yByte = pbBufY[h*width + w];
                var uByte = pbBufU[chIndex];
                var vByte = pbBufV[chIndex];

                outputDataU8[rgbPointer*4] = yByte + (vByte-128)*1.4075;
                outputDataU8[rgbPointer*4+1] = yByte - 0.3455*(uByte-128) - 0.7169*(vByte-128);
                outputDataU8[rgbPointer*4+2] = yByte + (uByte-128)*1.7790;
                outputDataU8[rgbPointer*4+3] = 255;

            };
        }

        this.worker.postMessage({ index: this.index, buf:outputDataU8 });
        //ez_context.putImageData(ez_output, 0, 0);

        //return;
*/
    };

    return AvcDecoder;
})();
new AvcDecoder(this);
