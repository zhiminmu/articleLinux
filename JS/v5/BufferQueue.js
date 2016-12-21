/**
 * Created by xflin on 2015/12/30.
 * xflin@cellcom.com.cn
 */

//Uint8ClampedArray
var BufferQueue;
BufferQueue = (function (size) {
    var _this = this;
    var _size;
    var _buffer;
    var _bufferU8;
    var _bufferView;
    var _idxWrite;
    var _idxRead;
    var _loopCountWrite;//:uint=0;
    var _loopCountRead;//:uint=0;

    var init = function () {
        _idxWrite = 0;
        _idxRead = 0;
        _loopCountWrite = 0;
        _loopCountRead = 0;
        _size = size;
        _buffer = new ArrayBuffer(_size);
        if (_buffer.byteLength === _size) {
            console.log("BufferQueue init ArrayBuffer size "+_size);
        } else {
            _size = _buffer.byteLength;
            console.log("BufferQueue init ArrayBuffer size fail."+_size);
        }
        _bufferU8 = new Uint8Array(_buffer);
        _bufferView = new DataView(_buffer);
    };

    _this.clear = function () {
        _idxRead = 0;
        _idxWrite = 0;
        _loopCountRead = 0;
        _loopCountWrite = 0;
        //_bufferU8.();
    };

    var getWritedCount = function () {
        return (_loopCountWrite * _size + _idxWrite);
    };

    var getReadCount = function() {
        return (_loopCountRead * _size + _idxRead);
    };

    var IsFull =  function(len) {
        return ((_this.getLength()+len) > size);
    };

    var IsWriteEnd =  function(len) {
        return ((_idxWrite+len) > size);
    };

    var IsReadEnd =  function(len) {
        return ((_idxRead+len) > size);
    };

    _this.getFreeLength = function() {
        return ( _size - (_idxWrite - _idxRead)) % _size;
    }

    _this.getLength = function() {
        return (_idxWrite - _idxRead  + _size) % _size;
    }

    var nextWriteIdx = function(offset) {
        if(_idxWrite+offset >= _size)
            _loopCountWrite++;

        _idxWrite = ((_idxWrite+offset) % _size);
        //console.log("_idxWrite="+_idxWrite+"["+offset+"]");
    };

    var nextReadIdx = function(offset) {
        if(_idxRead+offset >= _size)
            _loopCountRead++;

        _idxRead = ((_idxRead + offset) % _size);
        //console.log("_idxRead="+_idxRead+"["+offset+"]");
    };

    /*
    value -- int
    b --- boolean,true littleEndian;false bigEndian
     */
    _this.writeInt = function (value,b) {
        if(!IsWriteEnd()) {
            _bufferView.setInt32(_idxWrite, value, b);
            nextWriteIdx(4);
        } else {

        }
    };

    /*
    write queue buffer
    s --- ArrayBuffer
     */
    _this.writeBytes = function(s) {
        if(!s || s.byteLength===0) return;

        var frameLen = s.byteLength;
        if(!_bufferU8)
            _bufferU8 = new Uint8Array(_buffer);

        var bufU8 = new Uint8Array(s);
        if(IsWriteEnd(frameLen)) {
            //var buffer1 = s.slice(0, (_size - _idxWrite));
            //var buffer2 = s.slice((_size - _idxWrite));
            var data1 = bufU8.subarray(0,(_size - _idxWrite));//new Uint8Array(s,0,(_size - _idxWrite));
            var data2 = bufU8.subarray(data1.length);//new Uint8Array(s,(_size - _idxWrite));

            _bufferU8.set(data1,_idxWrite);
            _bufferU8.set(data2);
            console.log("_idxWrite 0" + ": " + _bufferU8[0]);
            nextWriteIdx(frameLen);
        } else {
            var data = new Uint8Array(s);
            _bufferU8.set(data,_idxWrite);
            nextWriteIdx(frameLen);
        }

        //console.log("writeBytes:_idxWrite=",_idxWrite,",writeLen=",frameLen,","+toHexString(s));
    };

    /*
     read from queue buffer
     return
     ArrayBuffer(frame)
     */
    _this.readBytes = function() {
        var frameLen=0;
        var buf;
        var bufU8;

        if(!_bufferView)
            _bufferView = new DataView(_buffer);

        if(_bufferView && _this.getLength() > 4) {
            //frameLen=_bufferView.getUint32(_idxRead,true);
            frameLen=_bufferView.getUint32(_idxRead);
            if( _this.getLength() >= (frameLen+4)) {
                nextReadIdx(4);
                //console.log("readBytes:"+frameLen);
                if (frameLen > 0) {
                    buf = new ArrayBuffer(frameLen);
                    bufU8 = new Uint8Array(buf);
                    if(IsReadEnd(frameLen)) {
                        var data1 = _bufferU8.subarray(_idxRead);//new Uint8Array(_buffer,_idxRead);
                        var data2 = _bufferU8.subarray(0,(frameLen - data1.length));//new Uint8Array(_buffer,0,(frameLen - data1.length));

                        bufU8.set(data1,0);
                        bufU8.set(data2,data1.length);
                    } else {
                        //buf = _buffer.slice(_idxRead, _idxRead + frameLen);
                        var data3 = _bufferU8.subarray(_idxRead,_idxRead + frameLen);
                        bufU8.set(data3);
                    }
                    nextReadIdx(frameLen);
                }
                //console.log("readBytes:_idxRead=",_idxRead,",readLen=",frameLen,","+toHexString(buf));
            }
        }
        return buf;
    };

    /*
     read sample from queue buffer
     return
     ArrayBuffer(frame)
     */
    _this.readSampleBytes = function(byteLength) {
        var frameLen=0;
        var buf;
        var bufU8;

        if(!_bufferView)
            _bufferView = new DataView(_buffer);

        if(_bufferView && _this.getLength() >= byteLength) {
            buf = new ArrayBuffer(byteLength);
            bufU8 = new Uint8Array(buf);
            if(IsReadEnd(byteLength)) {
                var data1 = _bufferU8.subarray(_idxRead);//new Uint8Array(_buffer,_idxRead);
                var data2 = _bufferU8.subarray(0,(byteLength - data1.length));//new Uint8Array(_buffer,0,(frameLen - data1.length));

                bufU8.set(data1,0);
                bufU8.set(data2,data1.length);
            } else {
                //buf = _buffer.slice(_idxRead, _idxRead + frameLen);
                var data3 = _bufferU8.subarray(_idxRead,_idxRead + frameLen);
                bufU8.set(data3);
            }
            nextReadIdx(frameLen);
        }
        return buf;
    };

    var toHexString = function(buf) {
        if(buf) {
            var buffer = "";
            var bufV = new DataView(buf);

            for (var i=0 ; i < bufV.byteLength &&  i < 512;i++) {
                var b = bufV.getUint8(i);
                buffer += (b<=0x0f?"0":"") + b.toString(16) + " ";
                //buffer.appendData((b<=0x0f?"0":"") + b.toString(16) + " ");
            }
            //console.log(buffer);
            return buffer;
        }
        return null;
    };


    init();
});

