<?php
class import_class{
    function __construct(){
        $this->files_path = "assets".DIRECTORY_SEPARATOR."import".DIRECTORY_SEPARATOR;
        $this->lang = "de_DE";
        $this->fallback_lang = "en_GB";
        $this->db = new db_class();
    }
    function get_files(){
        $files = scandir($this->files_path);
        unset($files[0]);
        unset($files[1]);
        foreach($files as &$file){
            $file = $this->files_path . $file;
        }
        return array_values($files);
    }

    function check_data_type($header){
        $header = explode("\t",$header);
        $type = false;
        $types = array(
            'dm1_failure'=>array(
                'ECU',
                'SPN',
                'FMI'
            ),
            'evo_bus_bosch'=>array(
                'ECU',
                'DTC'
            ),
            'evo_bus_continental'=>array(
                'ECU',
                'Code',
                'Environment'
            ),
            'evo_bus_event_code'=>array(
                'System',
                'Code',
                'Level',
                'Icon'
            )
        );
        foreach($types as $data_type=>$required_comlumns){
            $ok = true;
            foreach($required_comlumns as $required_comlumn){
                if (!in_array($required_comlumn,$header)){
                    $ok = false;
                    break;
                }
            }
            if ($ok){
                $type = $data_type;
                break;
            }
        }
        return $type;
    }
    function csv_to_array($data){
        $head = false;
        $ret = array();
        foreach($data as $row){
            $row = explode("\t",$row);
            if (empty($head)){
                $head = $row;
            }
            else{
                $item = array();
                foreach($head as $k=>$v){
                    $v = str_replace("\n","",$v);
                    $item[$v] = $row[$k];
                }
                $ret[]=$item;

            }
        }
        return $ret;
    }

    function get_description($data){
        $ret = false;
        if (isset($data[$this->lang])) $ret = $data[$this->lang];
        elseif($data[$this->fallback_lang]) $ret = $data[$this->fallback_lang];
        return $ret;
    }

    function make_code($data,$formula){
        $ret = array();
        foreach($formula as $v){
            $ret[$v] = $data[$v];
        }
        return implode("-",$ret);
    }
    
    function import_dm1_failure($data){
        //return false;
        $code_formula = array('System','ECU','SPN','FMI');        
        foreach($data as $row){
            $item = array(
                'system'        =>'DM1',
                'type'          =>'failure',
                'code'          => $this->make_code($row,$code_formula),
                'level'         => 'grey',
                'icon'          => '',
                'description'   => $this->get_description($row)
            );
            $this->db->array_insert_update($item,"codes");
        }        
    }
    function import_evo_bus_bosch($data){
        //return false;
        $code_formula = array('System','ECU','DTC');        
        foreach($data as $row){
            $item = array(
                'system'        =>'BOSCH',
                'type'          =>'failure',
                'code'          => $this->make_code($row,$code_formula),
                'level'         => 'grey',
                'icon'          => '',
                'description'   => $this->get_description($row)
            );                
            $this->db->array_insert_update($item,"codes");
        }        
    }
    function import_evo_bus_continental($data){
        //return false;
        $code_formula = array('System','ECU','Code');        
        foreach($data as $row){
            $item = array(
                'system'          =>'CONTINENTAL',
                'type'            =>'failure',
                'code'            => $this->make_code($row,$code_formula),
                'level'           => 'grey',
                'icon'            => '',
                'description'     => $this->get_description($row)
            );
            $this->db->array_insert_update($item,"codes");
        }        
    }

    function import_evo_bus_event_code($data){
        //return false;
        $code_formula = array('Code');        
        foreach($data as $row){
            $item = array(
                'system'        => $row['System'],
                'type'          =>'event',
                'code'          => $this->make_code($row,$code_formula),
                'level'         => (!empty($row['Level']))?$row['Level']:'grey',
                'icon'          => $row['Icon'],
                'description'   => $this->get_description($row)
            );
            $this->db->array_insert_update($item,"codes");
        }
    }

    function import_cars_csv($data){        
        foreach($data as $row){            
            $this->db->array_insert_update($row,"cars");            
        }
    }

    function install(){
        $installer = new install_class();
        $installer->install();			
    }

    function import(){
        $this->install();
        $files = $this->get_files();
        foreach($files as $file){
            $path_info = pathinfo($file);            
            $file_data = ($path_info['extension'] ==='gz')?gzfile($file):file_get_contents($file);
            $file_type = ($path_info['extension'] ==='gz')?$this->check_data_type($file_data[0]):'cars_csv';
            if ($file_type){                
                debug('Type: '.$file_type);
                $method = 'import_'.$file_type;
                $file_data =($file_type!=='cars_csv')?$this->csv_to_array($file_data):json_decode($file_data,1);
                if (method_exists($this,$method)){                    
                    $this->$method($file_data);
                }
                else{
                    //continue;
                    debug('File: '.$file);
                    debug('Type: '.$file_type);
                    debug($file_data);                    
                }
            }
        }
        $builder = new build_class();
		$builder->build();
    }
}
