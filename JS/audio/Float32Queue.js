/**
 * Created by xflin on 2016/9/9.
 * xflin@cellcom.com.cn
 */

MAX_BUFFER_SIZE = 8192*1000;
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


function Float32Queue(size,func) {
    //EventEmitter.call(this);
    _thisQueue = this;
    this._size = size | MAX_BUFFER_SIZE;
    this._callback = func;
    this.init();
}
//util.inherits(BufferQueue, EventEmitter);

Float32Queue.prototype.init = function () {
    this._idxWrite = 0;
    this._idxRead = 0;
    this._loopCountWrite = 0;
    this._loopCountRead = 0;
    this._buffer = new ArrayBuffer(this._size * 4);
    if (this._buffer.byteLength === this._size * 4) {
        console.log("Queue init ArrayBuffer size "+this._size);
    } else {
        this._size = this._buffer.length;
        console.log("Queue init ArrayBuffer size fail."+this._size);
    }
    this._bufferF32 = new Float32Array(this._buffer);
    //this._bufferU16 = new Uint16Array(this._buffer);
    this._bufferView = new DataView(this._buffer);
};

Float32Queue.prototype.clear = function () {
    this._idxRead = 0;
    this._idxWrite = 0;
    this._loopCountRead = 0;
    this._loopCountWrite = 0;
    //_bufferU8.();
};

Float32Queue.prototype.getWritedCount = function () {
    return (this._loopCountWrite * this._size + this._idxWrite);
};

Float32Queue.prototype.getReadCount = function() {
    return (this._loopCountRead * this._size + this._idxRead);
};

Float32Queue.prototype.IsFull =  function(len) {
    return ((this.getLength()+len) > this._size);
};

Float32Queue.prototype.IsWriteEnd =  function(len) {
    return ((this._idxWrite+len) > this._size);
};

Float32Queue.prototype.IsReadEnd =  function(len) {
    return ((this._idxRead+len) > this._size);
};

Float32Queue.prototype.getFreeLength = function() {
    return ( this._size - (this._idxWrite - this._idxRead)) % this._size;
}

Float32Queue.prototype.getLength = function() {
    return (this._idxWrite - this._idxRead  + this._size) % this._size;
}

Float32Queue.prototype.nextWriteIdx = function(offset) {
    if(this._idxWrite+offset >= this._size)
        this._loopCountWrite++;

    this._idxWrite = ((this._idxWrite+offset) % this._size);
    //console.log("_idxWrite="+this._idxWrite+"["+offset+"]");
};

Float32Queue.prototype.nextReadIdx = function(offset) {
    if(this._idxRead+offset >= this._size)
        this._loopCountRead++;

    this._idxRead = ((this._idxRead + offset) % this._size);
    //console.log("_idxRead="+this._idxRead+"["+offset+"]");
};

/*
 value -- int
 b --- boolean,true littleEndian;false bigEndian
 */
Float32Queue.prototype.writeInt = function (value,b) {
    if(!this.IsWriteEnd()) {
        this._bufferView.setInt32(this._idxWrite, value, b);
        this.nextWriteIdx(2);
    } else {

    }
};

/**
 * writeU16
 * @param value  u16
 * @param b
 */
Float32Queue.prototype.writeU16 = function (value,b) {
    if(!this.IsWriteEnd(1)) {
        this._bufferU16[this._idxWrite] = value;
        this.nextWriteIdx(1);
    } else {

    }
};

/**
 * readU16
 * @param value  u16
 * @param b
 */
Float32Queue.prototype.readU16 = function () {
    var n=0;
    if(this.getLength() >= 1) {
        n = this._bufferU16[this._idxRead];
        this.nextReadIdx(1);
    }
    return n;
};

/*
 write queue buffer
 s --- Uint16Array
 */
Float32Queue.prototype.writeSamples = function(s) {
    if(!s || s.length===0) return;

    var frameLen = s.length;
    if(!this._bufferF32)
        this._bufferF32 = new Float32Array(this._buffer);

    var buf = s;//new Uint8Array(s);
    if(this.IsWriteEnd(frameLen)) {
        //var buffer1 = s.slice(0, (_size - _idxWrite));
        //var buffer2 = s.slice((_size - _idxWrite));
        var data1 = buf.subarray(0,(this._size - this._idxWrite));//new Uint8Array(s,0,(_size - _idxWrite));
        var data2 = buf.subarray(data1.length);//new Uint8Array(s,(_size - _idxWrite));

        this._bufferF32.set(data1,this._idxWrite);
        this._bufferF32.set(data2);
        //console.log("_idxWrite 0" + ": " + _bufferU16[0]);
        this.nextWriteIdx(frameLen);
    } else {
        this._bufferF32.set(buf,this._idxWrite);
        this.nextWriteIdx(frameLen);
    }

    //console.log("writeBytes:_idxWrite=",this._idxWrite,",writeLen=",frameLen,","+toHexString(s));
};

/*
 read samples from queue buffer
 return
 Uint16Array
 */
Float32Queue.prototype.readSamples = function(len) {
    var buf;

    if(this.getLength() >= len) {
        buf = new Float32Array(len);
        if (this.IsReadEnd(len)) {
            var data1 = this._bufferF32.subarray(this._idxRead);//new Uint8Array(_buffer,_idxRead);
            var data2 = this._bufferF32.subarray(0,(len - data1.length));//new Uint8Array(_buffer,0,(frameLen - data1.length));

            buf.set(data1,0);
            buf.set(data2,data1.length);
        } else {
            //buf = _buffer.slice(_idxRead, _idxRead + frameLen);
            var data3 = this._bufferF32.subarray(this._idxRead,this._idxRead + len);
            buf.set(data3);
        }
        this.nextReadIdx(len);
    }
    return buf;
};
//module.exports = Float32Queue;
