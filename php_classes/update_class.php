<?php
class update_class{    
    function __construct(){
        $this->assets_path = 'assets'.DIRECTORY_SEPARATOR.'import'.DIRECTORY_SEPARATOR;


        $this->check_updates();
    }
    private function read_xml($file){
        try {
            $data = @file_get_contents($file);
        } catch (\Throwable $th) {
            return false;
        }
        
        try {
            $xml= simplexml_load_string($data);
        } catch (\Throwable $th) {
            return false;
        }
        $xml = json_encode($xml);
        return json_decode($xml,1);
    }

    private function get_data_failure_list(){
        $base_path = "http://at-wienerlinien-4.thoreb.com/candy/data-failure/";
        $xml_url = "http://at-wienerlinien-4.thoreb.com/candy/data-failure/DataVersionList.xml";
        if (!$data = $this->read_xml($base_path."DataVersionList.xml")){
            debug('Failed to get xml:'.$xml_url);
            return false;
        }else{
            $item = end($data['table']['r']);
            if ((isset($item['f'])) && (isset($item['f'][0]))){
                $last_version = $item['f'][0];
            }
        }
        if (empty($last_version)){
            debug("Error: can't detect version");
            return false;
        }
        //$last_version = 4;//test downgrade
        $base_path .= "{$last_version}/";
        if (!$data = $this->read_xml($base_path."DataFileList.xml")){
            debug('Failed to get xml:'.$xml_url);
            return false;
        }else{
            $files = array();
            foreach($data['table']['r'] as $item){
                $files[$item['f'][0]] = array(                    
                    'size'=>$item['f'][1],
                    'checksum'=>$item['f'][2],
                    'date'=>$item['f'][3],
                    'location'=>$base_path.$item['f'][0]
                );
            }
            
        }
        return $files;
    }
    private function get_assets_list(){
        $files = array();        
        $assets = array_diff(scandir($this->assets_path), array('.', '..'));
        foreach($assets as $file_name){
            $location = $this->assets_path.$file_name;
            $files[$file_name] = array(                    
                'size'=>filesize($location),
                'checksum'=>hash_file('md5', $location),
                'date'=>date("Y-m-d H:i:s T",filemtime($location)),
                'location'=>$location
            );
        }
        return($files);
    }
    private function update_data_failure(){
        debug('Checking data failure files');
        $ret = false;
        if($data_failiure_list = $this->get_data_failure_list()){            
            if ($assets_list = $this->get_assets_list()){
                foreach($assets_list as $file=>$file_info){
                    if (isset($data_failiure_list[$file])){
                        $up_to_date = true;
                        if ($file_info['size'] !=$data_failiure_list[$file]['size']) $up_to_date = false;
                        if ($file_info['checksum'] !=$data_failiure_list[$file]['checksum']) $up_to_date = false;
                        $msg = ($up_to_date)?'ok':'updated';
                        if (empty($up_to_date)){
                            $ret = true;
                            /*
                            debug('current version');
                            debug($file_info);
                            debug('server version');
                            debug($data_failiure_list[$file]);
                            */
                            $file_data = file_get_contents($data_failiure_list[$file]['location']);
                            $out_file = $file_info['location'];
                            $write = @file_put_contents($out_file,$file_data);
                            if($write ===false){
                                $msg = 'failed to write file: '.$out_file;                                
                            };
                        }
                        debug($file." - ".$msg);
                    }
                }                
            }
            else{
                debug("Failed to get assets_list");
            }
        }else{
            debug("Failed to get data_failiure_list");
        }
        return $ret;
    }
    private function update_data_events(){
        $path = "http://127.0.0.1:8080/candy-data-web/services/vehicleList/json";
        
        $data = file_get_contents($path);
        debug($data);

    }

    private function check_updates(){
        $update_done = false;
        if ($this->update_data_failure()){
            $update_done = true;
            debug('data failure updated');
        }
        $this->update_data_events();
        
    }
}