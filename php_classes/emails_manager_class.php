<?php
class emails_manager_class{
    function __construct(){        
        $this->db = new db_class();
    }
    function get_email_data($email){
        if ($email_id = $this->get_email_id($email)){
            $ret = array(
                "email"=>array(),
                "codes"=>array(),
                "vehicles"=>array()
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
            foreach($db_ret as $code_item){
                $ret['codes'][$code_item['code']] = $code_item['nach'];
            }

            $sql = "
                SELECT `description`,`type`
                FROM `email_vehicles`
                WHERE `email_id` = {$email_id}
            ";   

            $db_ret = $this->db->query($sql)->fetchAll();
            $ret['vehicles'] = array();
            foreach($db_ret as $item){
                $id =($item['type']==='vehicle')?$item['description']:"{$item['description']}_{$item['type']}";
                $ret['vehicles'][] = $id;
            }

            return $ret;
        }
        return false;
    }

    function delete_email($email){
        if ($email_id = $this->get_email_id($email)){
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
            return true;
        }
        return false;
    }

    function save_email($data){        
        $email_id = false;        
        if (isset($data['email'])){
            if (!empty($data['email']['email'])){
                if ($email_id =$this->get_email_id($data['email']['email'])){
                    $data['email']['id'] = $email_id;
                }
                $this->db->array_insert_update($data['email'],"emails");
                $email_id =$this->get_email_id($data['email']['email']);
            }
        }

        if ($email_id && isset($data['codes'])){            
            if (is_array($data['codes'])){                
                $this->db->query("
                    DELETE FROM `email_codes`
                    WHERE `email_id` = {$email_id}
                ");

                if (!empty($data['codes'])){
                    $sql = "
                        INSERT INTO `email_codes` (`email_id`, `code`, `nach`) VALUES
                    ";
                    foreach($data['codes'] as $code=>$nach){
                        $sql .= "({$this->db->escape($email_id)},{$this->db->escape($code)},{$this->db->escape($nach)}),";
                    }
                    $sql = substr($sql,0,-1);
                    $sql.=";";                    
                    $this->db->query($sql);
                }
            }      
        }
        if ($email_id && isset($data['vehicles'])){            
            if (is_array($data['codes'])){                
                $this->db->query("
                    DELETE FROM `email_vehicles`
                    WHERE `email_id` = {$email_id}
                ");

                if (!empty($data['vehicles'])){
                    $sql = "
                        INSERT INTO `email_vehicles` (`email_id`, `description`,`type`) VALUES
                    ";
                    foreach($data['vehicles'] as $code=>$vehicle_id){
                        $type = 'vehicle';
                        if (strpos($vehicle_id,"_local_area") !==false){
                            $type = "local_area";
                            $vehicle_id = str_replace("_{$type}","",$vehicle_id);
                        }elseif(strpos($vehicle_id,"_area") !==false){
                            $type = "area";
                            $vehicle_id = str_replace("_{$type}","",$vehicle_id);
                        }elseif(strpos($vehicle_id,"_region") !==false){
                            $type = "region";
                            $vehicle_id = str_replace("_{$type}","",$vehicle_id);
                        }
                        $sql .= "({$this->db->escape($email_id)},{$this->db->escape($vehicle_id)},{$this->db->escape($type)}),";
                    }
                    $sql = substr($sql,0,-1);
                    $sql.=";";                    
                    $this->db->query($sql);
                }
            }      
        }
        return $email_id;
    }

    function get_email_id($email){
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

    function get_emails(){
        $sql = "
            SELECT `email`
            FROM `emails`
        ";
        $emails = array();
        $db_mails = $this->db->query($sql)->fetchAll();
        foreach($db_mails as $mail_item){
            $emails[] = $mail_item['email'];
        }
        $out = array(
            'emails'=>$emails,
            'suggested_emails'=>array(
                'portal@wienerlinien.at',
                'thoreb@wienerlinien.at',
                'thoreb-service@wienerlinien.at',
                'michael.o@thoreb.com'
            )
        );
        return $out;        
    }
}