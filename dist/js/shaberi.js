// 接続先URI
var uri = "ws://localhost:9999";
var webSocket = null;

function init() {
    $("[data-name='message']").keypress(press);
    open();
}

function open() {
    if (webSocket == null) {
        webSocket = new WebSocket(uri);
        webSocket.onopen = onOpen;
        webSocket.onmessage = onMessage;
        webSocket.onclose = onClose;
        webSocket.onerror = onError;
    }
}

function onOpen(event) {
    chat("接続しました。");
}

function onMessage(event) {
    if (event && event.data) {
        message = parseMsg(event.data);
        chat(message);
    }
}

function onError(event) {
    //chat("エラーが発生しました。");
}

function onClose(event) {
    chat("切断しました。3秒後に再接続します。(" + event.code + ")");
    webSocket = null;
    setTimeout("open()", 3000);
}

function press(event) {
    if (event && event.which == 13) {
        send();
    }
}

function parseMsg(message){
    // メッセージ表示
    console.log(message);
    try {
        var msg = JSON.parse(message);
    } catch(e){
        console.log('unparsable json message.');
        colour = 'red';
    }
    try {
        colour = decodeURIComponent(escape(msg['colour']));
    } catch (e) {
        if(!colour){
            colour = 'black';
        }
    }
    colour = '<span style="color:' + colour + '">'
    try {
        hname = decodeURIComponent(escape(msg['hname']));
    } catch (e){
        hname = '';
    }
    if (hname) { hname = hname + ': '; }
    try {
        message = msg['message'];
        message = decodeURIComponent(escape(message));
    } catch (e) {
    }
    if (msg['msg_type'] == 'member_list') {
        console.log(message);
        member_list(message);
        return;
        //return '<span style="color:red">誰かの名前が変わりました</span>';
    }
    message = colour + hname + message + '</span>';
    console.log(message);
    return message
}

function send(){
    var sendmsg = {};
    sendmsg.message = $("[data-name='message']").val();
    sendmsg.hname = $("[data-name='hname']").val();
    sendmsg.colour = $("[data-name='colour']").val();
    // 存在チェック
    if (sendmsg.message && webSocket) {
         // メッセージ送信
        sendmsg.message = decodeURIComponent(sendmsg.message);
        sendmsg.hname = decodeURIComponent(sendmsg.hname);
        sendmsg = JSON.stringify(sendmsg);
        webSocket.send(sendmsg);
        // メッセージ初期化
        $("[data-name='message']").val("");
    }
}

// チャットに表示
function chat(message) {
    // 100件まで残す
    var chats = $("[data-name='chat']").find("div");
    while (chats.length >= 100) {
        chats = chats.last().remove();
    }
    var msgtag = $("<div>").html(message);
    $("[data-name='chat']").prepend(msgtag);
}

// チャットに表示
function member_list(message) {
    // 100件まで残す
    console.log('member name changed');
    $("[data-name='member-list']").html(message);
    $(".info").find("button").addClass("pure-button");
    $(".info").find("button").addClass("button-xsmall");
    $(".info").find("button").addClass("pure-button-disabled");
}
function changeColor() {
    var e = document.getElementById("colour-select");
    var color = e.options[e.selectedIndex].style.color;
    e.style.color = color;
    $("#color-selected").value(color);
}

// 初期処理登録
$(init);
