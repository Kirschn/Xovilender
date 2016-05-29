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
    sqlconnection.query("SELECT day, type, image, `desc`, link FROM events WHERE month LIKE " + mysql.escape(currMonth) + ";", function (err, results) {
        if (err) throw err;
        var events = results;
        console.log(results);
        var buildstring = "";
        table.forEach(function (currWeekArray) {
            console.log("Current Week Array: " + currWeekArray);
            buildstring += "<tr>";
            currWeekArray.forEach(function (currDayIteration) {
                console.log("Current Day Array: " + currDayIteration);
                if (currDayIteration !== 0) {
                    events.forEach(function (currEvent) {

                        if (currEvent.day == currDayIteration) {
                            console.log("Event");
                            buildstring += "<td><div class='calendarDate'>" + currDayIteration + "</div> (event)";
                            buildstring += "</td>";
                        } else {
                            // lol kein event
                            console.log("No Event");
                            buildstring += "<td><div class='calendarDate'>" + currDayIteration + "</div>";
                            buildstring += "</td>";
                        }
                    });
                } else {
                    buildstring += "<td><div class='calendarNull'>" + currDayIteration + "</div>";
                    buildstring += "</td>";
                }
            });
            buildstring += "</tr>"
        });

        var app = express();
        app.use(express.static('assets/static'));
        app.get('/', function (req, res) {
            var template = fs.readFileSync("assets/html/main.html", "utf8")
                .replace("[[TABLE]]", buildstring)
                .replace("[[HEADER]]", calendar.month_name[currMonth]);

            res.send(template);
            res.end();
        });
        app.listen(config.webPort, function () {
            console.log('Example app listening on port ' + config.webPort + '!');
        });

    });


}