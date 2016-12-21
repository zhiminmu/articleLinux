

document.write("<script src='JS/Adapter.js'></script>");

//创建adapter类对象
var adapter=Object.create(ConfAdapter);
var recctx=null;
var changeTag=false;

var iqArrary=new Array();
var scaleArr=new Array();
/**
 *背景图数据结构
 */
var ImageStruct={
    downloadurl:"",
    imageurl:"",
    isdownload:false
}
var delnameArr = new Array();
var removeArr=new Array();

var wbpagei=0;
var uuid=0;
var tmpfileuploadArr=new Array();
var v5domain;

//重写父类ParserXMPPString方法;
adapter.ParserXMPPString=function(IQMessage){

    try{
        var xmlnsVal;
        var query=IQMessage.getElementsByTagName("query")[0];
        xmlnsVal=query.getAttribute("xmlns");
        var querytype=query.getAttribute("type");

        if(xmlnsVal==="jabber:iq:agents"){

            var agentArr=query.getElementsByTagName("agent");
            if(agentArr.length<1)
            {
                alert('internal server error!');
                return;
            }
            var Iq=IQMessage.getAttribute('to');
            v5domain=Iq.slice(Iq.indexOf('@')+1,Iq.indexOf('/')+1);
            ServerHttp=agentArr[0].getAttribute("jid")+"upload/";
            ROOM_JID=ROOM_JID+"@"+agentArr[1].getAttribute("jid");
            adapter.imguploadurl=ServerHttp.replace(":80",":18080/api");
            adapter.connection.send($pres().tree());
            adapter.connection.send($pres({
                to: ROOM_JID
            }).c('x',{xmlns: 'cellcom:conf:enter'}).tree());

            adapter.connection.send($iq({
                id:"jcl_121",
                type:"set",
                to: ROOM_JID
            }).c("query",{xmlns: "cellcom:conf:enter"}).c("password","",prespass).up().c("nick","",nickname).c("username","",Fromusername).c("userpass","",userpass).tree());
        }
        if(xmlnsVal==="cellcom:wb:ctrl")
        {
            var ctl=query.getAttribute("ctl");
            var id=query.getElementsByTagName("id")[0].firstChild.nodeValue;
            var ctlname=id.slice(id.indexOf("/")+1);
            var tmpname=ctlname;
            var tmpid;
            for(var k=0;k<adapter.userrefArr.length;k++)
            {
                if(adapter.userrefArr[k].name===tmpname)
                {
                    tmpid=adapter.userrefArr[k].id;
                    break;
                }

            }

            if(querytype==="accept"){

                if(ctl==="controller") {
                    $("#" + tmpid + "_ctlimg").css("background-image", "url('./images/u900_normal.png')");
                    $("#" + tmpid + "_ctlimg").attr('isCtrling',true);

                }
                else {
                    $("#" + tmpid + "_ctlimg").css("background-image", "url('./images/operater.png')");
                    $("#" + tmpid + "_ctlimg").attr('isCtrling', true);
                }
                if(ctlname===selftruename)
                {
                    $("#lineselect").removeAttr('disabled');
                    $("#rectselect").removeAttr('disabled');
                    $("#colorslt").removeAttr('disabled');
                }

                if(ctl==="controller"&&ctlname===selftruename)
                {
                    UI.rfb.set_view_only(false);
                    adapter.isContrl=1;
                    $("#whichpg").removeAttr('disabled');
                    $("#nothingseceen").css("display","none");
                    $("#coverwbtab").css("display","none");
                    $("#wbcldpage").css("color","#000000");
                    $("#wbtab").css("color","#000000");
                    $("#startdsksharebtn").attr("disabled",false);
                    $("#webviewct").css("color","#000000");
                    $(".imgapplycontrl").css("background-image","url('./images/u793_normal.png')");
                    $("#applycontrl").text("主控状态");
                    $(".applycontrlmodule").css("backgroundColor","#FFCC00");
                }
                if(ctl==="operator"&&ctlname===selftruename)
                {
                    UI.rfb.set_view_only(true);
                    $("#whichpg").attr('disabled','true');
                    $("#nothingseceen").css("display","none");
                    $("#coverwbtab").css("display","block");
                    $(".imgapplycontrl").css("background-image","url('./images/u793_normal.png')");
                    $("#applycontrl").text("主控状态");
                    $(".applycontrlmodule").css("backgroundColor","#FFCC00");
                    adapter.isContrl=2;
                }
            }
            if(querytype==="stop")
            {

                $("#" + tmpid + "_ctlimg").css("background-image","url('./images/clear.png')");
                $("#" + tmpid + "_ctlimg").attr('isCtrling', false);
                if(ctlname===selftruename) {
                    $(".imgapplycontrl").css("background-image", "url('./images/u787_normal.png')");
                    $("#applycontrl").text("数据操作");
                    $(".applycontrlmodule").css("backgroundColor", "");
                    $("#whichpg").attr('disabled','true');
                    $("#lineselect").attr('disabled','true');
                    $("#rectselect").attr('disabled','true');
                    $("#colorslt").attr('disabled','true');
                    adapter.isContrl = 0;
                    UI.rfb.set_view_only(true);

                    $("#wbcldpage").css("color","#A0A0A0");
                    $("#wbtab").css("color","#A0A0A0");
                    $("#startdsksharebtn").attr("disabled", true);
                    $("#webviewct").css("color", "#A0A0A0");
                    $("#nothingseceen").css("display", "block");
                    $("#coverwbtab").css("display","block");
                }
            }
            return true;
        }
        //响应举手
        if(xmlnsVal==="cellcom:conf:eraisinghand")
        {

            if(querytype==="start"){

                Dialog.confirm('你同意这个观点吗？',function(){
                    adapter.connection.send(applyhandup("result"));
                },function(){

                },200,80);
            }
            if(querytype==="end")
            {
                Dialog.close();
                Dialog.alert("举手结果","举手: "+adapter.handupno+" ,没举手: "+(adapter.handtotal-adapter.handupno),null,200,80);
                adapter.handupno=0;
                adapter.handtotal=0;
            }
            if(querytype==="result")
            {
                adapter.handupno++;
            }
            if(querytype==="total")
            {
                adapter.handtotal=query.getElementsByTagName("total")[0].firstChild.nodeValue;
            }
            return true;
        }
        //会议主席
        if(xmlnsVal==="cellcom:conf:chair")
        {
            if(query.getElementsByTagName("x")[0])
            {
                if(query.getElementsByTagName("x")[0].firstChild.nodeValue==="refuse")
                {

                    Dialog.alert("信息","密码错误!",null,150,80);
                    return true;
                }

            }
            else{
                var id=query.firstChild.nodeValue;
                var tmpname=id.slice(id.indexOf("/")+1);

                $("#ul_memlist").css("color","#000000");
                for(var i=0;i<adapter.userrefArr.length;i++)
                {
                    if(adapter.chairname===adapter.userrefArr[i].name){
                        var tmpid=adapter.userrefArr[i].id;
                        $("#"+tmpid+"_user").children('p').eq(0).css('color',"#000000");
                    }
                    if(tmpname===adapter.userrefArr[i].name)
                    {
                        var tmpid=adapter.userrefArr[i].id;
                        $("#"+tmpid+"_user").children('p').eq(0).css('color',"#FE9900");
                    }
                }
                this.chairname=tmpname;
                if(this.chairname===selftruename)
                {
                    this.ispreschair=true;
                    setchairItemstyle();
                }
                else{
                    this.isotheruserchair=true;
                    this.ispreschair=false;
                    $("#chair_item p").css({"color":"#A0A0A0","cursor":"default"});
                }
            }
            return true;
        }
        //白板
        if(querytype==="create"&&xmlnsVal=="cellcom:doc:share")
        {

            var  filejid=query.getElementsByTagName("jid")[0].firstChild.nodeValue;
            var tmpurl=query.getElementsByTagName("url")[0].firstChild.nodeValue;
            if(window.location.protocol!=='http:') {
                 tmpurl = 'https://www.vccellcom.com:6084/goform/HTTPUpload/';
            }
            var filename=adapter.wbfileobj.name;
            var filetype=filename.slice(filename.lastIndexOf('.'));
            var tmpfilejid=filejid+"_original"+filetype;
            adapter.wbformdata.append("FileJID", tmpfilejid);
            adapter.wbformdata.append("file", adapter.wbfileobj);
            adapter.wbformdata.append("EndProtect", "whoknows");
            var tmpformdata=adapter.wbformdata;
            adapter.wbformdata=null;
            adapter.wbfileobj=null;
            $.ajax({
                url : tmpurl,
                type : 'post',
                data : tmpformdata,
                sync:true,
                cache : false,
                contentType : false,
                processData : false,
                success : function(data) {
                    console.log('upload wb file :'+filename+' success');


                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    console.log("upload failed:"+errorThrown);
                }

            });
            return true;
        }
        //协同浏览
        if(xmlnsVal==="cellcom:share:browse"&&querytype==="web")
        {

            var infoArr=query.getElementsByTagName("info");
            for(var i=0;i<infoArr.length;i++)
            {
                adapter.webviewbrowseArr.push(infoArr[i]);
            }
            return true;
        }
        if(xmlnsVal==="cellcom:share:browse"&&querytype==="browseend")
        {
            for(var i=0;i<adapter.webviewbrowseArr.length;i++)
            {
                var jid=adapter.webviewbrowseArr[i].getElementsByTagName("jid")[0].firstChild.nodeValue;
                var jid_id=jid.slice(jid.indexOf("/")+1);
                if(adapter.webviewbrowseArr[i].getElementsByTagName("url")[0]&&adapter.webviewbrowseArr[i].getElementsByTagName("url")[0].firstChild)
                {
                    var url=adapter.webviewbrowseArr[i].getElementsByTagName("url")[0].firstChild.nodeValue;
                    addwebviewpage(url,jid_id);
                }
                else{
                    addwebviewpage(null,jid_id);
                }
            }
            return true;
        }
        if(xmlnsVal==="cellcom:web:share")
        {
            var jid=query.getElementsByTagName("jid")[0].firstChild.nodeValue;
            var jid_id=jid.slice(jid.indexOf("/")+1);
            if(querytype==="share")
            {
                if(query.getElementsByTagName("url")[0]&&query.getElementsByTagName("url")[0].firstChild)
                {
                    var url=query.getElementsByTagName("url")[0].firstChild.nodeValue;
                    addwebviewpage(url,jid_id);
                }
                else{
                    addwebviewpage(null,jid_id);
                }
            }
            if(querytype==="change")
            {
                $("li[tar='webviewct']").click();
                $("."+jid_id).click();
            }
            if(querytype==="changedata")
            {
                if(query.getElementsByTagName("url")[0]&&query.getElementsByTagName("url")[0].firstChild)
                {
                    var url=query.getElementsByTagName("url")[0].firstChild.nodeValue;
                    $("#"+jid_id).children("iframe").first().attr("src",url);
                    $("."+jid_id).text(url);
                }

            }
            if(querytype==="end")
            {
                $("."+jid_id).remove();
                $("#"+jid_id).remove();
            }
            return true;

        }
        //投票
        if(xmlnsVal==="cellcom:conf:voting")
        {
            if(querytype==="start")
            {
                $("li[tar='votect']").click();
                if(adapter.timeinternal!==null)
                    clearInterval(adapter.timeinternal);
                $(".voteres_p").css("display","none");
                $("#voteresult").css("display","none");
                $("#voteapply").css("display","block");
                $(".mychoose").text("我选择的是: ");
                var qid=query.getElementsByTagName("qid")[0].firstChild.nodeValue;
                var caption=query.getElementsByTagName("caption")[0].firstChild.nodeValue;
                var multi=query.getElementsByTagName("multi")[0].firstChild.nodeValue;
                var reg=query.getElementsByTagName("reg")[0].firstChild.nodeValue;
                var timeout=query.getElementsByTagName("timeout")[0].firstChild.nodeValue;
                var subjectnode=query.getElementsByTagName("subject");
                timeout=timeout*60;
                adapter.timeinternal=setInterval(function() {

                    $(".timeremainder").text("剩于时间:"+"  "+converttime(--timeout));
                    if(timeout<1){

                        //  adapter.connection.send(sendApplyvotexml(true));
                        $("#voteapply").css("display","none");
                        $(".voteres_p").css("display","block");
                        clearInterval(adapter.timeinternal);
                    }
                },1000);
                $("#voteitem_ul").find("li").remove();
                $("#voteapply").attr("tar",qid);
                $(".votetitle").text(caption);
                for(var i=0;i<subjectnode.length;i++)
                {
                    var index=subjectnode[i].getAttribute("index");
                    var itemvalue=subjectnode[i].firstChild.nodeValue;
                    addVoteItem(qid,index,itemvalue,multi,reg);
                }
            }
            if(querytype==="end")
            {
                // adapter.connection.send(sendApplyvotexml(true));
                $("#voteapply").css("display","none");
                $(".voteres_p").css("display","block");
                tmpvoteArr.length=0;
                if(adapter.timeinternal!==null)
                    clearInterval(adapter.timeinternal);
            }
            if(querytype==="kithe"){
                $(".voteres_p").css("display","none");
                $("#voteapply").css("display","none");
                $("#voteresult").css("display","block");
                $("li[tar='votect']").click();
                var allcount=query.getElementsByTagName("count")[0].firstChild.nodeValue;
                var caption=query.getElementsByTagName("caption")[0].firstChild.nodeValue;
                var qid=query.getElementsByTagName("qid")[0].firstChild.nodeValue;
                var multi=query.getElementsByTagName("multi")[0].firstChild.nodeValue;
                var reg=query.getElementsByTagName("reg")[0].firstChild.nodeValue;
                var currentDate = new Date();
                $(".voteresulttime").text(currentDate.toLocaleDateString()+" "+currentDate.toLocaleTimeString());
                $("#votersttit_ul").children("li").last().text(allcount+"人参与投票");
                if(reg==="true")
                    $("#votersttit_ul").children("li").first().text("本次投票记名");
                else
                    $("#votersttit_ul").children("li").first().text("本次投票不记名");
                $(".votepretitle").text("会议标题: "+adapter.presenceName);
                $(".voteresulttitile").text(caption);
                $("#voteresult_ul").find("li").remove();
                var subjectArr=query.getElementsByTagName("subject");
                addVoteResultItem(allcount,count,index,name,multi,reg,true);
                var tmpsubjectArr=new Array();
                for(var i=0;i<subjectArr.length;i++){
                    var index=subjectArr[i].getAttribute("index");
                    if(index==="A")
                        tmpsubjectArr[0]=subjectArr[i];
                    if(index==="B")
                        tmpsubjectArr[1]=subjectArr[i];
                    if(index==="C")
                        tmpsubjectArr[2]=subjectArr[i];
                    if(index==="D")
                        tmpsubjectArr[3]=subjectArr[i];
                    if(index==="E")
                        tmpsubjectArr[4]=subjectArr[i];
                    if(index==="F")
                        tmpsubjectArr[5]=subjectArr[i];
                }
                for(var i=0;i<tmpsubjectArr.length;i++){
                    var count=tmpsubjectArr[i].getAttribute("count");
                    var index=tmpsubjectArr[i].getAttribute("index");
                    var name=tmpsubjectArr[i].getAttribute("name");
                    var voteusernameArr=new Array();
                    if(reg==="true"&&count>0){
                        var voteuserArr=tmpsubjectArr[i].getElementsByTagName("user");

                        for(var j=0;j<voteuserArr.length;j++)
                        {
                            voteusernameArr.push(voteuserArr[j].firstChild.nodeValue);
                        }
                    }
                    addVoteResultItem(allcount,count,index,name,multi,reg,false,voteusernameArr);
                }
            }
            return true;

        }

        if(xmlnsVal==="cellcom:mm:create"){
            var  from=IQMessage.getAttribute("from");
            var conferenceID=from.slice(0,from.indexOf("@"));
            adapter.connection.send(sendTransportxmlstr());
            /*if(this.SendPriorityPresence()&&this.GetTransferInfo()){

             }
             else{
             var errorIf=Object.create(ErrorInfo);;
             errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_SEND_XMPP_FAIL;
             errorIf.errorDescription=conferenceID;
             //注册回调
             return false;
             }
             var errorIf=Object.create(ErrorInfo);;
             errorIf.errorDescription=conferenceID;
             //注册回调*/
            this.isLeaveConference=false;
            return true;

        }
        if(xmlnsVal==="cellcom:conf:enter"){
            var error=IQMessage.getElementsByTagName("error")[0];;
            if(error)
            {

                var errCode=error.getAttribute("code");
                var errStr=error.firstChild.nodeValue;
                var errorIf=Object.create(ErrorInfo);;
                errorIf.errorDescription="";

                if(errCode===180)
                    errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_WRONG_NAME_OR_PASSWORD;
                else if(errCode===2007)
                    errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_CONFERENCE_NOT_EXIST;
                else
                    errorIf.errorNo=errCode;

                errorIf.errorDescription=errStr;
                alert(errStr);
                //注册回调
                return true;

            }else{
                $("#main_container").css("display","block");
                // var h=document.getElementById("canvas_tools_tr").clientHeight+document.getElementById("wbtab").clientHeight;
                // $("#nothingseceen").css({"width":document.getElementById("wbpage").clientWidth,"height":document.getElementById("wbpage").clientHeight+h});

                // var audioType,mixMode;
                //  var audiocodec=query.getElementsByTagName("audiocodec")[0];
                var mixmode=query.getElementsByTagName("mixmode")[0];

                //  audioType=audiocodec.firstChild.nodeValue;
                //  mixMode=mixmode.firstChild.nodeValue;
                this.selfRoomID=query.getElementsByTagName("id")[0].firstChild.nodeValue;
                selftruename=adapter.selfRoomID.slice(adapter.selfRoomID.indexOf("/")+1);
                //获取会议名
                this.presenceName=query.getElementsByTagName("topic")[0].firstChild.nodeValue;
                //显示本人用户名
                $("#memberimg p").text("会员:"+selftruename);                //addhkshen

                return true;
            }

        }
        if(xmlnsVal==="cellcom:conf:wannaTransportMM"){

            var error=IQMessage.getElementsByTagName("error")[0];
            if(error){
                var errCode=error.getAttribute("code");
                var errStr=error.firstChild.nodeValue;
                var errorIf=Object.create(ErrorInfo);;
                if(errCode===180)
                    errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_WRONG_NAME_OR_PASSWORD;
                else if(errCode===2007)
                    errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_CONFERENCE_NOT_EXIST;
                else
                    errorIf.errorNo=errCode;

                errorIf.errorDescription = errStr;
                //注册回调
                return true;
            }else{
                // this.StartTransferTest(IQMessage);//
                //fileShareSession->SetFileRoom(room_data.c_str());
                var protDes = query.getElementsByTagName("protDes")[0];
                var mmidStr = protDes.getAttribute("mmid");
                //  console.log("mmidStr is:" + mmidStr);

                var udp = query.getElementsByTagName("UDP")[0];
                var udpAddr = udp.getElementsByTagName("addr")[0];
                var udpIp = udpAddr.getElementsByTagName("ip")[0].firstChild.nodeValue;
                var udpAudioPort = udpAddr.getElementsByTagName("audioPort")[0].firstChild.nodeValue;
                var udpVideoPort = udpAddr.getElementsByTagName("videoPort")[0].firstChild.nodeValue;
                // console.log("udpIp:" + udpIp + ";" + "udpAudioPort:" + udpAudioPort + ";" + "udpVideoPort:" + udpVideoPort);

                var http = query.getElementsByTagName("HTTP")[0];
                var httpAddr = http.getElementsByTagName("addr")[0];
                var httpIp = httpAddr.getElementsByTagName("ip")[0].firstChild.nodeValue;
                var httpAudioPort = httpAddr.getElementsByTagName("audioPort")[0].firstChild.nodeValue;
                var httpVideoPort = httpAddr.getElementsByTagName("videoPort")[0].firstChild.nodeValue;
                // console.log("httpIp:" + httpIp + ";" + "httpAudioPort:" + httpAudioPort + ";" + "httpVideoPort:" + httpVideoPort);

                adapter.userDesMMID = mmidStr;



                //---------------enter room websocket---------------//
                videoUrl = "wss://" + "www.vccellcom.com" + ":6082";// + httpVideoPort;
                audioUrl = "wss://" + "www.vccellcom.com" + ":6081";// + httpAudioPort;
                var cfg = {};
                cfg.mmid = mmidStr;
                cfg.selfmmid = 0;
                cfg.confjid = ROOM_JID;
                //cfg.jid="guest@192.168.7.124";
                //cfg.nick="guest";

                //adapter.channelEnterRoom = new UserChannel(cfg);
                adapter.channelEnterRoom = UserChannel.createNew(cfg);
                //进入会议连接video/audio的websocket的结果的回调
                adapter.channelEnterRoom.setMediaParam("capture_scale",0.5);
                adapter.channelEnterRoom.setMediaParam("keyint",40);
                adapter.channelEnterRoom.setSocketEvent(websocketEnterRoomEvent);

                $("#canvas_src_div").mouseover(function(){
                    $("#status_src").css("display","block");
                });
                $("#canvas_src_div").mouseout(function(){
                    $("#status_src").css("display","none");
                });
                // adapter.channelEnterRoom.setVideosrc(document.getElementById("videosrc"));
                // adapter.channelEnterRoom.setCanvassrc(document.getElementById("canvas_src"));
                //adapter.channelEnterRoom.setCanvasdst(document.getElementById("canvas_dst"));

                //video websocket
                adapter.channelEnterRoom.connectVideo(videoUrl);

                //audio websocket
                adapter.channelEnterRoom.connectAudio(audioUrl);
                return true;
            }
        }
        if(xmlnsVal==="cellcom:conf:statusTransferOk")
        {
            //this.DealTransferOK(IQMessage);
            adapter.connection.send(sendCapabilityXMLStr('disable'));
            adapter.connection.send(sendStatusTransferOkXMLStr());
            return true;

        }
        if(xmlnsVal=="cellcom:conf:capability")
        {
            var user = query.getElementsByTagName("user")[0];
            var vSendStr;
            if(user.getElementsByTagName("vSend")[0])
                vSendStr = user.getElementsByTagName("vSend")[0].firstChild.nodeValue;
            var jid = user.getAttribute("jid");
            var tmpname=jid.slice(jid.indexOf('/')+1);
            var mmid = user.getAttribute("mmid");
            var tmpid;
            for(var i=0;i<adapter.userrefArr.length;i++)
            {
                if(tmpname===adapter.userrefArr[i].name)
                {
                    tmpid=adapter.userrefArr[i].id;
                    break;

                }
            }
            if (vSendStr == "immediately") {
                //self jid and mmid

                //开始上传数据
                if (mmid == adapter.userDesMMID) {
                    //adapter.channelEnterRoom.setVPublishStatus(true);
                }
            }
            if(vSendStr=='enable')
            {
                $("#"+tmpid+"_camimg").css("background-image","url('./images/u896_normal.png')");
                $("#" + tmpid + "_camimg").attr('isCaming', true);
            }
            if(vSendStr=='disable'){
                var tmpmmid=$("#"+tmpid+"_camimg").prev().attr("mmid");
                if(document.getElementById(tmpmmid)) {
                    $("." + tmpmmid).remove();
                    $("#"+tmpid+"_camimg").prev().attr("isshowV", false);
                    $("#" + tmpid + "_camimg").parent().css("background", "#B5E1F6");
                }
                $("#"+tmpid+"_camimg").css("background-image","url('./images/u896_unnornal.png')");
                $("#" + tmpid + "_camimg").attr('isCaming', false);
            }
            return true;
        }
        if(xmlnsVal==="cellcom:conf:user")
        {
            var user=query.getElementsByTagName("user");
            var i;
            for(i=0;i<user.length;i++)
            {
                var userJid=user[i].getAttribute("jid");
                var type=user[i].getAttribute("type");
                var name=user[i].getAttribute("name");
                if(name!==null){
                    var tmptag=0;
                    for(var ti=0;ti<adapter.userrefArr.length;ti++)
                    {
                        if(adapter.userrefArr[ti].name!==name)
                            tmptag++;
                    }
                    if(tmptag>=adapter.userrefArr.length) {
                        adapter.userrefArr.push({"name": name, "id": tmptag});
                        if(selftruename===name)
                            selftruenameid=tmptag;
                    }
                }
                var voice=user[i].getAttribute("voice");
                var ctl=user[i].getAttribute("ctl");
                var identity=user[i].getAttribute("identity");
                var videoCap=null;
                var voiceCap=null;
                var videoCapEle=user[i].getElementsByTagName("videocap")[0];
                var voiceCapEle=user[i].getElementsByTagName("voicecap")[0];
                if(videoCapEle)
                    videoCap=videoCapEle.firstChild.nodeValue;
                if(voiceCapEle)
                    voiceCap=voiceCapEle.firstChild.nodeValue;

                var mmid;
                var mmidEle=user[i].getElementsByTagName("mmid")[0];
                if(mmidEle)
                    mmid=mmidEle.firstChild.nodeValue;
                var mmidList=user[i].getElementsByTagName("mmidList")[0];

                var pos=-1;
                //一堆userlist处理。。。
                var temPos=0;
                for(var j=0;j<this.confUsers.length;j++)
                {
                    var oneUserInfo=this.confUsers[j];
                    if(oneUserInfo.jid===userJid)
                    {
                        if((type)&&(type==="remove")){
                            var mmidCurrentDelete=oneUserInfo.mmidListTraverse[oneUserInfo.mmidListTraverse.length-1];
                            /*if (clientSession) {
                             clientSession->deleteTalker(mmidCurrentDelete);
                             }*/
                            var tmpname=this.confUsers[j].name;
                            var tmpid;
                            if(tmpname===adapter.chairname) {

                                this.isotheruserchair = false;
                                this.ispreschair = false;
                                $("#applychair p").css({"color":"#FFFFFF","cursor":"pointer"});
                            }
                            for(var k=0;k<adapter.userrefArr.length;k++)
                            {
                                if(adapter.userrefArr[k].name===tmpname)
                                {
                                    tmpid=adapter.userrefArr[k].id;
                                    break;
                                }

                            }
                            $("."+oneUserInfo.mmidListTraverse[0]).remove();
                            $("#"+tmpid+"_user").remove();
                            $("#"+tmpid+"_upfileuser").remove();
                            if(this.isLeaveConference)
                                this.confUsers.length=0;
                            else
                                this.confUsers.splice(j,1);

                        }
                        else{
                            if(name){
                                var isFindMMID=false;
                                oneUserInfo.name=name;
                                if(voice)
                                    oneUserInfo.voice=voice;
                                if(identity)
                                    oneUserInfo.identity=identity;
                                if(ctl)
                                    oneUserInfo.userCtl=ctl;
                                if(videoCap)
                                    oneUserInfo.videoCap=videoCap;
                                if(voiceCap)
                                    oneUserInfo.voiceCap=voiceCap;

                                for(var k=0;k<oneUserInfo.mmidListTraverse.length;k++)
                                {
                                    if(oneUserInfo.mmidListTraverse[k]===null)
                                        continue;
                                    if(oneUserInfo.mmidListTraverse[k]===mmid)
                                        isFindMMID=true;

                                }
                                if(!isFindMMID){
                                    if(mmid!==0){
                                        if(name===selftruename)
                                            this.myselfmmid=mmid;
                                        oneUserInfo.mmidListTraverse.unshift(mmid);
                                    }

                                }
                                if(mmidList){
                                    var userDes=mmidList.getElementsByTagName("userDes");
                                    for(var k=0;k<userDes.length;k++)
                                    {
                                        var mmidEx=userDes[k].getAttribute("mmid");
                                        var isFindMMIDEx=false;
                                        for(var j=0;j<oneUserInfo.mmidListTraverse.length;j++)
                                        {
                                            if(oneUserInfo.mmidListTraverse[j]===null)
                                                continue;
                                            if(oneUserInfo.mmidListTraverse[j]===mmidEx)//mmidEx转成long
                                                isFindMMIDEx=true;
                                        }
                                        if(!isFindMMIDEx)
                                            oneUserInfo.mmidListTraverse.unshift(mmidEx);////mmidEx转成long

                                    }
                                }
                            }
                        }
                        pos=temPos;
                        break;
                    }
                    temPos++;

                }
                if(pos===-1)
                {
                    var oneUserInfo=Object.create(ConfUser);
                    oneUserInfo.mmidListTraverse=new Array();
                    oneUserInfo.jid=userJid;
                    if(voice)
                        oneUserInfo.voice=voice;
                    if(name)
                        oneUserInfo.name=name;

                    var isFindMMID=false;
                    for(var j=0;j<oneUserInfo.mmidListTraverse.length;j++)
                    {
                        if(oneUserInfo.mmidListTraverse[j]===null)
                            continue;
                        if(oneUserInfo.mmidListTraverse[j]===mmid)
                            isFindMMID=true;
                    }
                    if(!isFindMMID){
                        if(mmid!=0){

                            oneUserInfo.mmidListTraverse.unshift(mmid);
                        }
                    }
                    if(mmidList){
                        var userDes=mmidList.getElementsByTagName("userDes");
                        for(var i=0;i<userDes.length;i++)
                        {
                            var mmidEx=userDes[i].getAttribute("mmid");
                            var isFindMMIDEx=false;
                            for(var j=0;j<oneUserInfo.mmidListTraverse.length;j++)
                            {
                                if(oneUserInfo.mmidListTraverse[j]===null)
                                    continue;
                                if(oneUserInfo.mmidListTraverse[j]===parseInt(mmidEx))//mmidEx转成long
                                    isFindMMIDEx=true;
                            }
                            if(!isFindMMIDEx)
                                oneUserInfo.mmidListTraverse.unshift(parseInt(mmidEx));////mmidEx转成long

                        }
                    }
                    if(identity)
                        oneUserInfo.identity=identity;
                    if(ctl)
                        oneUserInfo.userCtl=ctl;
                    if(videoCap)
                        oneUserInfo.videoCap=videoCap;
                    if(voiceCap)
                        oneUserInfo.voiceCap=voiceCap;
                    this.confUsers.unshift(oneUserInfo);
                    /*  if(clientSession&&(voice)&&(voice==="speaking")
                     clientSession->addTalker(mmid); */
                }

            }
            var userlen=countusernum(adapter.confUsers);
            $("#presmem_num").find("p").html("参会用户("+userlen+")")
            adduserTolist(adapter.confUsers);
            adduserTouploadlist(adapter.confUsers);
            // this.OnConferenceUserChaned(this.confUsers);
            return true;
        }
        if(xmlnsVal==="cellcom:video:accept")
        {
            /*  var ids=query.getElementsByTagName("id");
             for(var i=0;i<ids.length;i++)
             {
             var id=ids[i]
             var userJid=id.firstChild.nodeValue;
             var temPos=0;
             var userExist=false;
             for(var i=0;i<this.confUsers.length;i++)
             {
             var oneUserInfo=this.confUsers[i];
             if(oneUserInfo.jid===userJid)
             {
             var acceptMmid=id.getAttribute("mmid");
             var userMmid=parseInt(acceptMmid);

             if(!this.isLeaveConference);
             //clientSession->NeedVideo(userMmid);

             var errorIf=Object.create(ErrorInfo);;
             errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_NO;
             errorIf.errorDescription=acceptMmid;
             errorIf.userJID=userJid;
             //注册回调GetVideoSuccess
             userExist=true;
             break;
             }
             temPos++;
             }

             }*/
            return true;
        }
        if(xmlnsVal==="cellcom:video:refuse")
        {
            /*   var ids=query.getElementsByTagName("id");
             for(var i=0;i<ids.length;i++)
             {
             var id=ids[i];
             var userJid=id.firstChild.nodeValue;
             var temPos=0;
             var userExist=false;
             for(var i=0;i<this.confUsers.length;i++)
             {
             var oneUserInfo=this.confUsers[i];
             if(oneUserInfo.jid===userJid)
             {
             var refuseMmid=id.getAttribute("mmid");
             var userMmid=parseInt(refuseMmid);
             if(!this.isLeaveConference);
             //  clientSession->NeedVideo(userMmid);

             var errorIf=Object.create(ErrorInfo);;
             errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_SERVER_REFUSE;
             errorIf.errorDescription=refuseMmid;
             errorIf.userJID=userJid;
             //注册回调GetVideoFail
             userExist=true;
             break;
             }
             temPos++;
             }
             }*/
            return true;
        }
        if(xmlnsVal==="cellcom:conf:multimediatransport")
        {
            //  this.StartGetVideo(IQMessage);
            var srcmmid;
            var member;
            srcmmid = query.getElementsByTagName("srcmmid")[0].firstChild.nodeValue;

            var connect = query.getElementsByTagName("connect")[0];
            if (connect) {
                member = connect.getElementsByTagName("member")[0].firstChild.nodeValue;
            }

            var disconnect = query.getElementsByTagName("disconnect")[0];
            if (disconnect) {
                member = disconnect.getElementsByTagName("member")[0].firstChild.nodeValue;
                console.log("停止获取其他客户端视频。");
                return;
                //估计要把UserChannel对象用数组什么的保存起来，此时要销毁UserChannel对象
            }
            var cfg = {};
            cfg.mmid = member;
            cfg.selfmmid = srcmmid;
            cfg.confjid = ROOM_JID;

            //var channelVideo = new UserChannel(cfg); 
            var channelVideo = UserChannel.createNew(cfg);
            adapter.getVideoChannelMap[member] = channelVideo;

            if(document.getElementById(member)===null){
                var canvasshowdiv=document.createElement("div");
                canvasshowdiv.setAttribute("class",member);

                var showbitratesdiv=document.createElement("div");
                showbitratesdiv.setAttribute("class","bitratediv");
                showbitratesdiv.setAttribute("id",member+"_speed");

                var canvasToShowVideo = document.createElement("canvas");
                canvasToShowVideo.setAttribute("id",member);
                canvasshowdiv.appendChild(showbitratesdiv);
                canvasshowdiv.appendChild(canvasToShowVideo);
                $("#membercamera_container").append(canvasshowdiv);
                if(isshowstyle===false)
                {
                    $("#membercamera_container div").css({"width":"96%","height":"165px"});
                }
                else{
                    if( $("#membercamera_container").children('div').length>5)
                        $(canvasshowdiv).hide();
                    $("#membercamera_container div").css({"width":"49%","height":"49%"});
                }
                $(canvasshowdiv).mouseover(function(){
                    $("#"+$(this).attr("class")+"_speed").css("display","block");

                });
                $(canvasshowdiv).mouseout(function(){
                    $("#"+$(this).attr("class")+"_speed").css("display","none");

                });
            }
            adapter.getVideoChannelMap[member].setCanvasdst(member);
            adapter.getVideoChannelMap[member].connectVideo(videoUrl);
            adapter.getVideoChannelMap[member].setSocketEvent(getVideoEvent);
            return true;
        }
        if(xmlnsVal==="cellcom:voice:accept")
        {
            var idElement=query.getElementsByTagName("id")[0];
            var mmidElement=query.getElementsByTagName("mmid")[0];
            var mmidList=query.getElementsByTagName("mmidList")[0];
            var mmid=mmidElement.firstChild.nodeValue;
            var idvalue=idElement.firstChild.nodeValue;
            var tmpname=idvalue.slice(idvalue.indexOf("/")+1);
            var tmpid;
            for(var k=0;k<adapter.userrefArr.length;k++)
            {
                if(adapter.userrefArr[k].name===tmpname)
                {
                    tmpid=adapter.userrefArr[k].id;
                    $("#"+tmpid+"_spkimg").css("background-image","url('./images/Mic_u860_normal.png')");
                    $("#"+tmpid+"_spkimg").attr('isSaying',true);
                    break;
                }
            }
            if(mmid===this.userDesMMID)
            {
                $(".imgapplyspeaking").css("background-image","url('./images/u790_normal.png')");
                $("#applyspeaking").text("正在发言");
                $(".speakmodule").css("backgroundColor","#FFCC00");
                adapter.isSpeaking=true;
                adapter.channelEnterRoom.setAPublishStatus(true);
                // this.SendOKAsk();
                // this.EnableSpeaking();
            }
            else{/*
             var userJid=idElement.firstChild.nodeValue;
             var pos=-1;
             var temPos=0;
             for(var i=0;i<this.confUsers.length;i++)
             {
             var oneUserInfo=this.confUsers[i];
             if(oneUserInfo.jid===userJid)
             {
             var isFindMMID=false;
             for(var j=0;j<oneUserInfo.mmidListTraverse.length;j++)
             {
             if(oneUserInfo.mmidListTraverse[j]===null)
             continue;
             if(oneUserInfo.mmidListTraverse[j]===mmid)
             isFindMMID=true;

             }
             if(!isFindMMID)
             {
             if(mmid!=0)
             oneUserInfo.mmidListTraverse.unshift(mmid);
             }
             if(mmidList)
             {
             var userDes=mmidList.getElementsByTagName("userDes");
             for(var i=0;i<userDes.length;i++)
             {
             var mmidEx=userDes[i].getAttribute("mmid");
             var isFindMMIDEx=false;
             for(var j=0;j<oneUserInfo.mmidListTraverse.length;j++)
             {
             if(oneUserInfo.mmidListTraverse[j]===null)
             continue;
             if(oneUserInfo.mmidListTraverse[j]===parseInt(mmidEx))//mmidEx转成long
             isFindMMIDEx=true;
             }
             if(!isFindMMIDEx)
             oneUserInfo.mmidListTraverse.unshift(parseInt(mmidEx));////mmidEx转成long

             }


             }
             pos=temPos;
             break;
             }
             temPos++;
             }
             if(pos==-1)
             {
             var oneUserInfo=Object.create(ConfUser);;
             oneUserInfo.jid=userJid;
             var isFindMMID=false;
             for(var i=0;i<oneUserInfo.mmidListTraverse.length;i++)
             {
             if(oneUserInfo.mmidListTraverse[i]===null)
             continue;
             if(oneUserInfo.mmidListTraverse[i]===mmid)
             isFindMMID=true;
             }
             if(!isFindMMID){
             if(mmid!=0)
             oneUserInfo.mmidListTraverse.unshift(mmid);
             }
             if(mmidList){
             var userDes=mmidList.getElementsByTagName("userDes");
             for(var i=0;i<userDes.length;i++)
             {
             var mmidEx=userDes[i].getAttribute("mmid");
             var isFindMMIDEx=false;
             for(var j=0;j<oneUserInfo.mmidListTraverse.length;j++)
             {
             if(oneUserInfo.mmidListTraverse[j]===null)
             continue;
             if(oneUserInfo.mmidListTraverse[j]===parseInt(mmidEx))//mmidEx转成long
             isFindMMIDEx=true;
             }
             if(!isFindMMIDEx)
             oneUserInfo.mmidListTraverse.unshift(parseInt(mmidEx));////mmidEx转成long

             }
             }
             this.confUsers.unshift(oneUserInfo);
             }
             // clientSession->addTalker(mmid);*/
            }
            return true;
        }
        if(xmlnsVal==="cellcom:voice:mute")
        {
            var idElement=query.getElementsByTagName("id")[0];
            var mmidElement=query.getElementsByTagName("mmid")[0];
            var mmid=mmidElement.firstChild.nodeValue;
            var idvalue=idElement.firstChild.nodeValue;
            var tmpname=idvalue.slice(idvalue.indexOf("/")+1);
            var tmpid;
            for(var k=0;k<adapter.userrefArr.length;k++)
            {
                if(adapter.userrefArr[k].name===tmpname)
                {
                    tmpid=adapter.userrefArr[k].id;
                    $("#"+tmpid+"_spkimg").css("background-image","url('./images/clear.png')");
                    $("#"+tmpid+"_spkimg").attr('isSaying',false);
                    break;
                }
            }
            if(mmid===adapter.userDesMMID){
                adapter.channelEnterRoom.setAPublishStatus(false);
                adapter.isSpeaking=false;
                $(".imgapplyspeaking").css("background-image","url('./images/u810_normal.png')");
                $("#applyspeaking").text("申请发言");
                $(".speakmodule").css("backgroundColor","");
            }
            else{
                adapter.channelEnterRoom.delSpeaker(mmid);
                /*var userJid=idElement.firstChild.nodeValue;
                 var pos=-1;
                 var temPos=0;
                 for(var i=0;i<this.confUsers.length;i++)
                 {
                 var oneUserInfo=this.confUsers[i];
                 if(oneUserInfo.jid===userJid)
                 {
                 this.confUsers.splice(i,1);
                 pos=temPos;
                 break;
                 }
                 temPos++;
                 }*/
                /* if(clientSession){
                 clientSession->deleteTalker(mmid);
                 } */

            }

            return true;

        }
        if(xmlnsVal==="cellcom:conf:visitor")
            return true;

        if(xmlnsVal==="cellcom:wb:create")
        {
            var wb=query.getElementsByTagName("wb")[0];
            if(wb){
                var id=wb.getAttribute("id");
                this.room_data=id;
                adapter.connection.send(sendQuerywbmsgxml());
            }
            return true;
        }
        if(xmlnsVal==="cellcom:conf:limit")
            return true;

        if(xmlnsVal==="cellcom:mm:user")
        {
            var userDes=query.getElementsByTagName("userDes")[0];
            var mmid=userDes.getAttribute("mmid");
            var deletemmid=parseInt(mmid);
            this.DeleteListMMID(deletemmid);
            //clientSession->deleteClientEndPoint(deletemmid);
            return true;
        }

        if(xmlnsVal==="cellcom:ds:begin")
        {

            var hostIP=query.getElementsByTagName("ip")[0].firstChild.nodeValue;
            var viewerPort=query.getElementsByTagName("viewerport")[0].firstChild.nodeValue;
            var passWord=query.getElementsByTagName("password")[0].firstChild.nodeValue;
            this.hostip=serverIp;//hostIP;
            if(window.location.protocol!=='http:')
            this.hostport="6080";//viewerPort;
            else
                this.hostport="5526";
            this.dskpass=passWord;
            UI.connect();
            $("li[tar='desktopsharect']").click();
            adapter.isdsktopsharing = true;
            $("#noVNC_container").css("background","#A0A0A0");

            return true;
        }
        if(xmlnsVal==="cellcom:ds:end")
        {
            // UI.rfb.disconnect();
            adapter.isdsktopsharing=false;
            $("#noVNC_container").css("background","#FFFFFF");
            return true;
        }
        if(xmlnsVal==="cellcom:conf:streamPublish")
        {
            var xmlURL=query.getElementsByTagName("url")[0];
            var xmlPublishName=query.getElementsByTagName("publishName")[0];
            var xmlPlayName=query.getElementsByTagName("playName")[0];
            var xmlStatusPublish=query.getElementsByTagName("statusPublish")[0];
            var xmlDuration=query.getElementsByTagName("duration")[0];
            var xmlTimePoint=query.getElementsByTagName("timePoint")[0];
            var xmlFileName=query.getElementsByTagName("filename")[0];
            var url="";
            var publishName="";
            var playName="";
            var statusPublish="";
            var duration="";
            var timePoint="";
            var filename="";
            if(xmlURL)
                url=xmlURL.firstChild.nodeValue;
            if(xmlPublishName&&xmlPublishName.firstChild)
                publishName=xmlPublishName.firstChild.nodeValue;
            if(xmlPlayName)
                playName=xmlPlayName.firstChild.nodeValue;
            if(xmlDuration)
                duration=xmlDuration.firstChild.nodeValue;
            if(xmlStatusPublish)
                statusPublish=xmlStatusPublish.firstChild.nodeValue;
            if(xmlTimePoint)
                timePoint=xmlTimePoint.firstChild.nodeValue;
            if(xmlFileName)
                filename=xmlFileName.firstChild.nodeValue;
            //  this.OnMediaPlayerStreamPublish(url, statusPublish, duration, timePoint, filename, playName);
            url=url+"/"+ROOM_JID.slice(0,ROOM_JID.indexOf('@'));
            adapter.timepoint=timePoint;
            adapter.allduration=duration;
            adapter.vmediaurl=url;
            loadvideo(url);
            if(pgrogressinterval !== null)
                clearInterval(pgrogressinterval);
            initprogress();
            pausetag=false;
            $("#playpausebtn").attr('src', './images/start.jpg');
            return true;
        }

        if(xmlnsVal==="cellcom:conf:streamPlay")
        {
            var xmlURL=query.getElementsByTagName("url")[0];
            var xmlPublishName=query.getElementsByTagName("publishName")[0];
            var xmlPlayName=query.getElementsByTagName("playName")[0];
            var xmlStatusPublish=query.getElementsByTagName("statusPublish")[0];
            var xmlDuration=query.getElementsByTagName("duration")[0];
            var xmlTimePoint=query.getElementsByTagName("timePoint")[0];
            var xmlFileName=query.getElementsByTagName("filename")[0];
            var url="";
            var publishName="";
            var playName="";
            var statusPublish="";
            var duration="";
            var timePoint="";
            var filename="";
            if(xmlURL)
                url=xmlURL.firstChild.nodeValue;
            if(xmlPublishName&&xmlPublishName.firstChild)
                publishName=xmlPublishName.firstChild.nodeValue;
            if(xmlPlayName)
                playName=xmlPlayName.firstChild.nodeValue;
            if(xmlDuration)
                duration=xmlDuration.firstChild.nodeValue;
            if(xmlStatusPublish)
                statusPublish=xmlStatusPublish.firstChild.nodeValue;
            if(xmlTimePoint)
                timePoint=xmlTimePoint.firstChild.nodeValue;
            if(xmlFileName)
                filename=xmlFileName.firstChild.nodeValue;
            url=url+"/"+ROOM_JID.slice(0,ROOM_JID.indexOf('@'));
            adapter.vmediaurl=url;
            adapter.timepoint=timePoint;
            adapter.allduration=duration;
            if(!$f(0)){
                loadvideo(url);
                if(pgrogressinterval !== null)
                    clearInterval(pgrogressinterval);
                initprogress();
                pausetag=false;
                $("#playpausebtn").attr('src', './images/start.jpg');
            }
            return true;
            // this.OnMediaPlayerStreamPlay(url, statusPublish, duration, timePoint, filename, playName);
        }
        if(xmlnsVal==="cellcom:conf:streamPause")
        {
            var xmlURL=query.getElementsByTagName("url")[0];
            var xmlPublishName=query.getElementsByTagName("publishName")[0];
            var xmlPlayName=query.getElementsByTagName("playName")[0];
            var xmlStatusPublish=query.getElementsByTagName("statusPublish")[0];
            var xmlDuration=query.getElementsByTagName("duration")[0];
            var xmlTimePoint=query.getElementsByTagName("timePoint")[0];
            var url="";
            var publishName="";
            var playName="";
            var statusPublish="";
            var duration="";
            var timePoint="";

            if(xmlURL)
                url=xmlURL.firstChild.nodeValue;
            if(xmlPublishName&&xmlPublishName.firstChild)
                publishName=xmlPublishName.firstChild.nodeValue;
            if(xmlPlayName)
                playName=xmlPlayName.firstChild.nodeValue;
            if(xmlDuration)
                duration=xmlDuration.firstChild.nodeValue;
            if(xmlStatusPublish)
                statusPublish=xmlStatusPublish.firstChild.nodeValue;
            if(xmlTimePoint)
                timePoint=xmlTimePoint.firstChild.nodeValue;
            url=url+"/"+ROOM_JID.slice(0,ROOM_JID.indexOf('@'));
            adapter.vmediaurl=url;
            adapter.timepoint=timePoint;
            adapter.allduration=duration;
            if(statusPublish==='Start') {
                if($f(0))
                    $f(0).pause();
                pausetag=true;
                $("#playpausebtn").attr('src', './images/stop.jpg');
            }
            if(statusPublish==='Stop') {

                loadvideo(url);
                if(pgrogressinterval !== null)
                    clearInterval(pgrogressinterval);
                initprogress();
                pausetag=false;
                $("#playpausebtn").attr('src', './images/start.jpg');
            }
            return true;

            //this.OnMediaPlayerStreamPause(url, statusPublish, duration, timePoint, playName);
        }
        if(xmlnsVal==="cellcom:conf:streamStop")
        {
            var xmlURL=query.getElementsByTagName("url")[0];
            var xmlPublishName=query.getElementsByTagName("publishName")[0];
            var xmlPlayName=query.getElementsByTagName("playName")[0];
            var xmlStatusPublish=query.getElementsByTagName("statusPublish")[0];
            var xmlDuration=query.getElementsByTagName("duration")[0];
            var xmlTimePoint=query.getElementsByTagName("timePoint")[0];
            var url="";
            var publishName="";
            var playName="";
            var statusPublish="";
            var duration="";
            var timePoint="";

            if(xmlURL)
                url=xmlURL.firstChild.nodeValue;
            if(xmlPublishName&&xmlPublishName.firstChild)
                publishName=xmlPublishName.firstChild.nodeValue;
            if(xmlPlayName)
                playName=xmlPlayName.firstChild.nodeValue;
            if(xmlDuration)
                duration=xmlDuration.firstChild.nodeValue;
            if(xmlStatusPublish)
                statusPublish=xmlStatusPublish.firstChild.nodeValue;
            if(xmlTimePoint)
                timePoint=xmlTimePoint.firstChild.nodeValue;
            url=url+"/"+ROOM_JID.slice(0,ROOM_JID.indexOf('@'));
            adapter.vmediaurl=url;
            adapter.timepoint=timePoint;
            adapter.allduration=duration;
            if($f(0)) {
                $f(0).stop();
                $("#player").hide();
                $("#nowdurpgs").css('width', 0 + 'px');
                $("#pgsbtn").css('left', 0);
                $("#timetd>div>p>span").eq(0).text(initTimeLength(0));
                $("#timetd>div>p>span").eq(1).text(initTimeLength(0));
                pausetag = true;
                $("#playpausebtn").attr('src', './images/stop.jpg');
            }
            return true;
            //this.OnMediaPlayerStreamStop(url, statusPublish, duration, timePoint, playName);
        }
        if(xmlnsVal==="cellcom:file:transmit")
        {
            var fileObj = UploadPar.fileObj; // js 获取文件对象
            var FileController=query.getElementsByTagName("uploadurl")[0].firstChild.nodeValue;
            if(window.location.protocol!=='http:') {
                var repstr = FileController.slice(0, FileController.indexOf('/goform'));
                FileController = FileController.replace(repstr, 'https://' + serverIp + ':6084');
            }
            // var FileController = 'https://www.vccellcom.com:6084/goform/HTTPUpload/';//query.getElementsByTagName("uploadurl")[0].firstChild.nodeValue;         // 接收上传文件的后台地址
            var clientJid=adapter.room_data;
            var filejid=query.getElementsByTagName("jid")[0].firstChild.nodeValue;
            UploadPar.filejid=filejid;
            var filesize=query.getElementsByTagName("size")[0].firstChild.nodeValue;
            var filename=query.getElementsByTagName("file")[0].firstChild.nodeValue;
            // FormData 对象

            var form = new FormData();


            form.append("ClientJID", clientJid);                        // 可以增加表单数据
            form.append("FileJID", filejid);
            form.append("file", fileObj);                           // 文件对象
            form.append("EndProtect", "whoknows");

            $.ajax({
                url: FileController ,
                type: 'post',
                data: form,
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                success:  function(data, textStatus) {
                    addfiletras("up",tmpfileuploadArr,UploadPar.fileObj.name,UploadPar.fileObj.size,"上传文件");
                    UploadPar.ClearAll();
                    if(tmpfileuploadArr.length===$("#upload_usrlist_ul").children("li").length)
                        adapter.connection.send(senduploadcplmsg(ROOM_JID,"groupchat",filename,filesize,filejid));
                    else
                    {
                        for(var i=0;i<tmpfileuploadArr.length;i++)
                        {
                            adapter.connection.send(senduploadcplmsg(ROOM_JID+"/"+tmpfileuploadArr[i],"chat",filename,filesize,filejid));
                        }
                    }

                    //完成后调用回复xml的函数
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    console.log("upload failed:"+errorThrown);
                }

            });

        }

        if(xmlnsVal==="cellcom:conf:kick"){
            var jid=query.getElementsByTagName("user")[0].getAttribute("jid");
            var username=jid.slice(jid.indexOf("/")+1);
            if(username===selftruename) {
                alert("您被请出会议!!");
                $("#main_container").css("display", "none");
                $("#logindlg").css("display","block");

            }
            return true;

        }
    }catch(e)
    {
        alert(e.message);
        return false;
    }
}

//重写父类DealAgentInfo function
adapter.DealAgentInfo=function(queryEle)
{
    var agents=queryEle.getElementsByTagName("agent");

    for(var i=0;i<agents.length;i++)
    {
        if(agents[i]===null)continue;
        var agent=agents[i];
        var nameEle=agent.getElementsByTagName("name")[0];
        if(!nameEle)
            continue;
        var name=nameEle.firstChild.nodeValue;
        if(!name)
            continue;
        if(name==="File Share")
        {
            var jidEle=agent.getAttribute("jid");
            //fileShareSession->SetFileServer(jidEle);
        }
    }

}

//重写父类SendPriorityPresence function
adapter.SendPriorityPresence=function(){
    var doc=createXMLDoc();
    var presence=doc.createElement("presence");
    doc.appendChild(presence);
    var show0=doc.createElement("show");
    show0.appendChild(doc.createTextNode("inconf"));
    var priority0=doc.createElement("priority");
    priority0.appendChild(doc.createTextNode("1"));

    var show1=doc.createElement("show");
    show1.appendChild(doc.createTextNode("inconf"));
    var priority1=doc.createElement("priority");
    priority1.appendChild(doc.createTextNode("1"));
    presence.appendChild(show0);
    presence.appendChild(priority0);
    presence.appendChild(show1);
    presence.appendChild(priority1);
    //*****
    var ret=this.connection.send(presence);
    if(!ret){
        var errorIf= Object.create(ErrorInfo);;
        errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_SEND_XMPP_FAIL;
        errorIf.errorDescription="";
        //注册回调；

    }
    return ret;

}

adapter.GetTransferInfo=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("type","get");
    var tmpjcluuid="jcl_"+this.uuid;
    iq.setAttribute("id",tmpjcluuid);
    iq.setAttribute("to",this.confRoomJID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:wannaTransportMM");
    var protDes=doc.createElement("protDes");
    var UDP=doc.createElement("UDP");
    var HTTP=doc.createElement("HTTP");
    protDes.appendChild(UDP);
    protDes.appendChild(HTTP);
    query.appendChild(protDes);
    iq.appendChild(query);
    var ret=this.connection.send(iq);
    if(!ret){
        var errorIf= Object.create(ErrorInfo);;
        errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_SEND_XMPP_FAIL;
        errorIf.errorDescription="";
        //注册回调；

    }

}

//重写StartTransferTest
/*adapter.StartTransferTest=function(iqStr){    //  clientSession->pTestInitInfo.m_testProt = UDPANDHTTP;0x03

 var query=iqStr.getElementsByTagName("query")[0];
 var protDes=query.getElementsByTagName("protDes")[0];
 var mmid=protDes.getAttribute("mmid");
 this.conferenceMMID=parseInt(mmid);
 if(this.isFirtMMID){
 this.MMIDDefault=parseInt(mmid);
 this.isFirtMMID=false;
 }
 var isHave=false;
 for(var k=0;k<this.mmidListSelf.length;k++)
 {
 var mmidSelfInfo=this.mmidListSelf[k];
 if(mmidSelfInfo===this.conferenceMMID){
 isHave=true;
 }
 }
 if(!isHave){
 this.mmidListSelf.push(this.conferenceMMID);
 }
 var UDP=protDes.getElementsByTagName("UDP")[0];
 var HTTP=protDes.getElementsByTagName("HTTP")[0];
 var UDP_Add=UDP.getElementsByTagName("addr")[0];
 var HTTP_Add=HTTP.getElementsByTagName("addr")[0];
 var UDP_ip=UDP_Add.getElementsByTagName("ip")[0].firstChild.nodeValue;
 var HTTP_ip=HTTP_Add.getElementsByTagName("ip")[0].firstChild.nodeValue;
 var UDP_audioPort=UDP_Add.getElementsByTagName("audioPort")[0].firstChild.nodeValue;
 var HTTP_audioPort=HTTP_Add.getElementsByTagName("audioPort")[0].firstChild.nodeValue;
 var UDP_videoPort=UDP_Add.getElementsByTagName("videoPort")[0].firstChild.nodeValue;
 var HTTP_videoPort=HTTP_Add.getElementsByTagName("videoPort")[0].firstChild.nodeValue;
 /* clientSession->pTestInitInfo.m_mmID = (long)conferenceMMID;
 clientSession->pTestInitInfo.m_tiOfUDP.desOfRemote.transType = UDPTRNS;
 clientSession->pTestInitInfo.m_tiOfUDP.desOfRemote.audioPort = atoi(UDP_audioPort);
 clientSession->pTestInitInfo.m_tiOfUDP.desOfRemote.videoPort = atoi(UDP_videoPort);

 //const char *ipaddr = [UDP_ip UTF8String];
 strcpy(clientSession->pTestInitInfo.m_tiOfUDP.desOfRemote.pIpAddr, UDP_ip);

 clientSession->pTestInitInfo.m_tiOfHTTP.desOfRemote.transType = HTTPTRNS;
 clientSession->pTestInitInfo.m_tiOfHTTP.desOfRemote.audioPort = atoi(HTTP_audioPort);
 clientSession->pTestInitInfo.m_tiOfHTTP.desOfRemote.videoPort = atoi(HTTP_videoPort);
 strcpy(clientSession->pTestInitInfo.m_tiOfHTTP.desOfRemote.pIpAddr, HTTP_ip);

 if (isFirstDesOfRemote) {
 clientSession->pDesOfRemoteDefault = clientSession->pTestInitInfo.m_tiOfHTTP.desOfRemote;
 isFirstDesOfRemote = false;
 }

 m_pAsyncThread->RegisterCallBack(this, (CallBackFuncType)(&ConfAdapter::OnTransferTestStart), NULL);
 clientSession->TestBegin();

 return true;
 }*/

//重写DealTransferOK
adapter.DealTransferOK=function(iqStr){
    for(var i=0;i<this.confUsers.length;i++)
    {

        var oneUserInfo=this.confUsers[i];
        if(oneUserInfo.voice==="speaking")
            var userMmid=oneUserInfo.mmidListTraverse[oneUserInfo.mmidListTraverse.length-1];
        //  clientSession->addTalker(userMmid);
    }
    //if (!clientSession->BuildEndPoint(conferenceMMID)) {
    var errorIf= Object.create(ErrorInfo);;
    errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_CONNECT_FAIL;
    errorIf.errorDescription="";
    //m_pAsyncThread->RegisterCallBack(this, (CallBackFuncType)(&ConfAdapter::TransferTestFail), errorInfo);
    if(!this.SendAbility(this.conferenceMMID))
        return true;

    iqStr.removeAttribute("xmlns");
    iqStr.setAttribute("to",this.selfRoomID);

    var ret=this.connection.send(iqStr);
    if(!ret){
        var errorIf= Object.create(ErrorInfo);;
        errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_SEND_XMPP_FAIL;
        errorIf.errorDescription="";
        //注册回调；TransferTestFail

    }
    this.SendOKAsk();
    //注册回调 TransferTestFinish
    return true;

}
//重写SendOKAsk
adapter.SendOKAsk=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("type","set");
    iq.setAttribute("to",this.confRoomJID);

    var ret=this.connection.send(iq);
    if(!ret){
        var errorIf= Object.create(ErrorInfo);;
        errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_SEND_XMPP_FAIL;
        errorIf.errorDescription="";
        //注册回调；TransferTestFail
    }
    return ret;

}

//重写StartTransferTest
adapter.SendAbility=function(iqStr){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("type","set");
    var tmpjcluuid="jcl_"+this.uuid;
    iq.setAttribute("id",tmpjcluuid);
    iq.setAttribute("to",this.confRoomJID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:capability");
    var user=doc.createElement("user");
    user.setAttribute("jid",this.selfRoomId);

    user.setAttribute("mmid",this.mmid);
    var vSend=doc.createElement("vSend");
    vSend.appendChild(doc.createTextNode("enable"));
    var aSend=doc.createElement("aSend");
    aSend.appendChild(doc.createTextNode("enable"));
    var vRecv=doc.createElement("vRecv");
    vRecv.appendChild(doc.createTextNode("enable"));
    var aRecv=doc.createElement("aRecv");
    aRecv.appendChild(doc.createTextNode("enable"));
    var camctrl=doc.createElement("camctrl");
    camctrl.appendChild(doc.createTextNode("disable"));

    query.appendChild(vSend);
    query.appendChild(aSend);
    query.appendChild(vRecv);
    query.appendChild(aRecv);
    query.appendChild(camctrl);
    query.appendChild(user);
    iq.appendChild(query);
    var ret =this.connection.send(iq);
    if(!ret){
        var errorIf= Object.create(ErrorInfo);;
        errorIf.errorNo=ADAPTER_ERROR_TYPE.ADAPTER_ERROR_SEND_XMPP_FAIL;
        errorIf.errorDescription="";
        //注册回调；TransferTestFail
    }
    return ret;
}
//EnableSpeaking
adapter.EnableSpeaking=function(){
    //clientSession->startTalk();
}


function parseWBXML(strxml)
{
    var xmlStrDoc=null;
    xmlStrDoc=createXMLstrDoc(strxml);
    var iqnode=null;
    if(xmlStrDoc.documentElement.nodeName==="iq")
        iqnode=xmlStrDoc.documentElement;
    else
        return;
    iqArrary.push(iqnode);
    adapter.ParserXMPPString(iqnode);
    var iqnodeid=iqnode.getAttribute("id");
    if(iqnodeid===null||iqnodeid===""||iqnodeid.indexOf(selftruename+"jcl_")===-1)
        parseIQnode(iqnode,iqArrary.length-1,false);



}


function removemem(pagei){

    var len=1;
    var lilength=document.getElementById("wbtab_ul").children.length;

    $("#"+pagei).remove();
    while(len<lilength)
    {
        if(	document.getElementById("wbtab_ul").children[len].attributes["tar"].value===pagei)
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
 *切换页面
 */


function showPage(){

    var len=0;
    var lilength=document.getElementById("wbtab_ul").children.length;

    while(len<lilength)
    {
        if(	document.getElementById("wbtab_ul").children[len].attributes["tar"].value===selectpageNo)
            document.getElementById("wbtab_ul").children[len].click();
        len++;
    }

}

var wbimgw=800,wbimgh=600,  wbloadwburl;
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

            }else{
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
        $("li[tar='wbct']").click();
        if(document.getElementById(jidpage)!==null)
            showPage();
        var tmppageid=jidpage;
        console.log($("#"+jidpage).attr("singlepg"));
        console.log($("#"+jidpage).attr("isdownloadok"));
        if($("#"+jidpage).attr("singlepg")&&$("#"+jidpage).attr("isdownloadok")==='true') {
            tmppageid=jidpage+"_"+pageno;
            if(document.getElementById(tmppageid)===null)
                addwbpagecld(jidpage, adapter.pagejid, 826,1169, pagenum, pageno,$("#"+jidpage).attr("docval"));
            $("#" + jidpage).find("li:not(#" + tmppageid + ")").css("display", "none");
            adapter.ctx = document.getElementById(tmppageid).children[1].getContext("2d");
            adapter.ctxeffect = document.getElementById(tmppageid).children[2].getContext("2d");
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
        if(infotype==="doc"){
            var removelen=0;
            var removetag=0;
            if(document.getElementById(jidpage)===null)
            {
                console.log("whiteboard page is null");

            }

            if($("#"+jidpage).attr("singlepg")==="false") {
                tmppageid=jidpage + "_" + objpageno;
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

/****
 *加载背景图
 **/
function downloadImg(url,ctxbg,jidp,w,h,pgno){


    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    xhr.onload = function() {
        var bytes = new Uint8Array(xhr.response);
        var tmpstr = bzip2.simple(bzip2.array(bytes));
        var b64 = window.btoa(tmpstr)
        var imgurl = 'data:image/png;base64,' + b64;

        drawImages(ctxbg,imgurl,w,h,pgno,jidp);


    }

}
/**
 *
 */
function changeRedraw(){
    /* var lilength=document.getElementById("wbtab_ul").children.length;
     for(var len=1;len<lilength;len++)
     {
     var pagejid=document.getElementById("wbtab_ul").children[len].attributes["tar"].value; */

    document.getElementById(selectpageNo).childNodes[0].width=$("#wbpage").width();
    document.getElementById(selectpageNo).childNodes[0].height=$("#wbpage").height();
    document.getElementById(selectpageNo).childNodes[1].width=$("#wbpage").width();
    document.getElementById(selectpageNo).childNodes[1].height=$("#wbpage").height();
    reDrawOnResize(selectpageNo);

// }
}

/**
 *窗口变化大小cavas重绘
 */
function reDrawOnResize(pageid)
{
    for(var i=0;i<iqArrary.length;i++)
    {
        if(iqArrary[i])
        {

            if(iqArrary[i].getElementsByTagName("jid")[0])
            {
                var tmpjid=iqArrary[i].getElementsByTagName("jid")[0].firstChild.nodeValue;
                tmpjid=tmpjid.slice(tmpjid.indexOf("/")+1);
                if(pageid===tmpjid)
                {
                    parseIQnode(iqArrary[i],i,false)
                }
            }

        }
    }
}


/**
 *清空当前页面
 */
function  clearDelpage(pgno){
////alert("clear"+pgno);
    var ctxx=document.getElementById(pgno).childNodes[1].getContext("2d");
    ctxx.clearRect(0,0,2000,2000);
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
//alert("写字");
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
 *addpage
 */

var addwbpage=function(tit,pgjid,width,height,pagenum,pageno,headtit){

    var AllImgExt=".jpg|.jpeg|.gif|.bmp|.png|";
    var AllPptExt=".ppt|.pptx";
    var filetype=headtit.slice(headtit.lastIndexOf('.')).toLowerCase();
    if(headtit==='wbSharing'||AllImgExt.indexOf(filetype)!==-1)
    {
        height=600;
        width=800;
    }else if(AllPptExt.indexOf(filetype)!==-1){
        width=1169;
        height=826;
    }else{
        height=1169;
        width=826;
    }
    if(adapter.isaddpictowb){
        width=adapter.orimageW;
        height=adapter.orimageH;
    }
    if(document.getElementById(tit)===null){

        var wbpageulwidth=$("#wbpage").children("ul").width();
        var wbpageulheight=$("#wbpage").children("ul").height();
        var canvasmarginleft=0,canvasmargintop=0;
        if(wbpageulwidth>width)
            canvasmarginleft=(wbpageulwidth-width)/2;
        if(wbpageulheight>height)
            canvasmargintop=(wbpageulheight-height)/2;

        if(headtit==="wbSharing"||!headtit) {
            wbpagei++;
            $('#wbtab_ul').append("<li  tar='" + tit + "'>电子白板" + wbpagei + "<img src='images/u650_normal.png'/></li>");
        }
        else
            $('#wbtab_ul').append("<li  tar='"+tit+"'>"+headtit+"<img src='images/u650_normal.png'/></li>");

        $(".canvasmargin").css({"margin-left":canvasmarginleft,"margin-top":canvasmargintop});
        $("#wbtab_ul").children().last().children().last().attr("deltar",tit);
        $("#wbtab_ul").children().last().children().last().on("click",function(){
            removemem($(this).attr("deltar"));
            adapter.connection.send(sendendwbxml(pgjid,$(this).attr("deltar")));
        });

        //
        var li=document.createElement("li");
        $(li).attr({"id":tit,"class":"canvasmargin","title":tit,'orgW':width,'orgH':height,"scaletag":'1','isdownloadok':'false'});
        $(li).css({"display":"none","background":"#FFFFFF","clear":"both"});
        $(li).width(width);
        $(li).height(height);
        $("#wbpage").children("ul").append(li);
        var canvas0=document.createElement("canvas");
        $(canvas0).css({"position":"absolute","border":"solid 1px #000000"});
        canvas0.width=width;
        canvas0.height=height;
        var canvas1=document.createElement("canvas");
        $(canvas1).css({"position":"absolute","border":"solid 1px #000000"});
        canvas1.width=width;
        canvas1.height=height;
        var canvas2=document.createElement("canvas");
        $(canvas2).css({"position":"absolute","border":"solid 1px #000000","display":"none"});
        canvas2.width=width;
        canvas2.height=height;
        if(AllImgExt.indexOf(filetype)===-1&&headtit!=='wbSharing'){
            var ul=document.createElement("ul");
            $(ul).css({"width":"100%","height":"100%","margin":"0px","padding":"0px"});
         /*   var cldli=document.createElement("li");
            $(cldli).attr("id",tit+"_"+pageno);
            $(cldli).css({"width":width,"height":height,"margin":"0px","padding":"0px","position":"absolute"});
            $(cldli).append(canvas0,canvas1,canvas2);
            $(ul).append(cldli);*/
            $(li).append(ul);
           // addlistentowbcanvas(tit+"_"+pageno);
            $("#"+tit).attr("singlepg","false");
            $("#"+tit).attr("docval",headtit);
        }else{
            $(li).append(canvas0,canvas1,canvas2);
            $("#"+tit).attr("docval",headtit);
            addlistentowbcanvas(tit);
        }



//

        //   adapter.connection.send(sendQuerywbcldmsgxml(pgjid));
        $("#canvas_tools_tr").css("display","block");
        $("#"+tit).attr("pagenum",pagenum);
        $("#"+tit).attr("pageno",pageno);
        $("#whichpg").val(parseInt(pageno)+1+'/'+pagenum);
        $("#wbtab_ul").children().last().click();
        if(adapter.isaddpictowb){
            var bgimgctx=document.getElementById($("#selectwb").attr("tar")).children[0].getContext("2d");
            adapter.isaddpictowb=false;
            drawImages(bgimgctx,adapter.dlgimgurl,adapter.orimageW,adapter.orimageH);

        }
//canvas绑定mousedown


    }
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

    var AllPptExt=".ppt|.pptx";
    var filetype=docval.slice(docval.lastIndexOf('.')).toLowerCase();
    if(AllPptExt.indexOf(filetype)!==-1)
    {

        width=1169;
        height=862;
    }
    var pgid=titid+"_"+pageno;
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
/**
 *
 * @param x
 * @param y
 * @param dtx
 * @param dty
 */
var ctldrawline=function(x,y,dtx,dty){
    adapter.ctxeffect.clearRect(0,0,2000,2000);
    adapter.ctx.beginPath();

    if(adapter.ctx.lineWidth>1)
    {
        adapter.ctx.moveTo(x,y);
        adapter.ctx.lineTo(dtx,dty);
    }
    else{
        adapter.ctx.moveTo(x-0.5,y-0.5);
        adapter.ctx.lineTo(dtx-0.5,dty-0.5);
    }
    adapter.ctx.stroke();
    adapter.ctx.closePath();

}
/**
 *ctldrawlineEffect
 */
var ctldrawlineEffect=function(x,y,dtx,dty,flag)
{
    if(flag){
        adapter.ctxeffect.clearRect(0,0,2000,2000);

        adapter.ctxeffect.beginPath();

        if(adapter.ctxeffect.lineWidth>1)
        {
            adapter.ctxeffect.moveTo(x,y);
            adapter.ctxeffect.lineTo(dtx,dty);
        }
        else{
            adapter.ctxeffect.moveTo(x-0.5,y-0.5);
            adapter.ctxeffect.lineTo(dtx-0.5,dty-0.5);
        }
        adapter.ctxeffect.stroke();
        adapter.ctxeffect.closePath();
    }
}
/**
 *ctldrawRect
 */
var ctldrawRect=function(x,y,dtx,dty)
{
    adapter.ctxeffect.clearRect(0,0,2000,2000);
    var w=Math.abs(dtx-x);
    var h=Math.abs(dty-y);
    if(parseInt(x)>parseInt(dtx)) x=dtx;
    if(parseInt(y)>parseInt(dty)) y=dty;
    adapter.ctx.beginPath();


    adapter.ctx.strokeRect(x-0.5,y-0.5,w,h);
    adapter.ctx.closePath();


}
/**
 *ctldrawRectEffect
 */
var ctldrawRectEffect=function(x,y,dtx,dty,flag)
{
    if(flag){
        adapter.ctxeffect.clearRect(0,0,2000,2000);
        var w=Math.abs(dtx-x);
        var h=Math.abs(dty-y);
        if(parseInt(x)>parseInt(dtx)) x=dtx;
        if(parseInt(y)>parseInt(dty)) y=dty;
        adapter.ctxeffect.beginPath();

        adapter.ctxeffect.strokeRect(x-0.5,y-0.5,w,h);
        adapter.ctxeffect.closePath();
    }
}
/**
 *ctldrawThinfreeline
 */
var ctldrawThinfreeline=function(x,y,flag)
{

    if(flag){


        if(adapter.ctx.lineWidth>1)
            adapter.ctx.lineTo(x,y);
        else
            adapter.ctx.lineTo(x,y);
        adapter.ctx.stroke();
    }

}
/**
 *drawround
 */
var ctldrawRound=function(x,y,dtx,dty){
    adapter.ctxeffect.clearRect(0,0,2000,2000);
    adapter.ctx.save();
    adapter.ctx.beginPath();
    var x0=(parseInt(dtx)+parseInt(x))/2;
    var y0=(parseInt(dty)+parseInt(y))/2;
    var w=Math.abs(dtx-x)/2;
    var h=Math.abs(dty-y)/2;
    var r = (w > h)? w : h;
    var ratioX = w / r; //横轴缩放比率
    var ratioY = h / r; //纵轴缩放比率
    adapter.ctx.scale(ratioX, ratioY); //进行缩放（均匀压缩）
//从椭圆的左端点开始逆时针绘制
    adapter.ctx.moveTo((x0 + w) / ratioX , y0 / ratioY);
    adapter.ctx.arc(x0 / ratioX, y0 / ratioY, r, 0, 2 * Math.PI);
    adapter.ctx.stroke();
    adapter.ctx.closePath();
    adapter.ctx.restore();

}
/**
 *drawroundEffect
 */
var drawRoundEffect=function(x,y,dtx,dty,flag){

    if(flag)
    {
        adapter.ctxeffect.clearRect(0,0,2000,2000);
        adapter.ctxeffect.beginPath();
        adapter.ctxeffect.save();
        var x0=(parseInt(dtx)+parseInt(x))/2;
        var y0=(parseInt(dty)+parseInt(y))/2;
        var w=Math.abs(dtx-x)/2;
        var h=Math.abs(dty-y)/2;
        var r = (w > h)? w : h;
        var ratioX = w / r; //横轴缩放比率
        var ratioY = h / r; //纵轴缩放比率
        adapter.ctxeffect.scale(ratioX, ratioY); //进行缩放（均匀压缩）
//从椭圆的左端点开始逆时针绘制
        adapter.ctxeffect.moveTo((x0 + w) / ratioX , y0 / ratioY);
        adapter.ctxeffect.arc(x0 / ratioX, y0 / ratioY, r, 0, 2 * Math.PI);
        adapter.ctxeffect.stroke();
        adapter.ctxeffect.restore();
        adapter.ctxeffect.closePath();

    }

}
/**
 *ctldrawdashrectEffect
 */
var ctldrawdashrectEffect=function(x,y,dtx,dty) {
    if(adapter.flag)
    {
        adapter.ctxeffect.strokeStyle="#000000";
        adapter.ctxeffect.clearRect(0,0,2000,2000);
        adapter.ctxeffect.lineWidth=1;
        var w=Math.abs(dtx-x);
        var h=Math.abs(dty-y);
        if(parseInt(x)>parseInt(dtx)) x=dtx;
        if(parseInt(y)>parseInt(dty)) y=dty;
        adapter.ctxeffect.beginPath();
        adapter.ctxeffect.dashedLineTo(x-0.5,y-0.5,x+w-0.5,y-0.5);
        adapter.ctxeffect.dashedLineTo(x+w-0.5,y-0.5,x+w-0.5,y+h-0.5);
        adapter.ctxeffect.dashedLineTo(x+w-0.5,y+h-0.5,x-0.5,y+h-0.5);
        adapter.ctxeffect.dashedLineTo(x-0.5,y+h-0.5,x-0.5,y-0.5);

        adapter.ctxeffect.closePath();

    }

}
/**
 *ctldrawRoundrect
 */
var ctldrawRoundrect=function(x,y,dtx,dty){
    adapter.ctxeffect.clearRect(0,0,2000,2000);
    var w=Math.abs(dtx-x);
    var h=Math.abs(dty-y);
    if(parseInt(x)>parseInt(dtx)) x=dtx;
    if(parseInt(y)>parseInt(dty)) y=dty;
    var x0=parseInt(x);
    var y0=parseInt(y);
// var r = w / 2;
    var r = 25;
    if (w <2 * r) r = w / 3;
    if (h < 2 * r) r = h / 3;
    adapter.ctx.beginPath();
    adapter.ctx.moveTo(x0+r, y0);
    adapter.ctx.arcTo(x0+w, y0, x0+w, y0+h, r);
    adapter.ctx.arcTo(x0+w, y0+h, x0, y0+h, r);
    adapter.ctx.arcTo(x0, y0+h, x0, y0, r);
    adapter.ctx.arcTo(x0, y0, x0+w, y0, r);
    adapter.ctx.stroke();
    adapter.ctx.closePath();

}
/**
 *ctldrawRoundrecteEffect
 */
var ctldrawRoundrecteEffect=function(x,y,dtx,dty,flag){
    if(flag){

        adapter.ctxeffect.clearRect(0,0,2000,2000);
        var w=Math.abs(dtx-x);
        var h=Math.abs(dty-y);
        if(parseInt(x)>parseInt(dtx)) x=dtx;
        if(parseInt(y)>parseInt(dty)) y=dty;
        var x0=parseInt(x);
        var y0=parseInt(y);
// var r = w / 2;
        var r = 25;
        if (w <2 * r) r = w / 3;
        if (h < 2 * r) r = h / 3;
        adapter.ctxeffect.beginPath();
        adapter.ctxeffect.moveTo(x0+r, y0);
        adapter.ctxeffect.arcTo(x0+w, y0, x0+w, y0+h, r);
        adapter.ctxeffect.arcTo(x0+w, y0+h, x0, y0+h, r);
        adapter.ctxeffect.arcTo(x0, y0+h, x0, y0, r);
        adapter.ctxeffect.arcTo(x0, y0, x0+w, y0, r);
        adapter.ctxeffect.stroke();
        adapter.ctxeffect.closePath();
    }


}
/**
 *ctldrawfluorepen
 */
var ctldrawfluorepen=function(x,y,flag){

    if(flag)
    {
//11cd0c
        adapter.ctx.lineTo(x,y);
        adapter.ctx.stroke();
    }

}
/**
 *插入字体输入框
 */
function fakeWordsInput(offsetx,offsety,x,y,dtx,dty,flag,down)
{


    if(flag)
    {
        var tmpx=x+offsetx*1;
        var tmpy=y+offsety*1;
        adapter.fontTipposx=tmpx;
        adapter.fontTipposy=tmpy;
        adapter.fontTip.show();
        adapter.fontTip.css({left:tmpx,top:tmpy});
        if(down){
            adapter.fontTip.width(60);
            adapter.fontTip.height(30);}
        else {
            adapter.fontTip.width(dtx - x - 8);
            adapter.fontTip.height(dty - y - 8);
        }
    }
}

/**
 *drawWords
 */
function ctldrawWords(){
    var words = adapter.fontTip.val();

    if(	adapter.fontTip.css("display")!= "none" && words )
    {
        var slectwbObj=$("#"+$("#selectwb").attr("tar"));
        var scaleratex=slectwbObj.first().attr("scaleratex");
        var scaleratey=slectwbObj.first().attr("scaleratey");
        var csscaletag=parseFloat(slectwbObj.attr("scaletag"));
        var offset = $("#"+$("#selectwb").attr("tar")).offset();
        var offset2 = adapter.fontTip.offset();
        var fontSize = 14;
        adapter.ctx.save();
        adapter.ctx.scale(1/csscaletag,1/csscaletag);
       // adapter.ctx.lineWidth= adapter.ctx.lineWidth*csscaletag;
        adapter.ctx.font=parseFloat(26*csscaletag)+"px Verdana";

        if(scaleratex)
            adapter.ctx.font=parseFloat(26/scaleratex*csscaletag)+"px Verdana";
//adapter.ctx.fillText(words,offset2.left-offset.left,(offset2.top-offset.top+fontSize*1));

        adapter.ctx.fillText(words,offset2.left-offset.left,(offset2.top-offset.top+fontSize*1));



        if(scaleratex)
            adapter.pointArr.push({"x":parseInt((offset2.left-offset.left)*scaleratex/csscaletag),"y":parseInt((offset2.top-offset.top-fontSize*0.06)*scaleratey/csscaletag)});
        else
            adapter.pointArr.push({"x":parseInt((offset2.left-offset.left)/csscaletag),"y":parseInt((offset2.top-offset.top )/csscaletag-fontSize*0.9)});

        adapter.fontTip.val("");
        adapter.ctx.restore();
        console.log('restore!!draw word!!!');
    }

    adapter.fontTip.width(60);
    adapter.fontTip.height(30);
    adapter.fontTip.hide();
    if(words!=="")
        adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,adapter.ctx.lineWidth,words));
}
/**
 *initlinestyle
 */
var initlinestyle=function(obj){
    adapter.ctx.lineWidth=1;
    if(adapter.lineselectischeck)
    {
        adapter.drawtype=obj.value;
        var index=obj.selectedIndex;
        adapter.ctx.lineWidth=obj.options[index].attributes["linewidth"].nodeValue;
    }
    if(adapter.rectselectischeck)
    {
        adapter.drawtype=document.getElementById("rectselect").value;
        var index=document.getElementById("rectselect").selectedIndex;
        adapter.ctx.lineWidth=document.getElementById("rectselect").options[index].attributes["linewidth"].nodeValue;

    }
    if(adapter.wordischecked)
        adapter.drawtype="text";
    if(adapter.selectischeck)
        adapter.drawtype="select";
    if(adapter.deleteischeck)
        adapter.drawtype="delete";
    adapter.ctx.lineCap="round";
    adapter.ctx.strokeStyle=document.getElementById("colorslt").value;//replaceRB(strToHex(document.getElementById("colorslectct").value));
    if(adapter.drawtype=="fluorepen")
        adapter.ctx.strokeStyle="rgba(172,254,172,0.7)";
    adapter.ctx.fillStyle=document.getElementById("colorslt").value;//replaceRB(strToHex(document.getElementById("colorslectct").value));

}
/**
 *初始化白板工具相关
 */
var initwbtools=function(){
    adapter.fontTip =$("<textarea rows='3' cols='20' style='background:transparent;position:absolute;display:none;width:60px;height:30px'></textarea>");
    $("#wbpage").append(adapter.fontTip);

    CanvasRenderingContext2D.prototype.dashedLineTo = function (fromX, fromY, toX, toY, pattern) {
        // default interval distance -> 5px  
        if (typeof pattern === "undefined") {
            pattern = 5;
        }

        // calculate the delta x and delta y  
        var dx = (toX - fromX);
        var dy = (toY - fromY);
        var distance = Math.floor(Math.sqrt(dx*dx + dy*dy));
        var dashlineInteveral = (pattern <= 0) ? distance : (distance/pattern);
        var deltay = (dy/distance) * pattern;
        var deltax = (dx/distance) * pattern;

        // draw dash line  
        this.beginPath();
        for(var dl=0; dl<dashlineInteveral; dl++) {
            if(dl%2) {
                this.lineTo(fromX + dl*deltax, fromY + dl*deltay);
            } else {
                this.moveTo(fromX + dl*deltax, fromY + dl*deltay);
            }
        }
        this.stroke();
    };

    /*$(adapter.fontTip).mousemove(function(e) {
     if(adapter.flag)
     {
     var tmpdelx=offsetdifX+deletex;
     var tmpdely=offsetdifY+deletey;
     adapter.fontTip.css({left:tmpdelx,top:tmpdely});
     var offset=$("#wbpage").offset();
     adapter.fontTip.width(e.pageX-offset.left-deletex);
     adapter.fontTip.height(e.pageY-offset.top-deletey);
     }
     });*/
    $(adapter.fontTip).mouseup(function() {
        adapter.flag=false;
        adapter.fontTip.focus();
    });
    adapter.fontTip.blur(ctldrawWords);

    $("#new_newpg").on("click",function(){
        adapter.connection.send(sendCreatewbxml());

    });
    $("#select").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#newword").removeAttr("class");
        $("#rectselect").removeAttr("class");
        adapter.selectischeck=true;
        adapter.lineselectischeck=false;
        adapter.wordischecked=false;
        adapter.deleteischeck=false;
        adapter.rectselectischeck=false;
    });
    $("#deleteele").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#select").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#newword").removeAttr("class");
        $("#rectselect").removeAttr("class");
        adapter.selectischeck=false;
        adapter.lineselectischeck=false;
        adapter.wordischecked=false;
        adapter.deleteischeck=true;
        adapter.rectselectischeck=false;
    });
    $("#lineselect").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#select").removeAttr("class");
        $("#newword").removeAttr("class");
        $("#rectselect").removeAttr("class");
        adapter.selectischeck=false;
        adapter.lineselectischeck=true;
        adapter.wordischecked=false;
        adapter.deleteischeck=false;
        adapter.rectselectischeck=false;
    });
    $("#newword").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#select").removeAttr("class");
        $("#rectselect").removeAttr("class");
        adapter.selectischeck=false;
        adapter.lineselectischeck=false;
        adapter.wordischecked=true;
        adapter.deleteischeck=false;
        adapter.rectselectischeck=false;
    });
    $("#rectselect").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#select").removeAttr("class");
        $("#newword").removeAttr("class");
        adapter.selectischeck=false;
        adapter.lineselectischeck=false;
        adapter.wordischecked=false;
        adapter.deleteischeck=false;
        adapter.rectselectischeck=true;

    });
    /* $("#showcolor").on("click",function(){

     });*/


}
/**
 *sendlinexml
 */
var sendlinexml=function(pArr,sharptype,pgjid,lineWidth,word){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id",selftruename+"jcl_"+adapter.jclnum++);
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
 *sendCreatewbxml
 */
var sendCreatewbxml=function(filename){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("type","create");
    query.setAttribute("xmlns","cellcom:doc:share");

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
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.selfRoomID);//selfRoomId
    var query=doc.createElement("query");
    query.setAttribute("type","apply");
    query.setAttribute("xmlns","cellcom:wb:ctrl");


    iq.appendChild(query);
    return iq;

}
/**
 *
 */
var sendChangepagexml=function(pgjid,pgnum,pgno){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data);//room_data
    var query=doc.createElement("query");
    query.setAttribute("type","change");
    query.setAttribute("xmlns","cellcom:doc:share");
    var info=doc.createElement("info");
    var jid=doc.createElement("jid");
    jid.appendChild(doc.createTextNode(pgjid));
    var pageno=doc.createElement("pageno");
    pageno.appendChild(doc.createTextNode(pgno));
    var pagenum=doc.createElement("pagenum");
    pagenum.appendChild(doc.createTextNode(pgnum));
    info.appendChild(jid);
    info.appendChild(pageno);
    info.appendChild(pagenum);
    query.appendChild(info);
    iq.appendChild(query);
    return iq;

}
/**
 *send  ctl stop
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
 *sendendwbxml
 */
var sendendwbxml=function(pgjid,endjid){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
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

/**
 *刚进入会议查询wb消息
 */
var sendQuerywbmsgxml=function(endjid){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:share:browse");
    iq.appendChild(query);
    return iq;


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
 *计算哪些图形要属于删除矩形内
 */
var parseDeleteSharpIqnode=function(iqnodeArr,jid,x,y,endx,endy){
    var info,object;
    var tmpdelArr=new Array();
    for(var k=0;k<iqnodeArr.length;k++)
    {
        var iqnode=iqnodeArr[k];
        if(iqnode.getElementsByTagName("info")[0]&&iqnode.getElementsByTagName("object")[0])
        {
            info=iqnode.getElementsByTagName("info")[0];
            var tmpjid=info.getElementsByTagName("jid")[0].firstChild.nodeValue;
            if(jid===tmpjid)
            {
                object=info.getElementsByTagName("object");
                for(var i=0;i<object.length;i++)
                {
                    var name=object[i].getElementsByTagName("name")[0].firstChild.nodeValue;
                    if(object[i].getElementsByTagName("points")[0])
                        var points=object[i].getElementsByTagName("points")[0];
                    else break;
                    var pointarr=points.getElementsByTagName("point");
                    if(pointarr.length===0) {
                        var pointsstr_en = points.firstChild.nodeValue;
                        var base64decode = Base64.decode(pointsstr_en);
                        var inflate = new Zlib.Inflate(base64decode);
                        var plain = inflate.decompress();
                        var str = new Array();
                        for (var tmi = 0; tmi < plain.length; tmi++) {
                            var tmpstr = String.fromCharCode(plain[tmi])
                            str.push(tmpstr);
                        }
                        var pointsstr_de = str.join("")
                        var pointsnode = createXMLstrDoc(pointsstr_de).documentElement;
                        pointarr =pointsnode.getElementsByTagName("point");
                    }
                    for (var j = 0; j < pointarr.length; j++) {
                        var tmpx = pointarr[j].getAttribute("x");
                        var tmpy = pointarr[j].getAttribute("y");
                        if (tmpx > x && tmpx < endx && tmpy > y && tmpy < endy) {
                            tmpdelArr.push(name);

                            break;

                        }
                    }


                }

            }
        }


    }
    return tmpdelArr;
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
        adapter.ctx.restore();


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
 *文件上传用户列表更新
 */

var adduserTouploadlist=function(userArr){
    for(var i=userArr.length-1;i>=0;i--){
        if(userArr[i]===null||userArr[i].name===selftruename)
            continue;
        var tmpusername=userArr[i].name;
        var id="";
        var tmpid;
        for(var j=0;j<adapter.userrefArr.length;j++)
        {
            if(adapter.userrefArr[j].name===userArr[i].name){
                tmpid=adapter.userrefArr[j].id
                break;
            }
        }
        id=tmpid+"_upfileuser";
        if(document.getElementById(id)===null)
        {
            var li=document.createElement("li");
            li.setAttribute("id",id)
            var checkBox=document.createElement("input");
            checkBox.setAttribute("type","checkBox");
            checkBox.setAttribute("class","upnocheck");
            var username_p=document.createElement("p");
            username_p.innerHTML=tmpusername;

            li.appendChild(checkBox);
            li.appendChild(username_p);
            $("#upload_usrlist_ul").append(li);
            $(checkBox).on("click",function(){
                var liArr=$("#upload_usrlist_ul").children("li");
                tmpfileuploadArr.length=0;
                for(var i=0;i<liArr.length;i++)
                {

                    if($(liArr[i].firstChild).get(0).checked)
                        tmpfileuploadArr.push($(liArr[i].lastChild).html());
                }

            });

        }
    }
}
/**
 *参会用户列表更新
 **/
var adduserTolist=function(userArr){

    /*var userlist_ul=document.getElementById("ul_memlist");
     userlist_ul.innerHTML="";*/
    for(var i=userArr.length-1;i>=0;i--){
        if(userArr[i]===null)
            continue;
        var tmpusername=userArr[i].name;
        var voicestatue=userArr[i].voice;
        var videostatue=userArr[i].videoCap;
        var id="";
        var tmpid;
        for(var j=0;j<adapter.userrefArr.length;j++)
        {
            if(adapter.userrefArr[j].name===userArr[i].name){
                tmpid=adapter.userrefArr[j].id
                id=adapter.userrefArr[j].id+"_user";
                break;
            }
        }

        if(document.getElementById(id)===null)
        {

            var li=document.createElement("li");

            var dlgtodiv=document.createElement("div");
            dlgtodiv.setAttribute("class","dlgto");
            dlgtodiv.setAttribute("tagid",tmpid)
            dlgtodiv.setAttribute("username",tmpusername);
            li.setAttribute("id",id);


            dlgtodiv.onclick=function(e){
                //增加请出会议、请出会议等	
                var tmpname=$(this).attr("username");
                if(selftruename!==tmpname)
                {
                    $(this).children("div").remove();
                    var chairdiv=document.createElement("div");
                    $(chairdiv).attr("class","chair_div");
                    var personaldlg_p=document.createElement("p");
                    personaldlg_p.innerHTML="文字悄悄话";
                    $(personaldlg_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px"});
                    var askleavepres_p=document.createElement("p");
                    askleavepres_p.innerHTML="请出会议";
                    $(askleavepres_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px"});
                    var chairexchange_p=document.createElement("p");
                    chairexchange_p.innerHTML="主席转换";
                    $(chairexchange_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px"});
                    var agreeuserspk_p=document.createElement("p");
                    var disagreeuserspk_p=document.createElement("p");
                    agreeuserspk_p.innerHTML="同意发言";
                    disagreeuserspk_p.innerHTML="禁止发言";
                    if( $("#"+$(this).attr("spkdivid")).attr('isSaying')==='false')
                    {
                        $(agreeuserspk_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#000000"});
                        $(disagreeuserspk_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#A0A0A0"});
                    }
                    else{
                        $(agreeuserspk_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#A0A0A0"});
                        $(disagreeuserspk_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#000000"});

                    }
                    var agreectl_p=document.createElement("p");
                    agreectl_p.innerHTML="同意控制";
                    var agreehandle_p=document.createElement("p");
                    agreehandle_p.innerHTML="同意操作";
                    var disgreehandle_p=document.createElement("p");
                    disgreehandle_p.innerHTML="停止申请操作权";
                    if( $("#"+$(this).attr("ctldivid")).attr('isCtrling')==='false'){
                        $(agreectl_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#000000"});
                        $(agreehandle_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#000000"});
                        $(disgreehandle_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#A0A0A0"});
                    }else{
                        $(agreectl_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#A0A0A0"});
                        $(agreehandle_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#A0A0A0"});
                        $(disgreehandle_p).css({"height":"18px","width":"auto","cursor":"pointer","margin":"0 0 2px 5px","color":"#000000"});
                    }

                    chairdiv.appendChild(personaldlg_p);
                    if(adapter.ispreschair)
                    {
                        $(chairdiv).css("height","175px");
                        chairdiv.appendChild(askleavepres_p);
                        chairdiv.appendChild(chairexchange_p);
                        chairdiv.appendChild(agreeuserspk_p);
                        chairdiv.appendChild(disagreeuserspk_p);
                        chairdiv.appendChild(agreectl_p);
                        chairdiv.appendChild(agreehandle_p);
                        chairdiv.appendChild(disgreehandle_p);
                    }
                    $(this).append(chairdiv);
                    var that=this;
                    var pnodes=$(this).children("div").first().children("p");
                    pnodes.eq(0).on("click",function(e){
                        $(this).parent().css("display","none");
                        if(!adapter.dlgisshow)
                            showdlg();
                        adduserdlg($(that).attr("username"),$(that).attr("tagid"));
                        e.stopPropagation();
                    });
                    if(pnodes.eq(1))//请出会议
                    {
                        pnodes.eq(1).on("click",function(e){
                            adapter.connection.send(kickoutpres(tmpname));
                            $(this).parent().css("display","none");
                            e.stopPropagation();
                        });
                    }
                    if(pnodes.eq(2))//主席置换
                    {
                        pnodes.eq(2).on("click",function(e){
                            adapter.connection.send(chairexchange(tmpname));
                            $(this).parent().css("display","none");
                            e.stopPropagation();
                        });
                    }
                    if(pnodes.eq(3))//允许发言
                    {
                        pnodes.eq(3).on("click",function(e){
                            if($("#"+$(that).attr("spkdivid")).attr('isSaying')==='false') {
                                adapter.connection.send(userspkauth(tmpname, true));
                                $(this).parent().css("display", "none");
                                e.stopPropagation();
                            }
                        });
                    }
                    if(pnodes.eq(4))//禁止发言
                    {
                        pnodes.eq(4).on("click",function(e){
                            if($("#"+$(that).attr("spkdivid")).attr('isSaying')==='true') {
                                adapter.connection.send(userspkauth(tmpname, false));
                                $(this).parent().css("display", "none");
                                e.stopPropagation();
                            }
                        });
                    }
                    if(pnodes.eq(5))//同意控制
                    {
                        pnodes.eq(5).on("click",function(e){
                            if($("#"+$(that).attr("ctldivid")).attr('isCtrling')==='false') {
                                adapter.connection.send(userctlauth(tmpname, true, "controller"));
                                $(this).parent().css("display", "none");
                                e.stopPropagation();
                            }
                        });
                    }

                    if(pnodes.eq(6))//同意操作
                    {
                        pnodes.eq(6).on("click",function(e){
                            if($("#"+$(that).attr("ctldivid")).attr('isCtrling')==='false') {
                                adapter.connection.send(userctlauth(tmpname, true, "operator"));
                                $(this).parent().css("display", "none");
                                e.stopPropagation();
                            }
                        });
                    }
                    if(pnodes.eq(7))//不同意操作
                    {
                        pnodes.eq(7).on("click",function(e){
                            if($("#"+$(that).attr("ctldivid")).attr('isCtrling')==='true') {
                                adapter.connection.send(userctlauth(tmpname, false));
                                $(this).parent().css("display", "none");
                                e.stopPropagation();
                            }
                        });
                    }

                    $(this).children("div").first().css({"left":$(this).position().left+15,"top":$(this).position().top+10});
                    $(this).children("div").first().show();

                    $(document).one("click", function(){
                        $(that).children("div").first().hide();
                    });
                    e.stopPropagation();
                }

            };
            var cameradiv=document.createElement("div");
            cameradiv.setAttribute("id",tmpid+"_camimg");
            cameradiv.setAttribute("class","camera");

            if(videostatue!=='disable') {
                cameradiv.setAttribute('isCaming', true);
                $(cameradiv).css("background-image","url('./images/u896_normal.png')");
            }
            else
                cameradiv.setAttribute('isCaming', false);
            var namep=document.createElement("p");
            namep.setAttribute("mmid",userArr[i].mmidListTraverse[0]);
            namep.setAttribute("jid",userArr[i].jid);
            namep.setAttribute("isshowV",false);
            $(namep).css({"cursor":"pointer","overflow":"hidden","text-overflow":"ellipsis","white-space":"nowrap"});
            namep.innerHTML=userArr[i].name;
            var userspkdiv=document.createElement("div");

            userspkdiv.setAttribute("id",tmpid+"_spkimg");
            dlgtodiv.setAttribute("spkdivid",tmpid+"_spkimg");
            userspkdiv.setAttribute("class","userspk");
            if(voicestatue==='speaking') {
                userspkdiv.setAttribute('isSaying', true);
                $(userspkdiv).css("background-image","url('./images/Mic_u860_normal.png')");
            }
            else
                userspkdiv.setAttribute('isSaying',false);

            if(userArr[i].voice==="speaking")
                $(userspkdiv).css("display","block");
            var userctldiv=document.createElement("div");
            userctldiv.setAttribute("id",tmpid+"_ctlimg");
            dlgtodiv.setAttribute("ctldivid",tmpid+"_ctlimg");
            userctldiv.setAttribute("class","userctl");
            userctldiv.setAttribute('isCtrling',false);
            if(userArr[i].userCtl==="controller")
                $(userctldiv).css({"display":"block","background-image":"url('./images/u900_normal.png')"});
            if(userArr[i].userCtl==="operator")
                $(userctldiv).css({"display":"block","background-image":"url('./images/operater.png')"});
            //点击显示摄像头视频
            namep.onclick=function(){
                if($(this).parent().children('div').eq(1).attr("iscaming")==='true') {
                    var tmpmmid = $(this).attr("mmid");
                    var tmpjid = $(this).attr("jid");
                    if ($(this).attr("isshowV") === "false") {
                        $(this).parent().css("background", "#3BC3FD");
                    } else {
                        $(this).parent().css("background", "#B5E1F6");
                    }
                    if (tmpjid === adapter.selfRoomID) {
                        if ($(this).attr("isshowV") === "false") {

                            $("#canvas_src_div").css("display", "block");
                            $(this).attr("isshowV", true);
                        } else {

                            $(this).attr("isshowV", false);
                            $("#canvas_src_div").css("display", "none");
                        }
                    }
                    else {
                        if ($(this).attr("isshowV") === "false") {
                            playVideo(tmpjid, tmpmmid);
                            /* if (document.getElementById(tmpmmid) !== null) {
                             $("." + tmpmmid).css("display", "block");
                             }*/
                            $(this).attr("isshowV", true);
                        }
                        else {
                            if (document.getElementById(tmpmmid) !== null) {
                                adapter.getVideoChannelMap[tmpmmid].destroy();
                                delete adapter.getVideoChannelMap[tmpmmid];
                                stopPlayVideo(tmpjid, tmpmmid);
                                if(!$("." + tmpmmid).is(":hidden")) {
                                    $("." + tmpmmid).remove();
                                    $("#membercamera_container").children('div').eq(4).show();
                                }else{
                                    $("." + tmpmmid).remove();
                                }

                                $(this).attr("isshowV", false);

                            }
                        }
                    }
                }

            }
            li.appendChild(dlgtodiv);
            li.appendChild(namep);
            li.appendChild(cameradiv);
            li.appendChild(userspkdiv);
            li.appendChild(userctldiv);
            $("#ul_memlist").append(li);

        }
        else{
            $("#"+id).children("p").first().attr("mmid",userArr[i].mmidListTraverse[0]);
        }
    }
}
/**
 *统计参会用户人员数
 */
var countusernum=function(userArr){
    var num=0;
    for(var i=0;i<userArr.length;i++)
    {
        if(userArr[i]!==null)
            num++;
    }
    return num;
}
/**
 *增加投票选项
 */
var tmpvoteArr=new Array();
var addVoteItem=function(qid,num,item,multi,reg) {

    var li=document.createElement("li");
    var checkBox=document.createElement("input");
    checkBox.setAttribute("type","checkBox");
    checkBox.setAttribute("id",num);
    checkBox.setAttribute("tar",item);
    checkBox.setAttribute("class","nomulti");
    $(checkBox).on("click",function(){
        if(multi==="false")
        {
            $(".nomulti").prop("checked",false);
            $(this).prop("checked",true);
        }
        var liArr=$("#voteitem_ul").children("li");
        tmpvoteArr.length=0;
        for(var i=0;i<liArr.length;i++)
        {
            if($(liArr[i].firstChild).attr("checked"))
                tmpvoteArr.push($(liArr[i].firstChild).attr("id"));
        }
        $(".mychoose").text(convertstr(tmpvoteArr));
    });
    var p_num=document.createElement("p");
    p_num.innerHTML=num;
    var p_item=document.createElement("p");
    p_item.innerHTML=item;
    li.appendChild(checkBox);
    li.appendChild(p_num);
    li.appendChild(p_item);

    $("#voteitem_ul").append(li);
}
/**
 *增加投票结果选项
 */
var addVoteResultItem=function(allcount,count,num,item,multi,reg,tag,name) {

    if(tag)
    {
        var li=document.createElement("li");
        var p_voteitem=document.createElement("p");
        p_voteitem.innerHTML="投票项";
        var p_voteratio=document.createElement("p");
        p_voteratio.innerHTML="比例";
        var p_votecount=document.createElement("p");
        p_votecount.innerHTML="人数";
        li.appendChild(p_voteitem);
        li.appendChild(p_voteratio);
        li.appendChild(p_votecount);
        if(reg==="true")
        {
            var p_voteperson=document.createElement("p");
            p_voteperson.innerHTML="投票人";
            li.appendChild(p_voteperson);
        }


        $("#voteresult_ul").append(li);
    }
    else{
        var li=document.createElement("li");
        var p_voteitem=document.createElement("p");
        p_voteitem.innerHTML=num+"  "+item;
        var p_voteratio=document.createElement("p");
        p_voteratio.innerHTML=parseInt(count*100/allcount)+"%";
        var p_votecount=document.createElement("p");
        p_votecount.innerHTML=count;
        li.appendChild(p_voteitem);
        li.appendChild(p_voteratio);
        li.appendChild(p_votecount);
        if(reg==="true")
        {
            var p_voteperson=document.createElement("select");
            for(var i=0;i<name.length;i++)
            {
                var option=document.createElement("option");
                option.innerHTML=name[i];
                p_voteperson.appendChild(option);
            }

            li.appendChild(p_voteperson);
        }
        $("#voteresult_ul").append(li);
    }


}
/**
 *转换时间显示格式
 */
var converttime=function (time) {

    var minute=parseInt(time/60);
    var second=parseInt(time%60);
    return minute+"分钟"+second+"秒";
}
/**
 *投票我选择的是转化
 */
var convertstr=function(numarr) {
    var str="我选择的是:   ";
    for(var i=0;i<numarr.length;i++)
    {   if(i===0)
        str=str+numarr[i]
    else
        str=str+","+numarr[i];
    }
    return str;
}
/**
 *提交投票发送xml数据
 */
var sendApplyvotexml=function(istimeout){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:voting");
    if(istimeout)
        query.setAttribute("type","end");
    else
        query.setAttribute("type","voting");
    var qid=doc.createElement("qid");
    qid.appendChild(doc.createTextNode($("#voteapply").attr("tar")));
    query.appendChild(qid);
    if(!istimeout)
    {
        var subjects=doc.createElement("subjects");
        subjects.appendChild(doc.createTextNode($("#voteapply").attr("tar")));
        for(var i=0;i<tmpvoteArr.length;i++){
            var subject=doc.createElement("subject");
            subject.appendChild(doc.createTextNode($("#"+tmpvoteArr[i]).attr("tar")));
            subjects.appendChild(subject);
        }
        query.appendChild(subjects);
    }
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
 *setchairItemstyle
 */
var setchairItemstyle=function(){
    $("#chair_item_ul li p").css({"color":"#FFFFFF","cursor":"pointer"});
    $("#phonepres p").css({"color":"#A0A0A0","cursor":"default"});
    $("#setpregroup p").css({"color":"#A0A0A0","cursor":"default"});
    $("#applychair p").css({"color":"#A0A0A0","cursor":"default"});
}

/**
 *申请主席权限xml消息
 */
var applypreschair=function(passwd) {

    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:chair");
    var pass=doc.createElement("pass");
    pass.appendChild(doc.createTextNode(passwd));
    query.appendChild(pass);
    iq.appendChild(query);
    return iq;
}
/**
 *全部静音xml消息
 */
var applyallmute=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:voice:muteall");
    iq.appendChild(query);
    return iq;
}
/**
 *主席控制模式xml消息
 */
var applyctlmode=function(mode){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:mode");
    query.setAttribute("type",mode);
    iq.appendChild(query);
    return iq;
}
/**
 *锁定会议
 */
var applylockpres=function(mode){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:lock");
    var action=doc.createElement("action");
    action.appendChild(doc.createTextNode(mode));
    query.appendChild(action);
    iq.appendChild(query);
    return iq;
}
/**
 *同步视频xml消息
 */
var applyvideosyncmode=function(mode){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:sync");
    var video=doc.createElement("video");
    video.appendChild(doc.createTextNode(mode));
    query.appendChild(video);
    iq.appendChild(query);
    return iq;
}
/**
 *RTSP列表xml消息
 */
var applyRTSPlist=function(code){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:rtsp:query");
    var company_code=doc.createElement("company_code");
    company_code.appendChild(doc.createTextNode(code));
    query.appendChild(company_code);
    iq.appendChild(query);
    return iq;
}
/**
 *H323服务xml消息
 */
var applyH323=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:server:extinfo");
    query.setAttribute("calltype","h323");
    iq.appendChild(query);
    return iq;
}
/**
 *举手功能xml消息
 */
var applyhandup=function(type){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    if(type==="result")
        iq.setAttribute("to",ROOM_JID+"/"+adapter.chairname);
    else
        iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:eraisinghand");
    query.setAttribute("type",type);
    iq.appendChild(query);
    return iq;
}
/**
 *删除下载文件
 */
var applydeldownldfile=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:file:transmit");
    query.setAttribute("type","deleteAll");
    iq.appendChild(query);
    return iq;
}
/**
 *会议录制权限
 */
var applypresrecodeauth=function(type){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:user:setting");
    var recorder=doc.createElement("recorder");
    recorder.appendChild(doc.createTextNode(type));
    query.appendChild(recorder);
    iq.appendChild(query);
    return iq;
}
/**
 *文字私聊权限
 */
var applydlgpersonal=function(type){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:chairadv");
    query.setAttribute("type","chat");
    var value=doc.createElement("value");
    value.appendChild(doc.createTextNode(type));
    query.appendChild(value);
    iq.appendChild(query);
    return iq;
}
/**
 *传输文件权限
 */
var applysendfileauth=function(type){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:chairadv");
    query.setAttribute("type","file");
    var value=doc.createElement("value");
    value.appendChild(doc.createTextNode(type));
    query.appendChild(value);
    iq.appendChild(query);
    return iq;
}
/**
 *同步桌面布局
 */
var applysyncdsklayout=function(type){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:chairadv");
    query.setAttribute("type","layout");
    var value=doc.createElement("value");
    value.appendChild(doc.createTextNode(type));
    query.appendChild(value);
    iq.appendChild(query);
    return iq;
}

/**
 *用户发言权限
 */
var userspkauth=function(name,accept){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID+"/"+name); //room_data
    var query=doc.createElement("query");
    if(accept)
        query.setAttribute("xmlns","cellcom:voice:accept");
    else
        query.setAttribute("xmlns","cellcom:voice:refuse");

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
 *主席置换
 */
var chairexchange=function(name){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:chair");
    var user=doc.createElement("user");
    user.appendChild(doc.createTextNode(ROOM_JID+"/"+name));
    query.appendChild(user);
    iq.appendChild(query);
    return iq;
}
/**
 *请出会议
 */
var kickoutpres=function(name){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","set");
    iq.setAttribute("to",ROOM_JID); //room_data
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:kick");
    var item=doc.createElement("item");
    item.setAttribute("jid",ROOM_JID+"/"+name);
    item.setAttribute("time","0");
    query.appendChild(item);
    iq.appendChild(query);
    return iq;
}

/**
 *获取视频
 */
var playVideo = function(userJid, mmidToPlayVideo) {
    console.log("get video");
    //adapter.GetVideo(userJid, mmidToPlayVideo);
    adapter.connection.send(GetVideo(userJid, mmidToPlayVideo));
}



/**
 *关闭视频
 */
var stopPlayVideo = function(userJid, mmidToPlayVideo) {
    console.log("stop video.");
    //adapter.StopGetVideo(userJid, mmidToPlayVideo);  

    adapter.connection.send(stopGetVideo(userJid, mmidToPlayVideo));
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
 *发送cellcom:conf:testOver
 */
var sendTransportTestOverXMLStr = function() {
    var doc = createXMLDoc();
    var iq = doc.createElement("iq");
    doc.appendChild(iq);

    iq.setAttribute("type", "set");

    var uuidStr = "jcl_" + uuid++;
    iq.setAttribute("id", uuidStr);
    iq.setAttribute("to", ROOM_JID);

    var query = doc.createElement("query");
    query.setAttribute("xmlns", "cellcom:conf:testOver");
    iq.appendChild(query);

    var audio = doc.createElement("audio");
    audio.setAttribute("trnsType", "HTTP");

    var video = doc.createElement("video");
    video.setAttribute("trnsType", "HTTP");
    //var bw = doc.createElement("bw");
    //bw.appendChild(doc.createTextNode("525803"));
    //var maxudplen = doc.createElement("maxudplen");
    //maxudplen.appendChild(doc.createTextNode("65000"));
    //var rtt = doc.createElement("rtt");
    //rtt.appendChild(doc.createTextNode("0"));
    //
    //video.appendChild(bw);
    //video.appendChild(maxudplen);
    //video.appendChild(rtt);

    var userDes = doc.createElement("userDes");
    userDes.setAttribute("mmid", adapter.userDesMMID);

    query.appendChild(audio);
    query.appendChild(video);
    query.appendChild(userDes);

    return iq;
}


/**
 *发送cellcom:conf:capability
 */
var sendCapabilityXMLStr = function(vstatus) {
    var doc = createXMLDoc();
    var iq = doc.createElement("iq");
    doc.appendChild(iq);

    iq.setAttribute("type", "set");

    var uuidStr = "jcl_" + uuid++;
    iq.setAttribute("id", uuidStr);
    iq.setAttribute("to", ROOM_JID);

    var query = doc.createElement("query");
    query.setAttribute("xmlns", "cellcom:conf:capability");

    var user = doc.createElement("user");
    user.setAttribute("jid", adapter.selfRoomID);

    user.setAttribute("mmid", adapter.userDesMMID);


    var vSend = doc.createElement("vSend");
    vSend.appendChild(doc.createTextNode(vstatus));
    var aSend = doc.createElement("aSend");
    aSend.appendChild(doc.createTextNode("enable"));

    var vRecv = doc.createElement("vRecv");
    vRecv.appendChild(doc.createTextNode("enable"));
    var aRecv = doc.createElement("aRecv");
    aRecv.appendChild(doc.createTextNode("enable"));

    var camctrl = doc.createElement("camctrl");
    camctrl.appendChild(doc.createTextNode(""));
    query.appendChild(user);
    user.appendChild(vSend);
    user.appendChild(aSend);
    user.appendChild(vRecv);
    user.appendChild(camctrl);
    user.appendChild(aRecv);



    iq.appendChild(query);

    return iq;
}


/**
 *发送cellcom:conf:statusTransferOk
 */
var sendStatusTransferOkXMLStr = function() {
    var doc = createXMLDoc();
    var iq = doc.createElement("iq");
    doc.appendChild(iq);

    iq.setAttribute("type", "set");

    var uuidStr = "jcl_" + uuid++;
    iq.setAttribute("id", uuidStr);
    iq.setAttribute("from", ROOM_JID);
    iq.setAttribute("to", adapter.selfRoomID);

    var query = doc.createElement("query");
    query.setAttribute("xmlns", "cellcom:conf:statusTransferOk");

    var userDes = doc.createElement("userDes");
    userDes.setAttribute("mmid", adapter.userDesMMID);

    query.appendChild(userDes);
    iq.appendChild(query);

    return iq;
}



/**
 *发送cellcom:video:apply
 */
var GetVideo = function(userJID, MMID) {

    var temPos = 0;
    for (var i = 0; i < adapter.confUsers.length; i ++) {
        var oneUserInfo = adapter.confUsers[i];
        //   console.log("oneUserInfo.jid:" + oneUserInfo.jid + " | " + "userJID:" + userJID);
        if (oneUserInfo.jid === userJID) {

            var doc = createXMLDoc();
            var iq = doc.createElement("iq");
            doc.appendChild(iq);

            iq.setAttribute("type", "get");

            var uuidStr = "jcl_" + uuid++;
            iq.setAttribute("id", uuidStr);
            iq.setAttribute("to", ROOM_JID);

            var query = doc.createElement("query");
            query.setAttribute("xmlns", "cellcom:video:apply");

            var mmid = doc.createElement("mmid");
            mmid.appendChild(doc.createTextNode(MMID));
            var id = doc.createElement("id");
            id.appendChild(doc.createTextNode(oneUserInfo.jid));

            query.appendChild(id);
            query.appendChild(mmid);
            iq.appendChild(query);

            return iq;
        }
        temPos ++;
    }
    return "";
}


/**
 *发送cellcom:video:close
 */
var stopGetVideo = function(userJID, MMID) {
    var temPos = 0;
    for (var i = 0; i < adapter.confUsers.length; i ++) {

        var oneUserInfo = adapter.confUsers[i];
        if (oneUserInfo.jid === userJID) {
            var doc = createXMLDoc();
            var iq = doc.createElement("iq");
            doc.appendChild(iq);

            iq.setAttribute("type", "set");

            var uuidStr = "jcl_" + uuid++;
            iq.setAttribute("id", uuidStr);
            iq.setAttribute("to", ROOM_JID);

            var query = doc.createElement("query");
            query.setAttribute("xmlns", "cellcom:video:close");

            var mmid = doc.createElement("mmid");
            mmid.appendChild(doc.createTextNode(MMID));
            var id = doc.createElement("id");
            id.appendChild(doc.createTextNode(oneUserInfo.jid));

            query.appendChild(id);
            query.appendChild(mmid);
            iq.appendChild(query);

            return iq;
        }
        temPos ++;
    }
    return "";
}
/**
 *
 */

var sendInsertPre=function(){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    iq.setAttribute("type","set");
    var tmpjcluuid="jcl_"+uuid++;
    iq.setAttribute("id",tmpjcluuid);
    iq.setAttribute("to",ROOM_JID);
    var query=doc.createElement("query");
    query.setAttribute("xmlns","cellcom:conf:enter");
    var password=doc.createElement("password");
    var nick=doc.createElement("nice");
    nick.appendChild(doc.createTextNode(Fromjid));
    var username=doc.createElement("username");
    username.appendChild(doc.createTextNode(Fromusername));
    var userpass=doc.createElement("userpass");
    userpass.appendChild(doc.createTextNode("12345678"));
    query.appendChild(password);
    query.appendChild(nick);
    query.appendChild(username);
    query.appendChild(userpass);
    iq.appendChild(query);
    return iq;
}

/**
 *请求上传
 */
var applyuploadfile=function(c_size,c_file,c_time,c_transmiter){
    var doc=createXMLDoc();
    var iq=doc.createElement("iq");
    doc.appendChild(iq);
    var id=doc.createElement("id");
    id.appendChild(doc.createTextNode("jcl_"+adapter.jclnum));
    iq.setAttribute("id","jcl_"+adapter.jclnum++);
    iq.setAttribute("type","get");
    iq.setAttribute("to",adapter.room_data); //room_data
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
    info.appendChild(size);
    info.appendChild(file);
    info.appendChild(time);
    info.appendChild(transmiter);
    info.appendChild(id);
    query.appendChild(info);
    iq.appendChild(query);
    return iq;
}

//文件上传
var uploadfile=function() {//增加toUser参数来表示选中的用户
    if(tmpfileuploadArr.length===0)
        Dialog.alert("信息","请选择用户!",null,150,80);
    else{
        var fileObj = document.getElementById("filereader").files[0]; // js 获取文件对象
        var obj=document.getElementById("filereader");
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

            adapter.connection.send(applyuploadfile(size,UploadPar.fileObj.name,time,toUser));

            $(".upload-close").click();

            //  obj.outerHTML=obj.outerHTML;

        }
    }
}

function progressFunction(evt) {

    var progressBar = document.getElementById("progressBar");

    var percentageDiv = document.getElementById("percentage");

    if (evt.lengthComputable) {

        progressBar.max = evt.total;

        progressBar.value = evt.loaded;

        percentageDiv.innerHTML = Math.round(evt.loaded / evt.total * 100) + "%";

    }

}

/**
 *上传文件
 */
var addfiletras=function(type,userArr,filename,size,result){

    var tr=document.createElement("tr");
    var td1=document.createElement("td");
    var image=document.createElement("img");

    td1.appendChild(image);
    var td2=document.createElement("td");
    if(type==="up"){
        image.src="images/filetras_1.png"
        if(userArr.length===$("#upload_usrlist_ul").children("li").length)
            td2.innerHTML="全部用户";
        else{
            var user="";
            for(var i=0;i<userArr.length;i++)
            {
                if(i===userArr.length-1)
                    user+=userArr[i];
                else
                    user+=userArr[i]+",";
            }
            td2.innerHTML=user;
        }
    }else{
        image.src="images/whitep.jpg";
        td2.innerHTML=userArr;
    }
    var td3=document.createElement("td");
    td3.innerHTML="<u>"+filename+"</u>";

    var td4=document.createElement("td");
    td4.innerHTML=(size/1024).toFixed(2)+"kb";
    var td5=document.createElement("td");
    td5.innerHTML=result;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);

    if(type==="up")
    {
        $("#uploadtable").append(tr);
        td3.innerHTML="<a>"+filename+"</a>";
    }
    else
    {
        td3.innerHTML="<u>"+filename+"</u>";
        $("#downloadtable").append(tr);
        $(td3).css("cursor","pointer");
        $(td3).attr("url",type);
        $(td3).on("click",function(){
            //  if(td5.innerHTML===result)
            downloadFile(filename,$(this).attr("url"));
            td5.innerHTML="已下载";
            image.src="images/filetras_1.png";
        });
    }
}
/**
 *上传完成发送msg
 **/
var senduploadcplmsg=function(touser,chattype,filename,filesize,filejid){
    var doc=createXMLDoc();
    var message=doc.createElement("message");
    message.setAttribute("id","jcl_"+adapter.jclnum++);
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
 *发送cellcom:voice:apply
 */
var startSpeaking = function() {
    var doc = createXMLDoc();
    var iq = doc.createElement("iq");
    doc.appendChild(iq);

    iq.setAttribute("type", "get");

    var uuidStr = "jcl_" + uuid++;
    iq.setAttribute("id", uuidStr);
    iq.setAttribute("to", ROOM_JID);

    var query = doc.createElement("query");
    query.setAttribute("xmlns", "cellcom:voice:apply");

    var desc = doc.createElement("desc");

    query.appendChild(desc);
    iq.appendChild(query);

    return iq;
}


/**
 *发送cellcom:voice:stop
 */
var stopSpeaking = function() {
    var doc = createXMLDoc();
    var iq = doc.createElement("iq");
    doc.appendChild(iq);

    iq.setAttribute("type", "set");

    var uuidStr = "jcl_" + uuid++;
    iq.setAttribute("id", uuidStr);
    iq.setAttribute("to", ROOM_JID);

    var query = doc.createElement("query");
    query.setAttribute("xmlns", "cellcom:voice:stop");

    iq.appendChild(query);

    return iq;
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
        adapter.ctx.save();
        adapter.ctxeffect.save();
        if($(this).parent().attr('scaletag'))
            csscaletag=parseFloat($(this).parent().attr('scaletag'));
        else
            csscaletag=parseFloat($(this).parent().parent().parent().attr('scaletag'));

        adapter.ctx.scale(1/csscaletag,1/csscaletag);
        adapter.ctx.lineWidth=adapter.ctx.lineWidth*csscaletag;
        if(scaleratex) {

            adapter.ctx.lineWidth = parseInt(adapter.ctx.lineWidth / scaleratex);
            adapter.ctxeffect.lineWidth = parseInt(adapter.ctxeffect.lineWidth / scaleratex);
        }
       // console.log(x+" save:"+y);
        switch(adapter.drawtype){
            case "line": adapter.ctx.beginPath(); break;
            case "thinfreeline":
            case "thickfreeline":adapter.ctx.beginPath();break;
            case "fluorepen":adapter.ctx.beginPath();break;
            case "rect":adapter.ctx.beginPath();break;
            case "roundrect" :adapter.ctx.beginPath();break;
            case "round" :adapter.ctx.beginPath();break;
            case "text" :adapter.ctx.beginPath();
                console.log(x+" save:restore"+y);
                adapter.ctx.restore();
                if(adapter.fontTip.css("display")=== "none")
                    fakeWordsInput(offsetdifX,offsetdifY,deletex,deletey,x,y,adapter.flag,true);
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
            if(scaleratex) {
                adapter.pointArr.push({"x": parseInt(tmpx * scaleratex*1/csscaletag), "y": parseInt(tmpy * scaleratey*1/csscaletag)});

            }
            else
                adapter.pointArr.push({"x":parseInt(tmpx*1/csscaletag),"y":parseInt(tmpy*1/csscaletag)});
            switch(adapter.drawtype){
                case "line":
                case "rect":
                case "roundrect":
                case "round" :
                case "select":
                case "delete":
                    $("#"+tit).children().last().css("display","block");
                    adapter.ctxeffect.scale(1/csscaletag,1/csscaletag);
                    break;
                case "text" :fakeWordsInput(offsetdifX,offsetdifY,deletex,deletey,tmpdeletx,tmpdelety,adapter.flag,false);break;
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
                adapter.ctx.closePath();
                adapter.ctx.restore();
                break;
            case "thinfreeline":
            case "thickfreeline":adapter.ctx.closePath();  adapter.ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,adapter.ctx.lineWidth));break;
            case "fluorepen":adapter.ctx.closePath();  adapter.ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,adapter.ctx.lineWidth));break;
            case "rect":
            case "roundrect" :
            case "round" :
            case "select":
            case "delete":
                    adapter.ctx.restore();
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
        adapter.ctxeffect.strokeStyle=adapter.ctx.strokeStyle;
        adapter.ctxeffect.lineWidth=adapter.ctx.lineWidth;
        adapter.ctxeffect.lineCap=adapter.ctx.lineCap;
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
            if(scaleratex)
                adapter.pointArr.push({"x":parseInt(endx*scaleratex*1/csscaletag),"y":parseInt(endy*scaleratey*1/csscaletag)});
            else
                adapter.pointArr.push({"x": parseInt(endx*1/csscaletag), "y": parseInt(endy*1/csscaletag)});
        }
        adapter.ctxeffect.restore();
        adapter.ctxeffect.clearRect(0,0,2000,2000);
        $(this).css("display","none");
        switch(adapter.drawtype){
            case "line": ctldrawline(x,y,endx,endy); adapter.ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,adapter.ctx.lineWidth)); break;
            case "thinfreeline":
            case "thickfreeline":break;
            case "fluorepen":break;
            case "rect": ctldrawRect(x,y,endx,endy); adapter.ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,adapter.ctx.lineWidth));break;
            case "roundrect" :ctldrawRoundrect(x,y,endx,endy); adapter.ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,adapter.ctx.lineWidth));break;
            case "round" :ctldrawRound(x,y,endx,endy); adapter.ctx.restore();adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,adapter.ctx.lineWidth));break;
            case "text" :break;
            case "select": adapter.ctx.restore(); break;
            case "delete":
                if(scaleratex)
                    deletemouseupfun(x*scaleratex/csscaletag,y*scaleratey/csscaletag,endx*scaleratex/csscaletag,endy*scaleratey/csscaletag);
                else
                    deletemouseupfun(parseInt(x/csscaletag),parseInt(y/csscaletag),parseInt(endx/csscaletag),parseInt(endy/csscaletag)); break;
            default: break;
        }
    });
}

var sendiqagents=function(serverip){

    var doc=createXMLDoc();
    var uuidStr = "jcl_" + uuid++;
    var iq=doc.createElement("iq");
    iq.setAttribute("id", uuidStr);
    iq.setAttribute("to",serverip);
    iq.setAttribute("type","get");
    var query=doc.createElement("query");
    query.setAttribute("xmlns","jabber:iq:agents");
    iq.appendChild(query);
    return iq;

}


