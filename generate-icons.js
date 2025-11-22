const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// CityV logo için modern gradient icon oluştur
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Rounded corners
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.15;
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.globalCompositeOperation = 'source-over';

  // Draw "C" letter in white
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', size / 2, size / 2);

  // Add location pin icon below
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const pinSize = size * 0.15;
  const pinX = size / 2;
  const pinY = size * 0.75;
  ctx.arc(pinX, pinY, pinSize, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

// Generate all icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, 'public');

console.log('🎨 CityV Icon\'ları oluşturuluyor...\n');

try {
  sizes.forEach(size => {
    const buffer = createIcon(size);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(publicDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ ${filename} oluşturuldu (${buffer.length} bytes)`);
  });
  
  console.log('\n🎉 Tüm icon\'lar başarıyla oluşturuldu!');
} catch (error) {
  console.error('❌ Icon oluşturma hatası:', error.message);
  console.log('\nℹ️  canvas paketi kurulmamış olabilir. Yüklemek için:');
  console.log('   npm install canvas');
}
