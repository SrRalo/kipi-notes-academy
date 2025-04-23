import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SHORTCUT_SIZES = [96];

async function generateIcons() {
    // Asegurarse de que existe el directorio de iconos
    const iconsDir = join(__dirname, '../public/icons');
    await mkdir(iconsDir, { recursive: true });

    // Generar iconos principales
    for (const size of ICON_SIZES) {
        await sharp(join(__dirname, '../src/assets/icon-base.png'))
            .resize(size, size)
            .png()
            .toFile(join(iconsDir, `icon-${size}x${size}.png`));
        console.log(`✓ Generado icon-${size}x${size}.png`);
    }

    // Generar iconos de acceso directo
    const shortcuts = [
        { name: 'shortcut-note', color: '#3399FF' },
        { name: 'shortcut-subject', color: '#10B981' }
    ];

    for (const shortcut of shortcuts) {
        for (const size of SHORTCUT_SIZES) {
            await sharp({
                create: {
                    width: size,
                    height: size,
                    channels: 4,
                    background: shortcut.color
                }
            })
            .composite([{
                input: Buffer.from(`
                    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        ${shortcut.name.includes('note') 
                            ? '<path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z"/>'
                            : '<path d="M12 4L4 8L12 12L20 8L12 4ZM4 12L12 16L20 12V16L12 20L4 16V12Z"/>'
                        }
                    </svg>
                `),
                top: Math.floor(size * 0.25),
                left: Math.floor(size * 0.25),
                width: Math.floor(size * 0.5),
                height: Math.floor(size * 0.5)
            }])
            .png()
            .toFile(join(iconsDir, `${shortcut.name}-${size}x${size}.png`));
            console.log(`✓ Generado ${shortcut.name}-${size}x${size}.png`);
        }
    }
}

generateIcons().catch(console.error);