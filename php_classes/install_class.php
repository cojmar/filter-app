<?php
class install_class{
    function __construct(){     
        $this->db = new db_class();
    }
    function install(){
        $this->install_db();
    }
    function install_db(){
        $sqls = array();
        $sqls[] = "
            CREATE TABLE IF NOT EXISTS `cars` (
                `id` bigint(21) NOT NULL,
                `manufacturer` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `manufacturerSerial` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `registration` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `regionalManagement` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `areaManagement` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `localAreaManagement` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        ";

        $sqls[] = "
            CREATE TABLE IF NOT EXISTS `codes` (
                `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `system` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `level` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `icon` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `description` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                PRIMARY KEY (`code`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;          
        ";

        $sqls[] = "
            CREATE TABLE IF NOT EXISTS `emails` (
                `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `send_interval` float NOT NULL DEFAULT '0',
                PRIMARY KEY (`email`),
                KEY `send_interval` (`send_interval`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;          
        ";

        foreach ($sqls as $sql){
            $this->db->query($sql);
        }
        return $this;
    }
}