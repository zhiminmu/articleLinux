/**
 * Created by xflin on 2015/12/30.
 * xflin@cellcom.com.cn
 */
//url:String,mmid:uint,packType:String,selfmmid:uint=0,confjid:String=null

importScripts("Util.js");
importScripts("Packet.js");
importScripts("BufferQueue.js");
var HttpSocket;
HttpSocket = (function () {
    var _this = this;
    var _worker;
    var _workerReply={};

    var _sock;//ws socket
    var _url;//:String;
    var _connected;//:Boolean = false;
    var _connectedV5;//:Boolean = false;

    var _rcvSum1=0;//:Number = 0;
    var _rcvSum2=0;//:Number = 0;
    var _sndSum1=0;//:Number = 0;
    var _sndSum2=0;//:Number = 0;
    var _timeUnit=10000;//:Number = 10000;//ms
    var _rcvStartTime=0;//:Number = 0;
    var _sndStartTime=0;//:Number = 0;
    var _rcvEndTime=0;//:Number = 0;
    var _sndEndTime=0;//:Number = 0;

    var _seq;//:uint;
    var _mmid;//:uint;
    var _msgType;//:String;//0 audio | 1 video
    var _default;//:Boolean = false;//default socket

    var _selfmmid;//:uint=0;//�����ű�����Ƶʱ�����
    var _confJid;//:String=null;//�����ű�����Ƶʱ�����

    //rcv queue
    var _bufferRcvQueueSize;
    var _bufferRcvQueue;
    var _timerRcvQueue;//id
    var _timerKeepAlive;//publish ws keep alive

    var _heartbeatData;

    function HttpSocket(worker) {
        //_this = this;
        _worker = worker;
        console.log("HttpSocket init() start...");
        _worker.onmessage = function (ev) {
            onHandleWorkerMsg(ev.data);
        };

        _worker.onclose = function (ev) {
            _worker = null;
            console.log(ev);
            //_this.close();
            close();
        };
        _worker.onerror= function (ev) {
            _worker = null;
            console.log(ev);
            //_this.close();
            close();
        };

        console.log("HttpSocket init() end...");
        //_bufferRcv = new BufferQueue(_bufferRcvQueueSize);
    }

    var onHandleWorkerMsg = function(data) {
        //var _this = this;
        //console.log("onHandleWorkerMsg dubug:",data);
        if(data.constructor === ArrayBuffer) {
            console.log("onHandleWorkerMsg:", toHexString(data));

        } else if(data.constructor === String) {
            console.log("onHandleWorkerMsg:",data);
            if(data === WORKER_QUIT) {
                close();
            } else if(data === HB_START){
                if(!_timerKeepAlive)
                    _timerKeepAlive = setInterval( function(){onKeepWsAlive();}, _msgType==MSGTYPE_AUDIO ? INTERVALTIMERAUDIO:INTERVALTIMERVIDEO );
            } else if(data === HB_STOP) {
                if(_timerKeepAlive) {
                    clearInterval(_timerKeepAlive);
                    _timerKeepAlive = 0;
                }
            } else {
                sndWorkerMsg(data);
            }
        } else {
            //console.log("onHandleWorkerMsg:",data);
            if(data.type == "init")
                init(data);
            else(data.type == "data")
                SendEventData(data);
        }
        //sndWorkerMsg(data);
    };

    var sndWorkerMsg = function(data) {
        //var _this = this;
        //console.log("sndWorkerMsg:",data);
        if(_worker)
            _worker.postMessage(data);
    };

    var init = function (cfg) {
        _url = cfg.url || "";
        _mmid = cfg.mmid || 0;
        _msgType = cfg.msgType || "";
        _selfmmid = cfg.selfmmid || 0;
        _confJid = cfg.confjid || "";
        _bufferRcvQueueSize = cfg.size || MAX_BUFFER_SIZE;

        console.log("init:",_url,_mmid,_msgType,_selfmmid,_confJid,_bufferRcvQueueSize);
        _seq = 0;
        _connected = false;
        _connectedV5 = false;

        _workerReply.mmid = _mmid;
        _workerReply.msgType = _msgType;
        _workerReply.type = TYPE_INIT;
        _workerReply.msg = "";

        //init heart beat data
        _heartbeatData = new ArrayBuffer(18);
        var bufferV = new DataView(_heartbeatData);
        var idx=0;
        bufferV.setUint16(idx,0x10,true);idx+=2;
        //bufferV.setUint32(idx,0x10,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;

        open();
    };

    var open = function () {
        console.log("start to connect to video server");
        _sock = new WebSocket(_url);
        console.log("end to connect to video server");
        _sock.onopen = function(evt) { onOpen(evt) };
        _sock.onclose = function(evt) { onClose(evt) };
        _sock.onmessage = function(evt) { onMessage(evt) };
        _sock.onerror = function(evt) { onError(evt) };
    };

    var close = function () {
        if(_timerKeepAlive) {
            clearInterval(_timerKeepAlive);
            _timerKeepAlive = 0;
        }

        if(_sock) {
            _sock.close();
        }
        _sock = null;
        stopTimer();

        if(_worker){
             _worker.close();
            _worker = null;
        }

    };

    var initTimer = function() {
        _bufferRcvQueue = new BufferQueue(_bufferRcvQueueSize);
        _timerRcvQueue = setInterval( function(){onHandleRcvQueue();}, 2 );
    };

    var stopTimer = function() {
        if(_timerRcvQueue) {
            clearInterval(_timerRcvQueue);
        }
        _timerRcvQueue = 0;

        if(_bufferRcvQueue) {
            _bufferRcvQueue.clear();
        }
        _bufferRcvQueue = null;
    };

    _this.setMmid = function(para) {
        _mmid = para;
    };

    _this.getMmid = function() {
        return _mmid;
    };

    _this.setSelfmmid = function(para) {
        _selfmmid = para;
    };

    _this.getSelfmmid = function() {
        return _selfmmid;
    };

    _this.getConnectedV5 = function() {
        return _connectedV5;
    };

    _this.getConnected = function() {
        return _connected;
    };

    _this.setMsgType = function(para) {//audio | video
        _msgType = para;
    };

    _this.getMsgType = function() {
        return _msgType;
    };

    _this.getRcvRate = function() {//bytes/s
        //console.log("now:"+(new Date()).valueOf() + "stime:"+_rcvStartTime + "etime:"+_rcvEndTime + "	_rcvSum1:"+_rcvSum1 + "	_rcvSum2:"+_rcvSum2);
        //return ((_rcvSum2-_rcvSum1) * 1000 / ((new Date()).valueOf() - _rcvStartTime)).toFixed(1) ;
        var rate = ((_rcvSum2-_rcvSum1) * 1000 / (_rcvEndTime - _rcvStartTime) ).toFixed(1) ;
        if(_rcvEndTime - _rcvStartTime >= _timeUnit) {
            _rcvStartTime = _rcvEndTime;
            _rcvSum1 = _rcvSum2;
        }
        return rate;
    };

    _this.getSndRate = function() {//bytes/s
        //console.log("now:"+(new Date()).valueOf() + "stime:"+_sndStartTime + "etime:"+_sndEndTime + "	_sndSum1:"+_sndSum1 + "	_sndSum2:"+_sndSum2);
        //return ((_sndSum2-_sndSum1) * 1000 / ((new Date()).valueOf() - _sndStartTime)).toFixed(1) ;
        var rate = ((_sndSum2-_sndSum1) * 1000 / (_sndEndTime - _sndStartTime) ).toFixed(1) ;
        if(_sndEndTime - _sndStartTime >= _timeUnit) {
            _sndStartTime = _sndEndTime;
            _sndSum1 = _sndSum2;
        }
        return rate;
    };

    /**
     *
     * POST / HTTP/1.0
     Accept:
     Accept-Language: en-us
     Accept-Encoding: gzip, deflate
     User-Agent: Cellconf/4.0
     extension-header: packettype = 0	mmid = 10000307
     Pragma: no-cache
     Cache-Control: no-cache
     Content-Length: 32767
     Host: 192.168.7.124

     publish header
     type --- POST|GET
     packType ---- audio | video
     **/
    var SendHttpTestHeader = function() {
        if(!_sock || !_connected) return;

        if(_msgType != MSGTYPE_AUDIO && _msgType != MSGTYPE_VIDEO) return;
        var packtype = 0;
        if(_msgType == MSGTYPE_VIDEO)
            packtype =1;

        var header = "POST / HTTP/1.1\r\n";
        //                var header:String="GET /com.broadsoft.xsi-actions/v2.0/user/nionUser1@xdp.broadsoft.com/profile HTTP/1.1\r\n";
        header+="Accept: */*\r\n";
        header+="Accept-Language: en-us\r\n";
        header+="Accept-Encoding: gzip, deflate\r\n";
        header+="User-Agent: Cellconf/4.0\r\n";
        header+="extension-header: packettype = "+packtype+"	mmid = "+_mmid+"\r\n";
        header+="Pragma: no-cache\r\n";
        header+="Cache-Control: no-cache\r\n";
        header+="Content-Length: 32767\r\n";
        header+="Host: "+_url+"\r\n";
        header+="\r\n"
        //			header+="Cache-Control: no-cache\r\n";
        //			header+="Connection: Keep-Alive\r\n";
        //			header+="Authorization: Basic "+getEncodedAuthorization()+"\r\n\r\n";

        SendMsg(header);
    };

    /*
     POST / HTTP/1.0
     Accept:
     Accept-Language: en-us
     Accept-Encoding: gzip, deflate
     User-Agent: Cellconf/4.0
     extension-header: infotype = 1	roomjid = 614641@slavemcu_23.machine23.v2c	selfmmid = 10000444	srcmmid = 10000443	mediatype = 1
     Pragma: no-cache
     Cache-Control: no-cache
     Content-Length: 32767
     Host: 192.168.7.124

     play header
     type --- POST|GET
     srcMmid --- play mmid
     roomjid ---- conf jid
     */
    var SendHttpHeader = function() {
        if(!_sock || !_connected) return;
        if(	_msgType != MSGTYPE_VIDEO) return;

        var packtype = 1;
        var header = "POST / HTTP/1.1\r\n";
        //                var header:String="GET /com.broadsoft.xsi-actions/v2.0/user/nionUser1@xdp.broadsoft.com/profile HTTP/1.1\r\n";
        header+="Accept: */*\r\n";
        header+="Accept-Language: en-us\r\n";
        header+="Accept-Encoding: gzip, deflate\r\n";
        header+="User-Agent: Cellconf/4.0\r\n";
        header+="extension-header: infotype = "+ packtype+"	roomjid = "+_confJid+"	selfmmid = "+_selfmmid+"	srcmmid = "+_mmid+"	mediatype = "+packtype+"\r\n";
        header+="Pragma: no-cache\r\n";
        header+="Cache-Control: no-cache\r\n";
        header+="Content-Length: 32767\r\n";
        header+="Host: "+_url+"\r\n";
        header+="\r\n"
        //			header+="Cache-Control: no-cache\r\n";
        //			header+="Connection: Keep-Alive\r\n";
        //			header+="Authorization: Basic "+getEncodedAuthorization()+"\r\n\r\n";

        SendMsg(header);
    };

    /*
    keep alive packet
     */
    var SendNullData = function() {
        /*
        var size = 20;//18;
        var idx=0;
        var buffer = new ArrayBuffer(size);
        var bufferV = new DataView(buffer);
        //bufferV.setUint16(idx,0x10,true);idx+=2;
        bufferV.setUint32(idx,0x10,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;
        bufferV.setUint32(idx,0x00,true);idx+=4;
        */
        if(_heartbeatData)
            SendData(_heartbeatData);
    };

    /*
     evt ---- {}
     {
     type:"data"
     data:ArrayBuffer
     pt:0x90   payloadType
     ts:2323442  timestamp
     syncPoint:0
     seq:0--n
     videoSize:0-5
     }
     */
    var SendEventData = function(evt) {
        if(!evt || !evt.data) return;

        var pack = new Packet(_mmid);
        pack.setv5MMID(_mmid);
        pack.setPayloadType(evt.pt);
        pack.setv5MMTimeStamp(evt.ts);
        pack.setTimestamp(evt.ts);
        pack.setPayload(evt.data);

        if(evt.seq)
            pack.setv5MMSeq(evt.seq);
        else
            pack.setv5MMSeq(++_seq);

        if(evt.syncPoint)
            pack.setv5SyncPoint(evt.syncPoint);
        else
            pack.setv5SyncPoint(evt.syncPoint);

        if(evt.videoSize)
            pack.setv5MMVideoSize(evt.videoSize);
        else if(_msgType == MSGTYPE_VIDEO)
            pack.setv5MMVideoSize(2);

        //console.log("SendEventData:",pack.toString());
        SendPacket(pack);
    };

    /*
     pack ---- Packet
     */
    var SendPacket = function(pack) {
        if(!pack || pack.getv5MMID() <= 0) return;

        var buffer = pack.getByteArray();

        if(buffer) {
            //SendData(buffer);

            if(buffer.byteLength > MAX_SIZE_PACKET) {//split packet
                var count = Math.ceil(buffer.byteLength/MAX_SIZE_PACKET);// + (buffer.byteLength%MAX_SIZE_PACKET ? 1:0);

               for(var i=0;i < count;i++) {
                    if( i==count-1)
                        SendData(buffer.slice(i*MAX_SIZE_PACKET));
                    else
                        SendData(buffer.slice(i*MAX_SIZE_PACKET,(i+1)*MAX_SIZE_PACKET));
                }

                /*
                var bufferU8 = new Uint8Array(buffer);
                var size=0;
                for(var i=0;i < count;i++) {
                    size = ((buffer.byteLength - i*MAX_SIZE_PACKET) >= MAX_SIZE_PACKET) ? MAX_SIZE_PACKET : (buffer.byteLength - i*MAX_SIZE_PACKET)
                    var bufferOne = new ArrayBuffer(size);
                    var bufferOneU8 = new Uint8Array(bufferOne);
                    bufferOneU8.set(bufferU8.subarray(i*MAX_SIZE_PACKET,i*MAX_SIZE_PACKET+size));
                    //bufferOneU8 = bufferU8.subarray(i*MAX_SIZE_PACKET,i*MAX_SIZE_PACKET+size);
                    SendData(bufferOne);
                }
*/
            } else {
                SendData(buffer);
            }

        }
    };

    /*
    msg ---- string
     */
    var SendMsg = function(msg) {
        if(!_sock || !_connected) return;
        if(!msg || msg.length <= 0) return;

        _sock.send(msg);

        //snd statics
        /*
        var now = new Date();
        if(now.valueOf() - _sndStartTime >= this._timeUnit) {
            _sndStartTime = now.valueOf();
            _sndSum1 = this._sndSum2;
        }
        _sndSum2 += msg.length;
        */
    };

    /*
     data ---- ArrayBuffer
     */
    var SendData = function(data) {
        if(!_sock || !_connected) return;
        if(!data || data.byteLength <= 0) return;

        _sock.binaryType = "arraybuffer";
        _sock.send(data);
        //console.log("SendData:[",data.byteLength,"]"+toHexString(data));

        //snd statics
        _sndEndTime = (new Date()).valueOf();
        _sndSum2 += data.byteLength;

        //return stat. info
        var reply={};
        reply.mmid = _mmid;
        reply.msgType = _msgType;
        reply.type = TYPE_STAT;
        reply.rcvRate = _this.getRcvRate();
        reply.sndRate = _this.getSndRate();
        sndWorkerMsg(reply);
    };

    var onOpen = function (evt) {
        _connected = true;
        _sock.binaryType = "arraybuffer";
        _sock.mask = 1;

        console.log(_url + ":CONNECTED");
        initTimer();

        if( _msgType == MSGTYPE_AUDIO)
            SendHttpTestHeader();//AUDIO
        else
        {
            if(_selfmmid==0)
                SendHttpTestHeader();//publish video
            else
                SendHttpHeader();//play remote video
        }

        //_worker.postMessage(new EventSocket(_mmid,TYPE_CONNECT,_msgType,evt.data));
        _workerReply.type = TYPE_INIT;
        _workerReply.msg = "init success.";
        sndWorkerMsg(_workerReply);
    };

    var onClose = function (evt) {
        _connected = _connectedV5 = false;
        console.log(_url + ":DISCONNECTED");

        //this._worker.postMessage(new EventSocket(_mmid,TYPE_CLOSE,_msgType,evt.data));
        _workerReply.type = TYPE_CLOSE;
        _workerReply.msg = evt.data;
        sndWorkerMsg(_workerReply);
    };

    var onError = function (evt) {
        _connected = _connectedV5 = false;
        console.log(_url + ":ERROR:" + evt.data);

        //this._worker.postMessage(new EventSocket(_mmid,TYPE_ERROR,_msgType,evt.data));
        _workerReply.type = TYPE_ERROR;
        _workerReply.msg = evt.data;
        sndWorkerMsg(_workerReply);
    };

    var onMessage = function (evt) {
        var data = evt.data;
        if(!data) return;
        if(_heartbeatData) {
            if (data.byteLength == _heartbeatData.byteLength) {
                if((new Uint8Array(data))[0] == (new Uint8Array(_heartbeatData))[0] ) {
                    console.log("heartbeat data.");
                    return;
                }
            }
        }

        if(data.constructor === String) {
            //testing code
            /*
            _connectedV5 = true;

            //_worker.postMessage(new EventSocket(_mmid,TYPE_CONNECT,_msgType,data));
            _workerReply.type = TYPE_CONNECT;
            _workerReply.msg = data;
            sndWorkerMsg(_workerReply);
            */

            if(data.search("200 OK") != -1) {
                _connectedV5 = true;

                //_worker.postMessage(new EventSocket(_mmid,TYPE_CONNECT,_msgType,data));
                _workerReply.type = TYPE_CONNECT;
                _workerReply.msg = data;
                sndWorkerMsg(_workerReply);
            } else if(data.search("HTTP") != -1){
                _connectedV5 = false;
                console.log(data);

                //_worker.postMessage(new EventSocket(_mmid,TYPE_ERROR,_msgType,data));
                _workerReply.type = TYPE_ERROR;
                _workerReply.msg = data;
                sndWorkerMsg(_workerReply);
            }

        } else if(data.constructor === ArrayBuffer){
            if(data.byteLength < 500) {
                var str = "";
                var buf = new Uint8Array(data);
                for (var i = 0; i < buf.byteLength; i++)
                {
                    str += String.fromCharCode(buf[i]);
                }
                if(str.indexOf("HTTP") >= 0 ) {//HTTP HEADER
                    if (str.indexOf("200 OK") >= 0) {
                        _connectedV5 = true;

                        //_worker.postMessage(new EventSocket(_mmid,TYPE_CONNECT,_msgType,data));
                        _workerReply.type = TYPE_CONNECT;
                        _workerReply.msg = data;
                        sndWorkerMsg(_workerReply);
                    }else{
                        _connectedV5 = false;
                        console.log(data);

                        //_worker.postMessage(new EventSocket(_mmid,TYPE_ERROR,_msgType,data));
                        _workerReply.type = TYPE_ERROR;
                        _workerReply.msg = data;
                        sndWorkerMsg(_workerReply);
                    }
                    return;
                }
            }
            _bufferRcvQueue.writeBytes(data);

            //statics rcv data
            _rcvEndTime = (new Date()).valueOf();
            _rcvSum2 += data.byteLength;

            //return stat. info
            var reply={};
            reply.mmid = _mmid;
            reply.msgType = _msgType;
            reply.type = TYPE_STAT;
            reply.rcvRate = _this.getRcvRate();
            reply.sndRate = _this.getSndRate();
            sndWorkerMsg(reply);

         } else if(data.constructor === Blob){
            var dataBuf = Blob2ArrayBuffer(data);
            if(!dataBuf || dataBuf.byteLength <= 0) return;

            _bufferRcvQueue.writeBytes(dataBuf);

            //statics rcv data
            _rcvEndTime = (new Date()).valueOf();
            _rcvSum2 += dataBuf.byteLength;

            //return stat. info
            var reply={};
            reply.mmid = _mmid;
            reply.msgType = _msgType;
            reply.type = TYPE_STAT;
            reply.rcvRate = _this.getRcvRate();
            reply.sndRate = _this.getSndRate();
            sndWorkerMsg(reply);

        } else {
            console.log("onMessage:un-support data type:",data.constructor);
        }
    };

    var onHandleRcvQueue = function () {
        var buffer = _bufferRcvQueue.readBytes();
        if(!buffer || buffer.byteLength <= 0) return;

        var pack = new Packet(_mmid);
        if( pack ) {
            var ret = pack.parseData(buffer);
            if(ret != 0) {
                console.log("onHandleRcvQueue:Packet.parseData fail["+ret+"]");
                return;
            }

            //var eventData = new EventSocketData(pack.getv5MMID(),pack.getPayloadType(),pack.getv5MMTimeStamp(),pack.getPayload());
            //_worker.postMessage(eventData);
            //return stat. info
            var reply={};
            reply.mmid = pack.getv5MMID();//_mmid;
            reply.msgType = _msgType;
            reply.type = TYPE_DATA;
            reply.data = pack.getPayload();
            reply.pt = pack.getPayloadType();
            reply.ts = pack.getv5MMTimeStamp();
            reply.syncPoint = pack.getv5SyncPoint();
            reply.videoSize = pack.getv5MMVideoSize();
            reply.rcvRate = _this.getRcvRate();
            reply.sndRate = _this.getSndRate();
            sndWorkerMsg(reply);
        }
    };

    var onKeepWsAlive = function() {
        SendNullData();
    };

    return HttpSocket;
})();
new HttpSocket(this);
