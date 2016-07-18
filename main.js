/**
 * Created by mcwmc on 28.05.2016.
 */
var template = "";
var express = require("express");
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json", "utf8"));
var http = require("http");
var mysql = require("mysql");
var calendar = require('node-calendar');
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
var token = Math.floor(Math.random() * 1234);
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
    function reloadtemplate(month) {
        cal = new calendar.Calendar(calendar.MONDAY);
        d = new Date();
        if (month == undefined) {
            currMonth = d.getMonth() + 1;
        }
        currDay = d.getDay();
        table = cal.monthdayscalendar(d.getFullYear(), currMonth);
        var sqlquery = "SELECT day, type, image, `desc`, month, link FROM events WHERE month LIKE " + mysql.escape(currMonth) + " ORDER BY day ASC, month ASC;";
        console.log("DEBUG SQL QUERY: " + sqlquery);
        sqlconnection.query(sqlquery, function (err, results) {
            if (err) throw err;
            var events = results;
            console.log(results);
            if (results[0] == undefined) {
                results.push({
                    day: 40,
                    type: "initiator",
                    image: "404.jpeg",
                    desc: "lol you should not see this",
                    link: "http://kirschn.de"
                });
            }

            var buildstring = "";
            table.forEach(function (currWeekArray) {
                console.log("Current Week Array: " + currWeekArray);
                buildstring += "<tr>";
                currWeekArray.forEach(function (currDayIteration) {
                    console.log("Current Day Array: " + currDayIteration);
                    if (currDayIteration !== 0) {
                        buildstring += "<td><div class='calendarDate'>" + currDayIteration + "";
                        var eventcounter = 0;
                        events.forEach(function (currEvent) {
                            if (currEvent.day == currDayIteration) {
                                eventcounter++;
                            }
                        });
                        var heightwidth = (100 / eventcounter);
                        events.forEach(function (currEvent) {

                            if (currEvent.day == currDayIteration) {
                                console.log("Event");
                                buildstring += "<div class='calendarEvent' style='height: " + heightwidth +"px !important;'><a href='" + currEvent.link + "' title='" + currEvent.desc + "'><img src='" +
                                    currEvent.image + "' height='" + heightwidth + "px !important'></a></div>";
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
            var sqlquery = "SELECT day, type, image, `desc`, month, link FROM events WHERE day >= " + currDay + " AND month >= " + currMonth + " ORDER BY day ASC, month ASC;";
            console.log("DEBUG SQL QUERY: " + sqlquery);
            sqlconnection.query(sqlquery, function (err, nextupresults) {
            for (i = 0; i < 3; i++) {
                console.log("For loop!");
                if (nextupresults[i] !== undefined) {
                    if (nextupresults[i].day !== 40) {
                        nextup += "<div class='nextupentry'><b>" + nextupresults[i].day + "." + nextupresults[i].month  +".</b><div class='nextupdesc' style='position: absolute; bottom: 0;'>" +  nextupresults[i].type + "</div>";
                        nextup += "<div class='nextuplogo' style='position: absolute; top: 0; right: 0;'><img style='height: 100px;' src='" + nextupresults[i].image + "'></div></div>";
                    }
                }
            }
            sqlconnection.query("SELECT DISTINCT image, `desc` FROM events", function (err, types) {
                var legende = "";
                types.forEach(function (currentType) {
                    legende +=  "<div class='nextupentry'>";
                    legende += "<div class='nextuplogo'><img style='height: 100px;' src='" + currentType.image + "'></div>";
                    legende += "<div class='legendetext'>" + currentType.desc + "</div></div>"

                });
                console.log("Next Up:" + nextup);
                template = fs.readFileSync("assets/html/main.html", "utf8")
                    .replace("[[TABLE]]", buildstring)
                    .replace("[[HEADER]]", calendar.month_name[currMonth])
                    .replace("[[NEXTUP]]", nextup)
                    .replace("[[LEGENDE]]", legende);

            });
    })})}
    setInterval(function() {
        reloadtemplate();
        console.log("Reloading Template...");
    }, 5000);
    var cal = new calendar.Calendar(calendar.MONDAY);
    var d = new Date();
    var currMonth = d.getMonth() + 1;
    var currDay = d.getDay();
    var table = cal.monthdayscalendar(d.getFullYear(), currMonth);
    sqlconnection.query("SELECT day, type, image, `desc`, month, link FROM events WHERE month LIKE " + mysql.escape(currMonth) + " ORDER BY day ASC, month ASC;", function (err, results) {
        if (err) throw err;
        var events = results;
        console.log(results);
        if (results[0] == undefined) {
            results.push({
                day: 40,
                type: "initiator",
                image: "404.jpeg",
                desc: "lol you should not see this",
                link: "http://kirschn.de"
            });
        }

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
                nextup += "<div class='nextupentry'><b>" + results[i].day + "." + results[i].month  +".</b><div class='nextupdesc' style='position: absolute; bottom: 0;'>" +  results[i].type + "</div>";
                nextup += "<div class='nextuplogo' style='position: absolute; top: 0; right: 0;'><img style='height: 100px; width: 100%;' src='" + results[i].image + "'></div></div>";
            }
        }
        sqlconnection.query("SELECT DISTINCT image, `desc` FROM events", function (err, types) {
           var legende = "";
            types.forEach(function (currentType) {
               legende +=  "<div class='nextupentry'>";
                legende += "<div class='nextuplogo'><img style='height: 100%;' src='" + currentType.image + "'></div>";
                legende += "<div class='legendetext'>" + currentType.desc + "</div></div>"

            });
            console.log("Next Up:" + nextup);
            template = fs.readFileSync("assets/html/main.html", "utf8")
                .replace("[[TABLE]]", buildstring)
                .replace("[[HEADER]]", calendar.month_name[currMonth])
                .replace("[[NEXTUP]]", nextup)
                .replace("[[LEGENDE]]", legende);
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


    });


}
