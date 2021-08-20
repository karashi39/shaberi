#!/usr/bin/env python3
from urllib.parse import unquote
from websocket_server import WebsocketServer
import json
import time

member_dict = {}

def send_msg(sendmsg, msg_type=None):
    """send message to all clients."""
    server_log(sendmsg)
    json.JSONEncoder().encode(sendmsg)
    server.send_message_to_all(sendmsg)
    return

def server_log(logmsg, loghead=''):
    """output server log."""
    print(str(time.ctime(time.time())))
    if loghead =='':
        pass
    else:
        print(loghead)
    print(logmsg)

def build_msg(msg_type, message=None, hname=None, colour='black'):
    """check and return built sendmsg for client."""
    if msg_type == 'chat':
        sendmsg = '{"msg_type":"' + msg_type + '"'
        sendmsg += ',"colour":"' + colour + '"' 
        sendmsg += ',"hname":"' + hname + '"' 
        sendmsg += ',"message":"'+  message + '"'
        sendmsg += '}'
    elif msg_type == 'member_list':
        sendmsg = '{"msg_type":"member_list","message":"' + member_dict + '"}'
    return sendmsg

def mng_members(client, hname='', left=False):
    """check client and update member_dict if new one come."""
    client_ipaddr = client['address'][0] + ':' + str(client['address'][1])
    if left:
        del member_dict[client_ipaddr]
        message = '誰か落ちました'
        sendmsg = build_msg('chat', message, hname='', colour='green')
        send_msg(sendmsg)
    else:
        if client_ipaddr in member_dict:
            if member_dict[client_ipaddr] == hname:
                return
            else:
                member_dict[client_ipaddr] = hname
        else:
            member_dict.update({client_ipaddr: ''})
            message = '誰かきました'
            sendmsg = build_msg('chat', message, hname='', colour='green')
            send_msg(sendmsg)

    message = 'member: '
    for name in member_dict.values():
        message += '<button>' + name + '</button>'
    send_msg('{"msg_type":"member_list","message":"' + message + '"}')
    server_log(member_dict, loghead='member:')
    return

def cleanup_clients():
    """try ping to each client and kill zombi."""
    server_log('[SYSTEM] cleaning up zombi clients...')
    for client in server.clients:
        try:
            server.send_message(client, 'ping')
        except TimeoutError:
            client_ipaddr = client['address'][0] + ':' + str(client['address'][1])
            del member_dict[client_ipaddr]
    return

def new_client(client, server):
    server_log(client, loghead='new_client----------------')
    mng_members(client)

def client_left(client, server):
    server_log(client, loghead='client_left---------------')
    mng_members(client, left=True)
    cleanup_clients()

def message_receive(client, server, message):
    server_log(client)
    server_log(message)

    message = json.loads(message)
    hname=message['hname']
    colour=message['colour']
    message=message['message']

    mng_members(client, hname)
    sendmsg = build_msg('chat', message, hname, colour)
    send_msg(sendmsg)

server = WebsocketServer(9999, host='')
server.set_fn_new_client(new_client)
server.set_fn_message_received(message_receive)
server.set_fn_client_left(client_left)
server.run_forever()
