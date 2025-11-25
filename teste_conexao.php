<?php
// Arquivo para testar a conexão com o banco de dados

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Teste de Conexão</title></head><body>";
echo "<h2>Teste de Conexão - AutoPeças Maia</h2>";

// Teste 1: Verificar se MySQL está rodando
echo "<h3>1. Testando MySQL:</h3>";
$conn_test = @new mysqli('localhost', 'root', '');

if ($conn_test->connect_error) {
    echo "<span style='color:red'>❌ MySQL não está rodando ou credenciais incorretas</span><br>";
    echo "Erro: " . $conn_test->connect_error . "<br>";
    die();
} else {
    echo "<span style='color:green'>✅ MySQL está rodando!</span><br><br>";
}

// Teste 2: Verificar se o banco existe
echo "<h3>2. Verificando Banco 'autopecas_maia':</h3>";
$result = $conn_test->query("SHOW DATABASES LIKE 'autopecas_maia'");

if ($result->num_rows == 0) {
    echo "<span style='color:orange'>⚠️ Banco NÃO existe! Criando agora...</span><br>";
    
    // Criar banco
    if ($conn_test->query("CREATE DATABASE autopecas_maia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
        echo "<span style='color:green'>✅ Banco criado com sucesso!</span><br><br>";
    } else {
        echo "<span style='color:red'>❌ Erro ao criar banco: " . $conn_test->error . "</span><br>";
        die();
    }
} else {
    echo "<span style='color:green'>✅ Banco existe!</span><br><br>";
}

// Conectar ao banco específico
$conn = new mysqli('localhost', 'root', '', 'autopecas_maia');

if ($conn->connect_error) {
    die("<span style='color:red'>❌ Erro ao conectar ao banco: " . $conn->connect_error . "</span>");
}

$conn->set_charset("utf8mb4");

// Teste 3: Verificar tabelas
echo "<h3>3. Verificando Tabelas:</h3>";
$result = $conn->query("SHOW TABLES");

$tabelas_existem = false;
if ($result && $result->num_rows > 0) {
    echo "<ul>";
    while ($row = $result->fetch_array()) {
        echo "<li>" . $row[0] . "</li>";
        $tabelas_existem = true;
    }
    echo "</ul>";
}

if (!$tabelas_existem) {
    echo "<span style='color:orange'>⚠️ Tabelas não existem! Criando agora...</span><br>";
    
    // Criar tabela produtos
    $sql_produtos = "CREATE TABLE IF NOT EXISTS produtos (
        id BIGINT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10, 2) NOT NULL,
        quantidade INT NOT NULL,
        descricao TEXT,
        detalhes TEXT,
        categoria ENUM('destaque', 'motores', 'pneus', 'autopecas', 'suspensao') NOT NULL,
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($conn->query($sql_produtos)) {
        echo "<span style='color:green'>✅ Tabela 'produtos' criada!</span><br>";
    } else {
        echo "<span style='color:red'>❌ Erro ao criar 'produtos': " . $conn->error . "</span><br>";
    }
    
    // Criar tabela produto_imagens
    $sql_imagens = "CREATE TABLE IF NOT EXISTS produto_imagens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        produto_id BIGINT NOT NULL,
        imagem LONGTEXT NOT NULL,
        ordem INT DEFAULT 0,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($conn->query($sql_imagens)) {
        echo "<span style='color:green'>✅ Tabela 'produto_imagens' criada!</span><br><br>";
    } else {
        echo "<span style='color:red'>❌ Erro ao criar 'produto_imagens': " . $conn->error . "</span><br>";
    }
}

// Teste 4: Contar produtos
echo "<h3>4. Produtos Cadastrados:</h3>";
$result = $conn->query("SELECT COUNT(*) as total FROM produtos");
if ($result) {
    $row = $result->fetch_assoc();
    echo "Total: <b>" . $row['total'] . "</b> produtos<br><br>";
}

// Teste 5: Teste de inserção
echo "<h3>5. Testando Inserção:</h3>";
$id_teste = time();
$sql = "INSERT INTO produtos (id, nome, preco, quantidade, descricao, detalhes, categoria) 
        VALUES (?, 'Produto Teste', 99.90, 10, 'Teste', 'Teste', 'destaque')";

$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param("i", $id_teste);
    if ($stmt->execute()) {
        echo "<span style='color:green'>✅ Teste de inserção OK!</span><br>";
        $conn->query("DELETE FROM produtos WHERE id = $id_teste");
        echo "<span style='color:blue'>🔄 Produto teste removido</span><br>";
    } else {
        echo "<span style='color:red'>❌ Erro ao inserir: " . $stmt->error . "</span><br>";
    }
    $stmt->close();
}

echo "<br><hr><h2 style='color:green;'>✅ Sistema está pronto para usar!</h2>";
echo "<p><a href='admin.php' style='padding:10px 20px; background:#007bff; color:white; text-decoration:none; border-radius:5px;'>Ir para Admin</a></p>";
echo "<p><a href='index.php' style='padding:10px 20px; background:#28a745; color:white; text-decoration:none; border-radius:5px;'>Ir para Site</a></p>";

$conn->close();
echo "</body></html>";
?>