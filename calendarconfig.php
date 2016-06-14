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
    mysqli_query($sqlconnection, "DELETE FROM ". $config["sqlTable"] . " WHERE id= " . mysqli_real_escape_string($sqlconnection, $_GET["delete"]));
}
echo var_dump(mysqli_query($sqlconnection, "SELECT * FROM events;"));