<?php
    include 'application/Core.php';
    $Core = new Core();
    $GET = filter_input_array(INPUT_GET);
    $data = $GET['data'];
    $type = $GET['type'];
    $info['id'] = (int) $GET['id'];
    $info['course'] = (int) $GET['course'];
    $info['group'] = (int) $GET['group'];
    $info['day'] = (int) $GET['day'];
    $info['type'] = $type;
    $start = microtime(true);
    ob_start();
    try {
        if (mb_strtolower($data) == 'list')
            $response = DataFactory::GetList ($type, $info['course']);
        else if (mb_strtolower($data) == 'schedule')
        {
            $response = DataFactory::GetSchedule ($type, $info);
            $response['current_week'] = ($Core->GetWeek(time()) == 1) ? 'up' : 'down';
            $Core->MemoryEffect($info);
        }
        else
            $response = '-1';       
    }
    catch (Exception $ex) {
        $response = $ex->getMessage();
    }
    if($config['dev_no_json_encoding'])
    {
        echo '<pre>';
        print_r($response);
        echo '</pre>';
    }
    else {
        echo json_encode($response);
    }
    
    ob_end_flush();
    exit;