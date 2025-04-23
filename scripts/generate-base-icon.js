import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear un icono base de 512x512 (el tamaño más grande que necesitamos)
sharp({
    create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 51, g: 153, b: 255, alpha: 1 } // #3399FF
    }
})
.composite([{
    input: Buffer.from(`
        <svg width="512" height="512" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 8L12 12L20 8L12 4ZM4 12L12 16L20 12V16L12 20L4 16V12Z"/>
        </svg>
    `),
    top: 128,
    left: 128,
    width: 256,
    height: 256
}])
.png()
.toFile(join(__dirname, '../src/assets/icon-base.png'))
.then(() => console.log('✓ Icono base generado'))
.catch(console.error);