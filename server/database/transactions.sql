-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 31, 2026 at 07:36 AM
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
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `transaction_id` varchar(20) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `tax_id` varchar(20) DEFAULT NULL,
  `personType` int(11) DEFAULT NULL,
  `house_number` text DEFAULT NULL,
  `buildingName` text DEFAULT NULL,
  `moo` text DEFAULT NULL,
  `soi` text DEFAULT NULL,
  `road` text DEFAULT NULL,
  `sub_district` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `subdistrictCode` varchar(10) DEFAULT NULL,
  `districtCode` varchar(10) DEFAULT NULL,
  `provinceCode` varchar(10) DEFAULT NULL,
  `postCode` varchar(10) DEFAULT NULL,
  `contact_title` varchar(50) DEFAULT NULL,
  `contact_firstname` varchar(255) DEFAULT NULL,
  `contact_middlename` varchar(255) DEFAULT NULL,
  `contact_lastname` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `total_amount` int(11) DEFAULT NULL,
  `exchange_rate` decimal(10,7) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `transaction_id`, `company_name`, `tax_id`, `personType`, `house_number`, `buildingName`, `moo`, `soi`, `road`, `sub_district`, `district`, `province`, `subdistrictCode`, `districtCode`, `provinceCode`, `postCode`, `contact_title`, `contact_firstname`, `contact_middlename`, `contact_lastname`, `phone`, `email`, `total_amount`, `exchange_rate`, `status`, `created_at`) VALUES
(1, 'TISI202603260001', 'บริษัท เอ จำกัด ', 'INDIVIDUAL', 1, '111', NULL, '11', 'เอ', 'เอ', 'ชุมตาบง', 'ชุมตาบง', 'นครสวรรค์', NULL, NULL, NULL, '60150', 'นาง', 'sirisak', 'นก', 'phupha', '0981234569', 'sirisak2013@gmail.com', 5150, 41.1047000, 'PENDING', '2026-03-26 06:25:10'),
(2, 'TISI202603260002', 'บริษัท บี จำกัด ', 'INDIVIDUAL', 1, '111', NULL, '11', 'เอ', 'เอ', 'ทางขวาง', 'แวงน้อย', 'ขอนแก่น', NULL, NULL, NULL, '40230', 'นาง', 'sirisak', 'นก', 'phupha', '0981234569', 'sirisak2013@gmail.com', 10300, 41.1047000, 'PENDING', '2026-03-26 06:47:47'),
(3, 'TISI202603260003', 'บริษัท เอ จำกัด ', '1234567891234', 1, '111', NULL, '11', 'เอ', 'เอ', 'ชีวึก', 'ขามสะแกแสง', 'นครราชสีมา', NULL, NULL, NULL, '30290', 'นาง', 'sirisak', 'นก', 'phupha', '0981234569', 'sirisak2013@gmail.com', 5640, 41.1047000, 'PENDING', '2026-03-26 06:58:30'),
(4, 'TISI20260326T08:57:1', 'บริษัท เอ จำกัด ', '1234567891234', 1, '111', NULL, '11', 'เอ', 'เอ', 'พนมเศษ', 'ท่าตะโก', 'นครสวรรค์', NULL, NULL, NULL, '60160', 'นาง', 'sirisak', 'นก', 'phupha', '0981234569', 'sirisak2013@gmail.com', 5150, 41.1047000, 'PENDING', '2026-03-26 08:57:19'),
(5, 'TISI20260327101706', 'บริษัท เอ จำกัด ', '1234567891234', 1, '111', NULL, '11', 'เอ', 'เอ', 'ลำชี', 'ฆ้องชัย', 'กาฬสินธุ์', NULL, NULL, NULL, '46130', 'นาย', 'sirisak', 'นก', 'phupha', '0981234569', 'sirisak2013@gmail.com', 8040, 41.1652000, 'PENDING', '2026-03-27 03:17:06'),
(6, 'TISI20260327143850', 'บริษัท วาย จำกัด ', '9876543219876', 1, '222', NULL, '22', '22', '22', 'บางพลวง', 'บ้านสร้าง', 'ปราจีนบุรี', NULL, NULL, NULL, '25150', 'นาย', 'sirisak', 'นก', 'phupha', '0981234569', 'sirisak2013@gmail.com', 5158, 41.1652000, 'PENDING', '2026-03-27 07:38:50');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
