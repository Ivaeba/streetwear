<?php
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

session_start();

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

function respond($payload, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function createPasswordHash($password) {
    $salt = bin2hex(random_bytes(16));
    $iterations = 120000;
    $hash = hash_pbkdf2('sha256', $password, $salt, $iterations, 64);
    return "sha256:{$iterations}:{$salt}:{$hash}";
}

function verifyPasswordHash($password, $storedHash) {
    if (empty($storedHash) || strpos($storedHash, ':') === false) {
        return false;
    }

    $parts = explode(':', $storedHash);
    if (count($parts) !== 4) {
        return false;
    }

    [$algo, $iterations, $salt, $hash] = $parts;
    $verify = hash_pbkdf2($algo, $password, $salt, (int)$iterations, strlen($hash));
    return hash_equals($hash, $verify);
}

if ($action === 'register') {
    $firstName = trim($input['first_name'] ?? '');
    $lastName = trim($input['last_name'] ?? '');
    $birthDate = trim($input['birth_date'] ?? '');
    $location = trim($input['location'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $password = $input['password'] ?? '';

    if (!$firstName || !$lastName || !$birthDate || !$location || !$email || !$phone || !$password) {
        respond(['success' => false, 'error' => 'All registration fields are required.'], 400);
    }

    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ? OR phone = ?');
    $stmt->bind_param('ss', $email, $phone);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        respond(['success' => false, 'error' => 'Email or phone is already registered.'], 409);
    }
    $stmt->close();

    $passwordHash = createPasswordHash($password);
    $role = 'customer';
    $privileges = 'customer';

    $stmt = $conn->prepare('INSERT INTO users (first_name, last_name, birth_date, location, email, phone, password_hash, role, privileges) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssssss', $firstName, $lastName, $birthDate, $location, $email, $phone, $passwordHash, $role, $privileges);

    if (!$stmt->execute()) {
        respond(['success' => false, 'error' => 'Unable to create user account.'], 500);
    }

    respond(['success' => true, 'message' => 'Registration completed.']);
}

if ($action === 'login') {
    $identifier = trim($input['identifier'] ?? '');
    $password = $input['password'] ?? '';

    if (!$identifier || !$password) {
        respond(['success' => false, 'error' => 'Identifier and password are required.'], 400);
    }

    $stmt = $conn->prepare('SELECT id, first_name, last_name, email, phone, password_hash, role, privileges FROM users WHERE email = ? OR phone = ? LIMIT 1');
    $stmt->bind_param('ss', $identifier, $identifier);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user || !verifyPasswordHash($password, $user['password_hash'])) {
        respond(['success' => false, 'error' => 'Login failed. Check your email/phone and password.'], 401);
    }

    unset($user['password_hash']);
    $_SESSION['user'] = $user;
    respond(['success' => true, 'user' => $user]);
}

if ($action === 'logout') {
    session_destroy();
    respond(['success' => true, 'message' => 'Logged out.']);
}

if ($action === 'check') {
    if (isset($_SESSION['user'])) {
        respond(['success' => true, 'user' => $_SESSION['user']]);
    } else {
        respond(['success' => false, 'error' => 'Not logged in.'], 401);
    }
}

if ($action === 'checkout') {
    if (!isset($_SESSION['user'])) {
        respond(['success' => false, 'error' => 'Not logged in.'], 401);
    }

    $userId = $_SESSION['user']['id'];
    $total = (float)($input['total'] ?? 0);

    if ($total <= 0) {
        respond(['success' => false, 'error' => 'Invalid total.'], 400);
    }

    // Create order
    $stmt = $conn->prepare('INSERT INTO orders (user_id, total) VALUES (?, ?)');
    $stmt->bind_param('id', $userId, $total);
    if (!$stmt->execute()) {
        respond(['success' => false, 'error' => 'Failed to create order.'], 500);
    }
    $orderId = $stmt->insert_id;

    // Create delivery
    $stmt = $conn->prepare('INSERT INTO deliveries (order_id, estimated_delivery) VALUES (?, DATE_ADD(NOW(), INTERVAL 7 DAY))');
    $stmt->bind_param('i', $orderId);
    $stmt->execute();

    respond(['success' => true, 'order_id' => $orderId]);
}

respond(['success' => false, 'error' => 'Action not supported.'], 400);
