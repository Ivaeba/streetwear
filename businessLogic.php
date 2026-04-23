<?php
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id, name, price, size, image_url FROM clothing";
$result = $conn->query($sql);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$products = [];

while ($row = $result->fetch_assoc()) {
    $products[] = [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'price' => (float) $row['price'],
        'size' => $row['size'],
        'image_url' => $row['image_url'],
    ];
}

echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
