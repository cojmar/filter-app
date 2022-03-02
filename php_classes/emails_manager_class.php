<?php
class emails_manager_class
{
    function __construct()
    {
        $this->db = new db_class();
    }
    function get_updates($time_stamp = false)
    {
        $time_stamp = empty($time_stamp) ? 0 : $time_stamp;
        $date = date("Y-m-d H:i:s", $time_stamp);
        $sql = "
                SELECT *
                FROM `email_actions_log`
                WHERE `time_stamp` >= '{$date}'
            ";
        $db_ret = $this->db->query($sql)->fetchAll();
        $ret = array(
            'deleted' => array(),
            'changed' => array()
        );
        foreach ($db_ret as $item) {
            $key = ($item["action"] === "delete") ? "deleted" : "changed";
            $ret[$key][] = $item['email'];
        }
        return $ret;
    }
    function log_action($email, $action)
    {
        $this->db->query("
            DELETE FROM `email_actions_log`
            WHERE
            `time_stamp` < '" . date("Y-m-d H:i:s", strtotime("-1 day")) . "'
        ");

        $this->db->array_insert_update(array(
            "email" => $email,
            "action" => $action,
            "time_stamp" => date("Y-m-d H:i:s")
        ), "email_actions_log");
    }

    function get_tree_structure()
    {
        if (!empty($this->cache_structure)) return $this->cache_structure;
        $sql = "
            SELECT 
                DISTINCT(`v`.`localAreaManagement`) AS `local_area`,
                `v`.`regionalManagement` AS `region`,
                `v`.`areaManagement` AS `area`    
            FROM `filter_app`.`vehicles` AS `v`
            GROUP BY(v.localAreaManagement)
        ";
        $data = $this->db->query($sql)->fetchAll();
        $struct = array(
            'area' => array(),
            'local_area' => array()
        );
        foreach ($data as $item) {
            $struct['area'][$item['area']] = array('region' => $item['region']);
            $struct['local_area'][$item['local_area']] = array('region' => $item['region'], 'area' => $item['area']);
        }

        $this->cache_structure = $struct;
        return $struct;
    }

    function nested_vehicles($vehicles)
    {
        $ret = array();
        $struct = $this->get_tree_structure();
        //return $struct;
        foreach ($vehicles as $item) {
            switch ($item['type']) {
                default:
                    if (!isset($ret[$item['region']])) $ret[$item['region']] = array();
                    if (!isset($ret[$item['region']][$item['area']])) $ret[$item['region']][$item['area']] = array();
                    if (!isset($ret[$item['region']][$item['area']][$item['local_area']])) $ret[$item['region']][$item['area']][$item['local_area']] = array();
                    $ret[$item['region']][$item['area']][$item['local_area']][] = $item['description'];
                    break;
                case 'region':
                    if (!isset($ret[$item['description']])) $ret[$item['description']] = array();
                    break;
                case 'area':
                    $item = array_merge($item, $struct['area'][$item['description']]);
                    if (!isset($ret[$item['region']])) $ret[$item['region']] = array();
                    if (!isset($ret[$item['region']][$item['description']]))  $ret[$item['region']][$item['description']] = array();
                    break;
                case 'local_area':
                    $item = array_merge($item, $struct['local_area'][$item['description']]);
                    if (!isset($ret[$item['region']])) $ret[$item['region']] = array();
                    if (!isset($ret[$item['region']][$item['area']])) $ret[$item['region']][$item['area']] = array();
                    if (!isset($ret[$item['region']][$item['area']][$item['description']])) $ret[$item['region']][$item['area']][$item['description']] = array();
                    break;
            }
        }
        //$ret = $vehicles;

        return $ret;
    }

    function get_email_data($email, $format_for_front = true)
    {
        if ($email_id = $this->get_email_id($email)) {
            $ret = array(
                "email" => array(),
                "codes" => array(),
                "vehicles" => array()
            );

            $sql = "
                SELECT *
                FROM `emails`
                WHERE `id` = {$email_id}
                LIMIT 1
            ";
            $ret['email'] = $this->db->query($sql)->fetch();

            $sql = "
                SELECT `code`,`nach`
                FROM `email_codes`
                WHERE `email_id` = {$email_id}
            ";

            $db_ret = $this->db->query($sql)->fetchAll();
            $ret['codes'] = array();
            foreach ($db_ret as $code_item) {
                $ret['codes'][$code_item['code']] = $code_item['nach'];
            }

            $sql = "
                SELECT 
                    `ev`.*,
                    `v`.`regionalManagement` AS `region`,
                    `v`.`areaManagement` AS `area`,
                    `v`.`localAreaManagement` AS `local_area`
                FROM `filter_app`.`email_vehicles` AS `ev`
                LEFT JOIN `filter_app`.`vehicles` AS `v` on `ev`.`description` = `v`.`id`
                WHERE `ev`.`email_id` = {$email_id}
            ";

            $db_ret = $this->db->query($sql)->fetchAll();
            $ret['vehicles'] = array();
            foreach ($db_ret as $item) {
                if ($format_for_front) {
                    $id = ($item['type'] === 'vehicle') ? $item['description'] : "{$item['description']}_{$item['type']}";
                    $ret['vehicles'][] = $id;
                } else {
                    $ret['vehicles'][] = $item;
                }
            }
            if (!$format_for_front) $ret['vehicles'] = $this->nested_vehicles($ret['vehicles']);
            return $ret;
        }
        return false;
    }

    function delete_email($email)
    {
        if ($email_id = $this->get_email_id($email)) {
            $this->db->query("
                DELETE FROM `email_codes`
                WHERE `email_id` = {$email_id}
            ");
            $this->db->query("
                DELETE FROM `emails`
                WHERE `id` = {$email_id}
            ");
            $this->db->query("
                DELETE FROM `email_vehicles`
                WHERE `email_id` = {$email_id}
            ");
            $this->log_action($email, "delete");
            return true;
        }
        return false;
    }

    function save_email($data)
    {
        $email_id = false;
        if (isset($data['email'])) {
            if (!empty($data['email']['email'])) {
                $action = "insert";
                if ($email_id = $this->get_email_id($data['email']['email'])) {
                    $action = "update";
                    $data['email']['id'] = $email_id;
                }
                $change = true;
                if ($action === 'update') {
                    $change = false;
                    if ($email_data = $this->get_email_data($data['email']['email'])) {
                        foreach ($email_data as $cat => $email_cat_data) {
                            if (isset($data[$cat])) {
                                foreach ($data[$cat] as $update_key => $update_val) {
                                    if (!isset($email_cat_data[$update_key])) {
                                        $change = true;
                                    } elseif ($update_val != $email_cat_data[$update_key]) {
                                        if (empty($email_cat_data[$update_key]) && empty($update_val)) {
                                            $change = false;
                                        } else {
                                            //$action = "{$update_key} {$update_val} {$email_cat_data[$update_key]}";
                                            $change = true;
                                        }
                                    }
                                }
                                foreach ($email_cat_data as $update_key => $update_val) {
                                    if (!isset($data[$cat][$update_key])) {
                                        $change = true;
                                        //$action = "{$cat} $update_key";
                                    }
                                }
                            }
                        }
                    }
                }

                if ($change) {
                    $this->db->array_insert_update($data['email'], "emails");
                    if ($data['email']['active'] == '0' && $change) $action = 'delete';
                    if ($data['email']['active'] == '1' && $change) $action = 'insert';
                    $this->log_action($data['email']['email'], $action);
                }
                $email_id = $this->get_email_id($data['email']['email']);
            }
        }

        if ($email_id && isset($data['codes'])) {
            if (is_array($data['codes'])) {
                $this->db->query("
                    DELETE FROM `email_codes`
                    WHERE `email_id` = {$email_id}
                ");

                if (!empty($data['codes'])) {
                    $sql = "
                        INSERT INTO `email_codes` (`email_id`, `code`, `nach`) VALUES
                    ";
                    foreach ($data['codes'] as $code => $nach) {
                        $sql .= "({$this->db->escape($email_id)},{$this->db->escape($code)},{$this->db->escape($nach)}),";
                    }
                    $sql = substr($sql, 0, -1);
                    $sql .= ";";
                    $this->db->query($sql);
                }
            }
        }
        if ($email_id && isset($data['vehicles'])) {
            if (is_array($data['codes'])) {
                $this->db->query("
                    DELETE FROM `email_vehicles`
                    WHERE `email_id` = {$email_id}
                ");

                if (!empty($data['vehicles'])) {
                    $sql = "
                        INSERT INTO `email_vehicles` (`email_id`, `description`,`type`) VALUES
                    ";
                    foreach ($data['vehicles'] as $code => $vehicle_id) {
                        $type = 'vehicle';
                        if (strpos($vehicle_id, "_local_area") !== false) {
                            $type = "local_area";
                            $vehicle_id = str_replace("_{$type}", "", $vehicle_id);
                        } elseif (strpos($vehicle_id, "_area") !== false) {
                            $type = "area";
                            $vehicle_id = str_replace("_{$type}", "", $vehicle_id);
                        } elseif (strpos($vehicle_id, "_region") !== false) {
                            $type = "region";
                            $vehicle_id = str_replace("_{$type}", "", $vehicle_id);
                        }
                        $sql .= "({$this->db->escape($email_id)},{$this->db->escape($vehicle_id)},{$this->db->escape($type)}),";
                    }
                    $sql = substr($sql, 0, -1);
                    $sql .= ";";
                    $this->db->query($sql);
                }
            }
        }
        return $email_id;
    }

    function get_email_id($email)
    {
        $sql = "
            SELECT `id`
            FROM `emails`
            WHERE `email` like {$this->db->escape($email)}
            LIMIT 1
        ";

        $db_mail = $this->db->query($sql)->fetch();
        if (isset($db_mail['id'])) return $db_mail['id'];
        return false;
    }

    function get_emails($all = true)
    {
        $sql = "
            SELECT `email`
            FROM `emails`
        ";
        if (empty($all)) {
            $sql .= "
                WHERE `active`=1
            ";
        }
        $emails = array();
        $db_mails = $this->db->query($sql)->fetchAll();
        foreach ($db_mails as $mail_item) {
            $emails[] = $mail_item['email'];
        }
        $out = array(
            'emails' => $emails,
            'suggested_emails' => array(
                'portal@wienerlinien.at',
                'thoreb@wienerlinien.at',
                'thoreb-service@wienerlinien.at',
                'michael.o@thoreb.com'
            )
        );
        return $out;
    }
}