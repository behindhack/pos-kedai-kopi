-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `role` ENUM('OWNER', 'CASHIER', 'BARISTA') NOT NULL DEFAULT 'CASHIER',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `reset_password_token` VARCHAR(255) NULL,
    `reset_password_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_materials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('COFFEE_BEAN', 'INGREDIENT', 'EQUIPMENT', 'PACKAGING', 'OTHER') NOT NULL DEFAULT 'INGREDIENT',
    `quantity` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    `unit` VARCHAR(50) NOT NULL,
    `min_quantity` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    `cost_per_unit` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `supplier` VARCHAR(255) NULL,
    `total_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('ESPRESSO', 'MANUAL_BREW', 'NON_COFFEE', 'FOOD') NOT NULL,
    `base_price` DECIMAL(15, 2) NOT NULL,
    `image` LONGTEXT NULL,
    `stock` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `extra_price` DECIMAL(15, 2) NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_recipes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `material_id` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(50) NOT NULL,
    `customer_name` VARCHAR(255) NULL,
    `order_type` ENUM('DINE_IN', 'TAKE_AWAY') NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,
    `discount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(15, 2) NOT NULL,
    `payment_method` ENUM('CASH', 'QRIS', 'TRANSFER') NOT NULL,
    `paid_amount` DECIMAL(15, 2) NOT NULL,
    `change_amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('PENDING', 'PREPARING', 'READY', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sales_order_number_key`(`order_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sale_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_category` VARCHAR(100) NULL,
    `base_price` DECIMAL(15, 2) NOT NULL,
    `qty` INTEGER NOT NULL,
    `note` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_item_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sale_item_id` INTEGER NOT NULL,
    `variant_id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `extra_price` DECIMAL(15, 2) NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `gross_revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `discounts` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `taxes` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `net_revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `opening_stock` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `purchases` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `closing_stock` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `cogs` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `utilities` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `rent` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `payroll` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `other_expenses` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_operating_expenses` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `gross_profit` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `operating_profit` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `net_profit` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL DEFAULT 'Kedai Kopi',
    `shop_logo` VARCHAR(10) NOT NULL DEFAULT '☕',
    `address` TEXT NOT NULL DEFAULT 'Alamat Kedai Kopi',
    `phone` VARCHAR(50) NOT NULL DEFAULT '081234567890',
    `receipt_printer_ip` VARCHAR(100) NULL,
    `print_show_logo` BOOLEAN NOT NULL DEFAULT true,
    `print_show_address` BOOLEAN NOT NULL DEFAULT true,
    `print_paper_width` INTEGER NOT NULL DEFAULT 80,
    `tax_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_recipes` ADD CONSTRAINT `product_recipes_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_recipes` ADD CONSTRAINT `product_recipes_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `raw_materials`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_item_variants` ADD CONSTRAINT `sale_item_variants_sale_item_id_fkey` FOREIGN KEY (`sale_item_id`) REFERENCES `sale_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
