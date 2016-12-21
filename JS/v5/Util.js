/**
 * Created by xflin on 2015/12/30.
 */

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
    var arrayBufferNew = null;
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
/*
 buf --- Uint8Array
 return String
 */
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

/*
var BinaryFile={
    createNew: function(filepath) {
        var binaryFile = {};

        var adTypeBinary = 1, adTypeText = 2;

        var adSaveCreateNotExist = 1, adSaveCreateOverWrite = 2;

        var adReadAll = -1, adReadLine = -2;

        var path = filepath;

        var uint8ArrayNew  = null;
        var arrayBufferNew = null;

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


        binaryFile.WriteAll = function (content) {

            var Stream = new ActiveXObject("ADODB.Stream");

            Stream.Type = adTypeText;

            Stream.CharSet = "iso-8859-1";

            Stream.Open();

            Stream.WriteText(content);

            Stream.SaveToFile(path, adSaveCreateOverWrite);

            Stream.Close();

            Stream = null;

        };

        binaryFile.ReadAll = function () {

            var Stream = new ActiveXObject("ADODB.Stream");

            Stream.Type = adTypeBinary;//adTypeText;

            Stream.CharSet = "iso-8859-1";

            Stream.Open();

            Stream.LoadFromFile(path);

            var content = Stream.ReadText(adReadAll);

            Stream.Close();

            Stream = null;

            return content;

        };

        return binaryFile;
    }

};
*/