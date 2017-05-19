/**
 * Created by Arunima on 24-Apr-17.
 */

/* Slackbot wala file created by Arunima on 24-Mar-17.*/

var admin_ID="U4M7ZCE2E";//slack ID... It will be changed to the UserID of the admin(navodita)
var sir_ID="U4M5UERM1";//sir

var user_ID;
var  url_inviteMore;
var url_invite="https://slack.com/api/channels.invite?token=xoxp-157305059732-157269328242-157540272292-1606768938cc7e7c53f6622d3e99c10c&channel=C4P35SB08&user="+admin_ID +"&pretty=1";
var channel_name;
var channel_url;
var userURL="https://slack.com/api/users.list?token=xoxp-157305059732-157269328242-157540272292-1606768938cc7e7c53f6622d3e99c10c&pretty=1";
var url_messages;
var url_postMessage;
var join_ts;
var url_createChannel;
var channel_id;

var usrID=[];
var userName=[];
var lenINI;
var token="";



$('#create_channel').click(function()
{
    token=$('#token').val();
    channel_name=$('#username').val();
    document.getElementById("channel_name").value = channel_name;
    console.log("This is the channel name"+channel_name);
    url_createChannel="https://slack.com/api/channels.create?token="+token+"&name="+channel_name+"&pretty=1";

    $.get(url_createChannel, function (data)
    {
        if(data.ok==true)
        {
            channel_id=data.channel.id;
            document.getElementById("channel_id").value = channel_id;
            console.log();
            console.log(data);
        }
        else
        {
            join_url="https://slack.com/api/channels.join?token="+token+"&name="+channel_name+"&pretty=1";
            $.get(join_url, function (data) {
                if(data.ok==true)
                {
                    window.channel_id = data.channel.id;
                    console.log(window.channel_id);
                    document.getElementById("channel_id").value=data.channel.id;

                }

            })
        }


        channel_url="https://slack.com/api/channels.join?token="+token+"&name="+channel_name+"&pretty=1";




        $.get(channel_url, function (data)      //create a channel and join OR if the channel is already ready then join the channel
        {
            console.log(data);

            channel_id=$("#channel_id").val();
            console.log(channel_id);

            url_inviteMore="https://slack.com/api/channels.invite?token="+token+"&channel="+channel_id+"&user="+sir_ID +"&pretty=1";
            var u ="https://slack.com/api/users.list?token="+token+"&pretty=1";

            $.get(u, function (data)       //client invites the admin to chat
            {
                console.log(data);
                var name;

                for(var i=0;i<data.members.length;i++)
                {
                    url_invite="https://slack.com/api/channels.invite?token="+token+"&channel="+channel_id+"&user="+data.members[i].id +"&pretty=1";
                    name=data.members[i].real_name;
                    console.log(data.members[i].real_name);

                    $.get(url_invite, function (data1)       //client invites the admin to chat
                    {
                        console.log("hi "+i.toString());
                        console.log(name+" adding "+data1);
                    });

                }
            });
        });

        channel_id=$('#channel_id').val();
        var url_info="https://slack.com/api/channels.info?"+token+"&channel="+channel_id+"&pretty=1";

        $.get(url_info, function (data) {
            if(data.ok==true)
            {

                join_ts=data.channel.latest.ts;
                document.getElementById("channel_ts").value = join_ts;
                console.log("hi"+join_ts);
                console.log(join_ts);
            }

            console.log("channel_id "+ channel_id);
        });

        $.get(userURL, function (data) {        //gets user list to associate userID with username
            console.log(data);
            for (var i = 0; i < data.members.length; i++) {
                // console.log(data.members[i].name + " " + data.members[i].id);
                usrID[i] = data.members[i].id;
                userName[i] = data.members[i].name
            }
            // console.log(userName + usrID);
            url_messages="https://slack.com/api/channels.history?token="+token+"&channel="+ $("#channel_id").val()+"&pretty=1";
            console.log(url_messages+".......url_messages");
            var ts;
            $.get(url_messages, function (data) {
                console.log(data);
                /* console.log(data.messages[1].text);*/
                lenINI= data.messages.length;
                ts=document.getElementById('channel_ts');

                for (var i = 0; i < data.messages.length; i++) {

                    for (var j = 0; j < usrID.length; j++)
                        if (data.messages[i].user == usrID[j]||data.messages[i].username)
                        {
                            if(data.messages[i].username==true)
                                name=data.messages[i].username;
                            else
                                name = userName[j];
                        }
                    console.log("ts" +ts);


                    if(data.messages[i].ts>ts)
                    { $('#a').append("<tr><td id='b'>" + name + "</td><td>" + data.messages[i].text + "</td></tr>");

                    }
                    if(ts=="channel_ts") {
                        $('#a').append("<tr><td id='b'>" + name + "</td><td>" + data.messages[i].text + "</td></tr>");

                    }



                }
            });
        });



        url_messages="https://slack.com/api/channels.history?token="+token+"&channel="+ $("#channel_id").val()+"&pretty=1";
        console.log(url_messages);


        var myVar = setInterval(myTimer, 1000);

        function myTimer()
        {

            console.log(url_messages);
            $.get(url_messages, function (data) {
                console.log(data);
                if(lenINI<data.messages.length)
                {
                    for(var i=0;i<data.messages.length-lenINI;i++)
                    {
                        for (var j = 0; j < usrID.length; j++)
                            if (data.messages[i].user == usrID[j]||data.messages[i].username)
                            {
                                if(data.messages[i].username==true)
                                {
                                    name = data.messages[i].username;
                                    console.log(name);
                                }
                                else
                                    name = userName[j];
                            }


                        if(!data.messages[i].text.includes("has joined the channel"))
                            $('#a').append("<tr><td id='b'>" + name  + "</td><td>" + data.messages[i].text.replace(/[<>]/g,"")+ "</td></tr>");

                    }

                    lenINI=data.messages.length;


                }

            });
            console.log("hi");

        }











        //to post message to the slack channel
        $('#btn').click(function()
        {

            channel_id=$("#channel_id").val();
            channel_name=$("#channel_name").val();


            var str = $('#tantanatan').val();

            url_postMessage = "https://slack.com/api/chat.postMessage?token="+token+"&channel=" + channel_id + "&text=" + str + "&username=" + channel_name + "&pretty=1";
            $.get(url_postMessage, function (data) {
                console.log(data);

            });

        });

    });



});











