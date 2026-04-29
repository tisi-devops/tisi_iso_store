-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 31, 2026 at 07:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tisi_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` int(11) NOT NULL,
  `transaction_id` varchar(20) DEFAULT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_option` varchar(50) DEFAULT NULL,
  `price_at_purchase` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `transaction_id`, `product_code`, `product_option`, `price_at_purchase`, `quantity`) VALUES
(1, 'TISI202603260001', 'ISO 14001:2015', 'Standard Digital', 5150, 1),
(2, 'TISI202603260002', 'ISO 9001:2015', 'Standard Digital', 5150, 1),
(3, 'TISI202603260002', 'ISO 14001:2015', 'Standard Digital', 5150, 1),
(4, 'TISI202603260003', 'ISO 37001:2025', 'Standard Digital', 5640, 1),
(5, 'TISI20260326T08:57:1', 'ISO 14001:2015', 'Standard Digital', 5150, 1),
(6, 'TISI20260327101706', 'ISO 14001:2015', 'Standard Digital', 5158, 1),
(7, 'TISI20260327101706', 'ISO 30000:2009', 'Standard Digital', 2882, 1),
(8, 'TISI20260327143850', 'ISO 14001:2015', 'Standard Digital', 5158, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
