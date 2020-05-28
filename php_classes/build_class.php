<?php
class build_class{
    function __construct(){
        $this->db = new db_class();
        $this->files_path = "assets".DIRECTORY_SEPARATOR."build".DIRECTORY_SEPARATOR;
    }

    function linear_children(&$data){
        $data = array_values($data);
        foreach($data as &$sub_data){
            $this->linear_children($sub_data['children']);
        }
    }

    function build_cars(){
        $sql = "
            SELECT *
            FROM  `cars`
        ";
        $cars = $this->db->query($sql)->fetchAll();
        $out = array();
        foreach($cars as $car){
            if (!isset($out[$car['regionalManagement']])){
                $out[$car['regionalManagement']] = array(
                    "id"=> $car['regionalManagement']."_region",
				    "text"=> $car['regionalManagement']." / Region",
				    "checked"=> false,
				    "hasChildren"=> true,
				    "children"=>array(
                    )
                );
            }
            if (!isset($out[$car['regionalManagement']]['children'][$car['areaManagement']])){
                $out[$car['regionalManagement']]['children'][$car['areaManagement']] = array(
                    "id"=> $car['areaManagement']."_area",
				    "text"=> $car['areaManagement']." / Area",
				    "checked"=> false,
				    "hasChildren"=> true,
				    "children"=>array(
                    )
                );
            }
            if (!isset($out[$car['regionalManagement']]['children'][$car['areaManagement']]['children'][$car['localAreaManagement']] )){
                $out[$car['regionalManagement']]['children'][$car['areaManagement']]['children'][$car['localAreaManagement']] = array(
                    "id"=> $car['localAreaManagement']."_local_area",
				    "text"=> $car['localAreaManagement'],
				    "checked"=> false,
				    "hasChildren"=> true,
				    "children"=>array(
                    )
                );
            }
            $out[$car['regionalManagement']]['children'][$car['areaManagement']]['children'][$car['localAreaManagement']]['children'][$car['id']] = array(
                "id"=> $car['id'],
                "text"=> $car['id'],//$car['registration'],
                "checked"=> false,
                "hasChildren"=> false,
                "children"=>array()
            );
        }   
        //debug($car);
        //debug($out);
        $this->linear_children($out);       
        $out = json_encode($out);
        file_put_contents($this->files_path."cars.json",$out);
    }
    
    function build_codes(){
        $sql = "
            SELECT *
            FROM  `codes`
            WHERE 
                `system` <> 'DM1'
        ";
        $codes = $this->db->query($sql)->fetchAll();
        $out = array();
        foreach($codes as $code){
            $item = array(
                'sel'          =>'',
                'icon'      => $code['icon'],
                'code'      => $code['code'],                
                'type'      => $code['type'],
                'system'    => $code['system'],
                'desc'      => $code['description'],
                'level'     => $code['level']
            );
            $out[] = $item;
        }
        //debug($out);
        $out = array("data"=>$out);
        $out = json_encode($out);
        file_put_contents($this->files_path."codes.json",$out);
    }

    function build(){
        $this->build_cars();
        $this->build_codes();
        debug('build done!');
    }

}