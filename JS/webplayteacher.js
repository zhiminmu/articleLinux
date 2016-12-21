// var drawdownflag=false;
var selectischeck=false,lineselectischeck=true,wordischecked=false,
    deleteischeck=false,rectselectischeck=false;
var ctx,ctxeffect;
// var drawtype;
var downloadUrl="http://120.25.73.123:80/upload";
var pointArr=new Array();
var uploadList={};
var adapter=Object.create(ConfAdapter);
var companyId,ROOM_JID,usernameid,Fromusername,userpass,prespass,serverIp,nickname;
var uuid=0;
var tmpfileuploadArr=new Array();
var dataTable={};
var iqArrary=new Array();
var selftruename="";
var selftruenameid='';
var wbpagei=0;
var removeArr=new Array();
var scaleArr=new Array();
var v5domain;
var isuploadv=false;
var isConnectVideoSocket = false;
var isConnectAudioSocket = false;
var videoUrl;
var audioUrl;
/***
 *
 */
$(document).ready(function(){

    init();
});
/**
 * myconnect
 */
var myconnect=function(){
    var searchStr = window.location.search;
    searchStr = searchStr.slice(1);
    var searchArr = searchStr.split("&");
    // for(item in searchArr){
    for(item=0;item<4;item++){
        tmp = searchArr[item].slice(0, searchArr[item].indexOf("="));
        switch(tmp){
            case "username":usernameid=searchArr[item].slice(searchArr[item].indexOf("=")+1); break;
            case "password":userpass=searchArr[item].slice(searchArr[item].indexOf("=")+1); break;
            case "corporateAccount":companyId=searchArr[item].slice(searchArr[item].indexOf("=")+1); break;
            case "conferenceID":ROOM_JID=searchArr[item].slice(searchArr[item].indexOf("=")+1); break;
            default: break;
        }
    }
    // companyId=sessionStorage.corporateAccount;
    // companyId=091711;
    // ROOM_JID=sessionStorage.conferenceID;
    // ROOM_JID=312670;
    // usernameid=sessionStorage.userName;
    // usernameid="manager";
    Fromusername=usernameid+"_"+companyId;
    // userpass=sessionStorage.password;
    // userpass="manager";
    serverIp="120.25.73.123";
    // serverIp="222.201.145.27";
    nickname=usernameid;
    if(nickname!==""){
        Fromusername="guest";
        usernameid=nickname+Fromusername;
        userpass="guest";
    }
    prespass="";
    var openfireurl=window.location.protocol;
    if(openfireurl==="https:")
        adapter.connection = new Openfire.Connection("wss://"+serverIp+":7443/ws/server");
    else{
        adapter.connection = new Openfire.Connection("ws://"+serverIp+":7070/ws/server");    }

    adapter.connection.rawInput = function (data) {
        console.log('RECV: ' + data);
        try {
            var xmlStrDoc=null;
            xmlStrDoc=createXMLstrDoc(data);
            var iqnode=null;
            if(xmlStrDoc.documentElement.nodeName==="iq")
                iqnode=xmlStrDoc.documentElement;
            else
                return;
            iqArrary.push(iqnode);
            adapter.ParserXMPPString(iqnode);
            var iqnodeid=iqnode.getAttribute("id");
            console.log(selftruename);
            if(iqnodeid===null||iqnodeid===""||iqnodeid.indexOf(selftruename+"jcl_")===-1)
                parseIQnode(iqnode,iqArrary.length-1,false);
        }
        catch (e){
            alert(e);
        }
          // handleInputmsg(data);
    };
    adapter.connection.rawOutput = function (data) {
         console.log('SEND: ' + data);
    };
    adapter.connection.connect(Fromusername,userpass,onConnect);
    $("#logindlg").css("display","none");
}
/***
 *
 * @param status
 */
var onConnect=function(status) {
    if (status == Strophe.Status.CONNECTING) {
          // alert('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
          alert('Strophe failed to connect.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
        alert('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
        alert('Strophe is disconnected.');
        // $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
          // alert('Strophe is connected.');

        adapter.connectstatus = true;
        adapter.connection.addHandler(onMessage, null, 'message', null, null, null);
        adapter.connection.send($pres().tree());
        adapter.connection.send(sendiqagents(serverIp));

    }
}
/**
 * 获取消息时的方法
 * @param msg
 * @returns {Boolean}
 */
function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    var recSendTime=msg.getAttribute('date');
    var subject = msg.getElementsByTagName('subject')[0];
    var sizeItem = msg.getElementsByTagName('size')[0];
    var tmpfrom=from.slice(from.indexOf('/')+1);
    if(!recSendTime)
        recSendTime=new Date().toLocaleTimeString();

    if (type == "chat" && elems.length > 0) {
        var body = Strophe.getText(elems[0]);
        var size = Strophe.getText(sizeItem);
        
        log_othersmsg(tmpfrom,recSendTime, body);
        var subjectText = Strophe.getText(subject);
        if (subjectText!=""&&subjectText==='file') {
            var filename=elems[0].firstChild.nodeValue;
            var filetype=filename.slice(filename.lastIndexOf(".")+1);
            var jid =msg.getElementsByTagName("jid")[0].firstChild.nodeValue;
            var room=jid.slice(0,jid.indexOf("@"));
            var fileno=jid.slice(jid.indexOf(v5domain)+v5domain.length);
            var downloadfileurl=ServerHttp+room+"/"+fileno+"."+filetype;
            appendToDownloadList(null,size,tmpfrom,body,downloadfileurl);
        }

    }
    
    if(type==="groupchat"&&elems.length>0){
        var body =Strophe.getText(elems[0]);
        var subjectText = Strophe.getText(subject);
        var size = Strophe.getText(sizeItem);
        console.log(from);
        //如果from是裸JID的话就不予处理，只有在携带资源的JId才会进行处理
        if(from.indexOf('/')!==-1){
            console.log(adapter.selfRoomID);
            if(adapter.selfRoomID.indexOf(from.slice(from.indexOf('/') + 1))!==-1){
                log_myselfmsg(from.slice(from.indexOf('/') + 1)  ,recSendTime, body);
            }
            else{
                log_othersmsg(from.slice(from.indexOf('/') + 1)  ,recSendTime, body);
                if (subjectText!=""&&subjectText==="file") {
                    var filename=elems[0].firstChild.nodeValue;
                    var filetype=filename.slice(filename.lastIndexOf(".")+1);
                    var jid =msg.getElementsByTagName("jid")[0].firstChild.nodeValue;
                    var room=jid.slice(0,jid.indexOf("@"));
                    var fileno=jid.slice(jid.indexOf(v5domain)+v5domain.length);
                    var downloadfileurl=ServerHttp+room+"/"+fileno+"."+filetype;
                    appendToDownloadList(null,size,tmpfrom,body,downloadfileurl);
                }
            }



        }
    }
    var scrolldiv=document.getElementById("dlgbody");
    scrolldiv.scrollTop = scrolldiv.scrollHeight;
    return true;
}
/***
 *
 * @param IQMessage
 * @constructor
 */
adapter.ParserXMPPString=function(IQMessage) {

    try {
        var xmlnsVal;
        var query = IQMessage.getElementsByTagName("query")[0];
        xmlnsVal = query.getAttribute("xmlns");
        var querytype = query.getAttribute("type");

        if (xmlnsVal === "jabber:iq:agents") {

            var agentArr = query.getElementsByTagName("agent");
            var Iq=IQMessage.getAttribute('to');
            v5domain = Iq.slice(Iq.indexOf('@')+1,Iq.indexOf('/')+1);
            ServerHttp = agentArr[0].getAttribute("jid") + "upload/";
            ROOM_JID=ROOM_JID+"@"+agentArr[1].getAttribute("jid");
            adapter.imguploadurl = ServerHttp.replace(":80", ":18080/api");
            adapter.connection.send($pres().tree());
            adapter.connection.send($pres({
                to: ROOM_JID
            }).c('x', {xmlns: 'cellcom:conf:enter'}).tree());

            adapter.connection.send($iq({
                id: "jcl_121",
                type: "set",
                to: ROOM_JID
            }).c("query", {xmlns: "cellcom:conf:enter"}).c("password", "", prespass).up().c("nick", "", nickname).c("username", "", Fromusername).c("userpass", "", userpass).tree())
            
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
                    // $("#" + tmpid + "_ctlimg").css("background-image", "url('./images/u900_normal.png')");
                    // $("#" + tmpid + "_ctlimg").attr('isCtrling',true);

                }
                else {
                    // $("#" + tmpid + "_ctlimg").css("background-image", "url('./images/operater.png')");
                    // $("#" + tmpid + "_ctlimg").attr('isCtrling', true);
                }
                if(ctlname===selftruename)
                {
                    // $("#lineselect").removeAttr('disabled');
                    // $("#rectselect").removeAttr('disabled');
                    // $("#colorslt").removeAttr('disabled');
                }
                if(ctl==="controller"&&ctlname===selftruename)
                {
                    // UI.rfb.set_view_only(false);
                    adapter.isContrl=1;
                    // alert(adapter.isContrl);
                    // $("#whichpg").removeAttr('disabled');
                    // $("#nothingseceen").css("display","none");
                    // $("#coverwbtab").css("display","none");
                    // $("#wbcldpage").css("color","#000000");
                    // $("#wbtab").css("color","#000000");
                    // $("#startdsksharebtn").attr("disabled",false);
                    // $("#webviewct").css("color","#000000");
                    // $(".imgapplycontrl").css("background-image","url('./images/u793_normal.png')");
                    // $("#applycontrl").text("主控状态");
                    // $(".applycontrlmodule").css("backgroundColor","#FFCC00");
                }
                if(ctl==="operator"&&ctlname===selftruename)
                {
                    // UI.rfb.set_view_only(true);
                    // $("#whichpg").attr('disabled','true');
                    // $("#nothingseceen").css("display","none");
                    // $("#coverwbtab").css("display","block");
                    // $(".imgapplycontrl").css("background-image","url('./images/u793_normal.png')");
                    // $("#applycontrl").text("主控状态");
                    // $(".applycontrlmodule").css("backgroundColor","#FFCC00");
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
                    // UI.rfb.set_view_only(true);

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

                var mixmode=query.getElementsByTagName("mixmode")[0];

                this.selfRoomID=query.getElementsByTagName("id")[0].firstChild.nodeValue;
                selftruename=adapter.selfRoomID.slice(adapter.selfRoomID.indexOf("/")+1);
                tchname = selftruename.slice(0,selftruename.indexOf("("));
                $("#tchname p").html("教师:"+"<span>"+tchname+"<span>");
                //获取会议名
                this.presenceName=query.getElementsByTagName("topic")[0].firstChild.nodeValue;                
                return true;
            }


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
                    if(tmptag>=adapter.userrefArr.length)
                        adapter.userrefArr.push({"name":name,"id":tmptag});
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
            $("#memnum").text("成员("+adapter.confUsers.length+")");
            adduserTolist(adapter.confUsers);
            // this.OnConferenceUserChaned(this.confUsers);
            return true;
        }
        if (xmlnsVal==="cellcom:conf:visitor") {
            return true;
        }
        if (xmlnsVal==="cellcom:conf:multigroup") {
            return true;
        }
        if (xmlnsVal==="cellcom:wb:create") {
            var wb = query.getElementsByTagName("wb")[0];
            if (wb) {
                var id = wb.getAttribute("id");
                this.room_data = id;
                adapter.connection.send(sendQuerywbmsgxml());
            }
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
        if(querytype==="browseend"&&xmlnsVal==="cellcom:share:browse")
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
        
        if(xmlnsVal==="cellcom:file:transmit")
        {
            var fileObj = UploadPar.fileObj; // js 获取文件对象
            console.log(UploadPar.fileObj);
            var FileController=query.getElementsByTagName("uploadurl")[0].firstChild.nodeValue;
            UploadPar.location = query.getElementsByTagName("location")[0].firstChild.nodeValue;
            if(window.location.protocol!=='http:') {
                var repstr = FileController.slice(0, FileController.indexOf('/goform'));
                // FileController = FileController.replace(repstr, 'https://' + serverIp + ':6084');
            }
            // var FileController = 'https://www.vccellcom.com:6084/goform/HTTPUpload/';//query.getElementsByTagName("uploadurl")[0].firstChild.nodeValue;         // 接收上传文件的后台地址
            var clientJid=adapter.room_data;
            var filejid=query.getElementsByTagName("jid")[0].firstChild.nodeValue;
            UploadPar.filejid=filejid;
            var filesize=query.getElementsByTagName("size")[0].firstChild.nodeValue;
            var filename=query.getElementsByTagName("file")[0].firstChild.nodeValue;
            var filepath=query.getElementsByTagName("path")[0].firstChild.nodeValue;
            uploadList[filename]=filepath;
            // FormData 对象

            var form = new FormData();


            form.append("ClientJID", clientJid);                        // 可以增加表单数据
            form.append("FileJID", filejid);
            form.append("file", fileObj);                           // 文件对象
            form.append("EndProtect", "whoknows");

            $.ajax({
                url: FileController,
                type: 'post',
                data: form,
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                success:  function(data, textStatus) {
                    var tmpfrom = UploadPar.filejid.slice(UploadPar.filejid.indexOf("/")+1);
                    appendToDownloadList(UploadPar.location,filesize,"myself",filename);
                    UploadPar.ClearAll();
                    if(tmpfileuploadArr.length===$("#uploadcoursefile").children("li").length)
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
            // $.ajax({
            //     url: FileController ,
            //     type: 'post',
            //     data: form,
            //     async: true,
            //     cache: false,
            //     contentType: false,
            //     processData: false,
            //     success:  function(data, textStatus) {
            //         // addfiletras("up",tmpfileuploadArr,UploadPar.fileObj.name,UploadPar.fileObj.size,"上传文件");
            //         UploadPar.ClearAll();
            //         if(tmpfileuploadArr.length===$("#upload_usrlist_ul").children("li").length)
            //             adapter.connection.send(senduploadcplmsg(ROOM_JID,"groupchat",filename,filesize,filejid));
            //         else
            //         {
            //             for(var i=0;i<tmpfileuploadArr.length;i++)
            //             {
            //                 adapter.connection.send(senduploadcplmsg(ROOM_JID+"/"+tmpfileuploadArr[i],"chat",filename,filesize,filejid));
            //             }
            //         }

            //         //完成后调用回复xml的函数
            //     },
            //     error:function(XMLHttpRequest, textStatus, errorThrown){
            //         console.log("upload failed:"+errorThrown);
            //     }

            // });

        }
        if(xmlnsVal==="cellcom:mm:create"){
            var  from=IQMessage.getAttribute("from");
            var conferenceID=from.slice(0,from.indexOf("@"));
            if (nickname==="manager") {
                console.log(nickname);
                adapter.connection.send(sendTransportxmlstr());
            }
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
                // videoUrl = "wss://"+"www.vccellcom.com"+":8085";
                // audioUrl ="wss://www.vccellcom.com:8084";
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

                // $("#canvas_src_div").mouseover(function(){
                //     $("#status_src").css("display","block");
                // });
                // $("#canvas_src_div").mouseout(function(){
                //     $("#status_src").css("display","none");
                // });
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
    }catch (e){
        alert(e.message);
    }
}

/**
 * init
 */
var init=function( ){
    myconnect();
    tab_userdlg("dlg_headct","selected");
    tabmodule("fun_module","selectedmod");
    tabmodule("ul_dlg","selecteddlg");
    tabmodeleQ("camera_choose","selectedQ");
    tab("wbtab_ul","selectwb");
    // dlgswitchctl();
    initwbtools();
    //开始上课事件
    $("#class_start").on("click",function(){
        // 开始上课功能有待实现＊＊＊＊＊＊＊
        // 打开摄像头
        // 打开声音
        //数据权限控制申请
        applycontrol();
        $(this).css({
            "background-image": 'url(./images/u258.png)'
        }); 
        $(this).attr('disabled', 'disabled');
        $("#class_break").css({
            "background-image": 'url(./images/u256.png)'
        }); 
        $("#class_break").removeAttr('disabled');
        $("#class_end").css({
            "background-image": 'url(./images/u256.png)'
        }); 
        $("#class_end").removeAttr('disabled');
        if(!isuploadv)
        {
            adapter.channelEnterRoom.setVideosrc(document.getElementById("videosrc"));
            adapter.channelEnterRoom.setCanvassrc(document.getElementById("canvas_src"));
            adapter.channelEnterRoom.setVPublishStatus(true);
            adapter.connection.send(sendCapabilityXMLStr('enable'));
            // $(this).text("关闭视频");


            isuploadv=true;
        }
        


    });
    //课间休息事件
    $("#class_break").on("click",function(){
        // 课间休息事件功能有待实现＊＊＊＊＊＊＊＊
        // 关闭摄像头
        // 关闭声音
        //数据权限控制申请
        applycontrol();
        $(this).css({
            "background-image": 'url(./images/u258.png)'
        }); 
        $(this).attr("disabled","disabled");
        $("#class_start").css({
            "background-image": 'url(./images/u256.png)'
        }); 
        $("#class_start").removeAttr('disabled');
        $("#class_end").css({
            "background-image": 'url(./images/u256.png)'
        }); 
        $("#class_end").removeAttr('disabled');
        if (isuploadv){
            $("#canvas_src_div").css("display","none");
            var ctx=document.getElementById('canvas_src').getContext('2d');
            $("#"+selftruenameid+"_user").css("background","#B5E1F6");
            $("#"+selftruenameid+"_user").children('p').eq(0).attr("isshowV",false);
            ctx.clearRect(0,0,2000,2000);
            adapter.channelEnterRoom.setVPublishStatus(false);
            adapter.connection.send(sendCapabilityXMLStr('disable'));
            isuploadv=false;
        }

    });
    $("#class_end").on("click",function(){
        // 关闭摄像头
        // 关闭声音
        if(adapter.isContrl===1||adapter.isContrl===2)
        {
            adapter.connection.send(sendCtlstopxml());
        }
        $(this).css({
            "background-image": 'url(./images/u258.png)'
        }); 
        $(this).attr("disabled","disabled");
        $("#class_start").css({
            "background-image": 'url(./images/u256.png)'
        }); 
        $("#class_start").attr("disabled","disabled");
        $("#class_break").css({
            "background-image": 'url(./images/u258.png)'
        }); 
        $("#class_break").attr("disabled","disabled");
        if (isuploadv){
            $("#canvas_src_div").css("display","none");
            var ctx=document.getElementById('canvas_src').getContext('2d');
            $("#"+selftruenameid+"_user").css("background","#B5E1F6");
            $("#"+selftruenameid+"_user").children('p').eq(0).attr("isshowV",false);
            ctx.clearRect(0,0,2000,2000);
            adapter.channelEnterRoom.setVPublishStatus(false);
            adapter.connection.send(sendCapabilityXMLStr('disable'));
            isuploadv=false;
        }
    })
    //发送聊天消息事件
    $("#sendmsg").on("click", function () {
        if($("#textval").val()!=='')
        // sendmessage( "",$("#textval").val());
        sendmessage();
        $("#textval").val("");
    })
    document.getElementById("textval").onkeydown = function (e) {
        e = e || window.event;
        ctl_entersendmsg(e);
    }
    // 点击已上传的课件进行共享
    $("#uploadFiles").click(function(event) {
        target = event.target;
        if(target.nodeName.toLowerCase()==="li"){
            adapter.connection.send(sendCreatewbxml(target.innerHTML));
        }
    });
    
    //麦克风增强事件
    $(".micro_str").on("click",function(){
        $(this).css({"background-color":"#787878","color":"#F0F0F0"});
        $(".reduce_echo").css({"background-color":"#F0F0F0","color":"#000000"});
        // 麦克风增强的功能有待实现＊＊＊＊＊＊＊＊
    });
    //回音降低事件
    $(".reduce_echo").on("click",function(){
        // 被点击后样式切换
        $(this).css({"background-color":"#787878","color":"#F0F0F0"});
        $(".micro_str").css({"background-color":"#F0F0F0","color":"#000000"});
        // 回音降低事件功能有待实现＊＊＊＊＊＊＊
    });
    //服务器测速事件
    $(".speed_test>p").on("click",function(){
        // 服务器测速事件功能有待实现＊＊＊＊＊＊＊
    });
    //摄像头直播事件
    $("#start_camera").on("click",function(){
        if($("#cover_div").is(":visible")){
            $("#cover_div").css("display", "none");
            // 不理解这里是做什么用的？是显示摄像头的内容吗
        }else {
            $("#cover_div").css("display", "block");
        }

    });
    //音频直播事件
    $("#voice_rtview >div").on("click",function(){
        // 音频直播代表的又是什么？想要完成什么功能？
    });
    //vnc桌面视频直播事件
    $("#vncview> div").on("click",function(){
        // 这个应该是显示桌面的内容，比如说将电子白板的内容显示出来，
        // 这个是直接从本地获取比较好还是从服务器请求得到的结果，应该有响应的库可以实现录制本地视频
        // 这些不用实现桌面视频文件的录制功能吗？
    });
    //隐藏聊天事件
    $("#hidedlg").on("click",function(){
        if( $(this).children("p").text()===">") {
            $("#right_ct").css("display", "none");
            $("#center_ct").css("width", "97%");
            $(this).children("p").text("<");
        }else{
            $("#right_ct").css("display", "block");
            $("#center_ct").css("width", "75%");
            $(this).children("p").text(">");
        }
    })

}

/**
 * tabmodule
 * @param tabid
 * @param activeid
 */
var tab_userdlg=function(tabid,activeid){
    $("#"+tabid).delegate("div:not(#"+activeid+")","click",function(){
        $("#"+$("#"+activeid).attr("tar")).css("display","none");
        $("#"+activeid).removeAttr("id");
        $(this).attr("id",activeid);
        $("#"+$(this).attr("tar")).css("display","block");
        if($(this).attr("tar")==="dlgbody"){
            $(this).children("img").attr("src","./images/u20.png");
            $(this).siblings().children("img").attr("src","./images/u24.png");

        }else{
            $(this).children("img").attr("src","./images/u79.png");
            $(this).siblings().children("img").attr("src","./images/u45.png");

        }

    });
};
/**
 * 初始化的时候首先显示功能列表中课件的内容，监听功能列表中的变化，将响应的内容进行显示和隐藏切换
 * @param tabId
 * @param activeId
 */

var tabmodule=function(tabId,activeId){
    $("#"+tabId).delegate("li:not(#"+activeId+")","click",function(){
        $("#"+$("#"+activeId).attr("tar")).css("display","none");
        $("#"+activeId).removeAttr("id");
        $(this).attr("id",activeId);
        $("#"+$(this).attr("tar")).css("display","block");
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

                $("#canvas_tools").css("display","block");
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
                        ctx = document.getElementById(tmppageid).children[1].getContext("2d");
                        ctxeffect = document.getElementById(tmppageid).children[2].getContext("2d");
                    }
                }else{
                    if($("#"+pageid).length) {
                        ctx = document.getElementById(pageid).children[1].getContext("2d");
                        ctxeffect = document.getElementById(pageid).children[2].getContext("2d");
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
                $("#canvas_tools").css("display","none");
                $("#"+$(this).attr("tar")).css("display","block");
            }


        }
    });

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

var tabmodeleQ=function(tabId,activeId){
    $("#"+tabId).delegate("div:not(#"+activeId+")","click",function(){
        $("#"+activeId).removeAttr("id");
        $(this).attr("id",activeId);
        if($(this).attr("tar")==="okq"){

        }
        if($(this).attr("tar")==="goodq"){

        }
        if($(this).attr("tar")==="highq"){

        }

    });

}
// /**
//  * sendmessage
//  * @param user
//  * @param msg
//  */
// var sendmessage=function(user,msg) {
//     var time = new Date().toLocaleTimeString();
//     if (user === "") {
//         var reply = $msg({to: ROOM_JID, type: 'groupchat', date: time}).cnode(Strophe.xmlElement('body', ''
//         , msg));
//         adapter.connection.send(reply.tree());
//     }else{
//         var reply = $msg({to: ROOM_JID, type: 'chat', date: time}).cnode(Strophe.xmlElement('body', ''
//             , msg));
//         adapter.connection.send(reply.tree());
//         log_myselfmsg(user,time,msg);
//     }
// }

/**
 * click button send msg
 **/
var sendmessage=function(){
    var tojid;
    if($("#selecteddlg").attr("tar")==="groupdlg"){
        tojid=ROOM_JID;
    }
    else
    {

        tojid=$("#selecteddlg").attr("nametag");
        tojid=ROOM_JID+"/"+tojid;
    }
    msg=$('#textval').val();
    sendMsg(tojid,msg);

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
        $("#"+user).append('p').append('<span style="color:#007FFF" class="myselfmsg">'+timename+'</span><br/>'+msg);

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

            log_usersendmsg($("#selecteddlg").attr("tar"),'我 '+sendTime, msg);
            var scrolldiv=document.getElementById($("#selecteddlg").attr("tar"));
            scrolldiv.scrollTop = 999;
        }
        adapter.connection.send(reply.tree());

        document.getElementById("textval").value='';
        var scrolldiv=document.getElementById("dlgbody");
        scrolldiv.scrollTop = scrolldiv.scrollHeight;

    }
}

/**
 * log_message
 * @param user
 * @param msg
 */
var log_othersmsg=function(user,time,msg){
    var msgp=document.createElement("p");
    msgp.setAttribute("tar",user);
    var span_user=document.createElement("span");
    span_user.setAttribute("class","othersmsg");
    span_user.innerHTML=user.slice(0,user.indexOf("("));
    msgp.appendChild(span_user);
    msgp.appendChild(document.createTextNode(time));
    msgp.appendChild(document.createElement('br'));
    msgp.appendChild(document.createTextNode(msg));
    // $("#dlgbody").append(msgp);
    $("#"+$("#selecteddlg").attr("tar")).append(msgp);
  //  $("#dlgbody").append('<p tar="'+user+'"><span class="othersmsg">'+user+'</span>'+time+'<br/>'+msg+'</p>');

    var tctldiv=document.createElement("div");
    tctldiv.setAttribute("class","tcldiv_cls");
    var  firstrowdiv=document.createElement("div");
    var  secondrowdiv=document.createElement("div");
    secondrowdiv.setAttribute("class","sencondrowcls")
    var userp=document.createElement("p");
    userp.innerHTML=user;
    $(userp).css({"margin":"auto","padding":"3px 0 0 3px","cursor":"default","color":"rgb(93, 176, 40)"});
    var  spkimg=document.createElement('img');
    spkimg.src='./images/33.png';
    $(spkimg).css({"float":"right","cursor":"pointer","margin":"0 2px 0 2px"});
    var  cmrimg=document.createElement('img');
    cmrimg.src='./images/11.png';
    $(cmrimg).css({"float":"right","cursor":"pointer","margin":"0 2px 0 2px"});
    var spktop=document.createElement("p");
    spktop.innerHTML="对他说";
    $(spktop).css({"width":"57px","height":"88%","cursor":"pointer", "text-align":"center","padding":"3px 0 0 0","color":"#000000","border-right":"1px solid #A0A0A0"});
    var nospkp=document.createElement("p");
    nospkp.innerHTML="禁言";
    $(nospkp).css({"width":"43px","height":"88%","cursor":"pointer","text-align":"center","padding":"3px 0 0 0","color":"#000000","border-right":"1px solid #A0A0A0"});
    var cancelp=document.createElement("p");
    cancelp.innerHTML="取消";
    $(cancelp).css({"width":"43px","height":"88%","cursor":"pointer","text-align":"center","padding":"3px 0 0 0","color":"#000000"});

    $(firstrowdiv).append(userp,cmrimg,spkimg);
    $(firstrowdiv).css({"width":"100%","height":"50%","border-bottom":"1px solid #A0A0A0"});
    $(secondrowdiv).append(spktop,nospkp,cancelp);
    $(secondrowdiv).css({"width":"100%","height":"50%"});
    $(tctldiv).append(firstrowdiv,secondrowdiv);
    span_user.appendChild(tctldiv);
    span_user.onclick=function(e){
        $(tctldiv).show();
        $(document).one("click", function()
        {
            $(tctldiv).hide();
        });
        e.stopPropagation();
    };
    spkimg.onclick=function(e){
        console.log("speek to "+$(msgp).attr("tar"));
        $(this).parent().parent().hide();
        e.stopPropagation();
    };
    cmrimg.onclick=function(e){
        console.log("camera to "+$(msgp).attr("tar"));
        $(this).parent().parent().hide();
        e.stopPropagation();
    };
    spktop.onclick=function(e){
        console.log("say to "+$(msgp).attr("tar"));
        $("#textval").val("@"+$(msgp).attr("tar")+":");
        $("#textval").focus();
        $(this).parent().parent().hide();
        e.stopPropagation();
    };
    nospkp.onclick=function(e){
        console.log("pause say to "+$(msgp).attr("tar"));
        $(this).parent().parent().hide();
        e.stopPropagation();
    };
    cancelp.onclick=function(e){
        $(tctldiv).hide();
        e.stopPropagation();
    };

}

var log_myselfmsg=function(user,time,msg){
    user=user.slice(0, user.indexOf("("));
    $("#"+$("#selecteddlg").attr("tar")).append('<p><span class="myselfmsg">'+user+'</span>'+time+'<br/>'+msg+'</p>');
}
/**
 * ctl_entersendmsg
 * @param e
 */
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
    if(e.ctrlKey && e.keyCode == 13){
        if($("#textval").val()!=='')
        sendMsg(tojid,$('#textval').val());
        $("#textval").val("");
    }

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
        var img1 = document.createElement("img");
        img1.src='images/1111b.png';
        div.append(img1);
        p.innerHTML=name.slice(0, name.indexOf("("));
        var img=document.createElement("img");
        img.src='images/u650_normal.png';
        img.setAttribute("deldlgtabid",title+"_li")
        img.setAttribute("deldlgct",title);
        img.onclick=function(){
            $("."+$(this).attr("deldlgtabid")).remove();
            $("#"+$(this).attr("deldlgct")).remove();
            var len=document.getElementById("ul_dlg").children.length;
            document.getElementById("ul_dlg").children[len-1].click();
        };
        li.appendChild(div);
        li.appendChild(p);
        li.appendChild(img);
        $('#dlg_ctlct').find("ul").append(li);
        $('#dlgbody').find("ul").append("<li  id='"+title+"'style='display:none'></li>");
        li.click();
    }
}
/**
 * dlgswitchctl
 */
// var dlgswitchctl= function () {
//     var div2=document.getElementById("switch_status");
//     var div1=document.getElementById("switch_ct");
//     div1.onclick=function(){
//         div1.className=(div1.className=="close1")?"open1":"close1";
//         div2.className=(div2.className=="close2")?"open2":"close2";
//         if(div2.className==="open2") {
//             $("#switch_ct p").html("开");
//             $("#switch_ct p").css({"left":"0px","right":"auto"});
//         }
//         else{
//             $("#switch_ct p").html("关");
//             $("#switch_ct p").css({"left":"auto","right":"0px"});
//         }
//     }
// }


var addwbpage=function(tit,pgjid,width,height,pagenum,pageno,docval){
    var x,y,deletex,deletey,offsetdifX,offsetdifY;
    var AllImgExt=".jpg|.jpeg|.gif|.bmp|.png|";
    var AllPptExt=".ppt|.pptx";
    var filetype=docval.slice(docval.lastIndexOf('.')).toLowerCase();

    if(docval==="wbSharing"||!docval) {
        wbpagei++;
        $('#wbtab_ul').append("<li  tar='" + tit + "'>电子白板" + wbpagei + "<img src='images/u650_normal.png'/></li>");
    }
    else
        $('#wbtab_ul').append("<li  tar='"+tit+"'>"+docval+"<img src='images/u650_normal.png'/></li>");

    if(document.getElementById(tit)===null){
        var wbpageulwidth=$("#wbpage_ul").width();
        var wbpageulheight=$("#wbpage_ul").height();
        var canvasmarginleft=0,canvasmargintop=0;
        if(wbpageulwidth>800)
            canvasmarginleft=(wbpageulwidth-800)/2;
        if(wbpageulheight>600)

        canvasmargintop=(wbpageulheight-600)/2;
        $("#wbpage_ul").append("<li id='"+tit+"' class='canvasmargin' title='"+tit+
        "' style='background:#FFFFFF; clear:both;width:"+width+"px;height:"+height+
        "px' scaletag='1',isdownloadok='false' ></li>");
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
        
        $(".canvasmargin").css({"margin-left":canvasmarginleft,"margin-top":canvasmargintop});
        $("#canvas_tools").css("display","block");
    
        $("#wbtab_ul").children().last().children().last().attr("deltar",tit);
        $("#wbtab_ul").children().last().children().last().on("click",function(){
            removemem($(this).attr("deltar"));
            adapter.connection.send(sendendwbxml(pgjid,$(this).attr("deltar")));
        });
        if(AllImgExt.indexOf(filetype)===-1&&docval!=='wbSharing'){
            var ul=document.createElement("ul");
            $(ul).css({"width":"100%","height":"100%","margin":"0px","padding":"0px"});
            $("#"+tit).append(ul);
            $("#"+tit).attr("singlepg","false");
            $("#"+tit).attr("docval",docval);
        }else{
            $("#"+tit).append(canvas0,canvas1,canvas2);
            ctx=document.getElementById(tit).children[1].getContext("2d");
            ctxeffect=document.getElementById(tit).children[2].getContext("2d");
            $("#"+tit).attr("docval",docval);
            addlistentowbcanvas(tit);
        }

    }
    $("#canvas_tools").css("display","block");
    $("#"+tit).attr("pagenum",pagenum);
    $("#"+tit).attr("pageno",pageno);
    $("#whichpg").val(parseInt(pageno)+1+'/'+pagenum);
    $("#wbtab_ul").children().last().click();
    if(adapter.isaddpictowb){
        var bgimgctx=document.getElementById($("#selectwb").attr("tar")).children[0].getContext("2d");
        adapter.isaddpictowb=false;
        drawImages(bgimgctx,adapter.dlgimgurl,adapter.orimageW,adapter.orimageH);

    }
}

/**
 *initlinestyle
 */
var initlinestyle=function(obj){
    ctx.lineWidth=1;
    if(lineselectischeck)
    {
        adapter.drawtype=obj.value;
        var index=obj.selectedIndex;
        ctx.lineWidth=obj.options[index].attributes["linewidth"].nodeValue;
    }
    if(rectselectischeck)
    {
        adapter.drawtype=document.getElementById("rectselect").value;
        var index=document.getElementById("rectselect").selectedIndex;
        ctx.lineWidth=document.getElementById("rectselect").options[index].attributes["linewidth"].nodeValue;

    }
    if(wordischecked)
        adapter.drawtype="text";
    if(selectischeck)
        adapter.drawtype="select";
    if(deleteischeck)
        adapter.drawtype="delete";
    ctx.lineCap="round";
    ctx.strokeStyle=document.getElementById("colorslt").value;//replaceRB(strToHex(document.getElementById("colorslectct").value));
    if(adapter.drawtype=="fluorepen")
        ctx.strokeStyle="rgba(172,254,172,0.7)";
    ctx.fillStyle=document.getElementById("colorslt").value;//replaceRB(strToHex(document.getElementById("colorslectct").value));

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


/*    $(fontTip).mousemove(function(e) {
        if(drawdownflag)
        {
            var tmpdelx=offsetdifX+deletex;
            var tmpdely=offsetdifY+deletey;
            fontTip.css({left:tmpdelx,top:tmpdely});
            var offset=$("#wbpage").offset();
            fontTip.width(e.pageX-offset.left-deletex);
            fontTip.height(e.pageY-offset.top-deletey);
        }
    });*/

    $(adapter.fontTip).mouseup(function() {
        // adapter.fontTip.attr('disabled', 'false');
        adapter.flag=false;
        adapter.fontTip.focus();
    });
    adapter.fontTip.blur(ctldrawWords);

    $("#new_newpg").on("click",function(){

        adapter.connection.send(sendCreatewbxml());
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
        console.log(adapter.isContrl);
        if(pagenum>1&&pagenum>pageno&&adapter.isContrl===1&&pagenum!==1001){
            $("#whichpg").val((pageno+1)+'/'+pagenum);
            adapter.connection.send( sendChangepagexml(adapter.pagejid,pagenum,pageno));
        }
    });

    $("#select").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#newword").removeAttr("class");
        $("#rectselect").removeAttr("class");
        selectischeck=true;
        lineselectischeck=false;
        wordischecked=false;
        deleteischeck=false;
        rectselectischeck=false;
    });
    $("#deleteele").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#select").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#newword").removeAttr("class");
        $("#rectselect").removeAttr("class");
        selectischeck=false;
        lineselectischeck=false;
        wordischecked=false;
        deleteischeck=true;
        rectselectischeck=false;
    });
    $("#lineselect").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#select").removeAttr("class");
        $("#newword").removeAttr("class");
        $("#rectselect").removeAttr("class");
        selectischeck=false;
        lineselectischeck=true;
        wordischecked=false;
        deleteischeck=false;
        rectselectischeck=false;
    });
    $("#newword").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#select").removeAttr("class");
        $("#rectselect").removeAttr("class");
        selectischeck=false;
        lineselectischeck=false;
        wordischecked=true;
        deleteischeck=false;
        rectselectischeck=false;
    });
    $("#rectselect").on("click",function(){
        $(this).attr("class","onclickstate");
        $("#deleteele").removeAttr("class");
        $("#lineselect").removeAttr("class");
        $("#select").removeAttr("class");
        $("#newword").removeAttr("class");
        selectischeck=false;
        lineselectischeck=false;
        wordischecked=false;
        deleteischeck=false;
        rectselectischeck=true;

    });
    /* $("#showcolor").on("click",function(){

     });*/


}

/**
 *ctldrawline
 */
var ctldrawline=function(x,y,dtx,dty){
    ctxeffect.clearRect(0,0,2000,2000);
    ctx.beginPath();
    x=x-0.5;
    y=y-0.5;
    dtx=dtx-0.5;
    dty=dty-0.5;
    if(ctx.lineWidth>1)
    {
        ctx.moveTo(x,y);
        ctx.lineTo(dtx,dty);
    }
    else{
        ctx.moveTo(x,y);
        ctx.lineTo(dtx,dty);
    }
    ctx.stroke();
    ctx.closePath();

}
/**
 *ctldrawlineEffect
 */
var ctldrawlineEffect=function(x,y,dtx,dty,drawdownflag)
{
    if(drawdownflag){
        ctxeffect.clearRect(0,0,2000,2000);

        ctxeffect.beginPath();
        x=x-0.5;
        y=y-0.5;
        dtx=dtx-0.5;
        dty=dty-0.5;
        if(ctxeffect.lineWidth>1)
        {
            ctxeffect.moveTo(x,y);
            ctxeffect.lineTo(dtx,dty);
        }
        else{
            ctxeffect.moveTo(x,y);
            ctxeffect.lineTo(dtx,dty);
        }
        ctxeffect.stroke();
        ctxeffect.closePath();
    }
}
/**
 *ctldrawRect
 */
var ctldrawRect=function(x,y,dtx,dty)
{
    ctxeffect.clearRect(0,0,2000,2000);
    var w=Math.abs(dtx-x);
    var h=Math.abs(dty-y);
    if(parseInt(x)>parseInt(dtx)) x=dtx;
    if(parseInt(y)>parseInt(dty)) y=dty;
    ctx.beginPath();


    ctx.strokeRect(x-0.5,y-0.5,w,h);
    ctx.closePath();


}
/**
 *ctldrawRectEffect
 */
var ctldrawRectEffect=function(x,y,dtx,dty,drawdownflag)
{
    if(drawdownflag){
        ctxeffect.clearRect(0,0,2000,2000);
        var w=Math.abs(dtx-x);
        var h=Math.abs(dty-y);
        if(parseInt(x)>parseInt(dtx)) x=dtx;
        if(parseInt(y)>parseInt(dty)) y=dty;
        ctxeffect.beginPath();

        ctxeffect.strokeRect(x-0.5,y-0.5,w,h);
        ctxeffect.closePath();
    }
}
/**
 *ctldrawThinfreeline
 */
var ctldrawThinfreeline=function(x,y,drawdownflag)
{

    if(drawdownflag){


        if(ctx.lineWidth>1)
            ctx.lineTo(x,y);
        else
            ctx.lineTo(x,y);
        ctx.stroke();
    }

}
/**
 *drawround
 */
var ctldrawRound=function(x,y,dtx,dty){
    ctxeffect.clearRect(0,0,2000,2000);
    ctx.save();
    ctx.beginPath();
    var x0=(parseInt(dtx)+parseInt(x))/2;
    var y0=(parseInt(dty)+parseInt(y))/2;
    var w=Math.abs(dtx-x)/2;
    var h=Math.abs(dty-y)/2;
    var r = (w > h)? w : h;
    var ratioX = w / r; //横轴缩放比率
    var ratioY = h / r; //纵轴缩放比率
    ctx.scale(ratioX, ratioY); //进行缩放（均匀压缩）
//从椭圆的左端点开始逆时针绘制
    ctx.moveTo((x0 + w) / ratioX , y0 / ratioY);
    ctx.arc(x0 / ratioX, y0 / ratioY, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

}
/**
 *drawroundEffect
 */
var drawRoundEffect=function(x,y,dtx,dty,drawdownflag){

    if(drawdownflag)
    {
        ctxeffect.clearRect(0,0,2000,2000);
        ctxeffect.beginPath();
        ctxeffect.save();
        var x0=(parseInt(dtx)+parseInt(x))/2;
        var y0=(parseInt(dty)+parseInt(y))/2;
        var w=Math.abs(dtx-x)/2;
        var h=Math.abs(dty-y)/2;
        var r = (w > h)? w : h;
        var ratioX = w / r; //横轴缩放比率
        var ratioY = h / r; //纵轴缩放比率
        ctxeffect.scale(ratioX, ratioY); //进行缩放（均匀压缩）
//从椭圆的左端点开始逆时针绘制
        ctxeffect.moveTo((x0 + w) / ratioX , y0 / ratioY);
        ctxeffect.arc(x0 / ratioX, y0 / ratioY, r, 0, 2 * Math.PI);
        ctxeffect.stroke();
        ctxeffect.restore();
        ctxeffect.closePath();

    }

}
/**
 *ctldrawdashrectEffect
 */
var ctldrawdashrectEffect=function(x,y,dtx,dty) {
    if(adapter.flag)
    {
        ctxeffect.strokeStyle="#000000";
        ctxeffect.clearRect(0,0,2000,2000);
        var w=Math.abs(dtx-x);
        var h=Math.abs(dty-y);
        if(parseInt(x)>parseInt(dtx)) x=dtx;
        if(parseInt(y)>parseInt(dty)) y=dty;
        ctxeffect.beginPath();
        ctxeffect.dashedLineTo(x-0.5,y-0.5,x+w-0.5,y-0.5);
        ctxeffect.dashedLineTo(x+w-0.5,y-0.5,x+w-0.5,y+h-0.5);
        ctxeffect.dashedLineTo(x+w-0.5,y+h-0.5,x-0.5,y+h-0.5);
        ctxeffect.dashedLineTo(x-0.5,y+h-0.5,x-0.5,y-0.5);

        ctxeffect.closePath();

    }

}
/**
 *ctldrawRoundrect
 */
var ctldrawRoundrect=function(x,y,dtx,dty){
    ctxeffect.clearRect(0,0,2000,2000);
    var w=Math.abs(dtx-x);
    var h=Math.abs(dty-y);
    if(parseInt(x)>parseInt(dtx)) x=dtx;
    if(parseInt(y)>parseInt(dty)) y=dty;
    var x0=parseInt(x)-0.5;
    var y0=parseInt(y)-0.5;
// var r = w / 2;
    var r = 25;
    if (w <2 * r) r = w / 3;
    if (h < 2 * r) r = h / 3;
    ctx.beginPath();
    ctx.moveTo(x0+r, y0);
    ctx.arcTo(x0+w, y0, x0+w, y0+h, r);
    ctx.arcTo(x0+w, y0+h, x0, y0+h, r);
    ctx.arcTo(x0, y0+h, x0, y0, r);
    ctx.arcTo(x0, y0, x0+w, y0, r);
    ctx.stroke();
    ctx.closePath();

}
/**
 *ctldrawRoundrecteEffect
 */
var ctldrawRoundrecteEffect=function(x,y,dtx,dty,drawdownflag){
    if(drawdownflag){

        ctxeffect.clearRect(0,0,2000,2000);
        var w=Math.abs(dtx-x);
        var h=Math.abs(dty-y);
        if(parseInt(x)>parseInt(dtx)) x=dtx;
        if(parseInt(y)>parseInt(dty)) y=dty;
        var x0=parseInt(x)-0.5;
        var y0=parseInt(y)-0.5;
// var r = w / 2;
        var r = 25;
        if (w <2 * r) r = w / 3;
        if (h < 2 * r) r = h / 3;
        ctxeffect.beginPath();
        ctxeffect.moveTo(x0+r, y0);
        ctxeffect.arcTo(x0+w, y0, x0+w, y0+h, r);
        ctxeffect.arcTo(x0+w, y0+h, x0, y0+h, r);
        ctxeffect.arcTo(x0, y0+h, x0, y0, r);
        ctxeffect.arcTo(x0, y0, x0+w, y0, r);
        ctxeffect.stroke();
        ctxeffect.closePath();
    }


}
/**
 *ctldrawfluorepen
 */
var ctldrawfluorepen=function(x,y,drawdownflag){

    if(drawdownflag)
    {
//11cd0c
        ctx.lineTo(x,y);
        ctx.stroke();
    }

}
/**
 *插入字体输入框
 */
function fakeWordsInput(offsetdifX,offsetdifY,x,y,dtx,dty,flag,down)
{

    if(flag)
    {
        var tmpx=x+offsetdifX*1;
        var tmpy=y+offsetdifY*1;
        adapter.fontTip.show();
        adapter.fontTip.css({left:tmpx,top:tmpy});
        // console.log(adapter.fontTip);
        
        if(down){
            adapter.fontTip.width(60);
            adapter.fontTip.height(30);
            console.log(adapter.fontTip.width());
            console.log(adapter.fontTip.height());
        }
        else {
            adapter.fontTip.width(dtx - x - 8);
            adapter.fontTip.height(dty - y - 8);
        }
        
    }
}
/**
 *插入字体输入框
 */
// function fakeWordsInput(offsetx,offsety,x,y,dtx,dty,flag,down)
// {

//     console.log(flag);
//     if(flag)
//     {
//         var tmpx=x+offsetx*1;
//         var tmpy=y+offsety*1;
//         adapter.fontTipposx=tmpx;
//         adapter.fontTipposy=tmpy;
//         adapter.fontTip.show();
//         adapter.fontTip.css({left:tmpx,top:tmpy});
//         if(down){
//             adapter.fontTip.width(60);
//             adapter.fontTip.height(30);}
//         else {
//             adapter.fontTip.width(dtx - x - 8);
//             adapter.fontTip.height(dty - y - 8);
//         }
//     }
// }

/**
 *drawWords
 */
// function ctldrawWords(){
//     var words = adapter.fontTip.val();
//     if(	adapter.fontTip.css("display")!= "none" && words )
//     {

//         var offset = $("#wb1").first().offset();
//         var offset2 = adapter.fontTip.offset();
//         var fontSize = 20;
//         ctx.font="26px Verdana";

// //adapter.ctx.fillText(words,offset2.left-offset.left,(offset2.top-offset.top+fontSize*1));
//         ctx.fillText(words,offset2.left-offset.left,(offset2.top-offset.top+fontSize*1));
//         pointArr.push({"x":parseInt(offset2.left-offset.left),"y":parseInt(offset2.top-offset.top-fontSize*0.2)})

//         adapter.fontTip.val("");
//     }
//     adapter.fontTip.width(60);
//     adapter.fontTip.height(30);
//     adapter.fontTip.hide();
//    // if(words!=="")
//      //   connection.send(sendlinexml(pointArr,drawtype,pagejid,ctx.lineWidth,words));
// }

/**
 *drawWords
 */
function ctldrawWords(){
    var words = adapter.fontTip.val();

    if( adapter.fontTip.css("display")!= "none" && words )
    {
        var slectwbObj=$("#"+$("#selectwb").attr("tar"));
        var scaleratex=slectwbObj.first().attr("scaleratex");
        var scaleratey=slectwbObj.first().attr("scaleratey");
        var csscaletag=parseFloat(slectwbObj.attr("scaletag"));
        var offset = $("#"+$("#selectwb").attr("tar")).offset();
        var offset2 = adapter.fontTip.offset();
        var fontSize = 14;
        ctx.save();
        ctx.scale(1/csscaletag,1/csscaletag);
       // adapter.ctx.lineWidth= adapter.ctx.lineWidth*csscaletag;
        ctx.font=parseFloat(26*csscaletag)+"px Verdana";

        if(scaleratex)
            ctx.font=parseFloat(26/scaleratex*csscaletag)+"px Verdana";
//adapter.ctx.fillText(words,offset2.left-offset.left,(offset2.top-offset.top+fontSize*1));

        ctx.fillText(words,offset2.left-offset.left,(offset2.top-offset.top+fontSize*1));



        if(scaleratex)
            adapter.pointArr.push({"x":parseInt((offset2.left-offset.left)*scaleratex/csscaletag),"y":parseInt((offset2.top-offset.top-fontSize*0.06)*scaleratey/csscaletag)});
        else
            adapter.pointArr.push({"x":parseInt((offset2.left-offset.left)/csscaletag),"y":parseInt((offset2.top-offset.top )/csscaletag-fontSize*0.9)});

        adapter.fontTip.val("");
        ctx.restore();
        console.log('restore!!draw word!!!');
    }

    adapter.fontTip.width(60);
    adapter.fontTip.height(30);
    adapter.fontTip.hide();
    if(words!=="")
        adapter.connection.send(sendlinexml(adapter.pointArr,adapter.drawtype,adapter.pagejid,ctx.lineWidth,words));
}

/**
 *参会用户列表更新
 **/
var adduserTolist=function(userArr){
    for(var i=userArr.length-1;i>=0;i--){
        if(userArr[i]===null)
            continue;
        var tmpusername=userArr[i].name;
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
            // dlgtodiv.setAttribute("canspk","true");
            dlgtodiv.setAttribute("tagid",tmpid);
            dlgtodiv.setAttribute("username",userArr[i].name);
            li.setAttribute("id",id);
            var personnick = document.createElement("div");
            personnick.setAttribute("class","imgfrom");
            personnick.setAttribute("id",tmpid+"_img");
            var cameradiv=document.createElement("div");
            cameradiv.setAttribute("id",tmpid+"_camimg");
            cameradiv.setAttribute("class","camera");
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
            if(userArr[i].voice==="speaking"){
                console.log(userArr[i].voice);
                console.log(userArr[i]);
                $(userspkdiv).css("display","block");
            }
            li.appendChild(userspkdiv);
            li.appendChild(cameradiv);
            li.appendChild(personnick);
            if(selftruename===userArr[i].name) {
                var tmpdiv=document.createElement("div");
                $(tmpdiv).css({"width":"26px","height":"24px","float":"right"});
                li.appendChild(tmpdiv);
            }else{
                li.appendChild(dlgtodiv);
            }
            li.appendChild(namep);
            $("#memberlist ul").append(li);
            userspkdiv.onclick=function(){
                console.log("speek to "+$(this).parent().children('p').text());
            }
            cameradiv.onclick=function(){
                console.log("camera to "+$(this).parent().children('p').text());
            }
            dlgtodiv.onclick=function(){
                // if($(this).attr("canspk")==="false"){
                //     $(this).attr("canspk","true");
                //     $(this).css("background-image","url('./images/22.png')");
                //    console.log("can msg to "+$(this).parent().children('p').text());
                // }

                // else{
                //     $(this).attr("canspk","false");
                //     $(this).css("background-image","url('./images/3.png')");
                //     console.log("can't msg to "+$(this).parent().children('p').text());
                // }
                adduserdlg($(this).attr("username"),$(this).attr("tagid"));


            }
        }
        else{
            $("#"+id).children("p").first().attr("mmid",userArr[i].mmidListTraverse[0]);
        }
    }
}
/***
 *
 * @param serverip
 * @returns {HTMLElement}
 */
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

var converToJson = function(size,from,text){
    var jsonStr={};
    jsonStr.from = from;
    jsonStr.text = text;
    jsonStr.size = size;
    return JSON.stringify(jsonStr);
}

/**
 *
 **/
function downloadFile(fileName,content){
    console.log(fileName);
    console.log(content);
    $.ajax({
        url: content,
        type: 'GET'
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
    

    if ((navigator.userAgent.indexOf('MSIE') >= 0)
        && (navigator.userAgent.indexOf('Opera') < 0)
        || (!!window.ActiveXObject || "ActiveXObject" in window)
        || (navigator.userAgent.indexOf('Edge') >= 0)) {
        alert("if");
        //包括Microsoft IE和Microsoft Edge
        document.execCommand('Saveas', false, '/Users/muzhimin/Downloads/' + fileName);
    } //Firefox浏览器的支持
    else if (navigator.userAgent.indexOf('Firefox') >= 0) {
        alert("elseif");
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
        alert("else");
        var aLink = document.getElementById("downloada");
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

var appendToDownloadList = function(location,size,tmpfrom,body,url){
    var size = bytesToSize(size);
    // alert(location);
    if (location==null) {
        dt = $("#downloadList").dataTable({
            'bPaginate':false,
            'bFilter':false,
            'bInfo':false
        });
        dt.fnAddData([tmpfrom,null,size]);
        var a = $("<a download="+body+" href="+url+">"+body+"</a>");
        $("#downloadList tbody tr:last-child").find("td:nth-child(2)").append(a);
    }
    else if (location==="uploadcoursefile"){
        id = "uploadFiles";
        var newItem = $("<li>"+body+"</li>");
        $("#"+id).append(newItem);
    }else if(location==="affix_upload_op"){
        ut = $("#uploadList").dataTable({
            'paging':false,
            'bFilter':false,
            'bInfo':false,
            'searching':false,
            'retrieve': true,        
        });
        ut.fnAddData([tmpfrom,body,size]);
    }
}
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1000, // or 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));

   return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}


/**
 * 进入会议连接video/audio的websocket的结果的回调
 */
var websocketEnterRoomEvent = function(evt) {
    // alert("999");
    var data = evt;
    console.log(data);
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
