<?php
// Desabilitar output de erros HTML
error_reporting(0);
ini_set('display_errors', 0);

// Header JSON primeiro
header('Content-Type: application/json; charset=utf-8');

// Limpar qualquer output anterior
ob_clean();

require_once 'config.php';

try {
    $conn = conectarBanco();
    $acao = $_GET['acao'] ?? $_POST['acao'] ?? '';

    switch ($acao) {
        case 'listar':
            listarProdutos($conn);
            break;
        
        case 'adicionar':
            adicionarProduto($conn);
            break;
        
        case 'remover':
            removerProduto($conn);
            break;
        
        default:
            echo json_encode(['success' => false, 'message' => 'Ação inválida']);
    }

    fecharBanco($conn);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}

exit;

// Listar todos os produtos
function listarProdutos($conn) {
    $sql = "SELECT id, nome, preco, quantidade, descricao, detalhes, categoria 
            FROM produtos ORDER BY data_cadastro DESC";
    
    $result = $conn->query($sql);
    $produtos = [];
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $produto = $row;
            
            // Buscar imagens do produto
            $sqlImagens = "SELECT imagem FROM produto_imagens 
                          WHERE produto_id = ? ORDER BY ordem";
            $stmtImg = $conn->prepare($sqlImagens);
            $stmtImg->bind_param("i", $row['id']);
            $stmtImg->execute();
            $resultImg = $stmtImg->get_result();
            
            $imagens = [];
            while ($img = $resultImg->fetch_assoc()) {
                $imagens[] = $img['imagem'];
            }
            
            $produto['imagens'] = $imagens;
            $produtos[] = $produto;
            
            $stmtImg->close();
        }
    }
    
    echo json_encode(['success' => true, 'produtos' => $produtos]);
}

// Adicionar novo produto
function adicionarProduto($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        return;
    }
    
    // Validar campos obrigatórios
    if (empty($data['nome']) || empty($data['preco']) || empty($data['quantidade'])) {
        echo json_encode(['success' => false, 'message' => 'Campos obrigatórios não preenchidos']);
        return;
    }
    
    $id = intval($data['id']);
    $nome = $conn->real_escape_string($data['nome']);
    $preco = floatval($data['preco']);
    $quantidade = intval($data['quantidade']);
    $descricao = isset($data['descricao']) ? $conn->real_escape_string($data['descricao']) : '';
    $detalhes = isset($data['detalhes']) ? $conn->real_escape_string($data['detalhes']) : '';
    $categoria = $conn->real_escape_string($data['categoria']);
    $imagens = $data['imagens'] ?? [];
    
    // Iniciar transação
    $conn->begin_transaction();
    
    try {
        // Inserir produto
        $sql = "INSERT INTO produtos (id, nome, preco, quantidade, descricao, detalhes, categoria) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Erro ao preparar inserção");
        }
        
        $stmt->bind_param("isdisss", $id, $nome, $preco, $quantidade, $descricao, $detalhes, $categoria);
        
        if (!$stmt->execute()) {
            throw new Exception("Erro ao inserir produto");
        }
        
        $stmt->close();
        
        // Inserir imagens
        if (!empty($imagens)) {
            $sqlImg = "INSERT INTO produto_imagens (produto_id, imagem, ordem) VALUES (?, ?, ?)";
            $stmtImg = $conn->prepare($sqlImg);
            
            if (!$stmtImg) {
                throw new Exception("Erro ao preparar inserção de imagens");
            }
            
            foreach ($imagens as $ordem => $imagem) {
                $stmtImg->bind_param("isi", $id, $imagem, $ordem);
                if (!$stmtImg->execute()) {
                    throw new Exception("Erro ao inserir imagem");
                }
            }
            
            $stmtImg->close();
        }
        
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Produto adicionado com sucesso']);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Remover produto
function removerProduto($conn) {
    $id = $_POST['id'] ?? 0;
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
        return;
    }
    
    $sql = "DELETE FROM produtos WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Produto removido com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao remover produto']);
    }
    
    $stmt->close();
}
?>