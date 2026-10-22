<?php
declare(strict_types=1);

// Backend dimostrativo: non accetta pagamenti e non invia email.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();

function respond(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
function field(array $data, string $key, int $min, int $max): string {
    $value = $data[$key] ?? null;
    if (!is_string($value)) respond(['error' => 'Campo non valido: ' . $key], 422);
    $value = trim($value);
    if (strlen($value) < $min || strlen($value) > $max) respond(['error' => 'Lunghezza non valida: ' . $key], 422);
    return $value;
}

try {
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    $action = $_GET['action'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($action === 'session' && $method === 'GET') respond(['csrf' => $_SESSION['csrf'], 'mode' => 'demo']);
    if ($method !== 'POST') { header('Allow: POST'); respond(['error' => 'Metodo non consentito.'], 405); }
    if (!in_array($action, ['contact', 'order'], true)) respond(['error' => 'Operazione sconosciuta.'], 404);
    if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) respond(['error' => 'Sessione scaduta. Ricarica la pagina.'], 403);
    if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) respond(['error' => 'Formato non supportato.'], 415);
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) respond(['error' => 'Richiesta troppo grande.'], 413);
    $raw = file_get_contents('php://input', false, null, 0, 20001);
    if ($raw === false || strlen($raw) > 20000) respond(['error' => 'Richiesta troppo grande.'], 413);
    try { $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException $e) { respond(['error' => 'Dati JSON non validi.'], 400); }
    if (!is_array($data) || array_is_list($data)) respond(['error' => 'Dati non validi.'], 400);
    $name = field($data, 'name', 1, 80);
    $email = field($data, 'email', 3, 180);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(['error' => 'Indirizzo email non valido.'], 422);
    $catalog = json_decode(file_get_contents(dirname(__DIR__) . '/assets/products.json'), true, 32, JSON_THROW_ON_ERROR);
    $products = array_column($catalog, null, 'id');
    $payload = ['name' => $name, 'email' => $email, 'demo' => true];
    $total = 0;
    if ($action === 'contact') {
        $payload['message'] = field($data, 'message', 10, 3000);
        if (($data['consent'] ?? '') !== 'on') respond(['error' => 'Conferma di presa visione richiesta.'], 422);
        $model = $data['model'] ?? '';
        if (!is_string($model) || ($model !== '' && !isset($products[$model]))) respond(['error' => 'Modello non valido.'], 422);
        $payload['model'] = $model;
    } else {
        $items = $data['items'] ?? null;
        if (!is_array($items) || !array_is_list($items) || count($items) < 1 || count($items) > 4) respond(['error' => 'Carrello non valido.'], 422);
        $seen = [];
        $payload['items'] = [];
        foreach ($items as $item) {
            if (!is_array($item)) respond(['error' => 'Articolo non valido.'], 422);
            $id = $item['id'] ?? null;
            $qty = $item['qty'] ?? null;
            if (!is_string($id) || !isset($products[$id]) || isset($seen[$id]) || !is_int($qty) || $qty < 1 || $qty > 5) respond(['error' => 'Articolo o quantità non validi.'], 422);
            $seen[$id] = true;
            $unitPrice = (int)$products[$id]['price'];
            $total += $unitPrice * $qty;
            $payload['items'][] = ['id' => $id, 'qty' => $qty, 'unit_price_eur' => $unitPrice];
        }
        $payload['total_eur'] = $total;
    }
    // La cartella dei dati è fuori dalla document root public/.
    $directory = getenv('AUREL_DATA_DIR') ?: dirname(__DIR__, 2) . '/var';
    if (!is_dir($directory) && !mkdir($directory, 0700, true)) throw new RuntimeException('Cannot create data directory');
    $database = new PDO('sqlite:' . $directory . '/aurel.sqlite');
    $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $database->exec('PRAGMA busy_timeout = 5000');
    $database->exec('CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL)');
    $database->exec('CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, window_start INTEGER NOT NULL)');
    // Limite per IP e finestra di 10 minuti, anche tra sessioni differenti.
    $rateKey = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $now = time();
    $database->exec('BEGIN IMMEDIATE TRANSACTION');
    $query = $database->prepare('SELECT hits, window_start FROM rate_limits WHERE key = ?');
    $query->execute([$rateKey]);
    $rate = $query->fetch(PDO::FETCH_ASSOC);
    if ($rate && (int)$rate['window_start'] > $now - 600 && (int)$rate['hits'] >= 15) {
        $database->exec('ROLLBACK');
        header('Retry-After: 600');
        respond(['error' => 'Troppe richieste. Riprova tra qualche minuto.'], 429);
    }
    $hits = $rate && (int)$rate['window_start'] > $now - 600 ? (int)$rate['hits'] + 1 : 1;
    $start = $hits === 1 ? $now : (int)$rate['window_start'];
    $query = $database->prepare('INSERT OR REPLACE INTO rate_limits (key, hits, window_start) VALUES (?, ?, ?)');
    $query->execute([$rateKey, $hits, $start]);
    $database->prepare('DELETE FROM rate_limits WHERE window_start < ?')->execute([$now - 86400]);
    $id = 'DEMO-' . strtoupper(bin2hex(random_bytes(5)));
    $query = $database->prepare('INSERT INTO requests (id, kind, payload, created_at) VALUES (?, ?, ?, ?)');
    $query->execute([$id, $action, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), gmdate('c')]);
    $database->exec('COMMIT');
    respond(['id' => $id, 'total' => $total, 'mode' => 'demo', 'payment' => false, 'email_sent' => false], 201);
} catch (Throwable $error) {
    error_log('AUREL backend: ' . $error->getMessage());
    respond(['error' => 'Servizio non disponibile. Verifica PHP, PDO SQLite e i permessi della cartella dati.'], 503);
}
