
<?php
/**
 * Created by PhpStorm.
 * User: Kirschn
 * Date: 14.06.2016
 * Time: 16:39
 */
$config = json_decode(file_get_contents("config.json"), true);
$sqlconnection = mysqli_connect($config["sqlHost"], $config["sqlUser"], $config["sqlPass"], $config["sqlDatabase"]);
if (isset($_GET["delete"])) {
    mysqli_query($sqlconnection, "DELETE FROM ". $config["sqlEventTable"] . " WHERE id=" . mysqli_real_escape_string($sqlconnection, $_GET["delete"]));
}
if (isset($_POST["day"]) && isset($_POST["desc"]) && isset($_POST["month"]) &&isset($_POST["type"]) &&isset($_POST["imageurl"]) &&isset($_POST["link"])) {
    mysqli_query($sqlconnection, "INSERT INTO events (day, month, type, image, `desc`, link) VALUES ('" . mysqli_real_escape_string($sqlconnection, $_POST["day"]) . "', '" . mysqli_real_escape_string($sqlconnection, $_POST["month"]) . "', '" . mysqli_real_escape_string($sqlconnection, $_POST["type"]) . "', '" . mysqli_real_escape_string($sqlconnection, $_POST["imageurl"]) . "', '" . mysqli_real_escape_string($sqlconnection, $_POST["desc"]) . "', '" . mysqli_real_escape_string($sqlconnection, $_POST["link"]) . "');");
}
$events = mysqli_query($sqlconnection, "SELECT * FROM events;");
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WUNDERSCHÖNE MANAGEMENT SEITE</title>
</head>
<body>
Please note: DESC and IMAGEURL have to be the same to generate an automatic group!<br>
<table border="1">
    <tr>
        <td>
            ID
        </td>
        <td>
            DAY
        </td>
        <td>
            MONTH
        </td>
        <td>
            TYPE
        </td>
        <td>
            DESC
        </td>
        <td>
            IMAGEURL
        </td>
        <td>
            ONCLICKLINK
        </td>
        <td>
            ACTION
        </td>
    </tr>
<?php
while ($r = mysqli_fetch_assoc($events)) {
    ?>
    <tr>
        <td>
            <?php echo $r["id"]; ?>
        </td>
        <td>
            <?php echo $r["day"]; ?>
        </td>
        <td>
            <?php echo $r["month"]; ?>
        </td>
        <td>
            <?php echo $r["type"]; ?>
        </td>
        <td>
            <?php echo $r["desc"]; ?>
        </td>
        <td>
            <?php echo $r["image"]; ?>
        </td>
        <td>
            <?php echo $r["link"]; ?>
        </td>
        <td>
            <a href="?delete=<?php echo $r["id"]; ?>">Delete</a>
        </td>
    </tr>
    <?php
}
    ?>
</table><br>
<form method="POST" action="/">
    <label for="day">Day:</label><input name="day" id="day" placeholder="21"><br>
    <label for="month">Month:</label><input name="month" id="month" placeholder="6"><br>
    <label for="type">Type:</label><input name="type" id="type" placeholder="Twitch"><br>
    <label for="desc">Desc:</label><input name="desc" id="desc" placeholder="Casual Stream"><br>
    <label for="imageurl">Image URL:</label><input name="imageurl" id="imageurl" placeholder="http://mun-1.cdn.spaceflow.io/b9g2hmkbs8ftiefgg62c.png"><br>
    <label for="link">URL:</label><input name="link" id="link" placeholder="http://youtube.com/yavigin"><br>
    <input type="submit">
</form>
</body>
</html>
