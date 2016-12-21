/**
 * Created by xflin on 2015/12/30.
 * xflin@cellcom.com.cn
 */
 var UserChannel = {

    /**
     *
     * @param cfg
     *     var cfg = {};
     *     cfg.mmid = 1000001;
     *     cfg.selfmmid = 0;
     *     cfg.confjid = "50001@slavemcu23";
     *     cfg.jid="guest@192.168.7.124";
     *     cfg.nick="guest";
     *
     *     cfg.vUrl = "ws://192.168.7.124:8888/red5WebSocket"
     *     cfg.aUrl = "ws://192.168.7.124:8888/red5WebSocket"
     * @constructor
     */
    createNew: function(cfg){
        var channel = {};

        var _config;
        var _vSockWorker;
        var _aSockWorker;
        //var _vSockStatus,_aSockStatus;
        var _vPublishStatus;
        var _aPublishStatus;

        var _socketEventFun;

        //catch audio/video parameters
        var _initPublishStatus = false;
        var _initPlayVideoStatus = false;
        var _initPublishVideoStatus = false;
        var _initPlayAudioStatus = false;
        var _initPublishAudioStatus = false;

        var _cfgMedia ={};
        _cfgMedia["play_scale"] = 0.5;//0.25|0.5|0.75|1
        _cfgMedia["keyint"] = 40;
        _cfgMedia["capture_scale"] = 0.5;//0.25|0.5|0.75|1
        _cfgMedia["encoder"] = "x264"; // "x264" | "openh264"
        _cfgMedia["renderer"] = "rgb";//(!window.WebGLRenderingContext) ? "rgb" : "webgl" ; // "webgl" | "rgb"
        /**preset
         *     <option value="ultrafast" selected>UltraFast</option>
         *     <option value="superfast">SuperFast</option>
         *     <option value="veryfast">VeryFast</option>
         *     <option value="faster">Faster</option>
         *     <option value="fast">Fast</option>
         *     <option value="medium">Medium</option>
         *     <option value="slow">Slow</option>
         *     <option value="slower">Slower</option>
         *     <option value="veryslow">VerySlow</option>
         *     <option value="placebo">Placebo</option>
         */
        _cfgMedia["preset"] = "ultrafast";
        /**
         * x264tune
         *          <select id="x264tune" name="x264tune">
         *            <option value="" selected>default</option>
         *            <option value="film">film</option>
         *            <option value="animation">animation</option>
         *            <option value="grain">grain</option>
         *            <option value="stillimage">stillimage</option>
         *            <option value="psnr">psnr</option>
         *            <option value="ssim">ssim</option>
         *            <option value="fastdecode">fastdecode</option>
         *            <option value="zerolatency">zerolatency</option>
         *          </select>
         */
        _cfgMedia["tune"] = "";

        _cfgMedia["crf"] = 23;//x264quality 0-51
        _cfgMedia["bitrate"] = 1000;//x264bitrate  0 - 300000

        var audiosrc;
        var videosrc;// = document.getElementById("videosrc");
        var canvas_src;// = document.getElementById("canvas_src");
        var canvas_src_ctx;// = this.canvas_src.getContext("2d");
        var canvas_dst;// = [];

        var encoder = null;
        var decoder = null;
        var renderer = null;
        var renderer_initialized = false;

        var decoder_width;
        var decoder_height;

        var audioRecorder = null;
        var audioCodec = null;
        var audio_context;


        var intervalVideoCatch = 1000 / 10 - 10;
        var prev_video_time = 0;
        var seqVideo=0;
        var seqAudio=0;
        var queued_frames=0;
        var max_queued_frames=0;

        var a = 100/0x8000;

        window.URL = (window.URL || window.webkitURL);
        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        window.AudioContext = (window.AudioContext || window.webkitAudioContext);
        window.BlobBuilder = (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder);


        channel.reset = function() {
            _vSockWorker = {};
            _aSockWorker = {};
            _vSockWorker.status = false;
            _aSockWorker.status = false;
            _vPublishStatus = false;
            _aPublishStatus = false;
        };

        channel.destroy = function() {
            _vPublishStatus = false;
            _aPublishStatus = false;

            console.log(_vSockWorker);
            channel.closeSocketWork(_vSockWorker);
            console.log(_aSockWorker);
            channel.closeSocketWork(_aSockWorker);
            _vSockWorker = null;
            _aSockWorker = null;

            if(encoder) {
                encoder.terminate();
            }
            if(decoder) {
                decoder.terminate();
            }

        };

        channel.setSocketEvent=function(fun) {
            _socketEventFun = fun;
        };

        channel.getMmid = function() {
            if(_config)
                return _config.mmid;

            return 0;
        };

        channel.getVStatus = function() {
            if(_vSockWorker)
                return _vSockWorker.status;

            return false;
        };
        channel.getAStatus = function() {
            if(_aSockWorker)
                return _aSockWorker.status;

            return false;
        };

        channel.getMediaParam = function(name) {
            return _cfgMedia[name];
        };
        channel.setMediaParam = function(name,value) {
            //_cfgMedia[name] = value;

            if(_cfgMedia[name] != value) {
                _cfgMedia[name] = value;

                if(name == "capture_scale" || name =="keyint") {
                    if(channel.getVPublishStatus()) {
                        channel.setVPublishStatus(false);
                        channel.setVPublishStatus(true);
                    }
                }
            }
        };

        channel.getVPublishStatus = function() {
            return _vPublishStatus;
        };
        channel.getAPublishStatus = function() {
            return _aPublishStatus;
        };

        /**
         * addSpeaker 添加speaker/其他用户发言
         * 当接收到voice:accept消息时调用
         * @param id
         */
        channel.addSpeaker = function(id) {
            if(audioRecorder) {
                audioRecorder.addSpeaker(id);
            }
        };
        /**
         * delSpeaker 删除speaker/其他用户禁言
         * 当接收到非voice:accept消息时调用
         * @param id
         */
        channel.delSpeaker = function(id) {
            if(audioRecorder) {
                audioRecorder.delSpeaker(id);
            }
        };

        channel.delAllSpeaker = function() {
            if(audioRecorder) {
                audioRecorder.delAllSpeaker();
            }
        };

        /**
         * setVPublishStatus 开始上传视频|取消上传视频
         * @param flag   true|false
         */
        channel.setVPublishStatus = function(flag) {
            channel.setHeartBeat(_vSockWorker,!flag);
            _vPublishStatus = flag;

            if(flag) {
                if(!_initPublishVideoStatus)
                    channel.initPublishVideo(_cfgMedia);
                //channel.initPublish(_cfgMedia);

                console.log("initPublishVideo",(new Date()).getTime());

                channel._wait_video_init();
            } else {
                _initPublishVideoStatus = false;
                if(encoder) {
                    encoder.terminate();
                    encoder = null;
                    queued_frames = 0;
                }
            }
        } ;

        /**
         * setAPublishStatus 开始上传音频|取消上传音频
         * @param flag   true|false
         */
        channel.setAPublishStatus = function(flag) {
            channel.setHeartBeat(_aSockWorker,!flag);
            _aPublishStatus = flag;

            if(flag) {
                if(!_initPublishAudioStatus)
                    channel.initPublishAudio(_cfgMedia);
                //channel.initPublish(_cfgMedia);

                if(audioRecorder) {
                    audioRecorder.exportData(channel.SendEncAudioStream);
                    audioRecorder.record();
                }
            } else {
                if(audioRecorder)
                    audioRecorder.stop();
            }
        } ;

        channel.setVideosrc = function(video) {
            videosrc = video;
        };
        channel.setCanvassrc = function(canvas) {
            canvas_src = canvas;
            canvas_src_ctx = canvas_src.getContext("2d");
        };
        channel.setCanvasdst = function(dst) {
            //canvas_dst = dst;
            canvas_dst = document.getElementById(dst);
        };

///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////HttpSocket Worker functions///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Build video stream ws socket connection
         * @param url  ws://xxx.xxx.xxx:port
         * @returns {number}
         * 0 --- success;others ---- fail
         */
        channel.connectVideo = function(url) {
            if(!url) return 1;

            _config.vUrl = url;
            console.log(url,_config);

            _vSockWorker.worker = new Worker("JS/v5/HttpSocket.js");
            
            _vSockWorker.worker.onmessage = function (ev) {
                var data = ev.data;


                console.log(data);
                //writeToScreen(objToString(data));

                if(data.type == TYPE_INIT) {//init
                    //_vSockWorker.status = data.type;
                } else if(data.type == TYPE_CONNECT) {//connected
                    _vSockWorker.status = true;
                    channel.setHeartBeat(_vSockWorker,true);
                    if(_socketEventFun)
                        _socketEventFun(data);
                } else if(data.type == TYPE_CLOSE) {//connected
                    _vSockWorker.status = false;
                    if(_socketEventFun)
                        _socketEventFun(data);
                } else if(data.type == TYPE_ERROR) {//connected
                    _vSockWorker.status = false;
                    if(_socketEventFun)
                        _socketEventFun(data);
                } else if(data.type == TYPE_MSG) {//message string
                    //writeToScreen(toHexString(data.data));
                } else if(data.type == TYPE_DATA) {//ArrayBuffer data
                    //todo...  play data
                    // writeToScreen(toHexString(data.data));
                    channel.PlayEncStream(data);

                } else if(data.type == TYPE_STAT) {//up/down speed
                    if(_socketEventFun)
                        _socketEventFun(data);
                } else {
                }
            };
            // alert("8888");
            //cfg
            var cfg = {};
            cfg.type = TYPE_INIT;
            // cfg.type = "init";
            // alert("heer");
            cfg.url = _config.vUrl;
            //cfg.url = "ws://192.168.7.241:8085";
            cfg.mmid = _config.mmid;
            cfg.msgType = MSGTYPE_VIDEO;
            cfg.selfmmid = _config.selfmmid || 0;
            cfg.confjid = _config.confjid;

            console.log(cfg);
            _vSockWorker.worker.postMessage(cfg);

            return 0;
        };

        /**
         * Set < ws heart beat function > switch
         * @param work   ws socket worker
         * @param flag   true|false
         */
        channel.setHeartBeat = function(sockWorker,flag) {
            if(flag)
                channel.sendData(sockWorker,HB_START);
            else
                channel.sendData(sockWorker,HB_STOP);
        };

        /**
         * close socket worker
         * @param work
         */
        channel.closeSocketWork = function(sockWorker) {
            channel.sendData(sockWorker,WORKER_QUIT);

            if(sockWorker) {
                sockWorker.status = false;
                if(sockWorker.worker)
                    sockWorker.worker.terminate();
            }

        };

        /**
         * send video data|msg
         * @param data
         *     var mediaData = {};
         *     mediaData.type = "data";
         *     mediaData.data = buffer;
         *     mediaData.pt = 0x90; //payloadType
         *     mediaData.ts = 2323442;
         *     mediaData.syncPoint = 1; //VIDEO: 0 = I frame;1= P frame; AUDIO: 0 = Normal frame;1 = Important frame;
         *     mediaData.seq = 3444;
         *     mediaData.videoSize = 3; //vide size
         *          VIDEOSIZE_QCIF      (BYTE)0 176 x 144
         *          VIDEOSIZE_CIF       (BYTE)1 352 x 288
         *          VIDEOSIZE_CIF320    (BYTE)2 320 x 240
         *          VIDEOSIZE_QCIF160   (BYTE)3 160 x 120
         *          VIDEOSIZE_CIF640    (BYTE)4 640 x 480
         *          VIDEOSIZE_CIF768    (BYTE)5 768 x 576
         *     or
         *     data = String "QUIT";    "HEARTBEAT START";     "HEARTBEAT STOP";
         */
        channel.sendData = function(sockWorker,data) {
            if(sockWorker && sockWorker.status)
                sockWorker.worker.postMessage(data);
        };


        /**
         * Build audio stream ws socket connection
         * @param url  ws://xxx.xxx.xxx:port
         * @returns {number}
         * 0 --- success;others ---- fail
         */
        channel.connectAudio = function(url) {
            if(!url) return 1;

            _config.aUrl = url;
            _aSockWorker.worker = new Worker("JS/v5/HttpSocket.js");
            _aSockWorker.worker.onmessage = function (ev) {
                var data = ev.data;

                //console.log(data);
                //writeToScreen(objToString(data));
                if(data.type == TYPE_INIT) {//init
                    //_aSockWorker.status = data.type;
                } else if(data.type == TYPE_CONNECT) {//connected
                    _aSockWorker.status = true;
                    channel.setHeartBeat(_aSockWorker,true);
                    if(_socketEventFun)
                        _socketEventFun(data);

                    //if(!_initPlayAudioStatus)
                    //    channel.initPlayAudio();

                } else if(data.type == TYPE_CLOSE) {//connected
                    _aSockWorker.status = false;
                    if(_socketEventFun)
                        _socketEventFun(data);

                    channel.destroyPlayAudio();
                } else if(data.type == TYPE_ERROR) {//connected
                    _aSockWorker.status = false;
                    if(_socketEventFun)
                        _socketEventFun(data);

                    channel.destroyPlayAudio();
                } else if(data.type == TYPE_MSG) {//message string
                    //writeToScreen(toHexString(data.data));
                } else if(data.type == TYPE_DATA) {//ArrayBuffer data
                    //todo...  play data
                    //console.log(toHexString(data.data));
                    channel.PlayEncStream(data);
                } else if(data.type == TYPE_STAT) {//up/down speed
                    if(_socketEventFun)
                        _socketEventFun(data);
                } else {
                }
            };

            //cfg
            var cfg = {};
            cfg.type = TYPE_INIT;
            cfg.url = _config.aUrl;
            cfg.mmid = _config.mmid;
            cfg.msgType = MSGTYPE_AUDIO;
            cfg.selfmmid = _config.selfmmid || 0;
            cfg.confjid = _config.confjid;
            _aSockWorker.worker.postMessage(cfg);

            return 0;
        };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        channel._get_x264_cfg = function (cfg) {
            var ret = {};
            ret["preset"] = cfg["preset"];
            ret["tune"] = cfg["tune"];
            ret["crf"] = cfg["crf"]; //or ret["bitrate"] = cfg["bitrate"];
            //ret["bitrate"] = cfg["bitrate"]; //or ret["bitrate"] = cfg["bitrate"];
            ret["keyint"] = cfg["keyint"]; //or ret["bitrate"] = cfg["bitrate"];

            //ret["x264"] = {"bitrate": cfg["bitrate"]};
            return ret;
        };
        channel._get_openh264_cfg = function (cfg) {
            return {
                "bitrate": cfg["bitrate"]
            };
        };

        channel.SendEncVideoStream = function (buf) {//Send videostream to Server
            //console.log("SendEncVideoStream Video Size:" + buf.byteLength + ":buf[4]=" + buf[4]);
            //console.log(toHexString(buf.buffer));
            var encData = {};
            encData.type = "data";
            encData.data = buf.buffer;
            encData.pt = MPEG4; //payloadType
            encData.ts = prev_video_time;
            encData.syncPoint = 1; //VIDEO: 0 = I frame;1= P frame; AUDIO: 0 = Normal frame;1 = Important frame;
            encData.videoSize = 2; //vide size
            switch(parseFloat(_cfgMedia["capture_scale"])) {
                case 1.0:// 640 x 480
                    encData.videoSize = 4;
                    break;
                case 0.75:// 480 x 320 | 352 x 288
                    encData.videoSize = 1;
                    break;
                case 0.5:// 320 x 160
                    encData.videoSize = 2;
                    break;
                case 0.25:// 160 x 120
                    encData.videoSize = 3;
                    break;
                default:
                    encData.videoSize = 2;
                    break;
            }
            encData.seq = seqVideo++;

            var labelLen = (buf[2]==0x01 ? 3:4);
            var frameType = buf[labelLen];

            /*
            switch(frameType & 0x1f) {
                case 0x07:
                case 0x08:
                    var iStart = 0;
                    var iEnd = 0;
                    var size = buf.length;
                    while ((iEnd = channel.findNalEnd(buf, iStart + labelLen)) <= size) {
                        //_cfgMedia["sps"] = new ArrayBuffer(iEnd - iStart);
                        var frame = new ArrayBuffer(iEnd - iStart);
                        var u8Frame = new Uint8Array(frame);
                        u8Frame.set(buf.subarray(iStart, iEnd));

                        labelLen = (u8Frame[2]==0x01 ? 3:4);
                        frameType = u8Frame[labelLen];
                        switch (frameType & 0x1f) {
                            case 0x07:
                                _cfgMedia["sps"] = u8Frame.buffer;
                                //_cfgMedia["sps"] = new ArrayBuffer(frame.byteLength);
                                var u8FrameDst = new Uint8Array(_cfgMedia["sps"]);
                                //u8FrameDst.set(u8Frame);
                                break;
                            case 0x08:
                                _cfgMedia["pps"] =  u8Frame.buffer;
                                //_cfgMedia["pps"] = new ArrayBuffer(frame.byteLength);
                                var u8FrameDst = new Uint8Array(_cfgMedia["pps"]);
                                //u8FrameDst.set(u8Frame);
                                break;
                            case 0x06:
                                console.log("SendEncVideoStream Video Size:" + buf.byteLength + ":nalType=" + frameType,(new Date()).getTime(),seqVideo);
                                break;
                            case 0x05:
                                console.log("SendEncVideoStream Video Size:" + buf.byteLength + ":nalType=" + frameType,(new Date()).getTime(),seqVideo);
                                break;

                        }
                        iStart = iEnd;
                        if(iStart >= size) break;
                    }

                    console.log("SendEncVideoStream Video Size:" + buf.byteLength + ":buf[4]=" + frameType,(new Date()).getTime());
                    encData.syncPoint = 0;
                    break;
                default:
                    encData.syncPoint = 1;
                    break;
            }


            if((seqVideo % _cfgMedia["videoFrameRate"]) == 0) {
                if(_cfgMedia["sps"] && _cfgMedia["pps"]) {
                    var idr = new ArrayBuffer(_cfgMedia["sps"].byteLength + _cfgMedia["pps"].byteLength);
                    var u8Idr = new Uint8Array(idr);

                    u8Idr.set(new Uint8Array(_cfgMedia["sps"]));
                    u8Idr.set(new Uint8Array(_cfgMedia["pps"]),_cfgMedia["sps"].byteLength);

                    encData.syncPoint = 0;
                    encData.data = idr;
                    channel.sendData(_vSockWorker,encData);
                }
            }
            */

            switch(frameType & 0x1f) {
                case 0x07:
                case 0x08:
                    //console.log("SendEncVideoStream Video Size:" + buf.byteLength + ":nalType=" + frameType,(new Date()).getTime(),seqVideo);
                    encData.syncPoint = 0;
                    break;
                //case 0x05:
                //    console.log("SendEncVideoStream1 Video Size:" + buf.byteLength + ":buf[4]=" + frameType,(new Date()).getTime());
                //    encData.syncPoint = 0;
                //    break;
                default:
                    encData.syncPoint = 1;
                    break;
            }

            channel.sendData(_vSockWorker,encData);
        };

        var prev_audio_time = 0;
        var prev_aduio_i8;
        channel.SendEncAudioStream = function (buf) {//Send audio stream to Server
            if (channel.audioCodec) {
                var out_i8 = channel.audioCodec.encodeAudio(buf);

                if(prev_audio_time == 0)
                    prev_audio_time = (new Date()).valueOf();

                prev_audio_time+=30;

                var mediaData = {};
                mediaData.type = "data";

                /*
                if(!prev_aduio_i8) {
                    mediaData.data = out_i8.buffer;
                    prev_aduio_i8 = new Int8Array(out_i8.length);
                } else {
                    var out = new Int8Array(out_i8.length + prev_aduio_i8.length);
                    out.set(out_i8);
                    out.set(prev_aduio_i8,out_i8.length);
                    mediaData.data = out.buffer;
                }
                if(prev_aduio_i8.byteLength == out_i8.length)
                    prev_aduio_i8.set(out_i8);
                */
                mediaData.data = out_i8.buffer;
                mediaData.pt = G723; //payloadType
                mediaData.ts = prev_audio_time;
                mediaData.syncPoint = 0; //VIDEO: 0 = I frame;1= P frame; AUDIO: 0 = Normal frame;1 = Important frame;
                mediaData.seq = seqAudio++;
                mediaData.videoSize = 0; //vide size

                channel.sendData(_aSockWorker,mediaData);
            }
        };
        channel.toHexString = function(buf) {
            if(buf) {
                var buffer = "";
                var bufV = new DataView(buf);

                for (var i=0 ; i < bufV.byteLength &&  i < 512;i++) {
                    var b = bufV.getUint8(i);
                    buffer += (b<=0x0f?"0":"") + b.toString(16) + " ";
                    //buffer.appendData((b<=0x0f?"0":"") + b.toString(16) + " ");
                }
                console.log(buffer);
                return buffer;
            }
            return null;
        };

        var _hasPlayedKeyframe = false;
        var _audioDataArray;
        channel.PlayEncStream = function (mediaData) {//Recv videostream to Server
            //console.log("PlayEncStream Size:" + mediaData.data.byteLength);
            //console.log("PlayEncStream:",toHexString(mediaData.data));

            if(!(mediaData.data) || mediaData.data.byteLength <= 0)
                return;

            switch(mediaData.pt) {
                case MPEG4:
                    if(!_initPlayVideoStatus)
                        channel.initPlayVideo(_cfgMedia);

                    if(decoder) {
                        var u8 = new Uint8Array(mediaData.data);
                        decoder.postMessage(u8);
                        /*
                        if(!_hasPlayedKeyframe && (u8[4] & 0x1f) == 0x07) {
                            _hasPlayedKeyframe = true;
                        }

                        if(_hasPlayedKeyframe) {
                            decoder.postMessage(u8);
                        }
                        */
                    }
                    break;
                case G723:
                    if(!_initPlayAudioStatus)
                        channel.initPlayAudio(_cfgMedia);

                    if (channel.audioCodec) {
                        var u8 = new Uint8Array(mediaData.data);
                        //var idx = ((u8[0] >> 8) & 0x00ff ) & 0x03;
                        var idx = ((u8[0]) & 0x00ff ) & 0x03;
                        var g723Len = G723FRAMELEN[idx];
                        //var out_i16 = channel.audioCodec.decodeAudio(u8);
                        var out_i16 = channel.audioCodec.decodeAudio(u8.subarray(0,g723Len));

                        if (audioRecorder)
                            audioRecorder.importData( {mmid: mediaData.mmid, buffer: out_i16, len:g723Len} );
                    }
                    break;
                case MPEGAAC:
                    if(!_audioDataArray) {
                        _audioDataArray = AudioDataArray.createNew({interval:150,size:40960,func:channel.playSound});
                    }
                    if(_audioDataArray) {
                        var obj = _audioDataArray.findArrayData(mediaData.mmid);
                        if(!obj) {
                            obj = _audioDataArray.newArrayData(mediaData.mmid);
                        }
                        if(obj) {
                            obj.writeBytes(mediaData.data);
                        }
                    }
                    break;
                default:
                    break;
            }
        };

        channel._wait_video_init = function () {
            //var _this = this;
            window.setTimeout(function () {
                if(!_vPublishStatus) return;

                if (videosrc.videoHeight == 0) {
                    channel._wait_video_init();
                }
                else {
                    var scale = parseFloat(_cfgMedia["capture_scale"]);
                    canvas_src.width = videosrc.videoWidth * scale;
                    canvas_src.height = videosrc.videoHeight * scale;

                    encoder.postMessage({
                        width: canvas_src.width,
                        height: canvas_src.height,
                        rgb: true,
                        x264: channel._get_x264_cfg(_cfgMedia),
                        openh264: channel._get_openh264_cfg(_cfgMedia)
                    });
                    //_this.encode_start_time = _this.encode_period_time = Date.now();
                    console.log("width:",canvas_src.width,"heigh:",canvas_src.height);
                    channel._wait_next_frame();
                }
            }, 0);
        };
        channel._wait_next_frame = function (interval) {
            //var _this = this;
            if (interval === void 0) { interval = undefined; }

            if (queued_frames > max_queued_frames) {
                return;
            }

            if (!interval)
                interval = intervalVideoCatch;
            window.setTimeout(function () {
                if(!_vPublishStatus) return;
                if (prev_video_time != videosrc.currentTime) {
                    prev_video_time = videosrc.currentTime;
                    channel._frame_updated();
                }
                //_this.timer_cleared = true;
                channel._wait_next_frame();
            }, interval);
        };

        channel._frame_updated = function () {
            if (queued_frames <= max_queued_frames) {
                canvas_src_ctx.drawImage(videosrc, 0, 0, videosrc.videoWidth, videosrc.videoHeight, 0, 0, canvas_src.width, canvas_src.height);
                var img = canvas_src_ctx.getImageData(0, 0, canvas_src.width, canvas_src.height);
                encoder.postMessage(img.data, [img.data.buffer]);
                queued_frames++;
            }
        };


        channel.initPlayVideo = function (cfg) {
            if (!canvas_dst) return;
            /*
             if (!canvas_dst) {
             canvas_dst = document.createElement("CANVAS");
             canvas_dst.id = "canvas_dst";
             //canvas_dst.setAttribute("id","canvas_dst");
             document.body.appendChild(canvas_dst);
             }
             */
            if(!decoder) {
                decoder = new Worker("js/video/openh264_decoder.js");
                //decoder = new Worker("js/video/avc_decoder.js");

                switch (cfg.renderer) {
                    case "webgl":
                        renderer = new WebGLRenderer();
                        console.log("WebGL Renderer (YUV420->RGB conversion in shader)");
                        break;
                    default:
                        renderer = new RGBRenderer();
                        console.log("Canvas.putImageData Renderer (YUV420->RGB conversion in asm.js)");
                        break;
                }

                decoder.postMessage({rgb: renderer.is_rgba(), index: 0});

                decoder.onmessage = function (ev) {
                    var index = ev.data.index;
                    ///console.log('decoder_1.onmessage');

                    if (!renderer_initialized) {
                        if (ev.data.buf instanceof Uint8Array)
                            return;

                        console.log('renderer_initialized', ev.data);
                        var width = decoder_width = ev.data.width;
                        var height = decoder_height = ev.data.height;

                        canvas_dst.width = width;
                        canvas_dst.height = height;

                        renderer.init(canvas_dst, width, height);
                        renderer_initialized = true;

                        return;
                    }

                    //--_this.decoder_queue;
                    if (ev.data.buf.length == 1)
                        return;

                    var yuv = ev.data.buf;

                    if (renderer.is_rgba()) {
                        renderer.render(yuv, yuv, yuv);
                    }
                    else {
                        var s = decoder_width * decoder_height;
                        var y = yuv.subarray(0, s);
                        var u = yuv.subarray(s, s * 1.25);
                        var v = yuv.subarray(s * 1.25, s * 1.5);
                        renderer.render(y, u, v);
                    }
                }
            }
            _initPlayVideoStatus = true;
        };

        channel.initPlayAudio = function (cfg) {

            if(!audio_context)
                audio_context = new AudioContext;

            //navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

            navigator.getUserMedia({audio: true, video: false},
                function (strm) {
                    //var video = _this.videosrc;
                    //videosrc.src = window.URL.createObjectURL(strm);

                    //audio init
                    var input = audio_context.createMediaStreamSource(strm);
                    var zeroGain = audio_context.createGain();
                    zeroGain.gain.value = 0;
                    input.connect(zeroGain);
                    zeroGain.connect(audio_context.destination);
                    if(!audioRecorder)
                        audioRecorder = new Recorder(input);
                    audioRecorder.exportData(channel.SendEncAudioStream);
                    audioRecorder.clear();
                    //audioRecorder.record();
                    //audioRecorder.stop();

                    if(!channel.audioCodec)
                        channel.audioCodec = new AudioCodec();
                    _initPlayAudioStatus = true;
                    //_initPublishAudioStatus = true;
                },
                function (err) {
                    console.log("failed(navigator.getUserMedia): " + err);
                }
            );

        };

        channel.initPublishVideo = function(cfg) {
            if (!videosrc) return;
            if(!canvas_src) return;

            if(!encoder) {
                switch (cfg.encoder) {
                    case "x264":
                        encoder = new Worker("JS/video/x264_encoder.js");
                        break;
                    case "openh264":
                        encoder = new Worker("JS/video/openh264_encoder.js");
                        break;
                    default:
                        throw "unknown encoder";
                }
                encoder.onmessage = function (ev) {
                    //_this.encoded_frames++;

                    if (ev.data.length > 1) {
                        //_this.encoded_bytes += ev.data.length;

                        //if (audioRecorder)
                        //    audioRecorder.exportData(_this.SendEncAudioStream);
                        console.log(ev.data);
                        channel.SendEncVideoStream(ev.data);
                        //console.log("SendEncVideoStream",(new Date()).getTime());
                    }
                    queued_frames--;

                    //_this.showVideoSpeed();

                    if (queued_frames <= max_queued_frames) {
                        //if (_this.timer_cleared) {
                        var delta = videosrc.currentTime - prev_video_time;

                        if (intervalVideoCatch <= delta) {
                            channel._frame_updated();
                            channel._wait_next_frame();
                        }
                        else {
                            channel._wait_next_frame(intervalVideoCatch - delta);
                        }
                        //}
                    }
                }
            }

            videosrc.autoplay = true;
            videosrc.muted = true
            navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
            if (navigator.getUserMedia) {
               navigator.getUserMedia({ audio: false, video: true },
                   function (strm) {
                       var video = videosrc;
                       video.src = window.URL.createObjectURL(strm);
                       _initPublishVideoStatus = true;
                   },
                   function (err) {
                       console.log("failed(navigator.getUserMedia): " + err);
                   }
               ); 
           }else{
                alert("liulanqibuzhichi");
           }
            
        };

        channel.initPublishAudio = function(cfg) {
            if(!videosrc) return;

            if(!audio_context)
                audio_context = new AudioContext;

            navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

            navigator.getUserMedia({ audio: true, video: false },
                function (strm) {
                    //var video = videosrc;
                    //video.src = window.URL.createObjectURL(strm);

                    //audio init
                    var input = audio_context.createMediaStreamSource(strm);
                    var zeroGain = audio_context.createGain();
                    zeroGain.gain.value = 0;
                    input.connect(zeroGain);
                    zeroGain.connect(audio_context.destination);
                    if(!audioRecorder)
                        audioRecorder = new Recorder(input);
                    audioRecorder.exportData(channel.SendEncAudioStream);
                    audioRecorder.clear();
                    audioRecorder.record();
                    //audioRecorder.stop();

                    if(!channel.audioCodec)
                        channel.audioCodec = new AudioCodec();

                    _initPublishAudioStatus = true;
                },
                function (err) {
                    console.log("failed(navigator.getUserMedia): " + err);
                }
            );

        };

        channel.destroyPlayAudio = function () {
            if(audioRecorder) {
                audioRecorder.destroy();
            }
            if(channel.audioCodec)
                channel.audioCodec = null;

            if(audio_context) {
                audio_context.close();
                audio_context = null;
            }
            _initPlayAudioStatus = false;
            _initPublishAudioStatus = false;

            if(_audioDataArray) {
                _audioDataArray.destroy();
            }
        };

        channel.findNalEnd = function(u8Buffer,start) {
            if(u8Buffer && u8Buffer.length > 0) {
                var size = u8Buffer.length;
                for(var i=start;i<size;i++) {
                    if((i+4) >= size) break;
                    if(u8Buffer[i] == 0x00) {
                        if(u8Buffer[i+1] == 0x00) {
                            if(u8Buffer[i+2] == 0x01){
                                return i;
                            } else if(u8Buffer[i+2] == 0x00){
                                if(u8Buffer[i+3] == 0x01)
                                    return i;
                            }
                        }
                    }
                }
                return size;
            }
            return 0;
        };

        /**
         * playSound : aac|mp3|ogg
         * @param buf ArrayBuffer
         */
        channel.playSound = function(buf) {
            if(!audio_context)
                audio_context = new AudioContext;
            if(!audio_context) return;

            var s = audio_context.createBufferSource(); // 创建一个声音源
            s.onended = function () {
                s.disconnect();
                s.stop();
            };
            s.connect(audio_context.destination);       //将该源与硬件相连
            s.start(0);                          // 现在播放该实例 noteOff(0)
            //console.log((new Date()).valueOf(),"playSound len=",buf.byteLength);
            audio_context.decodeAudioData(buf, function(buffer) {
                //console.log((new Date()).valueOf(),buffer);
                s.buffer = buffer;
            }, function (err) {
                //console.log(channel.toHexString(buf));
                console.log("playSound failed(decodeAudioData): " + err);
            });
        }

        /**
         * AudioDataArray
         * @type {{createNew: Function}}
         * cfg : {interval:25,size:4096,func:callback}
         */
        var AudioDataArray = {
            createNew: function(cfg) {
                var _config;
                var _obj = {};

                var queueData = [];
                var timerHandleQueue;
                _obj.init=function() {
                    timerHandleQueue = setInterval( function(){ _obj.onTimerHandleQueue(_config.func);}, _config.interval );
                };
                _obj.destroy=function() {
                    if(timerHandleQueue) {
                        clearInterval(timerHandleQueue);
                        timerHandleQueue = 0;
                    }

                    if(queueData) {
                        queueData.splice(0,queueData.length);
                    }
                };
                _obj.findArrayData = function(n) {
                    if(queueData) {
                        for(var i=0;i<queueData.length;i++) {
                            if(queueData[i]) {
                                if(queueData[i].getId() == n) {
                                    return queueData[i];
                                }
                            }
                        }
                    }
                    return null;
                };
                _obj.findArrayIdx = function(n) {
                    if(queueData) {
                        for(var i=0;i<queueData.length;i++) {
                            if(queueData[i]) {
                                if(queueData[i].getId() == n) {
                                    return i;
                                }
                            }
                        }
                    }
                    return -1;
                };
                _obj.newArrayData = function(n) {
                    var cfg = _config;
                    cfg.id = n;
                    var audioData = AudioData.createNew(cfg);
                    if(queueData) {
                        queueData.push(audioData);
                        return audioData;
                    } else {
                        return null;
                    }
                };
                _obj.delArrayData = function(n) {
                    var idx = _obj.findArrayIdx(n);
                    queueData.remove(idx);
                };
                _obj.onTimerHandleQueue = function(func) {
                    if(queueData) {
                        for(var i=0;i<queueData.length;i++) {
                            if(queueData[i]) {
                                //queueData[i].playSound();

                                var data = queueData[i].readBytes();

                                //todo...
                                if(data)
                                    func(data);


                            }
                        }
                    }
                };

                _config = cfg || {};
                _obj.init();
                return _obj;
            }
        };

        /**
         * AudioData
         * @type {{createNew: Function}}
         * cfg : {id:10003,size:4096}
         */
        var AudioData = {
            createNew: function(cfg) {
                var _config;
                var _obj = {};

                var queueData = {};
                var dataU8;

                _obj.init=function() {
                    queueData.id = _config.id;
                    queueData.start = 0;
                    queueData.end = 0;
                    queueData.data = new ArrayBuffer(_config.size);
                    dataU8 = new Uint8Array(queueData.data);
                    return queueData;
                };
                _obj.getId = function() {
                    return queueData.id;
                };
                _obj.getLength = function() {
                    return (queueData.end - queueData.start  + _config.size) % _config.size;
                };
                _obj.clear = function() {
                    queueData.end = 0;
                    queueData.start = 0;
                };
                _obj.writeBytes=function(s) {
                    if(!s || s.byteLength===0) return;
                    var len = s.byteLength;
                    var sU8 = new Uint8Array(s);
                    if(queueData.end + len > _config.size) {
                        var data1 = sU8.subarray(0,(_config.size - queueData.end));
                        var data2 = sU8.subarray(data1.length);

                        dataU8.set(data1,queueData.end);
                        dataU8.set(data2);
                        queueData.end = (queueData.end + len)%_config.size;
                    } else {
                        dataU8.set(sU8,queueData.end);
                        queueData.end += len;
                    }
                    //console.log("writeBytes: end=",queueData.end,"+",len);
                };
                _obj.readBytes=function() {
                    var len = _obj.getLength();
                    var s;
                    var sU8;
                    if(len > 0) {
                        s = new ArrayBuffer(len);
                        sU8 = new Uint8Array(s);
                        if(queueData.start > queueData.end) {
                            var data1 = dataU8.subarray(queueData.start);//new Uint8Array(_buffer,_idxRead);
                            var data2 = dataU8.subarray(0,(len - data1.length));//new Uint8Array(_buffer,0,(frameLen - data1.length));

                            sU8.set(data1,0);
                            sU8.set(data2,data1.length);
                        } else {
                            var data3 = dataU8.subarray(queueData.start,queueData.start + len);
                            sU8.set(data3);
                        }
                        queueData.start =(queueData.start + len)%_config.size;
                    }
                    //console.log("readBytes: start=",queueData.start,"+",len,"s.byteLength=", (s!=null)?s.byteLength:"null");
                    return s;
                };

                _config = cfg || {};
                _obj.init();
                return _obj;
            }
        };

        _config = cfg || {};
        channel.reset();
        console.log("UserChannel cfg:",cfg);

        return channel;
    }

};


//document.addEventListener("DOMContentLoaded", function (event) {
//    var output = document.getElementById("output");
//    var aUrl = "ws://localhost:9003";
//    var vUrl = "ws://localhost:9003";
//    //var aUrl = "ws://192.168.7.124:8888/red5WebSocket";
//    //var vUrl = "ws://192.168.7.124:8888/red5WebSocket";
//    var cfg = {};
//    //cfg.url = "ws://192.168.7.92:8888/red5WebSocket";
//    cfg.mmid = 1000001;
//    cfg.jid="guest@192.168.7.124";
//    cfg.nick="guest";
//    cfg.selfmmid = 0;
//    cfg.confjid = "50001@slavemcu23";
//
//    var audioUp = 0.0;
//    var audioDw = 0.0;
//
//    var socketEvent = function(evt) {
//        var data = evt;
//        //console.log(data);
//
//        if(channel) {
//            if(channel.getMmid() == data.mmid) {
//                if(data.type == TYPE_INIT) {//init
//                    //_vSockWorker.status = data.type;
//                } else if(data.type == TYPE_CONNECT) {//connected
//                    if(data.msgType =="video") {//video socket connected
//
//                    }else{//audio socket connected
//
//                    }
//                } else if(data.type == TYPE_CLOSE || data.type == TYPE_ERROR) {//connected
//                    if(data.msgType =="video") {//video socket connected
//
//                    }else{//audio socket connected
//
//                    }
//                } else if(data.type == TYPE_STAT) {
//                    if(data.msgType=="audio") {
//                        audioUp = data.sndRate;
//                        audioDw = data.rcvRate;
//                    } else {
//                        document.getElementById("status_src").innerHTML = 'UP:' + (data.sndRate + audioUp) + 'B/s ' +
//                            'DN:' + data.rcvRate + 'B/s ';
//                        document.getElementById("status_dst").innerHTML = 'DN:' + (data.rcvRate + audioDw) + 'B/s ' +
//                            'UP:' + data.sndRate + 'B/s ';
//                        audioUp = 0.0;
//                        audioDw = 0.0;
//                    }
//                }
//            }
//        }
//        if(channel1) {
//            if(channel1.getMmid() == data.mmid) {
//                if(data.type == TYPE_INIT) {//init
//                    //_vSockWorker.status = data.type;
//                } else if(data.type == TYPE_CONNECT) {//connected
//                    if(data.msgType =="video") {//video socket connected
//
//                    }else{//audio socket connected
//
//                    }
//                } else if(data.type == TYPE_CLOSE || data.type == TYPE_ERROR) {//connected
//                    if(data.msgType =="video") {//video socket connected
//
//                    }else{//audio socket connected
//
//                    }
//                } else if(data.type == TYPE_STAT) {
//                    document.getElementById("status_src1").innerHTML = 'UP:' + data.sndRate + 'B/s ' +
//                        'DN:' + data.rcvRate + 'B/s ';
//                    document.getElementById("status_dst1").innerHTML = 'DN:' + data.rcvRate + 'B/s ' +
//                        'UP:' + data.sndRate + 'B/s ';
//                }
//            }
//        }
//    }
//
//    var channel;
//    document.getElementById("new").addEventListener("click", function () {
//        //channel = new UserChannel(cfg);
//        //channel = Object.create(UserChannel,cfg);
//        channel = UserChannel.createNew(cfg);
//
//        channel.setSocketEvent(socketEvent);
//
//        channel.setVideosrc(document.getElementById("videosrc"));
//        channel.setCanvassrc(document.getElementById("canvas_src"));
//        channel.setCanvasdst(document.getElementById("canvas_dst"));
//        //channel.setCanvasdst("canvas_dst");
//    });
//    document.getElementById("destroy").addEventListener("click", function () {
//        if(channel)
//            channel.destroy();
//    });
//
//    var findEnd = function(buffer,start) {
//        if(u8FileData) {
//            var size = u8FileData.byteLength;
//            var u8Data = new Uint8Array(u8FileData);
//
//            for(var i=start;i<size;i++) {
//                if((i+4) >= size) break;
//                if(u8Data[i] == 0x00 && u8Data[i+1] == 0x00 && u8Data[i+2] == 0x00 && u8Data[i+3] == 0x01) {
//                    if(u8Data[i+4] == 0x67 || u8Data[i+4] == 0x68)
//                        continue;
//
//                    return i;
//                }
//            }
//            return size;
//        }
//        return 0;
//    };
//
//    var u8FileData  = null;
//    document.getElementById("h264").addEventListener("click", function () {
//        var iStart=0,iEnd=0;
//
//        if(u8FileData) {
//            var size = u8FileData.byteLength;
//            var u8Data = new Uint8Array(u8FileData);
//            //var u8Frame;
//
//            while( (iEnd = findEnd(u8Data,iStart+4)) < size) {
//                var frame = new ArrayBuffer(iEnd - iStart);
//                var u8Frame = new Uint8Array(frame);
//                u8Frame.set(u8Data.subarray(iStart,iEnd));
//                if(channel) {
//                    channel.PlayEncStream({pt:MPEG4,data:frame});//0x00000060
//                }
//                iStart = iEnd;
//            }
//
//            console.log("decode file size=",size,"start=",iStart,"end=",iEnd);
//        }
//        /*
//        if(u8FileData) {
//            if(channel) {
//                channel.PlayEncStream({pt:MPEG4,data:u8FileData});//0x00000060
//            }
//        }
//        */
//    });
//    var file_changed = function() {
//        var file = this.files[0];
//        //var u8FileData  = null;
//        var arrayBufferNew = null;
//
//        var fileReader     = new FileReader();
//        fileReader.onload  = function(progressEvent) {
//            u8FileData = this.result;
//        };
//        fileReader.onerror = function(evt) {
//            console.log("fileReader.onerror:",evt.toString());
//            //return null;
//        };
//        fileReader.onloadend = function(evt) {
//            console.log("fileReader.onloadend:",evt.toString());
//        };
//        fileReader.readAsArrayBuffer(file);
//    };
//
//    document.getElementById("captureRate").addEventListener("click", function () {
//        if(channel) {
//            //channel.setMediaParam("capture_scale",0.5);
//            channel.setMediaParam("keyint",30);
//
//        }
//    });
//
//    document.getElementById("connectV").addEventListener("click", function () {
//        if(channel)
//            channel.connectVideo(vUrl);
//    });
//    document.getElementById("connectA").addEventListener("click", function () {
//        if(channel)
//            channel.connectAudio(aUrl);
//    });
//
//    document.getElementById("publishV").addEventListener("click", function () {
//        if(channel) {
//            channel.setVPublishStatus(true);
//        }
//    });
//    document.getElementById("spublishV").addEventListener("click", function () {
//        if(channel)
//            channel.setVPublishStatus(false);
//    });
//    document.getElementById("publishA").addEventListener("click", function () {
//        if(channel)
//            channel.setAPublishStatus(true);
//    });
//    document.getElementById("spublishA").addEventListener("click", function () {
//        if(channel)
//            channel.setAPublishStatus(false);
//    });
//
//    function writeToScreen(message)
//    {
//        var pre = document.createElement("p");
//        pre.style.wordWrap = "break-word";
//        pre.innerHTML = message;
//        if(output)
//            output.appendChild(pre);
//    }
//
//    var channel1;
//    var cfg1 = {};
//    //cfg.url = "ws://192.168.7.92:8888/red5WebSocket";
//    cfg1.mmid = 1000002;
//    cfg1.jid="guest@192.168.7.124";
//    cfg1.nick="guest";
//    cfg1.selfmmid = 0;
//    cfg1.confjid = "50001@slavemcu23";
//    document.getElementById("new1").addEventListener("click", function () {
//        //channel1 = new UserChannel(cfg1);
//        channel1 = UserChannel.createNew(cfg1);
//
//        channel1.setSocketEvent(socketEvent);
//
//        channel1.setVideosrc(document.getElementById("videosrc1"));
//        channel1.setCanvassrc(document.getElementById("canvas_src1"));
//        channel1.setCanvasdst(document.getElementById("canvas_dst1"));
//        //channel1.setCanvasdst("canvas_dst1");
//    });
//    document.getElementById("destroy1").addEventListener("click", function () {
//        if(channel1)
//            channel1.destroy();
//    });
//
//    document.getElementById("connectV1").addEventListener("click", function () {
//        if(channel1)
//            channel1.connectVideo(vUrl);
//    });
//    document.getElementById("connectA1").addEventListener("click", function () {
//        if(channel1)
//            channel1.connectAudio(aUrl);
//    });
//
//    document.getElementById("publishV1").addEventListener("click", function () {
//        if(channel1)
//            channel1.setVPublishStatus(true);
//    });
//    document.getElementById("spublishV1").addEventListener("click", function () {
//        if(channel1)
//            channel1.setVPublishStatus(false);
//    });
//    document.getElementById("publishA1").addEventListener("click", function () {
//        if(channel1)
//            channel1.setAPublishStatus(true);
//    });
//    document.getElementById("spublishA1").addEventListener("click", function () {
//        if(channel1)
//            channel1.setAPublishStatus(false);
//    });
//
//    document.getElementById("h264file").addEventListener("change", file_changed);
//
//});


