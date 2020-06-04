<?php
class emails_manager_class{
    function __construct(){        
        $this->db = new db_class();
    }
    function get_email($email){

    }

    function delete_email($email){
        if ($email_id = $this->get_email_id($data['email']['email'])){
            $this->db->query("
                DELETE FROM `email_codes`
                WHERE `email_id` = {$email_id}
            ");
            $this->db->query("
                DELETE FROM `emails`
                WHERE `id` = {$email_id}
            ");
            return true;
        }
        return false;
    }

    function save_email($data){
        $out = array();
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
            $out['codes'] = array();
            if (is_array($data['codes'])){                
                $this->db->query("
                    DELETE FROM `email_codes`
                    WHERE `email_id` = {$email_id}
                ");
                foreach($data['codes'] as $code=>$flag){
                    $in = array(
                        "email_id"=>$email_id,
                        "code"=>$code,
                        "flag"=> $flag
                    );
                    $this->db->array_insert_update($in,"email_codes");
                }
            }      
        }		
        return $out;
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
            'suggested_emails'=>array('admin@test.com','worker@test.com')
        );
        return $out;        
    }
}