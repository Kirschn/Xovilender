/**
 * Created by mcwmc on 28.05.2016.
 */
var config = require("./config.js");
var express = require("express");
var fs = require("fs");
var http = require("http");
var mysql = require("mysql");
var calendar = require('node-calendar');
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log("worker ${worker.process.pid} died");
    });
} else {
    var sqlconnection = mysql.createConnection({
        host: config.sqlHost,
        user: config.sqlUser,
        database: config.sqlUser,
        password: config.sqlPass
    });
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    var cal = new calendar.Calendar(calendar.MONDAY);
    var d = new Date();
    var currMonth = d.getMonth() + 1;
    var currDay = d.getDay();
    var table = cal.monthdayscalendar(d.getFullYear(), currMonth);
    sqlconnection.query("SELECT day, type, image, `desc`, month, link FROM events WHERE month LIKE " + mysql.escape(currMonth) + " ORDER BY day ASC, month ASC;", function (err, results) {
        if (err) throw err;
        var events = results;
        console.log(results);
        results.push({
           day: 40,
            type: "initiator",
            image: "404.jpeg",
            desc: "lol you should not see this",
            link: "http://kirschn.de"
        });
        var buildstring = "";
        table.forEach(function (currWeekArray) {
            console.log("Current Week Array: " + currWeekArray);
            buildstring += "<tr>";
            currWeekArray.forEach(function (currDayIteration) {
                console.log("Current Day Array: " + currDayIteration);
                if (currDayIteration !== 0) {
                    buildstring += "<td><div class='calendarDate'>" + currDayIteration + "";
                    events.forEach(function (currEvent) {

                        if (currEvent.day == currDayIteration) {
                            console.log("Event");
                            buildstring += "<div class='calendarEvent'><a href='" + currEvent.link + "' title='" + currEvent.desc + "'><img src='" +
                                currEvent.image + "'></a></div>";
                        }
                    });
                    buildstring += "</div></td>";
                } else {
                    buildstring += "<td><div class='calendarNull'>&nbsp;</div>";
                    buildstring += "</td>";
                }
            });
            buildstring += "</tr>"
        });

        var nextup = "";
        for (i = 0; i < 3; i++) {
            console.log("For loop!");
            if (results[i] !== undefined) {
                nextup += "<div class='nextupentry'>" + results[i].day + "." + results[i].month  +"<div class='nextupdesc' style='position: absolute; bottom: 0;'>" +  results[i].desc + "</div>";
                nextup += "<div class='nextuplogo' style='position: absolute; right: 0;'><img src='" + results[i].image + "'></div></div>";
            }
        }
        console.log("Next Up:" + nextup);
        var template = fs.readFileSync("assets/html/main.html", "utf8")
            .replace("[[TABLE]]", buildstring)
            .replace("[[HEADER]]", calendar.month_name[currMonth])
            .replace("[[NEXTUP]]", nextup);
        var app = express();
        app.use(express.static('assets/static'));
        app.get('/', function (req, res) {

            res.send(template);
            res.end();
        });
        app.listen(config.webPort, function () {
            console.log('Example app listening on port ' + config.webPort + '!');
        });

    });


}