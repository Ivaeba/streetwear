<?php
// Parametry połączenia
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "shop_db";

// Nawiązanie połączenia przy użyciu mysqli
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Sprawdzenie błędów
if ($conn->connect_error) {
    die("Błąd bazy danych: " . $conn->connect_error);
}

// Ustawienie kodowania znaków na UTF-8 (żeby polskie znaki działały)
$conn->set_charset("utf8");
?>