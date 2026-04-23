CREATE DATABASE IF NOT EXISTS shop_db;
USE shop_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    birth_date DATE NOT NULL,
    location VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'customer',
    privileges VARCHAR(128) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_phone (phone)
);

UPDATE users SET password_hash = 'sha256:120000:10c85dca3aef61d73c076c90d35967cc:102c43a6386836c9b457d9d899d7f4d82df50d8426d28412c2f63a327d642bf3' WHERE email = 'ivan.staff@example.com';
UPDATE users SET password_hash = 'sha256:120000:a6637e6ee7a035ceecafd9b61901d72c:aa7b98ecdab0fc0c7ddbb3752ad7d0a35c50c86171e5be0315d681889dc4f42e' WHERE email = 'olga.staff@example.com';
UPDATE users SET password_hash = 'sha256:120000:f89e0763f1d61d12f75765deee64b3cf:98fd2d1d3056a4d0522c13d6d434abfe83cc945eb26879916d16e6e74cdb5221' WHERE email = 'alexey.staff@example.com';

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    clothing_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (clothing_id) REFERENCES clothing(id)
);

CREATE TABLE IF NOT EXISTS deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'preparing',
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clothing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    size VARCHAR(10),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO clothing (name, price, size, image_url)
SELECT 'T-shirt Black', 19.99, 'L', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'T-shirt Black' AND size = 'L');
SELECT 'T-shirt Black', 19.99, 'L', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'T-shirt Black' AND size = 'L');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Blue Jeans', 49.50, 'M', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Blue Jeans' AND size = 'M');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Winter Jacket', 89.00, 'XL', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Winter Jacket' AND size = 'XL');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Oversized Hoodie Sand', 64.90, 'L', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Oversized Hoodie Sand' AND size = 'L');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Graphic T-shirt Signal', 29.50, 'M', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Graphic T-shirt Signal' AND size = 'M');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Cargo Pants Shadow', 74.00, 'L', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Cargo Pants Shadow' AND size = 'L');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Denim Jacket Washed', 92.00, 'XL', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Denim Jacket Washed' AND size = 'XL');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Sneakers Atlas White', 109.00, '42', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Sneakers Atlas White' AND size = '42');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Sneakers Night Runner', 119.00, '43', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Sneakers Night Runner' AND size = '43');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Zip Hoodie Carbon', 69.50, 'XL', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Zip Hoodie Carbon' AND size = 'XL');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Straight Jeans Fade', 58.00, 'L', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Straight Jeans Fade' AND size = 'L');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Bomber Jacket Olive', 98.00, 'M', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Bomber Jacket Olive' AND size = 'M');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Cargo Shorts Desert', 52.00, 'M', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Cargo Shorts Desert' AND size = 'M');

INSERT INTO clothing (name, price, size, image_url)
SELECT 'Boxy T-shirt Clay', 27.00, 'S', 'https://via.placeholder.com/150'
WHERE NOT EXISTS (SELECT 1 FROM clothing WHERE name = 'Boxy T-shirt Clay' AND size = 'S');
