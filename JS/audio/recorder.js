(function (window) {

    var WORKER_PATH = 'JS/audio/recorderWorker.js';

    var Recorder = function (source, cfg) {
        var _this = this;

        var config = cfg || {};
        var bufferLen = config.bufferLen || 4096;
        this.context = source.context;
        //this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, bufferLen, 2, 2);
        this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, bufferLen, config.channel, config.channel);
        this.floatQueue = [];
        this.floatQueue_offset = 0;

        //add by xflin 20160909
        this.float32Queue = new Float32Queue(bufferLen*1000);

        var worker = new Worker(WORKER_PATH);
        this.sampleRate;

        worker.postMessage({
            command: 'init',
            config: config
            /*
            config: {
                sampleRate: this.context.sampleRate,
                rate: 8000,
                channel: 2,
                bits: 16,
                duration: 30
            }
            */
        });
        var recording = false, currCallback;

        this.node.onaudioprocess = function (e) {
			//if (_this.float32Queue.getLength() > 0){
			   if(config.channel && config.channel >= 2)
					_this.outputAudio(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1));
			   else
					_this.outputAudio(e.outputBuffer.getChannelData(0));
			//}

            if (!recording)
                return;

            //record audio to encode
            if(config.channel && config.channel >= 2)
                _this.inputAudio(e.inputBuffer.getChannelData(0), e.inputBuffer.getChannelData(1));
            else
                _this.inputAudio(e.inputBuffer.getChannelData(0));

            //console.log("Audio Size:" + e.inputBuffer.getChannelData(1).byteLength);
        }

        this.inputAudio = function (inDataL, inDataR) {
            var input = [];
            if(inDataL) input.push(inDataL);
            if(inDataR) input.push(inDataR);
            worker.postMessage({
                command: 'recordAudio',
                buffer: input
            });
        }

        //float32Queue play audio
        //edit by xflin 20160909
/*
        var copied = 0;
        this.outputAudio = function (outDataL, outDataR) {
            var len = _this.float32Queue.getLength();
            var output = [];

            if(outDataL) output.push(outDataL);
            if(outDataR) output.push(outDataR);
            while (copied < bufferLen && len > 0) {

                var copy_samples = Math.min(len, bufferLen - copied);
                var f32 = _this.float32Queue.readSamples(copy_samples);

                for (var ch = 0; ch < output.length; ++ch) {
                    output[ch].set(f32,copied);
                }
                copied += copy_samples;
                len = _this.float32Queue.getLength();
            }
            //fill bufferLen full
            if(copied < bufferLen) {
				//console.log((new Date()).valueOf(),"outputAudio",copied,len);
                //var zeroF32 = new Float32Array(bufferLen-copied);
                //for (var ch = 0; ch < output.length; ++ch) {
                //    output[ch].set(zeroF32,copied);
                //}
            }
            if(copied >= bufferLen)
                copied = 0;

        }
*/


        this.outputAudio = function (outDataL, outDataR) {
            var len = _this.float32Queue.getLength();
            if (len < bufferLen) {
                console.log((new Date()).valueOf(),"outputAudio",len);
                return;
            }

            var output = [];

            if(outDataL) output.push(outDataL);
            if(outDataR) output.push(outDataR);

            //console.log((new Date()).valueOf()+" Float32Queue len1="+_this.float32Queue.getLength());
            var f32 = _this.float32Queue.readSamples(bufferLen);
            if(!f32 || f32.length != bufferLen )
                return;

            //this.playPcmChunk(f32);
            if(outDataL)
                outDataL.set(f32);
            if(outDataR)
                outDataR.set(f32);
            /*
            for (var ch = 0; ch < output.length; ++ch) {
                output[ch].set(f32);
            }
            //console.log((new Date()).valueOf()+" Float32Queue len2="+_this.float32Queue.getLength());
            */
        }


        /*
        this.outputAudio = function (outDataL, outDataR) {
            if (_this.floatQueue.length == 0)
                return;

            var output = [];

            if(outDataL) output.push(outDataL);
            if(outDataR) output.push(outDataR);

            var total_samples = output[0].length;
            var copied = 0;
            while (copied < total_samples && this.floatQueue.length > 0) {
                //if(this.floatQueue[0].length > 0 ) {
                    var copy_samples = Math.min(this.floatQueue[0].length - this.floatQueue_offset, total_samples - copied);


                    for (var ch = 0; ch < output.length; ++ch) {
                        output[ch].set(this.floatQueue[0].subarray(this.floatQueue_offset, this.floatQueue_offset + copy_samples), copied);
                    }
                    copied += copy_samples;
                    this.floatQueue_offset += copy_samples;
                    this.queue_samples -= copy_samples;

                    if (this.floatQueue[0].length == this.floatQueue_offset) {
                        this.floatQueue_offset = 0;
                        this.floatQueue.shift();
                    }
                //} else {
                //    this.floatQueue.shift();
                //}
            }
        }
        */
        this.outputPcm = function() {
            window.setTimeout(function () {
                if(recording)
                    this.outputPcm();
            }, 30);
            worker.postMessage({ command: 'exportData' });
        }

        this.exportData = function (cb) {

            currCallback = cb || config.callback;
            if (!currCallback) throw new Error('Callback not set');

            //worker.postMessage({ command: 'exportData' });
        }

        this.importData = function (obj) {
            obj.command = 'importData';
            worker.postMessage(obj);
        }

        this.addSpeaker = function (id) {
            worker.postMessage({ command: 'addSpeaker',mmid: id});
        }

        this.delSpeaker = function (id) {
            worker.postMessage({ command: 'delSpeaker',mmid: id});
        }

        this.delAllPlayQueue = function () {
            worker.postMessage({ command: 'delAllPlayQueue'});
        }

        worker.onmessage = function (e) {
            switch (e.data.msg) {
                case 'recordAudio':
                    currCallback(e.data.buf);
                    //_this.clear();
                    break;
                case 'export':
                    currCallback(e.data.buf);
                    _this.clear();
                    break;
                case 'import':
                    //_this.floatQueue.push(e.data.buf);
                    _this.float32Queue.writeSamples(e.data.buf);
                    break;
            }
        }

        this.configure = function (cfg) {
            for (var prop in cfg) {
                if (cfg.hasOwnProperty(prop)) {
                    config[prop] = cfg[prop];
                }
            }
        }

        this.record = function () {
            recording = true;
        }

        this.stop = function () {
            recording = false;
        }

        this.isRecord = function () {
            return recording;
        }

        this.clear = function () {
            worker.postMessage({ command: 'clear' });
        }

        this.destroy = function () {
            this.stop();
            if(worker) {
                worker.postMessage({command: 'destroy'});
                worker.terminate();
            }
        }

        /**
         * ��������
         * @param n  0-100
         */
        this.setVolumn = function(n) {
            // ����һ��gain node
            var gainNode = this.context.createGain();
            // ��ʵ����gain node����
            source.connect(gainNode);
            // ��gain node�벥���豸����
            gainNode.connect(this.context.destination);
            //һ���趨���֮����Ϳ���ͨ���ı�ֵ֮�������������ˡ�
            //��������ֵ 0-1
            gainNode.gain.value = n/100.0;
        }
		
        var AudioStart =0;
        this.playPcmChunk = function(data){
            //var f32 = _this.float32Queue.readSamples(bufferLen);
            //if(!f32 || f32.length != bufferLen )
            //    return;

            var source = this.context.createBufferSource();

            var audio = data;//new Float32Array(data);

            //var audioBuffer = this.context.createBuffer(1, audio.length , 44100);
            var audioBuffer = this.context.createBuffer(1, audio.length , 8000);
            audioBuffer.getChannelData(0).set(audio);
            source.buffer = audioBuffer;
            source.connect(this.context.destination);

            //source.start(AudioStart);
            source.start(0);

            AudioStart += audioBuffer.duration;
        }

        source.connect(this.node);
        this.node.connect(this.context.destination);    //this should not be necessary
        //this.initAudioQueue();
    };

    window.Recorder = Recorder;

})(window);
