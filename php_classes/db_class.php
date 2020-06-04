<?php
class db_class{
    static private $connection = false;
    function __construct(){
        $this->columns_cache = array();
    }
    function connect($host,$username,$password,$dbname)
    {
        // if already connected in another instance return
        if (!empty(self::$connection)) return true;
        try {
            $dsn = "mysql:host={$host};dbname={$dbname}";
            $options = array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            );
            self::$connection = new PDO($dsn, $username, $password, $options);
            $this->query("SET NAMES utf8");
        }
        catch (PDOException $e) {
            return false;
            //debug($e->getMessage());
        }
    }

	function escape($str){    
        if (!$connection = self::$connection) return $str;
        return $connection->quote($str); 
    }

    function array_to_insert_update_sql($dta,$table)
	{
		$sql='';		
		foreach ($dta as $k=>$v)
		{			
			$sql .= ($sql=='')?"`$k`=".$this->escape($v):",`$k`=".$this->escape($v);			
		}
		$sql ="insert into `$table` set $sql on duplicate key update $sql";
		return $sql;
    }

    function table_columns($table)
	{
        if (!$connection = self::$connection) return false;
        if (!empty($this->columns_cache[$table])) return $this->columns_cache[$table];
        $columns = array();
        $q = $connection->prepare("SELECT COLUMN_NAME as field FROM information_schema.columns WHERE table_name =:table");
        $q->bindParam(':table', $table);
        $q->execute();
        $ret = $q->fetchAll();
        if (empty($ret)) return false;
        foreach($ret as $column){
            $columns[] = $column['field'];
        }
        $this->columns_cache[$table] = $columns;
        return $columns;
    }

    function array_insert_update($data,$table){
        if (!$connection = self::$connection) return false;
        if (!is_array($data)) return false;
        if (!$columns = $this->table_columns($table)) return false;
        foreach($data as $k=>$v) if (!in_array($k,$columns)) unset($data[$k]);
        if (empty($data)) return false;
        $sql='';
        $values = array();
        foreach ($data as $k=>$v){
            $sql .= ($sql=='')?"`$k`= ? ":",`$k`= ? ";
            $values[] = $v;
        } 
        foreach ($data as $k=>$v){
            $values[] = $v;
        }
        $sql ="insert into `$table` set $sql on duplicate key update $sql";
        $q = $connection->prepare($sql);
        return $q->execute($values);
    }    

    function query($sql){
        if (!$connection = self::$connection) return false;
        return $connection->query($sql);
    }

}