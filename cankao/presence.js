/**
 * Created by hkshen on 16/1/5.
 */

document.write("<script src='JS/AdapterIml.js'></script>");


// 全局变量声明
var ROOM_JID ;//="280523@slavemcu_22.machine22.v2c";//154356
var server_suffix="@slavemcu_22.machine22.v2c";
var ServerHttp="http://192.168.7.241/upload/";
var serverIp;
var companyId;
var nickname="";
var Fromusername;//="y1234567_428615";
var usernameid="";
var selftruename="";
var selftruenameid='';
var userpass;//=1234567;
var prespass;//=111111;
//my attributes
var sendnetspeed,recnetspeed;
//var selfEnterRommId;
var videoUrl;
var audioUrl;
var isConnectVideoSocket = false;
var isConnectAudioSocket = false;
var isshowstyle=false;
var isuploadv=false;

var pgrogressinterval = null;
var timeinterval = null;
var pausetag = false;
var delaytag=true;


/**
 *document  ready();
 */
$(document).ready(
    function(){
        window.onload = function() {


            if (window.applicationCache) {

                init();
                initDragmodule();

                //   alert("你的浏览器支持HTML5");


            } else {

                alert("你的浏览器不支持HTML5");

            }

        }


    }
);
var myconnect=function(roomid,prepswd,usernmid,compId,userpswd,nicknm,serip){
    companyId=compId;//$("#companyid").val();//${sessionScope.user.companyCode}
    ROOM_JID=roomid;//$("#preid").val();//${meet.conf_id}
    usernameid=usernmid;//$("#accounted").val();
    Fromusername=usernmid+"_"+companyId;//$("#accounted").val()+"_"+companyId;//${sessionScope.user.preName}
    userpass=userpswd;//$("#accountpasswd").val();//${sessionScope.user.password}
    prespass=parseInt(prepswd);//($("#prepasswd").val());//${meet.confpass}
    serverIp=serip;//$("#serverip").val( );
    nickname=nicknm;//$("#nickname").val();
    if(nickname!==""){
        Fromusername="guest";
        usernameid=nickname+Fromusername;
        userpass="guest";
    }
    var openfireurl=window.location.protocol;
    if(openfireurl==="https:")
        adapter.connection = new Openfire.Connection("wss://"+serverIp+":7443/ws/server");
    else{
        adapter.connection = new Openfire.Connection("ws://"+serverIp+":7070/ws/server");    }

    adapter.connection.rawInput = function (data) {
        console.log('RECV: ' + data);
       // try {
            parseWBXML(data);
     //   }
     //   catch (e){
       //     alert(e);
     //   }
          // handleInputmsg(data);
    };
    adapter.connection.rawOutput = function (data) { console.log('SEND: ' + data); };
    adapter.connection.connect(Fromusername,userpass,onConnect);
    $("#logindlg").css("display","none");
}
/*
 *初始化
 */
var init=function(){

    UI.load();
    //屏蔽右键显示;
    document.getElementById("desktopsharect").oncontextmenu = function(){return false;};

//连接服务器
    // myconnect();
    //  adapter.connection.connect(Fromusername,userpass,onConnect);
    initwbtools();
    $("#startdsksharebtn").attr("disabled",true);//初始化桌面共享按钮不可点击
    adapter.dlgbtnleftbite=0.89;
    adapter.dlgbtntopbite=0.7;
    //$(".voicekuai").attr("poswidth",0);
    // $(".microkuai").attr("poswidth",0);
    tabmodule("ulall_fun","selected");
    tabmodule("ul_dlgct","selecteddlg");
    tabmodule("wbviewtab_ul","selectedweb")
    tab("wbtab_ul","selectwb");
//主席功能按钮单击事件绑定
    chairfuninit();
//绑定文件传输

//绑定设置相关功能
    $("#li1").on("click",function(e){
        $("#setup").css({left:($(this).position().left+3),top:($(this).position().top+$(this).height()+2)});
        $("#setup").show();
        $(document).one("click", function()
        {
            $("#setup").hide();
        });
        e.stopPropagation();

    });
    $("#li2").on("click",function(){


    });
    $("#li3").on("click",function(e){

        $("#chair_item").css({left:($(this).position().left+3),top:($(this).position().top+$(this).height()+2)});
        $("#chair_item").show();
        $(document).one("click", function()
        {
            $("#chair_item").hide();
        });
        e.stopPropagation();
    });
    /*$("#chair_item").on("click", function(e){
     e.stopPropagation();
     });*/
    $("#li4").on("click",function(){


    });
    $("#li5").on("click",function(){


    });
//新建白板事件
    $(".new_wb p").on("click",function(){

        adapter.connection.send(sendCreatewbxml());

    });
    $(".new_PPTwb p").on("click",function(){

        $(this).next().click();

    });
    $(".new_WORDwb p").on("click",function(){

        $(this).next().click();

    });
    $(".new_EXCELwb p").on("click",function(){

        $(this).next().click();

    });
    $(".new_IMGwb p").on("click",function(){

        $(this).next().click();

    });
    $(".new_OTHERwb p").on("click",function(){

        $(this).next().click();

    });
//提交投票事件
    $(".applyvote").on("click",function() {
        if(tmpvoteArr.length>0)
        {
            if(adapter.timeinternal!==null)
                clearInterval(adapter.timeinternal);
            adapter.connection.send(sendApplyvotexml(false));
            $("#voteapply").css("display","none");
            $(".voteres_p").css("display","block");
        }
        else
            Dialog.alert("消息","请选择投票项",null,150,80);
    });
//关闭投票结果页面
    $("#voteresult_close").on("click",function() {
        $("#voteresult").css("display","none");
        $(".voteres_p").css("display","block");
    });
//协同浏览页面点击事件
    $("#webviewcldct").on("click",function(){

    });
//绑定点击申请发言事件
    $("#applyspeaking").on("click",function(){
        applyspeak();
    });
//绑定点击申请控件权限事件
    $("#applycontrl").on("click",function(){
        applycontrol();
    });
//绑定点击显示模式事件

    $("#showstyle").on("click",function(){
        var memctlength= $("#membercamera_container").children('div').length;
        if(isshowstyle===false)	{
            $("#centerct_td").css("display","none");
            $("#memct_td").css("width","100%");
            $("#membercamera_container").css({"width":"100%"});
            $("#membercamera_container div").css({"width":"49%","height":"49%"});

            if( memctlength>5)
            {
                for(var i=5;i<memctlength;i++)
                {
                    $("#membercamera_container").children('div').eq(i).hide();
                }
            }

            isshowstyle=true;
        }
        else{
            $("#memct_td").css("width","220px");
            $("#centerct_td").css("display","block");
            $("#membercamera_container div").css({"width":"96%","height":"165px"});
            $("#membercamera_container").css({"width":"220px"});
            if( memctlength>5)
            {
                for(var i=5;i<memctlength;i++)
                {
                    $("#membercamera_container").children('div').eq(i).show();
                }
            }
            isshowstyle=false;
        }
    });
//绑定点击会议录制事件
    $("#recordpres").on("click",function(){
        recordpres();
    });
//绑定麦克风静音事件
    $(".microctl").on("click",function(){
        micromute();

    });
//绑定声音静音事件
    $(".voicectl").on("click",function(){

        voicemute();
    });

//绑定btn隐藏与显示聊天界面
    $("#dlgbtn").on("click",function(){
        if(!adapter.ismove){
            clearInterval(msgalertInterval);
            msgalertInterval=null;
            showdlg();
        }
    });
//绑定关闭聊天显示btn
    $("#dlgclosebtn").on("click",function(){
        $("#dlgbtn").css("display","block");
        $("#dlgct").css("display","none");
        adapter.dlgisshow=false;
        getdlgpositionbite();
    });
//绑定btn发送消息事件
    $('#sendmesbtn').bind('click', function () {
        btnsendmsg();

    });
//绑定ctl+enter发送消息
    document.getElementById("sendtextarea").onkeydown = function (e) {
        e = e || window.event;
        ctl_entersendmsg(e);
    }
//拖动声音事件
    // voicedrag(".voiceline",".isplayvoiceline",".voicekuai");
//拖动麦克风事件
    //  voicedrag(".microline",".isplaymicroline",".microkuai");
//绑定点击声音事件
    $(".voiceline").on("click",function(e){

        //  myclick(".voiceline",".isplayvoiceline",".voicekuai",e);

    });
//绑定点击麦克风事件
    $(".microline").on("click",function(e){

        //    myclick(".microline",".isplaymicroline",".microkuai",e);

    });
    $("#micro_range").change(function(){
        //  alert(this.value);
    });

    $("#voice_range").change(function(){
        //  alert(this.value);
    });

    $("#colorslt").change(function(){
        // alert(document.getElementById("colorslt").value);
    });
//绑定循转图片 
    $("#imgrotate").on("click",function(){
        var w=$("#testimg").width();
        var h=$("#testimg").height();
        $("#testimg").rotate(90);
        if($("#imgct").width()<=h)
            $("#testimg").css({"width":h,"height":w,"margin-left":"0px","left":"0px"});
        else
            $("#testimg").css({"width":h,"height":w,"margin-left":-h/2,"margin-top":-w/2});
        if($("#imgct").height()<=w)
            $("#testimg").css({"margin-top":"0px","top":"0px"});
        else
            $("#testimg").css({"margin-top":-w/2});

    });
//绑定图片加入白板
    $("#imgaddtowb").on("click",function(){
        if(adapter.isContrl){
            adapter.isaddpictowb=true;
            adapter.connection.send(sendCreatewbxml());

            $("#chatimgdiv").css("display","none");

        }
    });
//绑定关闭图片查看
    $("#chatimgclose").on("click",function(){

        $("#chatimgdiv").css("display","none");

    });

//绑定视频开关
    $("#videosetup p").on("click",function(){
        if(!isuploadv)
        {
            adapter.channelEnterRoom.setVideosrc(document.getElementById("videosrc"));
            adapter.channelEnterRoom.setCanvassrc(document.getElementById("canvas_src"));
            adapter.channelEnterRoom.setVPublishStatus(true);
            adapter.connection.send(sendCapabilityXMLStr('enable'));
            $(this).text("关闭视频");


            isuploadv=true;
        }
        else
        {
            $("#canvas_src_div").css("display","none");
            var ctx=document.getElementById('canvas_src').getContext('2d');
            $("#"+selftruenameid+"_user").css("background","#B5E1F6");
            $("#"+selftruenameid+"_user").children('p').eq(0).attr("isshowV",false);
            ctx.clearRect(0,0,2000,2000);
            adapter.channelEnterRoom.setVPublishStatus(false);
            adapter.connection.send(sendCapabilityXMLStr('disable'));
            $(this).text("开启视频");
            isuploadv=false;
        }
    });
//绑定文字聊天上传图片

//文件上传相关
    $(".upload-close").on("click",function(){
        $(".upnocheck").prop("checked",false);
        var obj=document.getElementById("filereader");
        obj.outerHTML=obj.outerHTML;
        $(".upload-guide").css("display","none");
    });
    $("#addfilebtn").on("click",function(){
        $(".upload-guide").css("display","block");
        tmpfileuploadArr.length=0;
    });
    //白板文档翻页
    $("#whichpg").on("focus",function(){
        $(this).select();
    });
    $("#whichpg").on("keydown",function(e){
        e = e || window.event;
        if(e.keyCode == 13) {
            var pagenum = $("#" + $('#selectwb').attr("tar")).attr("pagenum");

            var pageno = parseInt($(this).val());
            if (pageno > pagenum || pageno < 0||pagenum==='1001') {
                var orgpageno=parseInt($("#"+$('#selectwb').attr("tar")).attr("pageno"))+1;
                $(this).val(orgpageno + '/' + pagenum);
            }
            else
            {
                $(this).val(pageno + '/' + pagenum);
                adapter.connection.send(sendChangepagexml(adapter.pagejid, pagenum, pageno - 1));
            }
        }
    });
    $("#backpg").on("click",function(){
        var pagevalue=$("#whichpg").val();
        var pagenum=parseInt(pagevalue.slice(pagevalue.indexOf('/')+1));
        var pageno=parseInt(pagevalue.slice(0,pagevalue.indexOf('/')));

        if(pagenum>1&&pageno>1&&adapter.isContrl===1&&pagenum!==1001){
            $("#whichpg").val((pageno-1)+'/'+pagenum);
            adapter.connection.send(sendChangepagexml(adapter.pagejid,pagenum,pageno-2));

        }

    });
    $("#nextpg").on("click",function(){
        var pagevalue=$("#whichpg").val();
        var pagenum=parseInt(pagevalue.slice(pagevalue.indexOf('/')+1));
        var pageno=parseInt(pagevalue.slice(0,pagevalue.indexOf('/')));

        if(pagenum>1&&pagenum>pageno&&adapter.isContrl===1&&pagenum!==1001){
            $("#whichpg").val((pageno+1)+'/'+pagenum);
            adapter.connection.send( sendChangepagexml(adapter.pagejid,pagenum,pageno));
        }
    });
    setInterval(function(){
        $("#status_src").text('我: ' + (sendnetspeed/1000).toFixed(2) + 'kb/s ') ;

    },500);

    //mediaplay
    $("#player").hide();
    $("#playpausebtn").on("click", function() {
        if(pausetag) {
            loadvideo(adapter.vmediaurl);
            $("#voicebar").val($f(0).getVolume());
            if(pgrogressinterval !== null)
                clearInterval(pgrogressinterval);
            initprogress();
            pausetag = false;
            $(this).attr('src', './images/start.jpg');
        } else {
            if($f(0))
                $f(0).pause();
            pausetag = true;
            $(this).attr('src', './images/stop.jpg');
        }
    })


    $("#covervideodiv").on("mouseover", function() {
        if($("#controlsct").is(":hidden")&&!$("#player").is(":hidden"))
            $("#controlsct").show();
        if(!pausetag) {
            var alldurpgslen = $("#alldurpgs").width() - 12;
            var tmpnowdurpgslen = alldurpgslen * adapter.timepoint / adapter.allduration;
            $("#nowdurpgs").css('width', tmpnowdurpgslen + 'px');
            $("#pgsbtn").css('left', $("#nowdurpgs").position().left + tmpnowdurpgslen);
            $("#timetd>div>p>span").eq(0).text(initTimeLength(adapter.timepoint));
        }
        //var tmp=$f(0).getVolume();
        //var tmp=$f(0).setVolume(80);
    });

    $("#covervideodiv").on("mouseout",
        function(e) {
            evt = window.event || e;
            var obj = evt.toElement || evt.relatedTarget;
            var pa = this;
            if(pa.contains(obj)) return false;
            if(delaytag)
                setTimeout(function() {
                    delaytag=true;
                    $("#controlsct").hide();
                }, 1000);
            delaytag=false;

        });

    $("#voicebar").on("change",function(){
        if($f(0)) {
            $f(0).setVolume($(this).val());
        }
    });


    $("#bigbtn").on("click", function () {

           var objslectwb = $("#" + $("#selectwb").attr('tar'));
           var scaletag = parseFloat(objslectwb.attr('scaletag'));
        if(scaletag<3) {
           scaletag += 0.1;
           objslectwb.attr('scaletag', scaletag);
           var tmpwidth = parseInt(objslectwb.attr('orgW') * scaletag);
           var tmpheight = parseInt(objslectwb.attr('orgH') * scaletag);
           objslectwb.width(tmpwidth);
           objslectwb.height(tmpheight);
           if (objslectwb.attr('singlepg') === 'false') {


               var tmpliobj=objslectwb.children('ul').eq(0).children('li');
               for (var wbpgno = 0; wbpgno < tmpliobj.length; wbpgno++) {
                   tmpliobj.eq(wbpgno).width(tmpwidth);
                   tmpliobj.eq(wbpgno).height(tmpheight);
                   var tmpcvsobj=tmpliobj.eq(wbpgno).children('canvas');
                   tmpcvsobj.eq(0).width(tmpwidth);
                   tmpcvsobj.eq(0).height(tmpheight);
                   tmpcvsobj.eq(1).width(tmpwidth);
                   tmpcvsobj.eq(1).height(tmpheight);
                   tmpcvsobj.eq(2).width(tmpwidth);
                   tmpcvsobj.eq(2).height(tmpheight);
               }

           } else {
               var tmpcvsobj=objslectwb.children('canvas');
               tmpcvsobj.eq(0).width(tmpwidth);
               tmpcvsobj.eq(0).height(tmpheight);
               tmpcvsobj.eq(1).width(tmpwidth);
               tmpcvsobj.eq(1).height(tmpheight);
               tmpcvsobj.eq(2).width(tmpwidth);
               tmpcvsobj.eq(2).height(tmpheight);

           }
           resizewbpage();
       }
    });
    $("#smallbtn").on("click", function () {

        var objslectwb= $("#"+$("#selectwb").attr('tar'));
        var scaletag =parseFloat(objslectwb.attr('scaletag'));
        if(scaletag>0.2) {
            scaletag -= 0.1;
            objslectwb.attr('scaletag', scaletag);
            var tmpwidth = parseInt(objslectwb.attr('orgW') * scaletag);
            var tmpheight = parseInt(objslectwb.attr('orgH') * scaletag);

            objslectwb.width(tmpwidth);
            objslectwb.height(tmpheight);
            if (objslectwb.attr('singlepg') === 'false') {
                var tmpliobj=objslectwb.children('ul').eq(0).children('li');
                for (var wbpgno = 0; wbpgno < tmpliobj.length; wbpgno++) {
                    tmpliobj.eq(wbpgno).width(tmpwidth);
                    tmpliobj.eq(wbpgno).height(tmpheight);
                    var tmpcvsobj=tmpliobj.eq(wbpgno).children('canvas');
                    tmpcvsobj.eq(0).width(tmpwidth);
                    tmpcvsobj.eq(0).height(tmpheight);
                    tmpcvsobj.eq(1).width(tmpwidth);
                    tmpcvsobj.eq(1).height(tmpheight);
                    tmpcvsobj.eq(2).width(tmpwidth);
                    tmpcvsobj.eq(2).height(tmpheight);
                }

            } else {
                var tmpcvsobj=objslectwb.children('canvas');
                tmpcvsobj.eq(0).width(tmpwidth);
                tmpcvsobj.eq(0).height(tmpheight);
                tmpcvsobj.eq(1).width(tmpwidth);
                tmpcvsobj.eq(1).height(tmpheight);
                tmpcvsobj.eq(2).width(tmpwidth);
                tmpcvsobj.eq(2).height(tmpheight);
            }
            resizewbpage();
        }
    });


}

/**
 * 进入会议连接video/audio的websocket的结果的回调
 */
var websocketEnterRoomEvent = function(evt) {
    var data = evt;

    //console.log(data);    
    if (data.type == TYPE_INIT) {//init
        //_vSockWorker.status = data.type;
    } else if (data.type == TYPE_CONNECT) {//connected
        if(data.msgType =="video") {//video socket connected
            isConnectVideoSocket = true;
            if (isConnectVideoSocket && isConnectAudioSocket) {
                adapter.connection.send(sendTransportTestOverXMLStr());
                isConnectVideoSocket = false;
            }
        } else {//audio socket connected
            isConnectAudioSocket = true;
            if (isConnectAudioSocket && isConnectVideoSocket) {
                adapter.connection.send(sendTransportTestOverXMLStr());
                isConnectAudioSocket = false;
            }
        }
    } else if (data.type == TYPE_CLOSE || data.type == TYPE_ERROR) {//connected
        if(data.msgType =="video") {//video socket connected

        } else {//audio socket connected

        }
    } else if (data.type == TYPE_STAT) {
        sendnetspeed=data.sndRate;
        //  document.getElementById("status_src").innerHTML = '我: ' + (data.sndRate/1000).toFixed(2) + 'kb/s ' ;

    }
}


/**
 * click button send msg
 **/
var btnsendmsg=function(){
    var tojid;
    if($("#selecteddlg").attr("tar")==="groupdlg")
        tojid=ROOM_JID;
    else
    {

        tojid=$("#selecteddlg").attr("nametag");
        tojid=ROOM_JID+"/"+tojid;
    }
    msg=$('#sendtextarea').val();
    sendMsg(tojid,msg);

}
/**
 *ctl+enter 发送消息
 **/
var ctl_entersendmsg=function(e){
    if($("#selecteddlg").attr("tar")==="groupdlg")
    {
        tojid=ROOM_JID;
    }
    else
    {



        tojid=$("#selecteddlg").attr("nametag");
        tojid=ROOM_JID+"/"+tojid;

    }
    if(e.ctrlKey && e.keyCode == 13)
        sendMsg(tojid,$('#sendtextarea').val());

}
/**
 *点击btn显示聊天界面
 */
var showdlg=function(){
    adapter.dlgisshow=true;
    var tmpleft=$("#dlgbtn").position().left;
    var tmptop=$("#dlgbtn").position().top;
    /* console.log(tmpleft+"top:"+tmptop+"clientw:"+document.body.clientWidth+"clientH:"+document.body.
     clientHeight); */
    if(tmpleft>=document.body.clientWidth-362)
    {
        tmpleft=tmpleft-362;
        if(tmpleft<0)
            tmpleft=0;
    }
    if(tmptop>=document.body.clientHeight-432)
    {
        tmptop=tmptop-432;
        if(tmptop<0)
            tmptop=0;
    }
    $("#dlgbtn").css("display","none");
    $("#dlgct").css("left",tmpleft+"px");
    $("#dlgct").css("top",tmptop+"px");
    $("#dlgct").css("display","block");
    getdlgpositionbite();
}


/**
 *申请发言和关闭
 */
var applyspeak=function(){
    if(!adapter.isSpeaking)
    {
        /*  $(".imgapplyspeaking").css("background-image","url('./images/u790_normal.png')");
         $("#applyspeaking").text("正在发言");
         $(".speakmodule").css("backgroundColor","#FFCC00");*/
        adapter.connection.send(startSpeaking());
        // adapter.isSpeaking=true;
    }
    else
    {
        /*   adapter.isSpeaking=false;
         $(".imgapplyspeaking").css("background-image","url('./images/u810_normal.png')");
         $("#applyspeaking").text("申请发言");*/
        adapter.connection.send(stopSpeaking());
        //  $(".speakmodule").css("backgroundColor","");

    }

}
/**
 *数据操作权限控制
 **/
var applycontrol=function(){

    if(adapter.isContrl===0)
    {
        /*$(".imgapplycontrl").css("background-image","url('./images/u793_normal.png')");
         $("#applycontrl").text("主控状态");
         $(".applycontrlmodule").css("backgroundColor","#FFCC00");*/
        /*$("#wbct").css("color","#000000");
         $("#startdsksharebtn").attr("disabled",false);
         $("#webviewct").css("color","#000000");*/
        // $("#nothingseceen").css("display","none");
        adapter.connection.send(sendCtlapplyxml());

    }
    if(adapter.isContrl===1||adapter.isContrl===2)
    {
        /* adapter.isContrl=0;
         $(".imgapplycontrl").css("background-image","url('./images/u787_normal.png')");
         $("#applycontrl").text("数据操作");
         $(".applycontrlmodule").css("backgroundColor","");*/
        /*  $("#wbct").css("color","#A0A0A0");
         $("#startdsksharebtn").attr("disabled",true);
         $("#webviewct").css("color","#A0A0A0");
         $("#nothingseceen").css("display","block");*/
        adapter.connection.send(sendCtlstopxml());
    }

}
/**
 *麦克风静音事件
 **/
var micromute=function(){
    if(!adapter.micromuted)
    {
        $(".microctl").css("background-image","url('./images/Mic_u865_normal.png')");
        adapter.micromuted=true;
    }
    else
    {
        $(".microctl").css("background-image","url('./images/Mic_u863_normal.png')");
        adapter.micromuted=false;
    }
}
/**
 *声音静音事件
 */

var voicemute=function(){
    if(!adapter.voicemuted)
    {
        $(".voicectl").css("background-image","url('./images/Mic_u860_normal.png')");
        adapter.voicemuted=true;
    }
    else
    {
        $(".voicectl").css("background-image","url('./images/Mic_u864_normal.png')");
        adapter.voicemuted=false;
    }
}
/**
 *会议录制事件
 */
var recordpres=function(){
    if(!adapter.isprerecord)
    {
        $(".imgrecordpres").css("background-image","url('./images/u833_normal.png')");
        $(".recordpresmodule").css("backgroundColor","#FFCC00");
        adapter.isprerecord=true;

    }else{
        $(".imgrecordpres").css("background-image","url('./images/u813_normal.png')");
        $(".recordpresmodule").css("backgroundColor","");
        adapter.isprerecord=false;

    }

}
/**
 *function tab 切换模板
 **/
var tabmodule=function(tabId,activeId){
    $("#"+tabId).delegate("li:not(#"+activeId+")","click",function(){
        if($("#"+activeId).attr("tar")==='mediaplayerct')
        $("#"+$("#"+activeId).attr("tar")).css("z-index","-1");
        else
            $("#"+$("#"+activeId).attr("tar")).css("display","none");
        $("#"+activeId).removeAttr("id");
        $(this).attr("id",activeId);
        $("#"+$(this).attr("tar")).css({"display":"block","z-index":"66"});
        if($(this).attr("tar")==="desktopsharect"&&adapter.mouseobj!==null&&adapter.isdsktopsharing){
            /*  var setter = adapter.mouseobj['_raw_set_' + 'scale'];
             setter.call(adapter.mouseobj, $("#noVNC_container").width()/adapter.clientW);

             var dsktop=($("#noVNC_container").height()-($("#noVNC_container").width()*adapter.clientH/adapter.clientW))/2;
             $("#noVNC_canvas").css("margin-top",dsktop+"px");*/
            /* console.log(" tabmodule clientW:"+adapter.clientW+" adapter.clientW:"+adapter.clientH+"dsktop:"+dsktop+ "noVNC_containerheight"+$('#noVNC_container').height());
             console.log("@@@"+$("#noVNC_container").height()*adapter.clientH/adapter.clientW);*/
        }
    });

}


/**
 *白板页面切换
 */
function tab(tabId,activeId){
    $("#"+tabId).delegate("li:not(#"+activeId+")","click",function(){
        $("#"+$("#"+activeId).attr("tar")).css("display","none");
        $("#"+activeId).removeAttr("id");
        pageNo=$(this).attr("tar");
        if(document.getElementById($(this).attr("tar"))){
            $(this).attr("id",activeId);
            if($(this).attr("tar")!=="wbheadpage")
            {

                $("#canvas_tools_tr").css("display","block");
                var pagenum=$("#"+$(this).attr("tar")).attr("pagenum");
                if(parseInt(pagenum)>999) {
                    pagenum = 1;
                    $("#" + $(this).attr("tar")).attr("pagenum",pagenum);
                }
                var pageno=$("#"+$(this).attr("tar")).attr("pageno");
                $("#whichpg").val(parseInt(pageno)+1+"/"+pagenum);

                var pageid=$(this).attr("tar");

                if($("#prg_"+pageid).length)
                $("#wbpage").css('overflow',"hidden");
                else
                    $("#wbpage").css('overflow',"auto");
                if($("#"+$(this).attr("tar")).attr("singlepg")==="false") {
                    var tmppageid=pageid+"_" + pageno;
                    if($("#"+tmppageid).length) {
                        adapter.ctx = document.getElementById(tmppageid).children[1].getContext("2d");
                        adapter.ctxeffect = document.getElementById(tmppageid).children[2].getContext("2d");
                    }
                }else{
                    if($("#"+pageid).length) {
                        adapter.ctx = document.getElementById(pageid).children[1].getContext("2d");
                        adapter.ctxeffect = document.getElementById(pageid).children[2].getContext("2d");
                    }
                }
                $("#"+$(this).attr("tar")).css("display","block");
                resizewbpage();
                if(adapter.isContrl===1)
                {

                    var jidhead=adapter.pagejid.slice(0,adapter.pagejid.indexOf("/"))+"/"+$(this).attr("tar");
                    adapter.connection.send(sendChangepagexml(jidhead,pagenum,pageno));
                }

            }else
            {
                $("#canvas_tools_tr").css("display","none");
                $("#"+$(this).attr("tar")).css("display","block");
            }


        }
    });

}


/**
 * window.onresize
 */
window.onresize=function(){
    //聊天界面resize
// changeRedraw();
    /* var h=document.getElementById("canvas_tools").clientHeight+document.getElementById("wbtab").clientHeight;

     $("#nothingseceen").css({"width":document.getElementById("wbpage").clientWidth,"height":document.getElementById("wbpage").clientHeight+h});*/
    if($(".upload-guide").position().left>$("#center_container").width()-$(".upload-guide").width())
        $(".upload-guide").css("left",$("#center_container").width()-$(".upload-guide").width()+"px");
    if($(".upload-guide").position().top>$("#center_container").height()-$(".upload-guide").height())
        $(".upload-guide").css("top",$("#center_container").height()-$(".upload-guide").height()+"px");
    resizewbpage();
    var dlgbtnleft=adapter.dlgbtnleftbite*document.body.clientWidth;
    var dlgbtntop=adapter.dlgbtntopbite*document.body.clientHeight;
    var dlgctleft=adapter.dlgctleftbite*document.body.clientWidth;
    var dlgcttop=adapter.dlgcttopbite*document.body.clientWidth;
    if(dlgbtnleft>=document.body.clientWidth-dlgbtnwidth)
        dlgbtnleft=document.body.clientWidth-dlgbtnwidth;
    if(dlgbtntop>=document.body.clientHeight-dlgbtnheight)
        dlgbtntop=document.body.clientHeight-dlgbtnheight;
    $("#dlgbtn").css("left",dlgbtnleft+"px");
    $("#dlgbtn").css("top",dlgbtntop+"px");
    if(dlgctleft>=document.body.clientWidth-dlgctwidth)
        dlgctleft=document.body.clientWidth-dlgctwidth;
    if(dlgcttop>=document.body.clientHeight-dlgctheight)
        dlgcttop=document.body.clientHeight-dlgctheight;
    $("#dlgct").css("left",dlgctleft+"px");
    $("#dlgct").css("top",dlgcttop+"px");

    var coverwebviewctW=$("#webviewct").width()-14;
    var webviewctH=$("#webviewct").height()-14;
    if($("#body").width()>=1397)
    {
        $("#coverwebviewscreen").css({"width":coverwebviewctW,"height":$("#webviewct").height()})
    }else{
        $("#coverwebviewscreen").css({"width":coverwebviewctW,"height":webviewctH})
    }


}
/**
 *获取聊天界面的位置
 */
var getdlgpositionbite=function()
{
    if($("#dlgbtn").position()&&$("#dlgbtn").position().left!==0)
    {
        adapter.dlgbtnleftbite=$("#dlgbtn").position().left/document.body.clientWidth;
        adapter.dlgbtntopbite=$("#dlgbtn").position().top/document.body.clientHeight;

    }
    if($("#dlgct").position()&&$("#dlgct").position().left!==0)
    {
        adapter.dlgctleftbite=$("#dlgct").position().left/document.body.clientWidth;
        adapter.dlgcttopbite=$("#dlgct").position().top/document.body.clientHeight;
    }
}

/**
 *模块拖动模板
 */

var dlgbtnwidth,dlgbtnheight,dlgctwidth,dlgctheight;

function gs(d){var t=document.getElementById(d);if (t){return t.style;}else{return null;}}
function gs2(d,a){
    if (d.currentStyle){
        var curVal=d.currentStyle[a]
    }else{
        var curVal=document.defaultView.getComputedStyle(d, null)[a]
    }
    return curVal;
}

var initDragmodule=function(){
    if (window.opera){ document.write("<input type='hidden' id='Q' value=' '>"); }

    //  var n = 888;
    var dragok = false;
    var y,x,d,dy,dx;

    function move(e)
    {

        if (!e) e = window.event;
        if (dragok){
            adapter.ismove=true;
            var tmpx=dx + e.clientX - x;
            var tmpy=dy + e.clientY - y;
            var dlgwidth=d.clientWidth+2;
            var dlgheight=d.clientHeight+4;
            if(d.className==="upload-guide")
            {
                if(tmpx<=0)
                    tmpx=0;
                if(tmpy<=0)
                    tmpy=0;
                if(tmpx>=$("#center_container").width()-dlgwidth)
                    tmpx=$("#center_container").width()-dlgwidth+"px";
                if(tmpy>$("#center_container").height()-dlgheight)
                    tmpy=$("#center_container").height()-dlgheight+"px";
                d.style.left=tmpx+"px";
                d.style.top = tmpy+"px";
            }else{
                if(tmpx>=document.body.clientWidth-dlgwidth)
                    d.style.left=document.body.clientWidth-dlgwidth+"px";
                else if(tmpx<=0)
                    d.style.left=0+"px";
                else
                    d.style.left = tmpx+ "px";
                if(tmpy>=document.body.clientHeight-dlgheight)
                    d.style.top  = document.body.clientHeight-dlgheight + "px";
                else if(tmpy<=0)
                    d.style.top  = 0 + "px";
                else
                    d.style.top = tmpy + "px";
            }
            dlgbtnwidth=$("#dlgbtn").width()+2;
            dlgbtnheight=$("#dlgbtn").height()+2;
            dlgctwidth=$("#dlgct").width()+2;
            dlgctheight=$("#dlgct").height()+2;

            return false;
        }
    }

    function down(e){
        adapter.ismove=false;
        if (!e) e = window.event;
        var temp = (typeof e.target != "undefined")?e.target:e.srcElement;
        if (temp.tagName != "HTML"|"BODY" && temp.className != "dragclass"){
            temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
        }
        if('TR'==temp.tagName){
            temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
            temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
            temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
        }

        if (temp.className.indexOf("dragclass")!==-1){
            if (window.opera){ document.getElementById("Q").focus(); }
            dragok = true;
            // temp.style.zIndex = n++;
            d = temp;
            dx = parseInt(gs2(temp,"left"))|0;
            dy = parseInt(gs2(temp,"top"))|0;
            x = e.clientX;
            y = e.clientY;
            document.onmousemove=move;
            return false;
        }
    }

    function up(){
        getdlgpositionbite();
        dragok = false;
        document.onmousemove=null;
    }

    $(".dragclass").on("mousedown",down);

    $(".dragclass").on("mouseup",up);


}


/**
 *聊天界面显示发送出群消息
 */
var log_groupmymsg=function(timename,msg)
{
    var url;
    if(msg.indexOf("anyeduimage:")!==-1)
    {
        url=msg.slice(msg.indexOf("http"),msg.length-4)+".thumb";
        $("#groupdlg").append('<div></div>').append('<h style="color:#007FFF">'+timename+'</h>');
        $("#groupdlg").append('<div></div>').append("<img src='"+url+"' onclick='showdlgimg(this.src)'/>");
    } else{
        $("#groupdlg").append('<div></div>').append('<h style="color:#007FFF">'+timename+msg+'</h>');
    }
}
/**
 *聊天界面显示接收到群消息
 */
var log_groupmsg=function(timename,msg)
{
    var url;
    if(msg.indexOf("anyeduimage:")!==-1)
    {
        url=msg.slice(msg.indexOf("http"),msg.length-4)+".thumb";
        if(window.location.protocol!=='http:') {
            var replacestr=url.slice(0,url.indexOf('/upload'));
            url = url.replace(replacestr,'https://'+serverIp);
        }
        $("#groupdlg").append('<div></div>').append(document.createTextNode(timename));
        $("#groupdlg").append('<div></div>').append("<img src='"+url+"' onclick='showdlgimg(this.src)'/>");
    }
    else
        $("#groupdlg").append('<div></div>').append(document.createTextNode(timename+msg));
    if(msgalertInterval===null&&!adapter.dlgisshow){
        var i=1;
        msgalertInterval=setInterval(function(){
            i++;
            if(i%2===0)
                $("#dlgbtn").css("display","none");
            else
                $("#dlgbtn").css("display","block");

        },500); }
}
/**
 *聊天界面显示发送出个人消息
 */
var log_usersendmsg=function(user,timename,msg)
{
    var url;
    if(msg.indexOf("anyeduimage:")!==-1)
    {
        url=msg.slice(msg.indexOf("http"),msg.length-1)+".thumb";
        if(window.location.protocol!=='http:') {
            var replacestr=url.slice(0,url.indexOf('/upload'));
            url = url.replace(replacestr,'https://'+serverIp);
        }
        $("#"+user).append('<div></div>').append('<h style="color:#007FFF">'+timename+'</h>');
        $("#"+user).append('<div></div>').append("<img src='"+url+"' onclick='showdlgimg(this.src)'/>");
    }
    else
        $("#"+user).append('<div></div>').append('<h style="color:#007FFF">'+timename+msg+'</h>');

}


/**
 *聊天界面显示接收到个人消息
 */
var log_userrecmsg=function(user,timename,msg)
{
    var url;
    if(msg.indexOf("anyeduimage:")!==-1)
    {
        url=msg.slice(msg.indexOf("http"),msg.length-4)+".thumb";
        if(window.location.protocol!=='http:') {
            var replacestr=url.slice(0,url.indexOf('/upload'));
            url = url.replace(replacestr,'https://'+serverIp);
        }
        $("#"+user+"_dlg").append('<div></div>').append(document.createTextNode(timename));
        $("#"+user+"_dlg").append('<div></div>').append("<img src='"+url+"' onclick='showdlgimg(this.src)'/>");
    }
    else
        $("#"+user+"_dlg").append('<div></div>').append(document.createTextNode(timename+msg));

    if(msgalertInterval===null&&!adapter.dlgisshow){
        var i=1;
        msgalertInterval=setInterval(function(){
            i++;
            if(i%2===0)
                $("#dlgbtn").css("display","none");
            else
                $("#dlgbtn").css("display","block");

        },500); }
}
/**
 * 连接绑定方法
 * @param status
 */
var onConnect=function(status)
{
    if (status == Strophe.Status.CONNECTING) {
        //   alert('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
        //   alert('Strophe failed to connect.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
        alert('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
        alert('Strophe is disconnected.');
        // $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
        //   alert('Strophe is connected.');

        adapter.connectstatus=true;
        adapter.connection.addHandler(onMessage, null, 'message', null, null,  null);
        adapter.connection.send(sendiqagents(serverIp));


    }

//adapter.connection.send(sendTransportxmlstr());
}
/**
 * 发信息
 * @param toId
 * @param fromId
 * @param msg
 */
var sendMsg=function(toId,msg) {
    if(adapter.connectstatus==true)
    {
        var reply='';
        var sendTime=new Date().toLocaleTimeString();
        if(ROOM_JID===toId)
        {
            reply = $msg({to: ROOM_JID, type: 'groupchat',date:sendTime}).cnode(Strophe.xmlElement('body', ''
                ,msg));

        }
        else
        {
            reply=$msg({to: toId, type: 'chat',date:sendTime}).cnode(Strophe.xmlElement('body', '' ,msg));

            log_usersendmsg($("#selecteddlg").attr("tar"),''+sendTime+' (我): ', msg);
            var scrolldiv=document.getElementById($("#selecteddlg").attr("tar"));
            scrolldiv.scrollTop = 999;
        }
        adapter.connection.send(reply.tree());

        document.getElementById("sendtextarea").value='';
        var scrolldiv=document.getElementById("groupdlg");
        scrolldiv.scrollTop = scrolldiv.scrollHeight;

    }
}
/**
 * 获取消息时的方法
 * @param msg
 * @returns {Boolean}
 */
var msgalertInterval=null;
var onMessage =function(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    var recSendTime=msg.getAttribute('date');
    if(msg.getElementsByTagName('subject')[0])
        var subject=msg.getElementsByTagName('subject')[0].firstChild.nodeValue;
    if(subject==="file")
    {
        var filefrom=from.slice(from.indexOf('/')+1);
        var filename=elems[0].firstChild.nodeValue;
        var filetype=filename.slice(filename.lastIndexOf(".")+1);
        var jid =msg.getElementsByTagName("jid")[0].firstChild.nodeValue;
        var room=jid.slice(0,jid.indexOf("@"));
        var fileno=jid.slice(jid.indexOf(v5domain)+v5domain.length);
        var downloadfileurl=ServerHttp+room+"/"+fileno+"."+filetype;
        var size=msg.getElementsByTagName("size")[0].firstChild.nodeValue;
        addfiletras(downloadfileurl,filefrom,filename,size,"未下载");

    }
    var i=0;
    if(!recSendTime)
        recSendTime=new Date().toLocaleTimeString();
    if (type == "chat" && elems.length > 0) {
        var body = elems[0];
        var tmpfrom;
        tmpfrom=from.slice(from.indexOf('/')+1);
        var id="",name="";
        for(var j=0;j<adapter.userrefArr.length;j++)
        {
            if(adapter.userrefArr[j].name===tmpfrom)
                id=adapter.userrefArr[j].id;
        }
        if(document.getElementById(tmpfrom)===null)
            adduserdlg(tmpfrom,id);
        if(subject==="file")
            log_userrecmsg(id,(recSendTime+' ('+from.slice(from.indexOf('/')+1) + '): ' ), "已经上传了文件:"+Strophe.getText(body));
        else
            log_userrecmsg(id,(recSendTime+' ('+from.slice(from.indexOf('/')+1) + '): ' ), Strophe.getText(body));
        var scrolldiv=document.getElementById(id+"_dlg");
        scrolldiv.scrollTop = scrolldiv.scrollHeight;
    }
    if(type==="groupchat"&&elems.length>0){
        var body =elems[0];
        if(from.indexOf('/')!==-1)
        {
            if(subject==="file")
            {
                if(adapter.selfRoomID.indexOf(from.slice(from.indexOf('/') + 1))!==-1)
                    ;
                else
                    log_groupmsg(''+recSendTime+' ('+from.slice(from.indexOf('/') + 1) + '): ' , "已经上传了文件:"+Strophe.getText(body));

            }
            else{
                if(adapter.selfRoomID.indexOf(from.slice(from.indexOf('/') + 1))!==-1)
                    log_groupmymsg(''+recSendTime+' ('+from.slice(from.indexOf('/') + 1) + '): ' , Strophe.getText(body));
                else
                    log_groupmsg(''+recSendTime+' ('+from.slice(from.indexOf('/') + 1) + '): ' , Strophe.getText(body));
            }
            var scrolldiv=document.getElementById("groupdlg");
            scrolldiv.scrollTop = scrolldiv.scrollHeight;
        }
    }
    return true;
}
/**
 *增加单独与单独用户聊天窗口
 **/
var adduserdlg=function(name,title){

    if(title!==""&&name!=selftruename&&document.getElementById(title+"_dlg")===null)
    {
        title=title+"_dlg"
        var li=document.createElement("li");
        li.setAttribute("tar",title);
        li.setAttribute("nametag",name);
        li.setAttribute("class",title+"_li");
        var div=document.createElement("div");
        var p=document.createElement("p");

        p.innerHTML=name;
        var img=document.createElement("img");
        img.src='images/u650_normal.png';
        img.setAttribute("deldlgtabid",title+"_li")
        img.setAttribute("deldlgct",title);
        img.onclick=function(){
            $("."+$(this).attr("deldlgtabid")).remove();
            $("#"+$(this).attr("deldlgct")).remove();
            var len=document.getElementById("ul_dlgct").children.length;
            document.getElementById("ul_dlgct").children[len-1].click();
        };
        li.appendChild(div);
        li.appendChild(p);
        li.appendChild(img);
        $('#dlgct_tab').find("ul").append(li);
        $('#dlgct_recmes').find("ul").append("<li  id='"+title+"'style='display:none'></li>");
        li.click();
    }
}


/**
 *showdlgimg
 */
var showdlgimg=function(url){
    var imgct=document.getElementById("imgct");
    $("#imgct").children().remove();
    var img=document.createElement("img");
    $(img).attr("id","testimg");
    if(url.indexOf("thumb")!==-1)
        url=url.slice(0,url.indexOf(".thumb"));
    adapter.dlgimgurl=url;
    img.src=url;
    $(imgct).append(img);
    img.onload=function(){
        var w=adapter.orimageW=img.naturalWidth;
        var h=adapter.orimageH=img.naturalHeight;
        if($("#imgct").width()<=w)
            $("#testimg").css({"width":w,"height":h,"margin-left":"0px","left":"0px"});
        else
            $("#testimg").css({"width":w,"height":h,"margin-left":-w/2});
        if($("#imgct").height()<=h)
            $("#testimg").css({"margin-top":"0px","top":"0px"});
        else
            $("#testimg").css({"margin-top":-h/2});

    }
    var bodyH=document.body.clientHeight;
    var bodyW=document.body.clientWidth;
    var left=(bodyW-$("#chatimgdiv").width())/2;
    var top=(bodyH-$("#chatimgdiv").height())/2;
    $("#chatimgdiv").css("display","block");
    $("#chatimgdiv").css("left",left);
    $("#chatimgdiv").css("top",top);
}
/**
 *resize wb  page
 */
var resizewbpage=function(){

    var wbpageulwidth=$("#wbpage").children("ul").width();
    var wbpageulheight=$("#wbpage").children("ul").height();
    var canvasmarginleft=0,canvasmargintop=0;
    var selectcanW=document.getElementById($("#selectwb").attr("tar")).clientWidth;
    var selectcanH=document.getElementById($("#selectwb").attr("tar")).clientHeight;
    if(wbpageulwidth>selectcanW)
        canvasmarginleft=(wbpageulwidth-selectcanW)/2;
    if(wbpageulheight>selectcanH)
        canvasmargintop=(wbpageulheight-selectcanH)/2;
    $(".canvasmargin").css({"margin-left":canvasmarginleft,"margin-top":canvasmargintop});
}
/**
 *chairfuninit主席功能单击事件绑定
 */

var chairfuninit=function(){

    //自由会议模式
    $("#autopresmode p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            if(!adapter.isautopresmode)
            {
                adapter.isautopresmode=true;
                adapter.connection.send(applyctlmode("auto"));
                $("#autopresmode div").css("background-image","url('./images/u940_normal.png')");
                $("#chairctlmode div").css("background-image","url('')");
            }
        }

    });
    //主席控制模式
    $("#chairctlmode p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            if(adapter.isautopresmode)
            {
                adapter.isautopresmode=false;
                adapter.connection.send(applyctlmode("chair"));
                $("#chairctlmode div").css("background-image","url('./images/u940_normal.png')");
                $("#autopresmode div").css("background-image","url('')");
            }
        }
    });
    //全部静音
    $("#allmute p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            adapter.connection.send(applyallmute());
        }
    });
    //锁定会议
    $("#lockpres p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            if(!adapter.islockpres)
            {
                adapter.islockpres=true;
                adapter.connection.send(applylockpres("lock"));
                $("#lockpres div").css("background-image","url('./images/u940_normal.png')");
            }
            else
            {
                adapter.islockpres=false;
                adapter.connection.send(applylockpres("unlock"));
                $("#lockpres div").css("background-image","url('')");
            }
        }
    });
    //自由同步视频
    $("#autosyncvideo p").on("click",function(){
        if(adapter.ispreschair)
        {
            /*$("#chair_item").css("display","none");			
             if(!adapter.isautosyncvideo)
             {
             adapter.isautosyncvideo=true;
             $("#autosyncvideo div").css("background-image","url('/images/u940_normal.png')");
             }
             else
             {
             adapter.isautosyncvideo=false;
             $("#autosyncvideo div").css("background-image","url('')");
             }*/
        }
    });
    //手动同步视频
    $("#manualsyncvideo p").on("click",function(){
        if(adapter.ismanualsyncvideo&&adapter.ispreschair);
    });
    //会议分组
    $("#setpregroup p").on("click",function(){
        if(adapter.issetpregroup&&adapter.ispreschair);
    });
    //RTSP视频
    $("#RSTPvideo p").on("click",function(){
        if(adapter.isRSTPvideo&&adapter.ispreschair);
    });
    //H323
    $("#H323 p").on("click",function(){
        if(adapter.isH323&&adapter.ispreschair);
    });
    //电话会议
    $("#phonepres p").on("click",function(){
        if(adapter.isphonepres&&adapter.ispreschair);
    });
    //发起举手
    $("#starthandup p").on("click",function(){
        if(adapter.ispreschair)
        {
            if(!adapter.isstarthandup)
            {
                adapter.isstarthandup=true;
                $(this).text("结束举手");
                adapter.connection.send(applyhandup("start"));
            }else
            {
                adapter.isstarthandup=false;
                $(this).text("发起举手");
                adapter.connection.send(applyhandup("end"));
            }
        }
    });
    //删除文件
    $("#deletefile p").on("click",function(){
        if(adapter.isdeletefile&&adapter.ispreschair);
    });
    //会议录制权限
    $("#prerecord p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            if(!adapter.isprerecordauth)
            {
                adapter.isprerecordauth=true;
                adapter.connection.send(applypresrecodeauth("enable"));
                $("#prerecord div").css("background-image","url('./images/u940_normal.png')");
            }
            else
            {
                adapter.isprerecordauth=false;
                adapter.connection.send(applypresrecodeauth("disable"));
                $("#prerecord div").css("background-image","url('')");
            }
        }
    });
    //文字私聊
    $("#dlgpersonal p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            if(!adapter.isdlgpersonal)
            {
                adapter.isdlgpersonal=true;
                adapter.connection.send(applydlgpersonal("enable"));
                $("#dlgpersonal div").css("background-image","url('./images/u940_normal.png')");
            }
            else
            {
                adapter.isdlgpersonal=false;
                adapter.connection.send(applydlgpersonal("disenable"));
                $("#dlgpersonal div").css("background-image","url('')");
            }
        }

    });
    //发送文件给参会用户
    $("#sendfiletouser p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            if(!adapter.isdendfiletouser)
            {
                adapter.isdendfiletouser=true;
                adapter.connection.send(applysendfileauth("enable"));
                $("#sendfiletouser div").css("background-image","url('./images/u940_normal.png')");
            }
            else
            {
                adapter.isdendfiletouser=false;
                adapter.connection.send(applysendfileauth("disenable"));
                $("#sendfiletouser div").css("background-image","url('')");
            }
        }
    });
    //同步桌面布局
    $("#syncdsktoplayout p").on("click",function(){
        if(adapter.ispreschair)
        {
            $("#chair_item").css("display","none");
            if(!adapter.issyncdsktoplayout)
            {
                adapter.issyncdsktoplayout=true;
                adapter.connection.send(applysyncdsklayout("enable"));
                $("#syncdsktoplayout div").css("background-image","url('./images/u940_normal.png')");
            }
            else
            {
                adapter.issyncdsktoplayout=false;
                adapter.connection.send(applysyncdsklayout("disenable"));
                $("#syncdsktoplayout div").css("background-image","url('')");
            }
        }
    });
    //申请成为会议主席
    $("#applychair p").on("click",function(){
        if(!adapter.ispreschair&&!adapter.isotheruserchair)
        {
            $("#chair_item").css("display","none");
            var diag = new Dialog();
            diag.Width = 300;
            diag.Height = 90;
            diag.Title = "申请成为会议主席";
            var tmpdiv=document.createElement("div");
            $(tmpdiv).attr("class",".applychairdiv");
            var p=document.createElement("p");
            p.appendChild(document.createTextNode("请输入主席密码:"));
            $(p).css({"font-size":"12px","line-height":1.4});
            var input=document.createElement("input");
            $(input).attr("type","password");
            $(input).attr("id","chairpasswd");
            var p_alert=document.createElement("p");
            p_alert.appendChild(document.createTextNode("提示:主席权限允许您全面控制会议的进行。"));
            $(p_alert).css({"font-size":"12px","line-height":1.4});
            tmpdiv.appendChild(p);
            tmpdiv.appendChild(input);
            tmpdiv.appendChild(p_alert);
            diag.InnerHtml=$(tmpdiv).html();
            diag.OKEvent = function(){
                adapter.connection.send(applypreschair($("#chairpasswd").val()));
                diag.close();
            };//点击确定后调用的方法
            diag.show();

        }
    });
}
/**
 *send dlg img xml
 */
var senddlgimgxml=function(jid,chattype,sendtime,msg){
    var doc=createXMLDoc();
    var message=doc.createElement("message");
    message.setAttribute("to",jid);
    message.setAttribute("type",chattype);
    message.setAttribute("date",sendtime);
    message.setAttribute("xmlns","jabber:client");
    var body=doc.createElement("body");
    body.appendChild(doc.createTextNode(msg));
    message.appendChild(body);
    return message;

}

/**
 * 接收视频回调
 */
var getVideoEvent = function(evt) {
    var data = evt;
    //console.log(data);

    //console.log(data);
    //writeToScreen(objToString(data));
    if (data.type == TYPE_INIT) {//init
        //_vSockWorker.status = data.type;
    } else if (data.type == TYPE_CONNECT) {//connected
        if(data.msgType =="video") {//video socket connected

        } else {//audio socket connected

        }
    } else if (data.type == TYPE_CLOSE || data.type == TYPE_ERROR) {//connected
        if(data.msgType =="video") {//video socket connected

        } else {//audio socket connected

        }
    } else if (data.type == TYPE_STAT) {
        //document.getElementById("status_src").innerHTML = 'UP:' + data.sndRate + 'B/s ' + 'DN:' + data.rcvRate + 'B/s ';
        //document.getElementById("status_dst").innerHTML = 'DN:' + data.rcvRate + 'B/s ' + 'UP:' + data.sndRate + 'B/s ';

        //以视频数据中的mmid来找到名字，当前考虑只有一个mmid的情况
        var currentVideoName;
        for (var i = 0; i < adapter.confUsers.length; i ++) {
            var currentUser = adapter.confUsers[i];
            if (currentUser.mmidListTraverse[0] == data.mmid) {
                currentVideoName = currentUser.name;
                break ;
            }
        }

        $("#"+data.mmid+"_speed").text(currentVideoName + ": " + (data.rcvRate/1000.0).toFixed(2) + "KB/s");
    }
}


/**
 *
 **/
function downloadFile(fileName,content){
    var aLink = document.getElementById("downloada");

    if ((navigator.userAgent.indexOf('MSIE') >= 0)
        && (navigator.userAgent.indexOf('Opera') < 0)
        || (!!window.ActiveXObject || "ActiveXObject" in window)
        || (navigator.userAgent.indexOf('Edge') >= 0)) {
        //包括Microsoft IE和Microsoft Edge
        document.execCommand('Saveas', false, 'c:\\' + fileName);
    } //Firefox浏览器的支持
    else if (navigator.userAgent.indexOf('Firefox') >= 0) {
        /*
         var evt = document.createEvent("HTMLEvents");
         evt.initEvent("click", false, false);
         aLink.download = fileName;
         aLink.href = content;
         aLink.dispatchEvent(evt); */
        window.open (content,
            'newwindow', 'height=300, width=300, top=0, left=0, toolbar=no,'+
            'menubar=no, scrollbars=no, resizable=no,location=no, status=no');
        //document.getElementById("downloada").click();
    }
    //其他如Chrome和360浏览器的支持
    else {
        var aLink = document.createElement('a');
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", false, false);
        aLink.download = fileName;
        aLink.href = content;
        aLink.dispatchEvent(evt);
    }

    /*

     var aLink = document.createElement('a');
     // var blob = new Blob([content]);
     var evt = document.createEvent("HTMLEvents");
     evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
     aLink.href = content;
     aLink.download = fileName;
     aLink.dispatchEvent(evt); */
}

/**
 *
 */
var  imgselectclick=function(  ){
    return $("#imgupload").click( );
}



/**
 *媒体播放
 */
var loadvideo= function(Vmediaurl) {
    if(Vmediaurl) {
        if( $("#player").is(":hidden"))
            $("#player").show();
        flowplayer("player", "./plugins/flowplayer-3.2.8.swf", {
            clip: {
                url: Vmediaurl,
                provider: 'rtmp',
                autoPlay: true,
                scaling:'fit',
                live: true

            },
            plugins: {
                rtmp: {
                    url: './plugins/flowplayer.rtmp-3.2.8.swf'

                },
                controls: null

            }



        });
    }
}


var initprogress = function() {

    var alldurpgslen = $("#alldurpgs").width() - 12;
    var nowdurpgslen = alldurpgslen * adapter.timepoint / adapter.allduration;
    $("#nowdurpgs").css('width', nowdurpgslen + 'px');
    $("#pgsbtn").css('left', $("#nowdurpgs").position().left + nowdurpgslen);
    $("#timetd>div>p>span").eq(0).text(initTimeLength(adapter.timepoint));
    $("#timetd>div>p>span").eq(1).text(initTimeLength(adapter.allduration));
    if(timeinterval)
        clearInterval(timeinterval);

    timeinterval = setInterval(function() {
        adapter.timepoint++;
    }, 1000);
    if(pgrogressinterval)
        clearInterval(pgrogressinterval);
    pgrogressinterval = setInterval(function() {
        if(!pausetag) {
            var alldurpgslen = $("#alldurpgs").width() - 12;
            var tmpnowdurpgslen = alldurpgslen * adapter.timepoint / adapter.allduration;
            $("#nowdurpgs").css('width', tmpnowdurpgslen + 'px');
            $("#pgsbtn").css('left', $("#nowdurpgs").position().left + tmpnowdurpgslen);
            $("#timetd>div>p>span").eq(0).text(initTimeLength(adapter.timepoint));
            if(adapter.timepoint >= adapter.allduration) {
                clearInterval(pgrogressinterval);
                clearInterval(timeinterval);
            }
        }
    }, 10);

}


var initTimeLength = function(timeLength) { //根据秒数格式化时间
    timeLength = parseInt(timeLength);
    var second = timeLength % 60;
    var minute = (timeLength - second) / 60;
    return(minute < 10 ? "0" + minute : minute) + ":" + (second < 10 ? "0" + second : second);
}

//file post to server
var postfiletoserver =function(objid,objparentcls,type){
    var formdata = new FormData();
    var fileObj = $('#'+objid).get(0).files;
    adapter.wbformdata= new FormData();
    //var fileObj=document.getElemeqntById("fileToUpload").files;
    var tmpurl=adapter.imguploadurl;
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
    $("."+objparentcls).append(tmp);


    return false;
}