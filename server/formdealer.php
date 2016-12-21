<?php
	$username = $_POST["username"];
	$corporateAccount = $_POST["corporateAccount"];
	$conferenceID = $_POST["conferenceID"];
	$password = $_POST["password"]; 
	$formArr = array(
		'username' => $username,
		'corporateAccount' => $corporateAccount,
		'conferenceID' => $conferenceID,
		'password' => $password
		 );
	header("Location:http://172.16.217.244:8301/webPlayTeacher/webplayteacher.html?username=".$username."&corporateAccount="
		.$corporateAccount."&conferenceID=".$conferenceID."&password=".$password);
 ?>