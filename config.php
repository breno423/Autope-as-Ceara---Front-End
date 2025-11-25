<?php
// NÃO COLOCAR NADA ANTES DO <?php !!

define('DB_HOST', 'localhost');
define('DB_USER', 'u233503672_nathyel');
define('DB_PASS', 'N@thyel8416');
define('DB_NAME', 'u233503672_bancodaloja');

// CONEXÃO COM ERROS HABILITADOS
function conectarBanco() {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro de conexão: ' . $e->getMessage()
        ]);
        exit;
    }
}

function fecharBanco($conn) {
    if ($conn) {
        $conn->close();
    }
}
