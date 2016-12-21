/**
 * Created by xflin on 2015/12/30.
 * xflin@cellcom.com.cn
 */

//globe var start
INTERVALTIMERAUDIO = 15000;//ms
INTERVALTIMERVIDEO = 30000;//ms
G723FRAMELEN = [24,20,4,1];

WORKER_QUIT = "QUIT";
HB_START = "HEARTBEAT START";
HB_STOP = "HEARTBEAT STOP";

//_type
TYPE_INIT = "init";//:String
TYPE_CONNECT = "conneted";//:String
TYPE_CLOSE = "close";//:String
TYPE_ERROR = "error";//:String   ioerror
TYPE_MSG = "msg";//:String messge
TYPE_DATA = "data";//:ArrayBuffer   data
TYPE_STAT = "stat";//:static. sndRate&rcvRate

//_msgType
MSGTYPE_AUDIO = "audio";//:String
MSGTYPE_VIDEO = "video";//:String
MSGTYPE_HEADERAUDIO = "header audio";//:String
MSGTYPE_HEADERVIDEO = "header video";//:String

//rcv queue
MAX_BUFFER_SIZE = 8192*1000;

//Packet protocol const parameters
VERSION    = 0x02;//:uint
EXTENSION    = 0x01;//:uint

//public static var H264:uint    = 0x60;//0xe0
MPEG4   = 0x00000060; //:uint v2, 96, dynamic
H261    = 0x00000061; //:uint
H263    = 0x00000062; //:uint
//H264  	 = 0x00000063; //:uint
G723    = 0x03;//:uint 0x83  [2byte len+32byte header + 48 bytes data]
SPEEX    = 0x06;//:uint
PCM = 0x00000007; //:uint < PCM码
SPEEX_NB = 0x00000009; ///:uint < SPeexNB
SPEEX_WB = 0x00000010; ///:uint < SPeexWB
MPEGAAC  = 0x00000012; ///:uint < G.711 u律编码方式

IFRAME = 0x00;//:uint
PFRAME = 0x01;
NORMALAUDIO = 0x00;
IMPORTAUDIO = 0x01;

VIDEOSIZE_QCIF		= 0x00;//:uint
VIDEOSIZE_CIF		= 0x01;
VIDEOSIZE_CIF320	= 0x02;
VIDEOSIZE_QCIF160	= 0x03;
VIDEOSIZE_CIF640	= 0x04;
VIDEOSIZE_CIF768	= 0x05;

MAX_SIZE_PACKET     = 2920;//:uint 1460;
MAX_SIZE_HEADER     = 32;
MAX_SIZE_PAYLOAD     = MAX_SIZE_PACKET - MAX_SIZE_HEADER;

TYPE_SIZE = 4;

//globe var end
/*
function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

function ArrayBuffer2Blob(buf) {
    return new Blob([buf]);
}

function Blob2ArrayBuffer(b) {
    var uint8ArrayNew  = null;
    //var arrayBufferNew = null;
    var fileReader     = new FileReader();
    fileReader.onload  = function(progressEvent) {
        arrayBufferNew = this.result;
        //uint8ArrayNew = new Uint8Array(arrayBufferNew);
        //return this.result;
    };
    fileReader.onerror = function(evt) {
        console.log("Blob2ArrayBuffer:",evt.toString());
        return null;
    };
    fileReader.onloadend = function(evt) {
        return arrayBufferNew;
    };
    fileReader.readAsArrayBuffer(b);
}

function toHexString(buf) {
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
}
*/
/*
 socket控制event
 _mmid --- uint32
 _type --- string 'conneted'|'close'|'error'
 _msgType --- string 'audio'|'video'
 _data ---- ArrayBuffer
 */
var EventSocket;
EventSocket = (function (id,type,msgType,msg) {
    this._mmid = id || 0;
    this._type = type;
    this._msgType = msgType;
    this._msg = msg;

    this.toString = function() {
        return "{\"_mmid\":"+ this._mmid +
            ",\"_type\":\"" + this._type + "\"" +
            ",\"_msgType\":\"" + this._msgType + "\"" +
            ",\"_msg\":\"" + this._msg + "\"" +
            "}";
    };
});

/*
socket数据event
_mmid --- uint32
_msgType --- string 'audio'|'video'
_data ---- ArrayBuffer
 */
var EventSocketData;
EventSocketData = (function () {
    var _this = this;
    var _mmid = 0;
    var _pt = 0;
    var _ts = 0;
    var _data;//object/bytearray/u8array

    function EventSocketData(id,pt,ts,data) {
        _mmid = id || 0;
        _pt = pt;
        _ts = ts;
        _data = data;
    }

    _this.toString = function() {
        return "{\"_mmid\":"+ _mmid +
            ",\"_pt\":" + _pt +
            ",\"_ts\":" + _ts +
            ",\"_data\":\"" + (_data ?toHexString(_data):"") + "\"" +
            "}";
    };

    _this.getMmid = function() {
        return _mmid;
    };
    _this.getPt = function() {
        return _pt;
    };
    _this.getTs = function() {
        return _ts;
    };
    _this.getData = function() {
        return _data;
    };

    _this.setMmid = function(id) {
        _mmid = id;
    };
    _this.setPt = function(pt) {
        _pt = pt;
    };
    _this.setTs = function(ts) {
        _ts = ts;
    };
    _this.setData = function(data) {
        _data = data;
    };
});

var Packet;
Packet = (function (mmid) {
    var _this = this;
    var _mmid = 0;//:uint = 0;

    // version (V): 2 bits
    // padding (P): 1 bit
    // extension (X): 1 bit
    // CSRC count (CC): 4 bits
    // marker (M): 1 bit
    // payload type (PT): 7 bits
    // sequence number: 16 bits
    // timestamp: 32 bits
    // SSRC: 32 bits
    // CSRC list: 0 to 15 items, 32 bits each

    //rtp header
    var _version=2;//:uint = 2;//2bit
    var _padding=0;//:uint = 0;//1bit
    var _extension=1;//:uint = 1;//1bit
    var _csrc=0;//:uint = 0;//4bit csrc count n [n*4bytes]

    var _marker=1;//:uint = 1;//1bit
    var _payloadType=0;//:uint = 0;//7bit

    var _seqNum=0;//:uint = 0;//2bytes
    var _timestamp=0;//:uint = 0;//4bytes
    var _ssrc=0;//:uint = 0;//4bytes

    var _csrcList=null;//:Array;

    //mm header
    var _v5Version=1;//:uint = 1;//1byte V2RTPversion
    var _v5RRFlag=0;//:uint = 0;//1byte If there is a RR in this rtppackt
    var _v5BWInfo=0;//:uint = 0;//2byte band infomation about the channel
    var _v5SubNum=0;//:uint = 0;//1byte if large video packet is splited
    var _v5TotalNum=1;//:uint = 1;//1byte subnum and totalnum will be used to reassemble
    var _v5MMSeq=0;//:uint = 0;//2byte sequence number indicate a unique multimedia packet
    var _v5MMTimeStamp=0;//:uint = 0;//4byte timestamp when the packet is built
    var _v5MMID=0;//:uint = 0;//4byte mmid

    var _v5SyncPoint=0;//:uint = 0;//1byte VIDEO: 0 = I frame;1= P frame; AUDIO: 0 = Normal frame;1 = Important frame;
    var _v5AudioBurstMark=0;//:uint = 0;//1byte mark the audio outburst;
    var _v5MMVideoSize=0;//:uint = 0;//1byte
    /*
     #define VIDEOSIZE_QCIF		(BYTE)0
     #define VIDEOSIZE_CIF		(BYTE)1
     #define VIDEOSIZE_CIF320	(BYTE)2
     #define VIDEOSIZE_QCIF160	(BYTE)3
     #define VIDEOSIZE_CIF640	(BYTE)4
     #define VIDEOSIZE_CIF768	(BYTE)5
     */
    var _v5Reserved=0;//:uint = 0;//1byte  or SubSeqOfPFrame;

    //payload
    var _payload;//Uint8Array|ArrayBuffer:ByteArray=new ByteArray();
    //var _payloadIndex=0;//:uint = 0;//split packet subNum
    var _payloadU8;

    /*
     mmid:uint
     */
    /*
    function Packet(mmid) {
        _mmid = mmid;
        //_this.reset();
    }
    */

    var init = function(mmid) {
        _mmid = mmid;
    }

    _this.reset = function() {
        //_mmid = 0;
        _version = 2;
        _padding = 0;
        _extension = 1;
        _csrc = 0;
        _marker = 1;
        _payloadType = 0;
        _seqNum = 0;
        _timestamp = 0;
        _ssrc = 0;
        _csrcList = null;

        _v5Version = 1;
        _v5RRFlag = 0;
        _v5BWInfo = 0;
        _v5SubNum = 0;
        _v5TotalNum = 1;
        _v5MMSeq = 0;
        _v5MMTimeStamp = 0;
        _v5MMID = 0;
        _v5SyncPoint = 0;
        _v5AudioBurstMark = 0;
        _v5MMVideoSize = 0;
        _v5Reserved = 0;

        _payload = null;
        //_payloadLen = 0;
        //_payloadIndex = 0;
    };

    _this.toString = function() {
        return toHexString(_this.getByteArray());
    }

    /*
     buf --- Uint8Array
     return String
     */
    /*
    var toHexString = function(buf) {
        if(buf) {
            var buffer = "";
            //buffer.position = 0;
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
    */
    /*
    parse ArrayBuffer
    s --- ArrayBuffer
    return int
    0  --- parse success
    1 --- packet is null
    2 --- length is wrong
    3 --- packet's parameter wrong
     */
    _this.parseData = function(s) {
        if(!s) return 1;
        var buf = new DataView(s);
        var idx = 0;
        var packetLen = buf.byteLength;
        if(packetLen < MAX_SIZE_HEADER) return 2;

        //console.log("parseData len="+packetLen);

        //rtp header
        var first = (buf.getUint8(idx++) & 0xff);
        _version = (first & 0xC0) >> 6;
        _padding = (first & 0x20) >> 5;
        _extension = (first & 0x10) >> 4;
        _csrc = (first & 0x0f);
        //console.log("first="+first+","+_version+","+_padding+","+_extension+","+_csrc);

        var second = (buf.getUint8(idx++) & 0xff);
        _marker = (second & 0x80) >> 7;
        _payloadType = (second & 0x7f);

        _seqNum = buf.getUint16(idx); idx+=2;
        _timestamp = buf.getUint32(idx);idx+=4;
        _ssrc = buf.getUint32(idx);idx+=4;

        if(_csrc > 0) {
            if(packetLen < (12+4*_csrc))
                return 2;

            _csrcList = new Array();
        }
        for(var i=0;i<_csrc;i++) {
            if(_csrcList){
                _csrcList.push(buf.getUint32(idx));idx+=4;
            }
        }

        if(_version != VERSION) return 3;
        if(_extension != EXTENSION) return 3;
        //if(_payloadType != MPEG4 && _payloadType != H263 && _payloadType != SPEEX && _payloadType != G723 && _payloadType != MPEGAAC ) return -1;

        //mm header
        //console.log("packetLen="+packetLen+","+idx);
        if(packetLen < (idx + 20) ) return 2;

        _v5Version = (buf.getUint8(idx++) & 0xff);
        _v5RRFlag = (buf.getUint8(idx++) & 0xff);
        _v5BWInfo = (buf.getUint16(idx) & 0xffff);idx+=2;

        _v5SubNum = (buf.getUint8(idx++) & 0xff);
        _v5TotalNum = (buf.getUint8(idx++) & 0xff);
        _v5MMSeq = (buf.getUint16(idx) & 0xffff);idx+=2;

        _v5MMTimeStamp = buf.getUint32(idx);idx+=4
        _v5MMID = buf.getUint32(idx);idx+=4

        _v5SyncPoint = (buf.getUint8(idx++) & 0xff);
        _v5AudioBurstMark = (buf.getUint8(idx++) & 0xff);
        _v5MMVideoSize = (buf.getUint8(idx++) & 0xff);
        _v5Reserved = (buf.getUint8(idx++) & 0xff);

        //if(_v5MMID != _mmid) return -1;
        if(idx < MAX_SIZE_HEADER) return 2;

        //_payload = s.slice(idx);
        var payloadLen = s.byteLength - idx;
        if(payloadLen > 0 ) {
            _payload = new ArrayBuffer(payloadLen);
            _payloadU8 = new Uint8Array(_payload);
            var sU8 = new Uint8Array(s,idx);
            _payloadU8.set(sU8);

            if((idx + _payloadU8.length) != packetLen) {
                console.log("parseData sum:"+ (idx + _payloadU8.length) + ",rcvSum:"+packetLen);
                return 3;
            }
        }

        return 0;
    };

    /*
     build ArrayBuffer,include size(TYPE_SIZE)
     return ArrayBuffer
     */
    _this.getByteArray = function() {
        var idx = 0;
        var packetLen = MAX_SIZE_HEADER + _csrc*4 + (_payload ? _payload.byteLength:0);
        //console.log("getByteArray packetLen="+packetLen);

        var buffer = new ArrayBuffer(TYPE_SIZE+packetLen);
        var buf = new DataView(buffer);

        if(TYPE_SIZE == 2)
            buf.setUint16(idx,packetLen,true);
        else
            //buf.setUint32(idx,packetLen,true);
            buf.setUint32(idx,packetLen);

        idx+=TYPE_SIZE;

        //rtp header
        //trace("first:"+(((this._version & 0x03) << 6) | ((_padding & 0x01) << 5) | ((_extension & 0x01) << 4) | (_csrc & 0x0f)).toString(16));
        //trace("second:"+(((this._marker & 0x01) << 7) | (_payloadType & 0x7f)).toString(16));

        buf.setInt8(idx,(((_version & 0x03) << 6) | ((_padding & 0x01) << 5) | ((_extension & 0x01) << 4) | (_csrc & 0x0f))); idx++;
        buf.setInt8(idx,(((_marker & 0x01) << 7) | (_payloadType & 0x7f)));idx++;
        buf.setInt16(idx,_seqNum & 0xffff);idx+=2;
        buf.setUint32(idx,_timestamp);idx+=4;
        buf.setUint32(idx,_ssrc);idx+=4;

        for(var i=0;i<_csrc && i<_csrcList.length;i++) {
            buf.setUint32(idx,_csrcList[i]);idx+=4;
        }

        //mm header
        buf.setInt8(idx,_v5Version & 0xff);idx++;
        buf.setInt8(idx,_v5RRFlag & 0xff);idx++;
        buf.setInt16(idx,_v5BWInfo & 0xffff);idx+=2;

        buf.setInt8(idx,_v5SubNum & 0xff);idx++;
        buf.setInt8(idx,_v5TotalNum & 0xff);idx++;
        buf.setInt16(idx,_v5MMSeq & 0xffff);idx+=2;

        buf.setUint32(idx,_v5MMTimeStamp);idx+=4;
        buf.setUint32(idx,_v5MMID);idx+=4

        buf.setInt8(idx,_v5SyncPoint & 0xff);idx++;
        buf.setInt8(idx,_v5AudioBurstMark & 0xff);idx++;
        buf.setInt8(idx,_v5MMVideoSize & 0xff);idx++;
        buf.setInt8(idx,_v5Reserved & 0xff);idx++;

        if(_payload && _payloadU8) {
            //console.log("getByteArray _payload "+ _payloadU8.length);
            if((idx + _payload.byteLength) == (TYPE_SIZE + packetLen)) {
                var bufU8 = new Uint8Array(buffer);
                bufU8.set(_payloadU8,idx);
            } else {
                console.log("getByteArray payload length something wrong:"+packetLen+"!="+idx+"+"+_payload.byteLength);
                return null;
            }
        }

        //console.log("getByteArray "+ bufU8.length);
        return buffer;
    };

    _this.getMmid = function() {
        return _mmid;
    };
    _this.setMmid = function(param){
        _mmid = param;
    };

    //rtp header
    _this.setVersion = function(param){
        _version = param;
    };
    _this.setPadding = function(param){
        _padding = param;
    };
    _this.setExtension = function(param){
        _extension = param;
    };
    _this.setCsrc = function(param){
        _csrc = param;
        if(_csrc > 0) {
            _csrcList = new Array();
        }
    };
    _this.setMarker = function(param){
        _marker = param;
    };
    _this.setPayloadType = function(param){
        _payloadType = param;
    };
    _this.setSeqNum = function(param){
        _seqNum = param;
    };
    _this.setTimestamp = function(param){
        _timestamp = param;
    };
    _this.setSsrc = function(param){
        _ssrc = param;
    };
    _this.setCsrcList = function(param){//:Array
        _csrcList = param;
    };

    _this.getVersion = function(){
        return _version;
    };
    _this.getPadding = function(){
        return _padding;
    };
    _this.getExtension = function(){
        return _extension;
    };
    _this.getCsrc = function(){
        return _csrc;
    };
    _this.getMarker = function(){
        return _marker;
    };
    _this.getPayloadType = function(){
        return _payloadType;
    };
    _this.getSeqNum = function(){
        return _seqNum;
    };
    _this.getTimestamp = function(){
        return _timestamp;
    };
    _this.getSsrc = function(){
        return _ssrc;
    };
    _this.getCsrcList = function() {//:Array
        return _csrcList;
    };

    //mm header
    _this.setv5Version = function(param){
        _v5Version = param;
    };
    _this.setv5RRFlag = function(param){
        _v5RRFlag = param;
    };
    _this.setv5BWInfo = function(param){
        _v5BWInfo = param;
    };

    _this.setv5SubNum = function(param){
        _v5SubNum = param;
    };
    _this.setv5TotalNum = function(param){
        _v5TotalNum = param;
    };
    _this.setv5MMSeq = function(param){
        _v5MMSeq = param;
    };

    _this.setv5MMTimeStamp = function(param){
        _v5MMTimeStamp = param;
    };
    _this.setv5MMID = function(param){
        _v5MMID = param;
    };

    _this.setv5SyncPoint = function(param){
        _v5SyncPoint = param;
    };
    _this.setv5AudioBurstMark = function(param){
        _v5AudioBurstMark = param;
    };
    _this.setv5MMVideoSize = function(param){
        _v5MMVideoSize = param;
    };
    _this.setv5Reserved = function(param){
        _v5Reserved = param;
    };

    _this.getv5Version = function(){
        return _v5Version;
    };
    _this.getv5RRFlag = function(){
        return _v5RRFlag;
    };
    _this.getv5BWInfo = function(){
        return _v5BWInfo;
    };
    _this.getv5SubNum = function(){
        return _v5SubNum;
    };
    _this.getv5TotalNum = function(){
        return _v5TotalNum;
    };
    _this.getv5MMSeq = function(){
        return _v5MMSeq;
    };
    _this.getv5MMTimeStamp = function(){
        return _v5MMTimeStamp;
    };
    _this.getv5MMID = function(){
        return _v5MMID;
    };
    _this.getv5SyncPoint = function(){
        return _v5SyncPoint;
    };
    _this.getv5AudioBurstMark = function(){
        return _v5AudioBurstMark;
    };
    _this.getv5MMVideoSize = function(){
        return _v5MMVideoSize;
    };
    _this.getv5Reserved = function(){
        return _v5Reserved;
    };

    _this.getPayload = function() {//:Uint8Array
        return _payload;
    };
    //payload
    _this.setPayload = function(param){//:ArrayBuffer
        if(param) {
            _payload = new ArrayBuffer(param.byteLength);
            _payloadU8 = new Uint8Array(_payload);
            var paramU8 = new Uint8Array(param);
            _payloadU8.set(paramU8);

            //toHexString(_payload);
            var packLen = MAX_SIZE_HEADER + _payload.length + 4*_csrc;
            _v5TotalNum = 1;//Math.ceil((packLen+TYPE_SIZE)/MAX_SIZE_PACKET);
            //console.log("_v5TotalNum="+_v5TotalNum);
        };
    };

    init(mmid);
});

/*
var object = {};
object._mmid = 123;
object._type = TYPE_CONNECT;
object._msgType = MSGTYPE_VIDEO;
object._msg = "connect ok.";
console.log(object.toString());

var ex = new EventSocket(123,TYPE_CONNECT,MSGTYPE_VIDEO,"adfaf");
console.log(ex.toString());

var payload = new ArrayBuffer(10);
var payloadU8 = new Uint8Array(payload);
for(var i=0;i<payloadU8.byteLength;i++) {
    payloadU8[i]=i;
}
console.log(toHexString(payload));
var exD = new EventSocketData(123,MSGTYPE_VIDEO,payload);
console.log(exD.toString());
*/
/*
var pack=new Packet(123);
var payload = new Uint8Array(10);
for(var i=0;i<payload.byteLength;i++) {
    payload[i]=i;
}
pack.setv5MMID(123);
pack.setPayload(payload.buffer);
console.log(pack.toString());
console.log("Version=" + pack.getVersion());
var data = pack.getByteArray();
console.log("data len="+data.byteLength);
var pack1 = new Packet(234);
var ret = pack1.parseData(data.slice(4));
console.log(pack1.toString());
console.log(ret + "," + pack1.getv5MMID());
*/
/*
 * RTPFixedHeader structure 12 bytes long
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |V=2|P|X|  CC   |M|     PT      |       sequence number         |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                           timestamp                           |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |           synchronization source( SSRC) identifier            |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+


 * RTPMMHeader structure 20 bytes long
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 | V2RTP Version | RR Flag(BYTE) |    Band Info(Audio/video)     |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 | Sub Number    | Total Num     |    Seqence Number(WORD)       |
 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 |                         Timestamp(DWORD)                      |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                           MMID(DWORD)                         |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |  V/A Frame    | AudioBurst    | VideoSize     |    reserved   |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

 * RTP Payload data
 .....


 typedef enum _payloadtype
 {
 //Audio codec, compliance to Fangkun audiolib
 G711a       = 0x00000000, ///< G.711 A律编码方式
 G723		= 0x00000001, ///< G.723.1 6.3kbps编码方式
 G711PLUS	= 0x00000002, ///< 高带宽冗余编码方式：G.711 + G.723.1 x 2
 G723PLUS	= 0x00000003, ///< 低带宽冗余编码方式：G.723.1 x 2
 CELP		= 0x00000004, ///< 高带宽MPEG-4 celp语音编码方式
 CELPPLUS	= 0x00000005, ///< 高带宽MPEG-4 celp语音编码方式：Celp x 2
 SPEEX		= 0x00000006, ///< 甚高带宽Speex 语音编码方式
 PCM			= 0x00000007, ///< PCM码
 G711u		= 0x00000008, ///< G.711 u律编码方式
 AUDIONONE	= 0x0000005F, ///< 未定义的编码方式

 //Video
 MPEG4   	= 0x00000060, //v2, 96, dynamic
 H261   		= 0x00000061, //
 H263   		= 0x00000062, //
 H264   		= 0x00000063, //

 UNKNOWNPLTYPE = 0x00000070

 }PayloadType;

 */
