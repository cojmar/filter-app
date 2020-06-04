<?php
	class router{
		//==Routes
		protected function save_email(){
			$json = file_get_contents('php://input');
			$data = json_decode($json,1);
			$out = array();			
			$em = new emails_manager_class();
			$ok = $em->save_email($data);			
			$out['status']=($ok)?'saved':'invalid data';
			$out['id'] = $ok;
			json_output($out);
		}
		protected function get_email(){
			$data = (!empty($this->url_data[0]))?$this->url_data[0]:false;
			$out = array('error'=>true);
			if ($data){
				$em = new emails_manager_class();
				if ($email_data = $em->get_email_data($data)){
					$out = $email_data;
				}
			}
			json_output($out);
		}
		protected function check_email(){
			$data = (!empty($this->url_data[0]))?$this->url_data[0]:false;
			$out = array('status'=>false);
			if ($data){
				$em = new emails_manager_class();
				if ($em->get_email_id($data)){
					$out['status'] = true;
				}
			}
			json_output($out);
		}
		protected function get_emails(){
			$em = new emails_manager_class();
			$out = $em->get_emails();
			json_output($out);
		}		
		protected function import(){
            $importer = new import_class();
            $importer->import();
		}
		protected function install(){
			$installer = new install_class();
			$installer->install();		
			debug('Done.');
		}
       

		protected function build(){
			$builder = new build_class();
			$builder->build();
		}
		protected function test(){			
			$ret = $this->db->table_columns('codes');
			if (empty($ret)){
				debug("DB not working!");
			}else{
				debug("DB ok.");
			}			
		}
		public function client(){
            $out = file_get_contents('client.html');
            die($out);
		}
		public function need_login(){
			header("HTTP/1.1 401 Unauthorized");
            die('Unauthorized access, please use portal to login.');
		}
		public function check_login(){
			$sara = new sara_class();				
			$out = array(
				'login'=>$sara->check_login()
			);
			json_output($out);
		}
		public function default_route(){
            header("HTTP/1.0 404 Not Found");
            die;
		}
		//==Custom Init
		private function init(){
			$this->db = new db_class();
			$this->db->connect("localhost","root","Tu#1Fru#1","filter_app");
			$this->db->connect("localhost","root","asdasd","filter_app");
		}
		function __construct()
		{
			set_time_limit(0);
			// PROTECTED functions require login
			// Get url segments try to find a non private function with same name as 1st segment and run it
			// If not try to lunch default_route()
			// $this->route will be the 1st segment, 
			// $this->url_data will be array of rest of segments if any			
			$this->route = "client";//default route on empty segments
			$this->url_data = array();			
			$ok_run_route = true;
			if ($route_data = $this->get_route_data()){
				$this->route = array_shift($route_data);
				$this->url_data = $route_data;
			}
			if (method_exists($this,$this->route) && $this->route !==__FUNCTION__)
			{				
				$reflection = new ReflectionMethod($this, $this->route);
				$needs_login = (!$reflection->isPublic());
				$ok_run_route = ($needs_login)?false:true;
				if (!$ok_run_route){
					$sara = new sara_class();
					$ok_run_route = $sara->check_login();
				} 				
			}
			else{
				$this->route = "default_route";
			}
			if ($ok_run_route){				
				$route = $this->route;
				//==Run custom init
				if (method_exists($this,'init')) $this->init();
				//==Run route
				if (method_exists($this,$route)) $this->$route();
			}else{
				if (method_exists($this,'need_login')) $this->need_login();
			}
		}
		private function get_route_data()
		{	//==Processes url segments delimited by / returns array of segments or false
			$path = false;
			$real_path = substr(urldecode($_SERVER['REQUEST_URI']),strlen(dirname($_SERVER['SCRIPT_NAME'])));
			$path_info = pathinfo($real_path);
			$uri_path =(isset($path_info['dirname']) && strlen($path_info['dirname'])>1)?$path_info['dirname']:'';
			if (!empty($uri_path) && substr($uri_path,0,1)=="/") $uri_path =substr($uri_path,1);		
			if (!empty($uri_path)) $uri_path.="/";			
			$uri_path .=$path_info['basename'];
			if($path_info['basename'] == $path_info['filename'] && !empty($uri_path)) $path=explode("/",$uri_path);			
			elseif(!empty($path_info['basename'])) $path=explode("/",$uri_path);					
			return $path;
		}
	}
	//==Autoload
	spl_autoload_register(function ($class_name) {
		include 'php_classes' . DIRECTORY_SEPARATOR . $class_name . '.php';
	});	
	//==Run
	ini_set('display_errors', 1);
	error_reporting(E_ALL);
	set_time_limit(0);
	function json_output($data=false){
		$out = (is_array($data) || is_object($data))?json_encode($data):json_encode(array($data));
		header('Content-Type: application/json');
		die($out);
	}
	function debug($data,$mode=NULL)
	{	
		switch($mode)
		{
			default:$ret_data = print_r($data,1);break;
			case 1:$ret_data = json_encode($data);break;
			case 2:$ret_data = var_export($data,1);break;
		}
		print "<div style='background-color:#efefef;padding:5px;border:1px solid #5d5d5d;border-top:0px;'><xmp>".$ret_data."</xmp></div>";
	}
	$start_time = microtime(true);	
	ob_start();
	new router();
	$output = ob_get_contents();
	$execution_time = microtime(true) - $start_time;
	@ob_end_clean();
	print "
		<style>
			body, html{
				margin:1px 3px;
				padding:0px;
			}			
		</style>
		<div style='background-color:#5d5d5d;padding:5px;border:1px solid #5d5d5d;color:fff;font-size:14px;height:10px;line-height:10px;'>
			Execution time: {$execution_time} seconds
		</div>
	";	
	die($output);