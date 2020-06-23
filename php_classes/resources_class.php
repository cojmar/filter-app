<?php
class resources_class{
    //==Init
    function __construct(){
        $this->resource = false;
        $this->action = false;
        $this->data = false;
        $this->segments = array();
        $this->em = new emails_manager_class();
    }
    public function run($segments=array(),$data = false,$action = false){
        if (empty($action)) $action = ($data ===false)?'GET':'SET';
        $this->resource = false;
        $this->data = $data;
        if (!is_array($segments)) $segments = array($segments);
        if (isset($segments[0])) $this->resource = array_shift($segments);
        $this->segments = $segments;
        $this->action = $action;
        $run = $this->run_action();        
        $ret = array(
            //'resource' =>$this->resource,
            //'action' => $this->action,
            'response' => $run,
            'time_stamp'=>strtotime('now')
        );
        if ($run === false || isset($run['error'])){
            //unset($ret['response']['error']);
            $ret['response'] = null;
            $ret['error'] =($run === false)?"invalid action":$run['error'];
        }        
        return $ret;
    }
    private function run_action(){
        $sep = strtolower($this->action."_");
        $sep_len = strlen($sep);
        $resources = array();
        if ($methods = get_class_methods($this)){
            foreach ($methods as $method){
                if (substr($method,0,$sep_len)===$sep) $resources[substr($method,$sep_len)] = $method;
            } 
        }
        if (empty($this->resource)){            
            return array_keys($resources);
        }else{
            if (isset($resources[$this->resource])){
                $action = $resources[$this->resource];
                return $this->$action();
            }
        }
        return false;
    }
    //==Actions    
    public function get_emails(){
        $ret = $this->em->get_emails();
        return $ret['emails'];
    }
    public function get_email(){
        $data = (!empty($this->segments[0]))?$this->segments[0]:false;
        $ret = array('error'=>'invalid email');
        if ($data){            
            if ($email_data = $this->em->get_email_data($data,false)){
                $ret = $email_data['email'];
                $ret['codes'] = (object)$email_data['codes'];
                $ret['vehicles'] = $email_data['vehicles'];
                unset($ret['id']);
            }
        }
        foreach($ret['vehicles'] as &$region){
            foreach($region as &$area){                
                $area = (object)$area;
            }
            $region = (object)$region;
        }
        return $ret;
    }
    public function get_updates(){
        $data = (!empty($this->segments[0]))?$this->segments[0]:false;        
        return $this->em->get_updates($data);
    }
}