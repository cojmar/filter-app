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
            CREATE TABLE IF NOT EXISTS `vehicles` (
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
                `id` bigint(21) NOT NULL AUTO_INCREMENT,
                `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `send_interval` float NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `email` (`email`) USING BTREE,
                KEY `send_interval` (`send_interval`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;     
        ";

        $sqls[] = "
            CREATE TABLE IF NOT EXISTS `email_codes` (
                `email_id` bigint(21) NOT NULL,
                `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                `nach` float NOT NULL,
                UNIQUE KEY `email_id` (`email_id`,`code`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        ";
        $sqls[] = "
            CREATE TABLE IF NOT EXISTS `email_vehicles` (
                `email_id` bigint(21) NOT NULL,
                `description` varchar(255) COLLATE utf8_unicode_ci NOT NULL,            
                `type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                UNIQUE KEY `email_id` (`email_id`,`description`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        ";
        $sqls[] = "
        CREATE TABLE IF NOT EXISTS `email_actions_log` (
            `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `action` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `time_stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`email`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    ";

        foreach ($sqls as $sql){
            $this->db->query($sql);
        }
        return $this;
    }
}