<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user'])) {
    header('Location: index.html');
    exit;
}

$user = $_SESSION['user'];

// Получить активные заказы (pending, processing)
$activeOrders = [];
$sql = '
    SELECT o.id, o.status, o.total, o.created_at,
           GROUP_CONCAT(c.name SEPARATOR ", ") as items
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN clothing c ON oi.clothing_id = c.id
    WHERE o.user_id = ? AND o.status IN (\'pending\', \'processing\', \'shipped\')
    GROUP BY o.id
    ORDER BY o.created_at DESC
';
$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $activeOrders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
} else {
    error_log('account.php prepare failed activeOrders: ' . $conn->error);
}

// История покупок (completed)
$orderHistory = [];
$sql = '
    SELECT o.id, o.status, o.total, o.created_at,
           GROUP_CONCAT(c.name SEPARATOR ", ") as items
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN clothing c ON oi.clothing_id = c.id
    WHERE o.user_id = ? AND o.status = \'delivered\'
    GROUP BY o.id
    ORDER BY o.created_at DESC
';
$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $orderHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
} else {
    error_log('account.php prepare failed orderHistory: ' . $conn->error);
}

// Доставки
$deliveries = [];
$sql = '
    SELECT d.id, o.id as order_id, d.status, d.tracking_number, d.estimated_delivery, d.updated_at,
           GROUP_CONCAT(c.name SEPARATOR ", ") as items
    FROM deliveries d
    JOIN orders o ON d.order_id = o.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN clothing c ON oi.clothing_id = c.id
    WHERE o.user_id = ?
    GROUP BY d.id
    ORDER BY d.updated_at DESC
';
$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $deliveries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
} else {
    error_log('account.php prepare failed deliveries: ' . $conn->error);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Account - Streetwear Shop</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="page-shell">
        <header class="hero">
            <nav class="topbar">
                <div class="brand-block">
                    <p class="eyebrow">Drop 2026</p>
                    <a class="brand" href="index.html">NO RULES / STREETWEAR</a>
                </div>
                <div class="topbar-meta">
                    <span class="meta-pill">Account</span>
                    <div>Welcome, <?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></div>
                </div>
            </nav>
        </header>

        <main class="content-grid">
            <section class="account-panel">
                <div class="section-heading">
                    <h2>My Account</h2>
                    <p>Manage your orders and deliveries</p>
                </div>

                <div class="account-section">
                    <h3>Active Orders</h3>
                    <?php if (empty($activeOrders)): ?>
                        <p>No active orders.</p>
                    <?php else: ?>
                        <div class="orders-list">
                            <?php foreach ($activeOrders as $order): ?>
                                <div class="order-card">
                                    <div class="order-header">
                                        <strong>Order #<?php echo $order['id']; ?></strong>
                                        <span class="order-status"><?php echo ucfirst($order['status']); ?></span>
                                    </div>
                                    <p>Items: <?php echo htmlspecialchars($order['items']); ?></p>
                                    <p>Total: <?php echo number_format($order['total'], 2); ?> PLN</p>
                                    <p>Ordered: <?php echo date('Y-m-d', strtotime($order['created_at'])); ?></p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="account-section">
                    <h3>Order History</h3>
                    <?php if (empty($orderHistory)): ?>
                        <p>No completed orders.</p>
                    <?php else: ?>
                        <div class="orders-list">
                            <?php foreach ($orderHistory as $order): ?>
                                <div class="order-card">
                                    <div class="order-header">
                                        <strong>Order #<?php echo $order['id']; ?></strong>
                                        <span class="order-status completed"><?php echo ucfirst($order['status']); ?></span>
                                    </div>
                                    <p>Items: <?php echo htmlspecialchars($order['items']); ?></p>
                                    <p>Total: <?php echo number_format($order['total'], 2); ?> PLN</p>
                                    <p>Delivered: <?php echo date('Y-m-d', strtotime($order['created_at'])); ?></p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="account-section">
                    <h3>Delivery Tracking</h3>
                    <?php if (empty($deliveries)): ?>
                        <p>No deliveries in progress.</p>
                    <?php else: ?>
                        <div class="deliveries-list">
                            <?php foreach ($deliveries as $delivery): ?>
                                <div class="delivery-card">
                                    <div class="delivery-header">
                                        <strong>Delivery for Order #<?php echo $delivery['order_id']; ?></strong>
                                        <span class="delivery-status"><?php echo ucfirst($delivery['status']); ?></span>
                                    </div>
                                    <p>Items: <?php echo htmlspecialchars($delivery['items']); ?></p>
                                    <?php if ($delivery['tracking_number']): ?>
                                        <p>Tracking: <?php echo htmlspecialchars($delivery['tracking_number']); ?></p>
                                    <?php endif; ?>
                                    <?php if ($delivery['estimated_delivery']): ?>
                                        <p>Estimated: <?php echo date('Y-m-d', strtotime($delivery['estimated_delivery'])); ?></p>
                                    <?php endif; ?>
                                    <p>Last Update: <?php echo date('Y-m-d H:i', strtotime($delivery['updated_at'])); ?></p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="account-actions">
                    <button class="btn btn-secondary" onclick="logout()">Logout</button>
                </div>
            </section>
        </main>
    </div>

    <script>
        async function logout() {
            const response = await fetch('auth.php?action=logout');
            const result = await response.json();
            if (result.success) {
                window.location.href = 'index.html';
            }
        }
    </script>
</body>
</html>