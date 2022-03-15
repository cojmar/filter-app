<?php
class sara_class
{
    function __construct()
    {
        $this->no_login_ips = array(
            //'86.121.167.156',
            '127.0.0.1',
            '5.2.149.9'
        );
    }
    function check_token($token = false)
    {
        //return true;
        if (in_array($_SERVER['REMOTE_ADDR'], $this->no_login_ips) !== false) return true;
        if (empty($token)) return false;
        $url = 'http://127.0.0.1:8080/SaraSERVER/resources/authorize/user/verify/' . $token;
        $response = file_get_contents($url);
        return (!empty($response)) ? true : false;
    }
    function check_login()
    {
        //return true;
        $token = (!empty($_SESSION['token'])) ? $_SESSION['token'] : false;
        return $this->check_token($token);
    }
}