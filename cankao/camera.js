      
                  
           
   videoObj = { "video": true ,"audio":true},            
   errBack = function (error) {           
            console.log("Video capture error: ", error.code);    
               };                 
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);


if (navigator.getUserMedia) {
    	navigator.getUserMedia(videoObj, function (stream) {
    	var video = document.getElementById("video");
            
        if (window.URL) {
        	video.src = window.URL.createObjectURL(stream);
        } else {
            video.src = stream;
        }
                    video.autoplay=true;      
             }, errBack);       
    }else{
    	console.log("your browser dose not support getUserMedia");
    }