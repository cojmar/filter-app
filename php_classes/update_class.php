<?php
class update_class
{
    function __construct($check_updates = true)
    {
        $this->assets_path = 'assets' . DIRECTORY_SEPARATOR . 'import' . DIRECTORY_SEPARATOR;
        $this->assets_json_path = 'assets' . DIRECTORY_SEPARATOR . 'import_json' . DIRECTORY_SEPARATOR;
        if ($check_updates) $this->check_updates();
    }
    private function read_xml($file)
    {
        try {
            $data = @file_get_contents($file);
        } catch (\Throwable $th) {
            return false;
        }

        try {
            $xml = simplexml_load_string($data);
        } catch (\Throwable $th) {
            return false;
        }
        $xml = json_encode($xml);
        return json_decode($xml, 1);
    }
    public function curl($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-type: application/x-www-form-urlencoded; charset=UTF-8"));
        curl_setopt($ch, CURLINFO_HEADER_OUT, TRUE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    }

    public function get_json_codes_list()
    {
        $result = $this->curl("http://candy:L0ll1p0p@at-wienerlinien-4.thoreb.com:8080/candy-realtime-web/deprecated.jsp");
        $result = explode("<h2>JSON Links</h2>", $result);
        $result = explode("</table>", $result[1]);
        $result = explode('<a href="', $result[0]);
        $ret = array();
        foreach ($result as $k => $file) {
            if ($k == 0) continue;
            $file =  explode('"', $file);
            $file = $file[0];
            $name = explode("/deprecated/", $file);
            $name = str_replace("/", "_", $name[1]) . '.json';
            $location = "http://candy:L0ll1p0p@at-wienerlinien-4.thoreb.com:8080" . $file;
            $data = $this->curl($location);
            $ret[$name] = array(
                "size" => strlen($data),
                "data" => $data,
                "location" => $location
            );
        }
        return $ret;
    }

    private function get_codes_list()
    {
        $base_path = "http://at-wienerlinien-4.thoreb.com/candy/data-failure/";
        $xml_url = "http://at-wienerlinien-4.thoreb.com/candy/data-failure/DataVersionList.xml";
        if (!$data = $this->read_xml($base_path . "DataVersionList.xml")) {
            debug('Failed to get xml:' . $xml_url);
            return false;
        } else {
            $item = end($data['table']['r']);
            if ((isset($item['f'])) && (isset($item['f'][0]))) {
                $last_version = $item['f'][0];
            }
        }
        if (empty($last_version)) {
            debug("Error: can't detect version");
            return false;
        }
        //$last_version = 4;//test downgrade
        $base_path .= "{$last_version}/";
        if (!$data = $this->read_xml($base_path . "DataFileList.xml")) {
            debug('Failed to get xml:' . $xml_url);
            return false;
        } else {
            $files = array();
            foreach ($data['table']['r'] as $item) {
                $files[$item['f'][0]] = array(
                    'size' => $item['f'][1],
                    'checksum' => $item['f'][2],
                    'date' => $item['f'][3],
                    'location' => $base_path . $item['f'][0]
                );
            }
        }
        return $files;
    }
    private function get_assets_list($path = false)
    {
        if (empty($path)) $path = $this->assets_path;
        $files = array();
        $assets = array_diff(scandir($path), array('.', '..'));
        foreach ($assets as $file_name) {
            $location = $path . $file_name;
            $files[$file_name] = array(
                'size' => filesize($location),
                'checksum' => hash_file('md5', $location),
                'date' => date("Y-m-d H:i:s T", filemtime($location)),
                'location' => $location
            );
        }
        return ($files);
    }

    private function update_codes_from_json()
    {
        debug('Checking event/error codes json files');
        $ret = false;
        if ($codes_list = $this->get_json_codes_list()) {
            $assets_list = $this->get_assets_list($this->assets_json_path);
            foreach ($codes_list as $file => $file_info) {
                $up_to_date = (isset($assets_list[$file]));
                if ($up_to_date) {
                    if ($assets_list[$file]['size'] !== $file_info['size']) $up_to_date = false;
                }
                $msg = ($up_to_date) ? 'ok' : 'updated';
                if (empty($up_to_date)) {
                    $ret = true;
                    $file_data = $file_info['data'];
                    $out_file = $this->assets_json_path . $file;
                    $write = @file_put_contents($out_file, $file_data);
                    if ($write === false) {
                        $msg = 'failed to write file: ' . $out_file;
                    };
                }
                debug($file . " - " . $msg);
            }
        } else {
            debug("Failed to get codes_list");
        }
        return $ret;
    }


    private function update_codes()
    {
        debug('Checking event/error codes files');
        $ret = false;
        if ($codes_list = $this->get_codes_list()) {
            if ($assets_list = $this->get_assets_list()) {
                foreach ($assets_list as $file => $file_info) {
                    if (isset($codes_list[$file])) {
                        $up_to_date = true;
                        if ($file_info['size'] != $codes_list[$file]['size']) $up_to_date = false;
                        if ($file_info['checksum'] != $codes_list[$file]['checksum']) $up_to_date = false;
                        $msg = ($up_to_date) ? 'ok' : 'updated';
                        if (empty($up_to_date)) {
                            $ret = true;
                            /*
                            debug('current version');
                            debug($file_info);
                            debug('server version');
                            debug($codes_list[$file]);
                            */
                            $file_data = file_get_contents($codes_list[$file]['location']);
                            $out_file = $file_info['location'];
                            $write = @file_put_contents($out_file, $file_data);
                            if ($write === false) {
                                $msg = 'failed to write file: ' . $out_file;
                            };
                        }
                        debug($file . " - " . $msg);
                    }
                }
            } else {
                debug("Failed to get assets_list");
            }
        } else {
            debug("Failed to get codes_list");
        }
        return $ret;
    }
    private function update_vehicles()
    {
        debug('Checking vehicles');
        $change = false;
        $local_file = str_replace("/", DIRECTORY_SEPARATOR, "assets/import/json.json");
        $external_data = file_get_contents("http://datanisse:GURKmajonas@at-wienerlinien.thoreb.com:8080/candy-data-web/services/vehicleList/json");
        $external_file_info = array(
            'size' => strlen($external_data),
            'checksum' => md5($external_data)
        );
        $local_data = file_get_contents($local_file);
        $local_file_info = array(
            'size' => strlen($local_data),
            'checksum' => md5($local_data)
        );
        $unchanged = ($external_file_info === $local_file_info);
        $msg = "{$local_file} - ok";
        if (!$unchanged) {
            $write = @file_put_contents($local_file, $external_data);
            $msg = "{$local_file} - updated";
            if ($write === false) {
                $msg = 'failed to write file: ' . $local_file;
            } else {
                $change = true;
            }
        }
        debug($msg);
        return $change;
    }

    private function check_updates()
    {
        $update_done = false;
        if ($this->update_codes()) {
            $update_done = true;
            debug('data failure updated');
        }

        if ($this->update_codes_from_json()) {
            $update_done = true;
            debug('data failure updated');
        }



        if ($this->update_vehicles()) {
            $update_done = true;
            debug('data failure updated');
        }
        if ($update_done) {
            $importer = new import_class();
            debug('Importing data from files to db!');
            $importer->import();
        } else {
            debug('Nothing to update, all data is up to date!');
        }
    }
}