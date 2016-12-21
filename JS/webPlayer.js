function show_cur_times(){
    //获取当前日期
    var date_time = new Date();
    //定义星期
    var week;
    //switch判断
    switch (date_time.getDay()){
        case 1: week="星期一"; break;
        case 2: week="星期二"; break;
        case 3: week="星期三"; break;
        case 4: week="星期四"; break;
        case 5: week="星期五"; break;
        case 6: week="星期六"; break;
        default:week="星期天"; break;
    }
 
     //年
     var year = date_time.getFullYear();
      //判断小于10，前面补0
       if(year<10){
          year="0"+year;
        }
     
     //月
     var month = date_time.getMonth()+1;
      //判断小于10，前面补0
      if(month<10){
        month="0"+month;
      }
     
     //日
     var day = date_time.getDate();
      //判断小于10，前面补0
     if(day<10){
        day="0"+day;
     }
     
     //时
     var hours =date_time.getHours();
     //判断小于10，前面补0
     if(hours<10){
        hours="0"+hours;
     }
     
     //分
     var minutes =date_time.getMinutes();
      //判断小于10，前面补0
     if(minutes<10){
        minutes="0"+minutes;
     }
     
     //秒
     var seconds=date_time.getSeconds();
      //判断小于10，前面补0
     if(seconds<10){
        seconds="0"+seconds;
     }
     
     //拼接年月日时分秒
     var date_str = year+"年"+month+"月"+day+"日 "+hours+":"+minutes+":"+seconds+" "+week;
     //显示在id为showtimes的容器里
     // document.getElementById("showtimes").innerHTML= date_str;
     $("#showtimes").html(date_str);
}

$(document).ready(function($) {
	
    $("#newwb p").on("click",function(){
        adapter.connection.send(sendCreatewbxml());
    });
	// 上传课件操作
	$("#uploadclassfile p").click(function(event) {
		// $("#uploadcoursefile").trigger("click");
        $(this).next().click();
        $("#uploadcoursefile").change(function(event) {
            postfiletoserver("uploadcoursefile","wb");
        });
	});
	
	// 上传附件
    $(".affix-nav p").click(function(event) {
        $("#affix_upload_op").click();
        uploadfile("affix_upload_op");
    });
	document.onkeydown = function(event){
		// event.preventDefault();
		if (event.keyCode==27) {
			$("#windows_full").show();
		}
	}
	
	// 点击播放音乐按钮
	$("#play_music_ct p").click(function(event) {
		
	});

     //设置1秒调用一次show_cur_times函数
    setInterval("show_cur_times()",1000);
    var clock = document.querySelector('#utility-clock')
    utilityClock(clock)

    if (clock.parentNode.classList.contains('fill')) 
        autoResize(clock, 295 + 32);
	
});
// 展示课件
function showCourseFile(){

}
 

// 是否支持file API
function isSupportFileApi(){
	if (window.File&&window.FileReader&&window.FileList&&window.Blob) {
		return true;
	}
	return false;
}
function isSupportFormData(){
	if (window.FormData) {
		return true;
	}
}
/**
 *刚进入会议查询wb消息
 */
var sendQuerywbmsgxml=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+uuid++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:share:browse");
    iq.appendChild(query);
    return iq;
}

/**
 *
 */
var deletemouseupfun=function (x,y,dtx,dty) {

    if(adapter.deleteischeck){
        var tmpx=x;
        var tmpy=y;
        var w=Math.abs(dtx-x);
        var h=Math.abs(dty-y);
        if(x>dtx) {
            x=dtx;
            dtx=tmpx;
        }
        if(y>dty){
            y=dty;
            dty=tmpy;
        }
        var tmp=parseDeleteSharpIqnode(iqArrary,adapter.pagejid,x,y,dtx,dty);
        if(tmp.length){
            adapter.connection.send(sendDeletesharpxml(tmp,adapter.pagejid));


        //    parseIQnode(sendDeletesharpxml(tmp,adapter.pagejid),iqArrary.length,false);
        }
        ctx.restore();


    }

}
/**
 *发送删除xml消息
 */
var sendDeletesharpxml=function (namearr,pgjid) {
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:object:share");
    query.setAttribute("type","delete");
    var info=doc.createElement("info");
    var jid=doc.createElement("jid");
    jid.appendChild(doc.createTextNode(pgjid));
    var pageno=doc.createElement("pageno");
    var pagenovalue=$('#whichpg').val();
    pageno.appendChild(doc.createTextNode(pagenovalue.slice(0,pagenovalue.indexOf('/'))-1));
    var type=doc.createElement("type");
    type.appendChild(doc.createTextNode("doc"));
    var object=doc.createElement("object");
    for(var i=0;i<namearr.length;i++)
    {
        var name=doc.createElement("name");
        name.appendChild(doc.createTextNode(namearr[i]));
        object.appendChild(name);
    }
    info.appendChild(jid);
    info.appendChild(pageno);
    info.appendChild(type);
    info.appendChild(object);
    query.appendChild(info);
    iq.appendChild(query);
    return iq;

}

/**
 * color数据转换成#FFFFF格式
 */
function  strToHex(col)
{
    var tmpcol=parseInt(col);
    var tmpcolor=(tmpcol).toString(16);
    if(tmpcol<=15)
        return "00000"+tmpcolor;
    else if(tmpcol<=255)
        return "0000"+tmpcolor;
    else if(tmpcol<=4096)
        return "000"+tmpcolor;
    else if(tmpcol<=65535)
        return "00"+tmpcolor;
    else if(tmpcol<=1048575)
        return "0"+tmpcolor;
    else return ""+tmpcolor;
}

function replaceRB(str)
{

    return "#"+str.slice(4,6)+str.slice(2,4)+str.slice(0,2);


}
function replaceBR(str){
    return str.slice(5,7)+str.slice(3,5)+str.slice(1,3);
}

/**
 * 绘制矩形
 */
function drawRect(x,y,dtx,dty,col)
{
    var imgcol=replaceRB(strToHex(col));
    var w=Math.abs(dtx-x);
    var h=Math.abs(dty-y);
    if(parseInt(x)>parseInt(dtx)) x=dtx;
    if(parseInt(y)>parseInt(dty)) y=dty;
    recctx.beginPath();
    recctx.strokeStyle=imgcol;
    recctx.lineWidth=1;
    recctx.strokeRect(x-0.5,y-0.5,w,h);
    recctx.closePath();

}
/**
 * 绘制圆角矩形
 */
function drawArcRect(x,y,dtx,dty,col)
{

    var w=Math.abs(dtx-x);
    var h=Math.abs(dty-y);
    if(parseInt(x)>parseInt(dtx)) x=dtx;
    if(parseInt(y)>parseInt(dty)) y=dty;
    var x0=parseInt(x)-0.5;
    var y0=parseInt(y)-0.5;
    var r = 25;
    if (w <2 * r) r = w / 3;
    if (h < 2 * r) r = h / 3;
    var imgcol=replaceRB(strToHex(col));

    recctx.strokeStyle=imgcol;
    recctx.lineWidth=1;
    recctx.beginPath();
    recctx.moveTo(x0+r, y0);
    recctx.arcTo(x0+w, y0, x0+w, y0+h, r);
    recctx.arcTo(x0+w, y0+h, x0, y0+h, r);
    recctx.arcTo(x0, y0+h, x0, y0, r);
    recctx.arcTo(x0, y0, x0+w, y0, r);
    recctx.stroke();
    recctx.closePath();


}
/**
 * 绘制圆
 */
function drawRound(x,y,dtx,dty,col)
{

    recctx.save();
    recctx.lineWidth=1;
    var imgcol=replaceRB(strToHex(col));
    recctx.strokeStyle=imgcol;
    recctx.beginPath();
    var x0=(parseInt(dtx)+parseInt(x))/2;
    var y0=(parseInt(dty)+parseInt(y))/2;
    var w=Math.abs(dtx-x)/2;
    var h=Math.abs(dty-y)/2;
    var r = (w > h)? w : h;
    var ratioX = w / r; //横轴缩放比率
    var ratioY = h / r; //纵轴缩放比率
    recctx.scale(ratioX, ratioY); //进行缩放（均匀压缩）
//从椭圆的左端点开始逆时针绘制
    recctx.moveTo((x0 + w) / ratioX , y0 / ratioY);
    recctx.arc(x0 / ratioX, y0 / ratioY, r, 0, 2 * Math.PI);
    recctx.stroke();
    recctx.closePath();
    recctx.restore();
}
/**
 * 绘制直线
 */
function  drawLine(x,y,dtx,dty,col,thick)
{

    recctx.lineCap="round";
    var imgcol=replaceRB(strToHex(col));
    recctx.strokeStyle=imgcol;
    recctx.beginPath();

    recctx.lineWidth=thick;
    if(thick>1)
    {

        recctx.moveTo(x,y);
        recctx.lineTo(dtx,dty);
    }
    else{
        recctx.moveTo(x-0.5,y-0.5);
        recctx.lineTo(dtx-0.5,dty-0.5);
    }
    recctx.stroke();
    recctx.closePath();


}
/**
 * 曲线
 */
function  drawThinfreeline(arr,col,thick)
{
    recctx.lineCap="round";
    var pointslen=1,dstX=0,dstY=0;
    var imgcol=replaceRB(strToHex(col));
    recctx.strokeStyle=imgcol;
    recctx.lineWidth=thick;
    recctx.beginPath();
    if(thick>1)
        recctx.moveTo(arr[0].X,arr[0].Y);
    else
        recctx.moveTo(arr[0].X-0.5,arr[0].Y-0.5);
    while(pointslen<arr.length){
        dstX=arr[pointslen].X;
        dstY=arr[pointslen].Y;
        pointslen++;
        if(thick>1)
            recctx.lineTo(dstX,dstY);
        else
            recctx.lineTo(dstX-0.5,dstY-0.5);
    }
    recctx.stroke();
    recctx.closePath();
}
/**
 * 荧光笔曲线
 */
function  drawfluorepen(arr,col)
{
//alert("画荧光笔");
    var pointslen=1,dstX=0,dstY=0;
    var imgcol=replaceRB(strToHex(col));
    recctx.lineCap="round";
    recctx.strokeStyle="rgba(172,254,172,0.7)";//11cd0c
    recctx.lineWidth=12;
    recctx.beginPath();
    recctx.moveTo(arr[0].X,arr[0].Y);
    while(pointslen<arr.length){
        dstX=arr[pointslen].X;
        dstY=arr[pointslen].Y;
        pointslen++;
        recctx.lineTo(dstX,dstY);

    }
    recctx.stroke();
    recctx.closePath();
}
/**
 * 绘制字体
 */
function drawText(textval,x,y,col,italic,bold,size,height,name)
{
    if(italic==="x")
        italic="";
    else
        italic="italic";
    if(bold==="x")
        bold="";
    else
        bold="bold";
    size=parseInt(size*96/72);
    y=y-height;
    recctx.font=bold+" "+" "+italic+" "+size+"px "+name;
    var imgcol=replaceRB(strToHex(col));
    recctx.fillStyle=imgcol;
    recctx.fillText(textval,x,y);
}

/**
 *sendlinexml
 */
// var sendlinexml=function(pArr,sharptype,pgjid,lineWidth,word){
//     var doc=createXMLDoc();
//     var iq=doc.createElement("iq");
//     doc.appendChild(iq);
//     iq.setAttribute("id","jcl_"+uuid++);
//     iq.setAttribute("type","get");
//     iq.setAttribute("to",adapter.room_data);//room_data
//     var query=doc.createElement("query");
//     query.setAttribute("type","create");
//     query.setAttribute("xmlns","cellcom:object:share");

//     var info=doc.createElement("info");
//     var jid=doc.createElement("jid");
//     jid.appendChild(doc.createTextNode(pgjid));
//     var pageno=doc.createElement("pageno");
//     pageno.appendChild(doc.createTextNode("0"));
//     var type=doc.createElement("type");
//     type.appendChild(doc.createTextNode("doc"));
//     var object=doc.createElement("object");
//     console.log(sharptype);
//     var objtype=doc.createElement("type");
//     objtype.appendChild(doc.createTextNode(sharptype));
//     var color=doc.createElement("color")
//     color.appendChild(doc.createTextNode(parseInt(replaceBR(document.getElementById("colorslt").value),16)));
//     var points=doc.createElement("points");
//     for(var i=0;i<pArr.length;i++)
//     {
//         var point;
//         if(i==0)
//         {
//             point=doc.createElement("point");
//             point.setAttribute("y",pArr[i].y);
//             point.setAttribute("x",pArr[i].x);
//         }else{
//             point=doc.createElement("point");
//             point.setAttribute("y",pArr[i].y);
//             point.setAttribute("x",pArr[i].x);
//             point.setAttribute("type","x");
//         }
//         points.appendChild(point);
//     }
//     var owner=doc.createElement("owner");
//     owner.appendChild(doc.createTextNode("adasfsdf"));
//     object.appendChild(objtype);
//     object.appendChild(color);
//     if(sharptype==="line"||sharptype==="thickfreeline"||sharptype==="thinfreeline")
//     {
//         var thick=doc.createElement("thick");
//         thick.appendChild(doc.createTextNode(lineWidth));
//         object.appendChild(thick);
//     }
//     if(sharptype==="text")
//     {
//         var text=doc.createElement("text");
//         text.appendChild(doc.createTextNode(word));
//         object.appendChild(text);
//         var font=doc.createElement("font");
//         font.setAttribute("underline","x");
//         font.setAttribute("bold","x");
//         font.setAttribute("pitch","0");
//         font.setAttribute("color",document.getElementById("colorslectct").value);
//         font.setAttribute("strikeOut","x");
//         font.setAttribute("height","-27");
//         font.setAttribute("size","20");//size
//         font.setAttribute("italic","x");
//         font.setAttribute("name","Verdana");
//         font.setAttribute("charset","1");
//         object.appendChild(font);

//     }
//     object.appendChild(points);
//     object.appendChild(owner);
//     info.appendChild(jid);
//     info.appendChild(pageno);
//     info.appendChild(type);
//     info.appendChild(object);
//     query.appendChild(info);
//     iq.appendChild(query);
//     return iq;
// }

/**
 *sendlinexml
 */
var sendlinexml=function(pArr,sharptype,pgjid,lineWidth,word){
    // console.log(pArr);
    // console.log(sharptype);
    // console.log(pgjid);
    // console.log(lineWidth);
    // console.log(word);
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id",selftruename+"jcl_"+uuid++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data);//room_data
    var query=doc.createElement("query");
    query.setAttribute("type","create");
    query.setAttribute("xmlns","cellcom:object:share");

    var info=doc.createElement("info");
    var jid=doc.createElement("jid");
    jid.appendChild(doc.createTextNode(pgjid));
    var pageno=doc.createElement("pageno");
    var pagenovalue=$('#whichpg').val();
    pageno.appendChild(doc.createTextNode(pagenovalue.slice(0,pagenovalue.indexOf('/'))-1));
    var type=doc.createElement("type");
    type.appendChild(doc.createTextNode("doc"));
    var object=doc.createElement("object");

    var objtype=doc.createElement("type");
    objtype.appendChild(doc.createTextNode(sharptype));
    var color=doc.createElement("color")
    color.appendChild(doc.createTextNode(parseInt(replaceBR(document.getElementById("colorslt").value),16)));
    var points=doc.createElement("points");
    for(var i=0;i<pArr.length;i++)
    {
        var point;
        if(i==0)
        {
            point=doc.createElement("point");
            point.setAttribute("y",pArr[i].y);
            point.setAttribute("x",pArr[i].x);
        }else{
            point=doc.createElement("point");
            point.setAttribute("y",pArr[i].y);
            point.setAttribute("x",pArr[i].x);
            point.setAttribute("type","x");
        }
        points.appendChild(point);
    }
    var encode=doc.createElement("encode");
    var encodelen=doc.createElement("encodelen");
    var owner=doc.createElement("owner");
    owner.appendChild(doc.createTextNode("adasfsdf"));
    object.appendChild(objtype);
    object.appendChild(color);
    if(sharptype==="line"||sharptype==="thickfreeline"||sharptype==="thinfreeline")
    {
        var thick=doc.createElement("thick");
        thick.appendChild(doc.createTextNode(lineWidth));
        object.appendChild(thick);
    }
    if(sharptype==="text")
    {
        var text=doc.createElement("text");
        text.appendChild(doc.createTextNode(word));
        object.appendChild(text);
        var font=doc.createElement("font");
        font.setAttribute("underline","x");
        font.setAttribute("bold","x");
        font.setAttribute("pitch","0");
        font.setAttribute("color",parseInt(replaceBR(document.getElementById("colorslt").value),16));
        font.setAttribute("strikeOut","x");
        font.setAttribute("height","-27");
        font.setAttribute("size","20");//size
        font.setAttribute("italic","x");
        font.setAttribute("name","Verdana");
        font.setAttribute("charset","1");
        object.appendChild(font);

    }
    if(sharptype==="thickfreeline"||sharptype==="thinfreeline"||sharptype==="fluorepen")
    {
        var pointsencode=doc.createElement("points");
        pointsencode.appendChild(points);
        var pointsstr= pointsencode.innerHTML;
        var pointArr=new Array( );
        for(var tmpi=0;tmpi<pointsstr.length;tmpi++)
            pointArr.push( pointsstr[tmpi].charCodeAt());
        var deflate = new Zlib.Deflate(pointArr);
        var compressed = deflate.compress();
        var base64encode=Base64.encode(compressed);
        var points_base64=doc.createElement("points");
        points_base64.appendChild(doc.createTextNode(base64encode));
        encode.appendChild(doc.createTextNode("zlib"));
        encodelen.appendChild(doc.createTextNode(pointsstr.length));
        object.appendChild(encode);
        object.appendChild(encodelen);
        object.appendChild(points_base64);

    }else{
        encode.appendChild(doc.createTextNode("none"));
        object.appendChild(encode);
        object.appendChild(points);
    }

    object.appendChild(owner);
    info.appendChild(jid);
    info.appendChild(pageno);
    info.appendChild(type);
    info.appendChild(object);
    query.appendChild(info);
    iq.appendChild(query);
    return iq;
}
/**
 *增加协同浏览页面
 */
var addwebviewpage=function(url,jid)
{

    var li=document.createElement("li");
    if(document.getElementById("selectedweb")===null)
        $(li).attr("id","selectedweb");
    $(li).attr("tar",jid);
    $(li).attr("class",jid);
    if(url)
        $(li).text(url);
    else
        $(li).text("空白页");
    $("#wbviewtab_ul").append(li);
    $(li).click();
    var ctli=document.createElement("li");
    $(ctli).attr("id",jid);
    var iframe=document.createElement("iframe");
    if(url)
        iframe.src=url;
    else
        iframe.location="about:blank";
    ctli.appendChild(iframe);
    $("#webviewcldct").children("ul").append(ctli);

}
/**
 *请求上传
 */
var applyuploadfile=function(c_jid,c_size,c_file,c_time,c_transmiter,loc){
    console.log(adapter.room_data);
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    var id=doc.createElement("id");
    id.appendChild(doc.createTextNode("jcl_"+uuid));
    iq.setAttribute("id","jcl_"+uuid++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); 
    var query=doc.createElement("query");
    query.setAttribute("type","create");
    query.setAttribute("xmlns","cellcom:file:transmit");
    var info=doc.createElement("info");
    var size=doc.createElement("size");
    size.appendChild(doc.createTextNode(c_size));
    var file=doc.createElement("file");
    file.appendChild(doc.createTextNode(c_file));
    var time=doc.createElement("time");
    time.appendChild(doc.createTextNode(c_time));
    var transmiter=doc.createElement("transmiter");
    transmiter.appendChild(doc.createTextNode(c_transmiter));
    var location=doc.createElement("location");
    location.appendChild(doc.createTextNode(loc));
    info.appendChild(size);
    info.appendChild(file);
    info.appendChild(time);
    info.appendChild(transmiter);
    info.appendChild(id);
    info.appendChild(location);
    query.appendChild(info);
    iq.appendChild(query);
    console.log(iq);
    return iq;
}

//file post to server
var postfiletoserver =function(objid,type){
    var formdata = new FormData();
    var fileObj = $('#'+objid).get(0).files;
    adapter.wbformdata= new FormData();
    var tmpurl=adapter.imguploadurl;
    console.log(window.location.protocol);
    if(window.location.protocol!=='http:') {
        var replacestr = adapter.imguploadurl.slice(0, adapter.imguploadurl.indexOf('/api'));
         tmpurl = adapter.imguploadurl.replace(replacestr, 'https://' + serverIp + ':6085');
    }
    //var tmpurl='https://www.vccellcom.com:6085/api/upload/';

    var filename=fileObj[0].name;
    if(type==='wb') {

        adapter.connection.send(sendCreatewbxml(filename));
        adapter.wbformdata.append("ClientJID", adapter.room_data);                     // 可以增加表单数据
        adapter.wbfileobj=fileObj[0];
    }
    else {
        formdata.append("imgFile", fileObj[0]);
        $.ajax({
            url: tmpurl,
            type: 'post',
            data: formdata,
            sync: true,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                    var sendTime = new Date().toLocaleTimeString();
                  //  var repdatastr = data.data.slice(0, data.data.indexOf('/upload'));
                    var tmpdata=data.data;
                  /*  if(window.location.protocol!=='http:')
                    tmpdata=tmpdata.data.replace(repdatastr, 'https://' + serverIp);*/
                    var message = "anyeduimage:<" + tmpdata + ">";
                    if ($("#selecteddlg").attr("tar") === "groupdlg") {
                        adapter.connection.send(senddlgimgxml(ROOM_JID, 'groupchat', sendTime, message));
                    }
                    else {
                        var tojid = $("#selecteddlg").attr("nametag");


                        adapter.connection.send(senddlgimgxml(ROOM_JID + "/" + tojid, 'chat', sendTime, message));
                        log_usersendmsg($("#selecteddlg").attr("tar"), '' + sendTime + ' (我): ', message);
                    }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("upload failed:" + errorThrown);
            }

        });
    }
    var tmp=$('#'+objid)[0].outerHTML;
    $('#'+objid).remove();
    $("#uploadclassfile").append(tmp);

    return false;
}

//上传附件文件
var uploadfile=function(id) {//增加toUser参数来表示选中的用户
		$("#"+id).change(function(event) {
			var fileObj = $(this)[0].files[0];
			if(!fileObj)
			    Dialog.alert("信息","请选择文件!",null,150,80);
			if(fileObj&&UploadPar.fileObj==null){
			    UploadPar.fileObj=fileObj;
			    var size=UploadPar.fileObj.size;
			    var mydata = new Date();
			    var time = mydata.getFullYear() + '/'+(mydata.getMonth()+1).toString()+
			        '/'+ mydata.getDate()+' '+mydata.getHours()+':'+mydata.getMinutes()+
			        ':'+mydata.getMilliseconds();
			    var toUser = "208640@slavemcu_22.machine22.v2c/"+selftruename;//发送的用户
			    UploadPar.toUser=toUser;

			    adapter.connection.send(applyuploadfile(UploadPar.filejid,size,UploadPar.fileObj.name,time,toUser,id));
			}
			  
		})  
    
}
/**
 *上传完成发送msg
 **/

var senduploadcplmsg=function(touser,chattype,filename,filesize,filejid){
    // console.log(touser);
    // touser=touser+"@slavemcu_1.machine1.vccellcom.com";
    var doc=createXMLDoc();
    var message=doc.createElement("message");
    // message.setAttribute("id","jcl_"+uuid++);
    message.setAttribute("to",touser);
    message.setAttribute("type",chattype);
    var subject=doc.createElement("subject");
    subject.appendChild(doc.createTextNode("file"));
    var body=doc.createElement("body");
    body.appendChild(doc.createTextNode(filename));
    var x=doc.createElement("x");
    x.setAttribute("xmlns","cellcom:x:oob");
    var jid=doc.createElement("jid");
    jid.appendChild(doc.createTextNode(filejid));
    var desc=doc.createElement("desc");
    desc.appendChild(doc.createTextNode(filename));
    var size =doc.createElement("size");
    size.appendChild(doc.createTextNode(filesize));
    x.appendChild(jid);
    x.appendChild(desc);
    x.appendChild(size);
    message.appendChild(subject);
    message.appendChild(body);
    message.appendChild(x);
    return message;

}
/**
 *sendCreatewbxml
 */
var sendCreatewbxml=function(filename){
    console.log(adapter.room_data);
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+uuid++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("type","create");
    // query.setAttribute("type","download");
    query.setAttribute("xmlns","cellcom:doc:share");
    // query.setAttribute("xmlns","cellcom:share:browse");

    var info=doc.createElement("info");
    var infodoc=doc.createElement("doc");
    var pagenum=doc.createElement("pagenum");
    if(filename)
    {
        infodoc.appendChild(doc.createTextNode(filename));
        pagenum.appendChild(doc.createTextNode("1001"));
    }
    else
    {
        infodoc.appendChild(doc.createTextNode("wbSharing"));
        pagenum.appendChild(doc.createTextNode("1"));
    }
    var jid=doc.createElement("jid");


    var size=doc.createElement("size");
    info.appendChild(infodoc);
    info.appendChild(pagenum);
    info.appendChild(size);
    info.appendChild(jid);
    query.appendChild(info);
    iq.appendChild(query);
    return iq;


}
/**
 * send  ctl apply
 * 申请数据权限
 */
var sendCtlapplyxml=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+uuid++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.selfRoomID);//selfRoomId
    var query=doc.createElement("query");
    query.setAttribute("type","apply");
    query.setAttribute("xmlns","cellcom:wb:ctrl");


    iq.appendChild(query);
    return iq;

}
/**
 * 终止数据权限申请
 * send  ctl stop
 */
var sendCtlstopxml=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",adapter.selfRoomID);//selfRoomId
    var query=doc.createElement("query");
    query.setAttribute("type","stop");
    query.setAttribute("xmlns","cellcom:wb:ctrl");


    iq.appendChild(query);
    return iq;

}
/**
 *用户控制权限
 */
var userctlauth=function(name,accept,ctltype){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","result");
    iq.setAttribute("to",ROOM_JID+"/"+name); //room_data
    var query=doc.createElement("query");
    if(accept){
        query.setAttribute("xmlns","cellcom:wb:ctrl");
        query.setAttribute("ctl",ctltype);
        query.setAttribute("type","accept");
    }
    else{
        query.setAttribute("xmlns","cellcom:wb:ctrl");
        query.setAttribute("type","refuse");
    }
    iq.appendChild(query);
    return iq;
}
/**
 *数据操作权限控制
 **/
var applycontrol=function(){

    if(adapter.isContrl===0)
    {
        adapter.connection.send(sendCtlapplyxml());
    }
    if(adapter.isContrl===1||adapter.isContrl===2)
    {
        adapter.connection.send(sendCtlstopxml());
    }

}
function downloadOperation(FileController){
    console.log(FileController);
    console.log(window.location);
    $.ajax({
        url: FileController,
        type: 'GET',
        headers:{
            "X-PINGOTHER": "pingpong",
            "Content-Type":"text/plain",
            "withCredentials":true
            // "origin":
            // "Access-Control-Allow-Origin":"*"
        }
    })
    .done(function() {
        console.log("success");
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
}

/**
 *发送cellcom:conf:wannaTransportMM
 */
var sendTransportxmlstr=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("type","get");
    var tmpjcluuid="jcl_"+uuid++;
    iq.setAttribute("id",tmpjcluuid);
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:wannaTransportMM");
    var protDes=doc.createElement("protDes");
    var UDP=doc.createElement("UDP");
    var HTTP=doc.createElement("HTTP");
    protDes.appendChild(UDP);
    protDes.appendChild(HTTP);
    query.appendChild(protDes);
    iq.appendChild(query);
    return iq;
}
/**
 *解析fs节点
 */
function parseIQnode(iqnodes,iqno,isdelete)
{

    var querytype,xmlnsVal,downloadurl,docval,pagenum,query,info;


    if(!iqnodes.getElementsByTagName("query")[0])
        return;
    query=iqnodes.getElementsByTagName("query")[0];
    querytype=query.getAttribute("type");
    xmlnsVal=query.getAttribute("xmlns");
    if(querytype==="browseend"&&xmlnsVal==="cellcom:share:browse")
    {

        for(var tmpi=0;tmpi<adapter.wbbrowseArr.length;tmpi++)
        {
            var newjid;
            docval= adapter.wbbrowseArr[tmpi].getElementsByTagName("doc")[0].firstChild.nodeValue;
            newjid=adapter.wbbrowseArr[tmpi].getElementsByTagName("jid")[0].firstChild.nodeValue;
            downloadurl=adapter.wbbrowseArr[tmpi].getElementsByTagName("downloadurl")[0].firstChild.nodeValue;
            pagenum=adapter.wbbrowseArr[tmpi].getElementsByTagName("pagenum")[0].firstChild.nodeValue;

            var newjidpage=newjid.substring(newjid.lastIndexOf("/")+1,newjid.length);
            if(window.location.protocol!=='http:') {
                var repstr = downloadurl.slice(0, downloadurl.indexOf('/upload'));
                downloadurl = downloadurl.replace(repstr, "https://" + serverIp);
            }
            downloadurl = downloadurl.replace(/\\/g, "/");
            var  loadwburl=downloadurl+"_0";
            var  tmpbgroom=loadwburl.slice(loadwburl.indexOf('upload/')+7);
            tmpbgroom=tmpbgroom.slice(0,tmpbgroom.indexOf('/')+1);
            adapter.bgimgdldurlhead=loadwburl.slice(0,loadwburl.indexOf('upload/')+7)+tmpbgroom;
            adapter.pagejid=newjid;
            // selectpageNo=newjidpage;
        
            if(docval==="wbSharing")
            {
                addwbpage(newjidpage,newjid,800,600,pagenum,0,docval);
                // wbpagei++;
                // $('#wbtab_ul').append("<li  tar='" + newjidpage + "'>电子白板" + wbpagei + "<img src='images/u650_normal.png'/></li>");
            }else{
                // alert("not wbSharing");
                // $('#wbtab_ul').append("<li  tar='"+newjidpage+"'>"+docval+"<img src='images/u650_normal.png'/></li>");
                addwbpage(newjidpage,newjid,800,600,pagenum,0,docval);
                $("#"+newjidpage).attr("isdownloadok",'true');
               
            }

        }
        return;
    }
    if(query.getElementsByTagName("info")[0])
        info=query.getElementsByTagName("info");
    else
        return;
    if(!query.getAttribute("type")||!query.getAttribute("xmlns"))
        return;

    if(querytype==="share"&&xmlnsVal==="cellcom:doc:share")
    {

        var newjid;
        docval= info[0].getElementsByTagName("doc")[0].firstChild.nodeValue;
        newjid=info[0].getElementsByTagName("jid")[0].firstChild.nodeValue;
        downloadurl=info[0].getElementsByTagName("downloadurl")[0].firstChild.nodeValue;
        pagenum=info[0].getElementsByTagName("pagenum")[0].firstChild.nodeValue;

        var newjidpage=newjid.substring(newjid.lastIndexOf("/")+1,newjid.length);
       // downloadurl=downloadurl.replace(":80/upload",":18080/api/get?image=");
        if(window.location.protocol!=='http:') {
            var repstr = downloadurl.slice(0, downloadurl.indexOf('/upload'));
            downloadurl = downloadurl.replace(repstr, "https://" + serverIp);
        }
        downloadurl=downloadurl.replace(/\\/g,"/");
        wbloadwburl=downloadurl+"_0";
        var  tmpbgroom=wbloadwburl.slice(wbloadwburl.indexOf('upload/')+7);
        tmpbgroom=tmpbgroom.slice(0,tmpbgroom.indexOf('/')+1);
        adapter.bgimgdldurlhead=wbloadwburl.slice(0,wbloadwburl.indexOf('upload/')+7)+tmpbgroom;
        selectpageNo=newjidpage;
        adapter.pagejid=newjid;

        if(docval==="wbSharing")
        {
            addwbpage(newjidpage,newjid,800,600,pagenum,0,docval);

        }else{
            addwbpage(newjidpage,newjid,800,600,pagenum,0,docval);
         //   if(pagenum==='1001')
         //   {
                var lodingdiv=document.createElement('div');
                $(lodingdiv).attr("id","prg_"+newjidpage);
                $("#wbpage").css('overflow', "hidden");
                $(lodingdiv).css({"width":"100%","height":"100%","position":"absolute",
                    "z-index":"88","background-color":"#B4B4B4","left":0,"top":0});
                var progressdiv=document.createElement('div');
                $(progressdiv).attr('class',"loader loader-gray  duration-1s-before");
                $(progressdiv).append('<a href="javascript:;"></a>');
                var prgctdiv=document.createElement('div');
               $(prgctdiv).css({"width":"80px","height":"100px","left":"50%","top":"50%","margin-left":"-40px","margin-top":"-50px","position":"absolute"});
                var pw=document.createElement('p');
                pw.innerHTML='正在缓冲';
                $(pw).attr("align","center");
                $(pw).css({"color":"#55A7FD","box-shadow:":"#A9D7FF"})
                $(prgctdiv).append(progressdiv,pw);
                $(lodingdiv).append(prgctdiv);
               $("#"+newjidpage).append(lodingdiv);
          //  }
            var AllImgExt=".jpg|.jpeg|.gif|.bmp|.png|";
            var AllPptExt=".ppt|.pptx";
            var filetype=docval.slice(docval.lastIndexOf('.')).toLowerCase();
            if(AllImgExt.indexOf(filetype)===-1&&pagenum>1) {
                wbimgh=1169;
                wbimgw=826;
                if(AllPptExt.indexOf(filetype)!==-1)
                {
                    wbimgw=1169;
                    wbimgh=826;
                }
            }


        }
        return;
    }
    if(querytype==="download"&&xmlnsVal==="cellcom:doc:share")
    {

      var removeprgjid=info[0].getElementsByTagName("jid")[0].firstChild.nodeValue;
        removeprgjid=removeprgjid.slice(removeprgjid.indexOf('/')+1);

        $("#"+removeprgjid).attr("isdownloadok",'true');
    }

    if(querytype==="doc"&&xmlnsVal==="cellcom:share:browse")
    {
        for(var tmpi=0;tmpi<info.length;tmpi++)
        {
            adapter.wbbrowseArr.push(info[tmpi]);
        }
        return;

    }

//var  pageid=strNodes.item(1).textContent;
    var  jid;
    if(!info[0].getElementsByTagName("jid")[0])
        return;
    jid=info[0].getElementsByTagName("jid")[0].firstChild.nodeValue;

    var  jidpage=jid.substring(jid.lastIndexOf("/")+1,jid.length);
    var tmppageid=jidpage;
    if(querytype==="change"&&xmlnsVal=="cellcom:doc:share")
    {
        // var h=document.getElementById("canvas_tools_tr").clientHeight+document.getElementById("wbtab").clientHeight;
        // $("#nothingseceen").css({"width":document.getElementById("wbpage").clientWidth,"height":document.getElementById("wbpage").clientHeight+h});
        changeTag=true;
        selectpageNo=jidpage;

        adapter.pagejid=jid;
        var pageno=info[0].getElementsByTagName("pageno")[0].firstChild.nodeValue;
        if(!info[0].getElementsByTagName("pagenum")[0])
            return;
        var pagenum=info[0].getElementsByTagName("pagenum")[0].firstChild.nodeValue;
        $("#"+jidpage).attr("pageno",pageno);
        $("#"+jidpage).attr("pagenum",pagenum);
        var tmppageno=parseInt(pageno)+1;
        if(pageno===pagenum){
            $("#"+jidpage).attr("pageno",0);
            pageno=0;
            tmppageno=1;
            $("#"+jidpage).attr("isdownloadok","true");

        }
        if(pagenum=='1000')
        $("#whichpg").val(tmppageno+'/1');
        else
            $("#whichpg").val(tmppageno+'/'+pagenum);
        $("li[tar='courseware_ct']").click(); //点击左侧的课件选项
        console.log(jidpage);
        console.log($('#'+jidpage));
        var npg = document.getElementById(jidpage);
        console.log(npg);
        if(npg!==null){
            showPage();
        }
        var tmppageid=jidpage;
        console.log($("#"+jidpage).attr("singlepg"));
        console.log($("#"+jidpage).attr("isdownloadok"));
        if($("#"+jidpage).attr("singlepg")&&$("#"+jidpage).attr("isdownloadok")==='true') {
            tmppageid=jidpage+"_"+pageno;
            if(document.getElementById(tmppageid)===null){
                addwbpagecld(jidpage, adapter.pagejid, 826,1169, pagenum, pageno,$("#"+jidpage).attr("docval"));
            }
            $("#" + jidpage).find("li:not(#" + tmppageid + ")").css("display", "none");
            ctx = document.getElementById(tmppageid).children[1].getContext("2d");
            ctxeffect = document.getElementById(tmppageid).children[2].getContext("2d");
            $("#" + tmppageid).css("display", "block");

        }
        if(!$("#"+jidpage).attr("singlepg")&&$("#"+jidpage).attr("docval")!=='wbSharing'&&$("#"+jidpage).attr("isdownloadok")==='true')
        {
            var tmpdownurl = adapter.bgimgdldurlhead + jidpage + "/" + jidpage + "_0";
            var downloadctx = document.getElementById(jidpage).childNodes[0].getContext("2d");
            downloadImg(tmpdownurl,downloadctx,jidpage,800,600,0);
            $("#"+jidpage).attr("isdownloadok",'false');

        }
        if($("#"+jidpage).attr("docval")==='wbSharing')
        {
            if(!$("#"+tmppageid).attr("queryobjtag")||$("#"+tmppageid).attr("queryobjtag")!=="true") {
                adapter.connection.send(sendQuerywbcldmsgxml(adapter.pagejid,pageno));
                $("#" + tmppageid).attr("queryobjtag", "true");
            }
        }


        return true;

    }
    if(querytype==="end"&&xmlnsVal=="cellcom:doc:share")
    {
        removemem(jidpage);
        return;
    }

    selectpageNo=jidpage;

    if((querytype==="create"||querytype==="browse")&&xmlnsVal==="cellcom:object:share")
    {
        var infotype=info[0].getElementsByTagName("type")[0].firstChild.nodeValue;
        var objpageno=info[0].getElementsByTagName("pageno")[0].firstChild.nodeValue;
        console.log(infotype);
        console.log(objpageno);
        if(infotype==="doc"){
            var removelen=0;
            var removetag=0;
            console.log(jidpage);
            console.log($("#"+jidpage));
            if(document.getElementById(jidpage)===null)
            {
                console.log("whiteboard page is null");

            }

            if($("#"+jidpage).attr("singlepg")==="false") {
                tmppageid=jidpage + "_" + objpageno;
                console.log(tmppageid);
                console.log(document.getElementById("tmppageid"));
                recctx = document.getElementById(jidpage + "_" + objpageno).childNodes[1].getContext("2d");
            }
            else {
                recctx = document.getElementById(jidpage).childNodes[1].getContext("2d");
            }
            recctx.save();
            // recctx.scale($("#wbpage").width()/800,$("#wbpage").height()/600);//白板
            var z=0;
            while(scaleArr.length>z)
            {
                if(tmppageid===scaleArr[z].page)
                {
                    var scalex=document.getElementById(tmppageid).childNodes[1].width/scaleArr[z].origW;
                    var scaley=document.getElementById(tmppageid).childNodes[1].height/scaleArr[z].origH;
                    recctx.scale(scalex,scaley);
                    break;
                }
                z++;
            }
            var object=info[0].getElementsByTagName("object");
            for(var objectNo=0;objectNo<object.length;objectNo++)
            {

                console.log(object[objectNo]);
                var   imageType=object[objectNo].getElementsByTagName("type")[0].firstChild.nodeValue;
                var   color=object[objectNo].getElementsByTagName("color")[0].firstChild.nodeValue;
                var   owner=object[objectNo].getElementsByTagName("owner")[0].firstChild.nodeValue;
                var   zorder=object[objectNo].getElementsByTagName("zorder")[0].firstChild.nodeValue;
                var   imagename=object[objectNo].getElementsByTagName("name")[0].firstChild.nodeValue;
                var   isencode=object[objectNo].getElementsByTagName("encode")[0].firstChild.nodeValue;
                var deltag=0;
                if(isdelete){
                    for(var j=0;j<delnameArr.length;j++)
                    {
                        if(imagename===delnameArr[j].name&&delnameArr[j].jid===jid&&delnameArr[j].pageno===objpageno)
                            deltag++;

                    }}
                if(deltag!==0)
                    continue;

                var   pointsArray=new Array();
                if(isencode==="none") {


                    var pointNode = object[objectNo].getElementsByTagName("points")[0].getElementsByTagName("point");

                    if (!pointNode.length)
                        continue;

                    for (var i = 0; i < pointNode.length; i++) {
                        var x, y;
                        x = pointNode[i].getAttribute("x");
                        y = pointNode[i].getAttribute("y");
                        pointsArray.push({"X": x, "Y": y});


                    }
                }else{
                    var pointsstr_en=object[objectNo].getElementsByTagName("points")[0].firstChild.nodeValue;
                    var base64decode= Base64.decode(pointsstr_en);
                    var inflate = new Zlib.Inflate(base64decode);
                    var plain = inflate.decompress();
                    var str=new Array();
                    for(var tmi=0;tmi<plain.length;tmi++) {
                        var tmpstr=String.fromCharCode(plain[tmi])
                        str.push(tmpstr);
                    }
                    var pointsstr_de=str.join("")
                    var pointsnode=createXMLstrDoc(pointsstr_de).documentElement;
                    var pointNode=pointsnode.getElementsByTagName("point");
                    if (!pointNode.length)
                        continue;
                    for (var i = 0; i < pointNode.length; i++) {
                        var x, y;
                        x = pointNode[i].getAttribute("x");
                        y = pointNode[i].getAttribute("y");
                        pointsArray.push({"X": x, "Y": y});

                    }
                }

                if(imageType==="rect")
                {
                    drawRect(pointsArray[0].X,pointsArray[0].Y,pointsArray[1].X,pointsArray[1].Y,color);

                }
                if(imageType==="roundrect")
                {
                    drawArcRect(pointsArray[0].X,pointsArray[0].Y,pointsArray[1].X,pointsArray[1].Y,color);

                }
                if (imageType==="round")
                {
                    drawRound(pointsArray[0].X,pointsArray[0].Y,pointsArray[1].X,pointsArray[1].Y,color);

                }

                if((imageType==="line")||(imageType==="thinfreeline")||(imageType=="thickfreeline"))
                {
                    var thick;
                    thick= object[objectNo].getElementsByTagName("thick")[0].firstChild.nodeValue;
                    if(imageType=="line") {

                        drawLine(pointsArray[0].X, pointsArray[0].Y, pointsArray[1].X, pointsArray[1].Y, color, thick);

                    }

                    if(imageType=="thinfreeline"||imageType=="thickfreeline")
                    {

                        drawThinfreeline(pointsArray,color,thick);

                    }

                }
                if(imageType=="fluorepen")
                {
                    drawfluorepen(pointsArray,color);

                }
                if(imageType==="text"){
                    var textvalue,fontnode,bold,italic,size,fontname,height;
                    fontnode=object[objectNo].getElementsByTagName("font")[0];

                    textvalue=object[objectNo].getElementsByTagName("text")[0].firstChild.nodeValue;
                    bold=fontnode.getAttribute("bold");
                    italic=fontnode.getAttribute("italic");
                    size=fontnode.getAttribute("size");
                    fontname=fontnode.getAttribute("name");
                    height=fontnode.getAttribute("height");
                    // alert("drawtext");
                    drawText(textvalue,pointsArray[0].X,pointsArray[0].Y,color,italic,bold,size,height,fontname);
                }
            }
            recctx.restore();
        }
    }
    if(querytype==="delete"&&xmlnsVal==="cellcom:object:share")
    {

        var delNames=info[0].getElementsByTagName("object")[0].getElementsByTagName("name");
// recctx=document.getElementById(tmppage).getContext("2d");
        var tmppgjid=info[0].getElementsByTagName("jid")[0].firstChild.nodeValue;
        var delpageno=info[0].getElementsByTagName("pageno")[0].firstChild.nodeValue;
        if($("#"+jidpage).attr("singlepg")==="false")
            jidpage=jidpage+"_"+delpageno;
        for(var i=0;i<delNames.length;i++)
        {
            delnameArr.push({"jid":tmppgjid,"name":delNames[i].firstChild.nodeValue,"pageno":delpageno});
        }
//iqno-2;
        clearDelpage(jidpage);
        for(var j=0;j<iqno;j++)
        {
            var tmpquery=iqArrary[j].getElementsByTagName("query")[0];
            if(tmpquery&&tmpquery.getAttribute("type"))
                var tmpquerytype=tmpquery.getAttribute("type");
            else
                continue;
            if(tmpquery&&tmpquery.getAttribute("xmlns"))
                var tmpxmlnsVal=tmpquery.getAttribute("xmlns");
            else
                continue;
            if((tmpquerytype==="create"||tmpquerytype==="browse")&&tmpxmlnsVal==="cellcom:object:share")
            {
                var strnode,tmpjid;
                if(tmpquery.firstChild.textContent)
                    strnode=tmpquery.firstChild.textContent;
                else if(tmpquery.firstChild.text)
                    strnode=tmpquery.firstChild.text;
                tmpjid=tmpquery.getElementsByTagName("jid")[0].firstChild.nodeValue;
                if(jid===tmpjid)
                {
                    parseIQnode(iqArrary[j],j,true);

                }
            }

        }
    }
}

function showPage(){
    var len=0;
    var lilength=document.getElementById("wbtab_ul").children.length;

    while(len<lilength)
    {
        if( document.getElementById("wbtab_ul").children[len].attributes["tar"].value===selectpageNo)
            document.getElementById("wbtab_ul").children[len].click();
        len++;
    }

}

/****
 *加载背景图
 **/
function downloadImg(url,ctxbg,jidp,w,h,pgno){

    alert("downloadImg");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    
    // $.getJSON(url,function(data){
    //     console.log(data);
    // });
    xhr.onload = function() {
        var bytes = new Uint8Array(xhr.response);
        var tmpstr = bzip2.simple(bzip2.array(bytes));
        var b64 = window.btoa(tmpstr)
        var imgurl = 'data:image/png;base64,' + b64;

        drawImages(ctxbg,imgurl,w,h,pgno,jidp);


    }

}
/**CDATA:
 * 绘制图片http://123.65.22.216:18080/api/get?image=/room170/a713580639/a713580639_0
 */
function drawImages(context,url,w,h,pageno,jidp)//(context,url,x,y,w,h)
{
    var img=new Image();
    img.src=url;

    img.onload = function(){
        //  context.save();
        // context.scale(800/w,600/h);

        context.drawImage(img, 0, 0,w,h);
        var removejidp=jidp;
        alert("areyou");
        if(removejidp.indexOf('_')!==-1)
            removejidp=removejidp.slice(0,removejidp.indexOf('_'));
        if($("#prg_"+removejidp).length) {
            $("#prg_" + removejidp).remove();
            $("#wbpage").css('overflow', "auto");
        }
        var width=img.naturalWidth;
        var height=img.naturalHeight;
        if(jidp) {
            var scalex = document.getElementById(jidp).childNodes[1].width / width;
            var scaley = document.getElementById(jidp).childNodes[1].height / height;
            $("#" + jidp).attr("scaleratex", 1 / scalex);
            $("#" + jidp).attr("scaleratey", 1 / scaley);
            scaleArr.push({"page": jidp, "origH": height, "origW": width});

                if (!$("#" + jidp).attr("queryobjtag") || $("#" + jidp).attr("queryobjtag") !== "true") {
                    adapter.connection.send(sendQuerywbcldmsgxml(adapter.pagejid, pageno));
                    $("#" + jidp).attr("queryobjtag", "true");
                }

        }
        //   context.restore();

    }

}
/**
 *刚进入会议查询wb里面的元素消息
 */
var sendQuerywbcldmsgxml=function(endjid,pgno){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:object:share");
    query.setAttribute("type","browse");
    var info=doc.createElement("info");
    var jid=doc.createElement("jid");
    jid.appendChild(doc.createTextNode(endjid));
    var pageno=doc.createElement("pageno");
    pageno.appendChild(doc.createTextNode(pgno));
    var type=doc.createElement("type");
    type.appendChild(doc.createTextNode("doc"));
    info.appendChild(jid);
    info.appendChild(pageno);
    info.appendChild(type);
    query.appendChild(info);
    iq.appendChild(query);
    return iq;


}

/**
 *
 * @param titid
 * @param pagejid
 * @param width
 * @param height
 * @param pagenum
 * @param pageno
 */
var addwbpagecld =function(titid, pagejid, width,height,pagenum,pageno,docval){
    alert("addwbpagecld");
    var AllPptExt=".ppt|.pptx";

    var filetype=docval.slice(docval.lastIndexOf('.')).toLowerCase();
    if(AllPptExt.indexOf(filetype)!==-1)
    {

        width=1169;
        height=862;
    }
    var pgid=titid+"_"+pageno;
    console.log(pgid);
    if(document.getElementById(pgid)===null) {
        var canvas0 = document.createElement("canvas");
        $(canvas0).css({"position": "absolute", "border": "solid 1px #000000"});
        canvas0.width = width;
        canvas0.height = height;
        var canvas1 = document.createElement("canvas");
        $(canvas1).css({"position": "absolute", "border": "solid 1px #000000"});
        canvas1.width = width;
        canvas1.height = height;
        var canvas2 = document.createElement("canvas");
        $(canvas2).css({"position": "absolute", "border": "solid 1px #000000", "display": "none"});
        canvas2.width = width;
        canvas2.height = height;
        var cldli = document.createElement("li");
        $(cldli).attr("id", pgid);
        $(cldli).css({"width": "800px", "height": "600px", "margin": "0px", "padding": "0px","position":"absolute","display":"none"});
        $(cldli).append(canvas0, canvas1, canvas2);
        $("#" + titid).children("ul").append(cldli);
        ctx=document.getElementById(pgid).children[1].getContext("2d");
        ctxeffect=document.getElementById(pgid).children[2].getContext("2d");
        addlistentowbcanvas(pgid);
        if($("#" + titid).attr("scaletag")!=='1')
        {
            var tmpscalenum=$("#" + titid).attr("scaletag");
            var tmpwidth = parseInt($("#" + titid).attr('orgW') * tmpscalenum);
            var tmpheight = parseInt($("#" + titid).attr('orgH') * tmpscalenum);

            $(cldli).width(tmpwidth);
            $(cldli).height(tmpheight);
            $(canvas0).width(tmpwidth);
            $(canvas0).height(tmpheight);
            $(canvas1).width(tmpwidth);
            $(canvas1).height(tmpheight);
            $(canvas2).width(tmpwidth);
            $(canvas2).height(tmpheight);
        }
        var url=adapter.bgimgdldurlhead+titid+"/"+titid+"_"+pageno;
        var bgctx=document.getElementById(pgid).childNodes[0].getContext("2d");
       downloadImg(url, bgctx, pgid, width, height,pageno);
    }

}

var addlistentowbcanvas=function(tit){
    var x,y,deletex,deletey,offsetdifX,offsetdifY,csscaletag= 1;
    $("#"+tit).children().eq(1).mousedown(function(e){
        initlinestyle(document.getElementById("lineselect"));
        adapter.flag=true;
        var offset=$(this).offset();
        var deleteoffset=$("#wbpage").offset();
        if(parseInt(deleteoffset.left)>parseInt(offset.left))
            offsetdifX=parseInt(deleteoffset.left)-parseInt(offset.left);
        else
            offsetdifX=0;
        if(parseInt(deleteoffset.top)>parseInt(offset.top))
            offsetdifY=parseInt(deleteoffset.top)-parseInt(offset.top);
        else
            offsetdifY=0;
        deletex=parseInt(e.pageX-deleteoffset.left);
        deletey=parseInt(e.pageY-deleteoffset.top);
        adapter.pointArr.length=0;
        x=parseInt(e.pageX-offset.left);
        y=parseInt(e.pageY-offset.top);
        var scaleratex=$(this).parent().attr("scaleratex");
        var scaleratey=$(this).parent().attr("scaleratey");
        ctx.save();
        ctxeffect.save();
        if($(this).parent().attr('scaletag')){
            csscaletag=parseFloat($(this).parent().attr('scaletag'));
            console.log(csscaletag);
        }
        else{
            csscaletag=parseFloat($(this).parent().parent().parent().attr('scaletag'));
            console.log(csscaletag);
        }

        ctx.scale(1/csscaletag,1/csscaletag);
        ctx.lineWidth=ctx.lineWidth*csscaletag;
        if(scaleratex) {

            ctx.lineWidth = parseInt(ctx.lineWidth / scaleratex);
            ctxeffect.lineWidth = parseInt(ctxeffect.lineWidth / scaleratex);
        }
       // console.log(x+" save:"+y);
        switch(adapter.drawtype){
            case "line": ctx.beginPath(); break;
            case "thinfreeline":
            case "thickfreeline":ctx.beginPath();break;
            case "fluorepen":ctx.beginPath();break;
            case "rect":ctx.beginPath();break;
            case "roundrect" :ctx.beginPath();break;
            case "round" :ctx.beginPath();break;
            case "text" :ctx.beginPath();
                console.log(x+" save:restore"+y);
                ctx.restore();
                console.log(adapter.fontTip);
                if(adapter.fontTip.css("display")=== "none"){
                    // alert("fakeWordsInput");
                    fakeWordsInput(offsetdifX,offsetdifY,deletex,deletey,x,y,adapter.flag,true);
                }
                break;
            case "select":break;
            case "delete":break;
            default: break;
        }
    });


//canvas 绑定mousemove
    $("#"+tit).children().eq(1).mousemove(function(e){
        var offset = $(this).offset();
        var deleteoffset=$("#wbpage").offset();
        if(parseInt(deleteoffset.left)>parseInt(offset.left))
            offsetdifX=parseInt(deleteoffset.left)-parseInt(offset.left);
        else
            offsetdifX=0;
        if(parseInt(deleteoffset.top)>parseInt(offset.top))
            offsetdifY=parseInt(deleteoffset.top)-parseInt(offset.top);
        else
            offsetdifY=0;
        var tmpdeletx=parseInt(e.pageX-deleteoffset.left);
        var tmpdelety = parseInt(e.pageY-deleteoffset.top);
        var tmpx = parseInt(e.pageX-offset.left);
        var tmpy = parseInt(e.pageY-offset.top);
        if(adapter.flag){
            var scaleratex=$(this).parent().attr("scaleratex");
            var scaleratey=$(this).parent().attr("scaleratey");
            // console.log(scaleratex+":scaleratex");
            if(scaleratex) {
                // console.log(tmpx);
                // console.log(parseInt(tmpx * scaleratex*1/csscaletag));
                adapter.pointArr.push({"x": parseInt(tmpx * scaleratex*1/csscaletag), "y": parseInt(tmpy * scaleratey*1/csscaletag)});

            }
            else{
                // console.log(tmpx);
                // console.log(csscaletag);
                // console.log(parseInt(tmpx*1/csscaletag));
                adapter.pointArr.push({"x":parseInt(tmpx*1/csscaletag),"y":parseInt(tmpy*1/csscaletag)});
            }
            switch(adapter.drawtype){
                case "line":
                case "rect":
                case "roundrect":
                case "round" :
                case "select":
                case "delete":
                    $("#"+tit).children().last().css("display","block");
                    ctxeffect.scale(1/csscaletag,1/csscaletag);
                    break;
                case "text" : fakeWordsInput(offsetdifX,offsetdifY,deletex,deletey,tmpdeletx,tmpdelety,adapter.flag,false);break;
                case "thinfreeline":
                case "thickfreeline":ctldrawThinfreeline(tmpx,tmpy,adapter.flag);break;
                case "fluorepen":ctldrawfluorepen(tmpx,tmpy,adapter.flag);break;
                default: break;
            }
        }
    });
//canvas 绑定mouseup
    $("#"+tit).children().eq(1).mouseup(function(e){
        adapter.flag=false;
        var offset=$(this).offset();
        endx=parseInt(e.pageX-offset.left);
        endy=parseInt(e.pageY-offset.top);

        switch(adapter.drawtype){
            case "line":
                ctx.closePath();
                ctx.restore();
                break;
            case "thinfreeline":
            case "thickfreeline":ctx.closePath();  ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,ctx.lineWidth));break;
            case "fluorepen":ctx.closePath();  ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,ctx.lineWidth));break;
            case "rect":
            case "roundrect" :
            case "round" :
            case "select":
            case "delete":
                    ctx.restore();
                break;
            case "text" :adapter.fontTip.focus();break;
            default: break;
        }
    });
    //effectcanvas 绑定mousemove
    $("#"+tit).children().eq(2).mousemove(function(e){
        var offset = $(this).offset();
        var tmpx = parseInt(e.pageX-offset.left);
        var tmpy = parseInt(e.pageY-offset.top);
        ctxeffect.strokeStyle=ctx.strokeStyle;
        ctxeffect.lineWidth=ctx.lineWidth;
        ctxeffect.lineCap=ctx.lineCap;
        switch(adapter.drawtype){
            case "line": ctldrawlineEffect(x,y,tmpx,tmpy,adapter.flag); break;
            case "thinfreeline":
            case "thickfreeline":break;
            case "fluorepen":break;
            case "rect":ctldrawRectEffect(x,y,tmpx,tmpy,adapter.flag); break;
            case "roundrect":ctldrawRoundrecteEffect(x,y,tmpx,tmpy,adapter.flag);break;
            case "round" :drawRoundEffect(x,y,tmpx,tmpy,adapter.flag);break;
            case "text" :break;
            case "select":ctldrawdashrectEffect(x,y,tmpx,tmpy,adapter.flag);break;
            case "delete":ctldrawdashrectEffect(x,y,tmpx,tmpy,adapter.flag);break;
            default: break;
        }
    });
    $("#"+tit).children().eq(2).mouseup(function(e){
        adapter.flag=false;
        var offset=$(this).offset();
        endx=parseInt(e.pageX-offset.left);
        endy=parseInt(e.pageY-offset.top);
        if(adapter.drawtype!=="text") {
            var scaleratex=$(this).parent().attr("scaleratex");
            var scaleratey=$(this).parent().attr("scaleratey");
            if(scaleratex){
                console.log(endx);
                console.log(scaleratex);
                console.log(csscaletag);
                console.log(parseInt(endx*scaleratex*1/csscaletag));
                adapter.pointArr.push({"x":parseInt(endx*scaleratex*1/csscaletag),"y":parseInt(endy*scaleratey*1/csscaletag)});
            }
            else{
                console.log(endx);
                console.log(csscaletag);
                console.log(parseInt(endx*1/csscaletag));
                adapter.pointArr.push({"x": parseInt(endx*1/csscaletag), "y": parseInt(endy*1/csscaletag)});
            }
        }
        ctxeffect.restore();
        ctxeffect.clearRect(0,0,2000,2000);
        $(this).css("display","none");
        switch(adapter.drawtype){
            case "line": ctldrawline(x,y,endx,endy); ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,ctx.lineWidth)); break;
            case "thinfreeline":
            case "thickfreeline":break;
            case "fluorepen":break;
            case "rect": ctldrawRect(x,y,endx,endy); ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,ctx.lineWidth));break;
            case "roundrect" :ctldrawRoundrect(x,y,endx,endy); ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,ctx.lineWidth));break;
            case "round" :ctldrawRound(x,y,endx,endy); ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,ctx.lineWidth));break;
            case "text" :break;
            case "select": fctx.restore(); break;
            case "delete":
                if(scaleratex)
                    deletemouseupfun(x*scaleratex/csscaletag,y*scaleratey/csscaletag,endx*scaleratex/csscaletag,endy*scaleratey/csscaletag);
                else
                    deletemouseupfun(parseInt(x/csscaletag),parseInt(y/csscaletag),parseInt(endx/csscaletag),parseInt(endy/csscaletag)); break;
            default: break;
        }
    });
}
function removemem(pagei){

    var len=1;
    var lilength=document.getElementById("wbtab_ul").children.length;

    $("#"+pagei).remove();
    while(len<lilength)
    {
        if( document.getElementById("wbtab_ul").children[len].attributes["tar"].value===pagei)
        {
            $("#wbtab_ul").children().eq(len).remove();
            lilength--;
            if(lilength===1)
                $("#wbtab_ul").children("li").first().click();

        }
        len++;

    }

// document.getElementById("wbtab_ul").children[document.getElementById("wbtab_ul").children.length-1].click();
    removeArr.push(pagei);
}

/**
 *sendendwbxml
 */
var sendendwbxml=function(pgjid,endjid){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+uuid++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("type","end");
    query.setAttribute("xmlns","cellcom:doc:share");

    var info=doc.createElement("info");
    var jid=doc.createElement("jid");
    var tmpjid=pgjid.slice(0,pgjid.indexOf("/"))+"/"+endjid;
    jid.appendChild(doc.createTextNode(tmpjid));

    info.appendChild(jid);
    query.appendChild(info);
    iq.appendChild(query);
    return iq;


}


function utilityClock(container) {
    var dynamic = container.querySelector('.dynamic')
    var hourElement = container.querySelector('.hour')
    var minuteElement = container.querySelector('.minute')
    var secondElement = container.querySelector('.second')
    var minute = function(n) {
        return n % 5 == 0 ? minuteText(n) : minuteLine(n)
    }
    var minuteText = function(n) {
        var element = document.createElement('div')
        element.className = 'minute-text'
        element.innerHTML = (n < 10 ? '0' : '') + n
        position(element, n / 60, 135)
        dynamic.appendChild(element)
    }
    var minuteLine = function(n) {
        var anchor = document.createElement('div')
        anchor.className = 'anchor'
        var element = document.createElement('div')
        element.className = 'element minute-line'
        rotate(anchor, n)
        anchor.appendChild(element)
        dynamic.appendChild(anchor)
    }
    var hour = function(n) {
        var element = document.createElement('div')
        element.className = 'hour-text hour-' + n
        element.innerHTML = n
        position(element, n / 12, 105)
        dynamic.appendChild(element)
    }
    var position = function(element, phase, r) {
        var theta = phase * 2 * Math.PI
        element.style.top = (-r * Math.cos(theta)).toFixed(1) + 'px'
        element.style.left = (r * Math.sin(theta)).toFixed(1) + 'px'
    }
    var rotate = function(element, second) {
        element.style.transform = element.style.webkitTransform = 'rotate(' + (second * 6) + 'deg)'
    }
    var animate = function() {
        var now = new Date()
        var time = now.getHours() * 3600 +
                    now.getMinutes() * 60 +
                    now.getSeconds() * 1 +
                    now.getMilliseconds() / 1000
        rotate(secondElement, time)
        rotate(minuteElement, time / 60)
        rotate(hourElement, time / 60 / 12)
        requestAnimationFrame(animate)
    }
    for (var i = 1; i <= 60; i ++) minute(i)
    for (var i = 1; i <= 12; i ++) hour(i)
    animate()
}

function autoResize(element, nativeSize) {
    var update = function() {
        var scale = Math.min(window.innerWidth/2, window.innerHeight/2) / nativeSize
        element.style.transform = element.style.webkitTransform = 'scale(' + scale.toFixed(3) + ')'
    }
    update()
    window.addEventListener('resize', update)
}

//video

