<?php
class sara_class{
    function __construct(){ 
    }
    function check_token($token=false){
        if($_SERVER['REMOTE_ADDR']==='127.0.0.1') return true;
        if (empty($token)) return false;
        $url = 'http://127.0.0.1:8080/SaraSERVER/resources/authorize/user/verify/' . $token;
        $response = file_get_contents($url);
        return (!empty($response))?true:false;
    }
    function check_login(){        
        $token = (!empty($_SESSION['token']))?$_SESSION['token']:false;
        return $this->check_token($token);        
    }
}