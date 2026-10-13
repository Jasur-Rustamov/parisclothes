
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = 'product-photos';

// Сначала true — только проверка без изменений.
// После проверки поменяй на false для конвертации.
const DRY_RUN = false;

async function main() {
    const { data: products, error } = await supabase
        .from('products')
        .select('id, image_url');

    if (error) throw error;

    console.log(`Найдено товаров: ${products.length}`);

    let converted = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
        const url = product.image_url;

        if (
            typeof url !== 'string' ||
            !/\.(png|jpe?g)$/i.test(new URL(url).pathname)
        ) {
            skipped++;
            continue;
        }

        try {
            const parsed = new URL(url);
            const marker = `/object/public/${BUCKET}/`;
            const index = parsed.pathname.indexOf(marker);

            if (index === -1) {
                throw new Error('Изображение не найдено в ожидаемом bucket');
            }

            const oldPath = decodeURIComponent(
                parsed.pathname.slice(index + marker.length)
            );

            const newPath = oldPath.replace(
                /\.(png|jpe?g)$/i,
                '.webp'
            );

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Ошибка скачивания: HTTP ${response.status}`);
            }

            const original = Buffer.from(await response.arrayBuffer());

            const webp = await sharp(original)
                .rotate()
                .webp({ quality: 85 })
                .toBuffer();

            console.log(
                `Товар ${product.id}: ${original.length} → ${webp.length} байт`
            );

            if (DRY_RUN) {
                console.log(`Проверка: ${oldPath} → ${newPath}`);
                continue;
            }

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(newPath, webp, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(newPath);

            const { error: updateError } = await supabase
                .from('products')
                .update({ image_url: publicData.publicUrl })
                .eq('id', product.id);

            if (updateError) throw updateError;

            converted++;
            console.log(`✅ Товар ${product.id} обновлён`);
        } catch (error) {
            failed++;
            console.error(`❌ Товар ${product.id}: ${error.message}`);
        }
    }

    console.log('\n--- ИТОГ ---');
    console.log(`Конвертировано: ${converted}`);
    console.log(`Пропущено: ${skipped}`);
    console.log(`Ошибок: ${failed}`);
}

main().catch(console.error);
