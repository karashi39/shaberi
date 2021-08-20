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

function onOpen() {
  chat("接続しました。");
}

function onMessage(event) {
  if (event && event.data) {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.msg_type === 'member_list') member_list(data);
    if (data.msg_type === 'chat') chat(parseChat(data));
  }
}

function onError(event) {
  console.warn(event);
  chat("エラーが発生しました。");
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

function encode(text) {
  return decodeURIComponent(text);
}

function decode(text) {
  let ret = '';
  try {
    ret = decodeURIComponent(escape(text));
  } catch (e) {
    return text;
  }
  return ret;
}

function parseChat(data){
  let color = decode(data.colour);
  if(!color) color = 'black';
  let hname = decode(data.hname);
  let message = decode(data.message);
  let span = `<span style="color: ${color};">${hname}: ${message}</span>`
  return span;
}

function send(){
  if (!webSocket) return;
  const data = {
    message: encode($("[data-name='message']").val()),
    hname: encode($("[data-name='hname']").val()),
    colour: encode($("[data-name='colour']").val()),
  };
  webSocket.send(JSON.stringify(data));
  $("[data-name='message']").val("");
}

// add chat row
function chat(message) {
  // 100件まで残す
  var chats = $("[data-name='chat']").find("div");
  while (chats.length >= 100) {
    chats = chats.last().remove();
  }
  var msgtag = $("<div>").html(message);
  $("[data-name='chat']").prepend(msgtag);
}

// update member list
function member_list(data) {
  console.log('member name changed');
  $("[data-name='member-list']").html(data.message);
  $(".info").find("button").addClass("pure-button");
  $(".info").find("button").addClass("button-xsmall");
  $(".info").find("button").addClass("pure-button-disabled");
}

// used by index.html
function changeColor() {
  var e = document.getElementById("colour-select");
  var color = e.options[e.selectedIndex].style.color;
  e.style.color = color;
  $("#color-selected").val(color);
}

// 初期処理登録
$(init);
