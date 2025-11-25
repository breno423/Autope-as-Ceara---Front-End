<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

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
    
    $id = $data['id'];
    $nome = $data['nome'];
    $preco = $data['preco'];
    $quantidade = $data['quantidade'];
    $descricao = $data['descricao'] ?? '';
    $detalhes = $data['detalhes'] ?? '';
    $categoria = $data['categoria'];
    $imagens = $data['imagens'] ?? [];
    
    // Iniciar transação
    $conn->begin_transaction();
    
    try {
        // Inserir produto
        $sql = "INSERT INTO produtos (id, nome, preco, quantidade, descricao, detalhes, categoria) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isdisss", $id, $nome, $preco, $quantidade, $descricao, $detalhes, $categoria);
        
        if (!$stmt->execute()) {
            throw new Exception("Erro ao inserir produto");
        }
        
        // Inserir imagens
        if (!empty($imagens)) {
            $sqlImg = "INSERT INTO produto_imagens (produto_id, imagem, ordem) VALUES (?, ?, ?)";
            $stmtImg = $conn->prepare($sqlImg);
            
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
    
    if (isset($stmt)) $stmt->close();
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