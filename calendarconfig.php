
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

$events = mysqli_query($sqlconnection, "SELECT * FROM events;");
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WUNDERSCHÖNE MANAGEMENT SEITE</title>
</head>
<body>
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
</table>
</body>
</html>
