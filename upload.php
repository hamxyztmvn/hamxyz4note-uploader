<?php
// upload.php - Handle file upload and Telegram notification

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Konfigurasi Telegram Bot
$BOT_TOKEN = '8284681567:AAFc3bN5QUP2qisYYoJaVeAwHNCpmvn5gWc'; // Ganti dengan token bot Anda
$CHAT_ID = '8200190115';    // Ganti dengan chat ID Anda

// Cek jika request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Ambil data JSON dari request
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validasi data
if (!$data || !isset($data['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

$file = $data['file'];

// Format pesan untuk Telegram
$message = "📁 *File Baru Diupload*\n";
$message .= "━━━━━━━━━━━━━━━━━━━━\n";
$message .= "📝 *Nama:* " . htmlspecialchars($file['name']) . "\n";
$message .= "📊 *Ukuran:* " . formatBytes($file['size']) . "\n";
$message .= "📄 *Tipe:* " . htmlspecialchars($file['type']) . "\n";
$message .= "⏰ *Waktu:* " . date('d/m/Y H:i:s') . "\n";
$message .= "👤 *Uploader:* " . htmlspecialchars($file['uploader']) . "\n";
$message .= "🔗 *ID:* " . htmlspecialchars($file['id']) . "\n";
$message .= "━━━━━━━━━━━━━━━━━━━━";

// Kirim ke Telegram
$url = "https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage";
$postData = [
    'chat_id' => $CHAT_ID,
    'text' => $message,
    'parse_mode' => 'Markdown'
];

// Gunakan cURL untuk mengirim request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Response
if ($httpCode === 200) {
    echo json_encode([
        'success' => true,
        'message' => 'Notification sent to Telegram'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to send notification',
        'telegram_response' => $response
    ]);
}

// Fungsi helper untuk format bytes
function formatBytes($bytes, $precision = 1) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}
?>