-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- ホスト: 127.0.0.1
-- 生成日時: 2021-10-15 03:37:51
-- サーバのバージョン： 10.4.21-MariaDB
-- PHP のバージョン: 8.0.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- データベース: `stless_db`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `shopping_time_data_table`
--

CREATE TABLE `shopping_time_data_table` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `shopping_date` date NOT NULL,
  `shopping_time` time NOT NULL,
  `time_zone` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- テーブルの構造 `store_table`
--

CREATE TABLE `store_table` (
  `id` int(11) NOT NULL,
  `data_transfer_flag` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- テーブルのデータのダンプ `store_table`
--

INSERT INTO `store_table` (`id`, `data_transfer_flag`) VALUES
(1, 0);

--
-- ダンプしたテーブルのインデックス
--

--
-- テーブルのインデックス `shopping_time_data_table`
--
ALTER TABLE `shopping_time_data_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`);

--
-- テーブルのインデックス `store_table`
--
ALTER TABLE `store_table`
  ADD PRIMARY KEY (`id`);

--
-- ダンプしたテーブルの AUTO_INCREMENT
--

--
-- テーブルの AUTO_INCREMENT `shopping_time_data_table`
--
ALTER TABLE `shopping_time_data_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- テーブルの AUTO_INCREMENT `store_table`
--
ALTER TABLE `store_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- ダンプしたテーブルの制約
--

--
-- テーブルの制約 `shopping_time_data_table`
--
ALTER TABLE `shopping_time_data_table`
  ADD CONSTRAINT `shopping_time_data_table_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store_table` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
