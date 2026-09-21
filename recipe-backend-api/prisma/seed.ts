import { PrismaClient, RecipeStatus, RecipeSource, MealType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const MAT_KHAU_DEMO = 'Ad12345678';

interface NguyenLieuSeed {
    text: string;
    qty: string;
    unit: string;
}

interface MonSeed {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    cookTimeMinutes: number;
    prepTimeMinutes: number;
    servings: number;
    tacGia: string;
    nhom: string;
    ingredients: NguyenLieuSeed[];
    steps: string[];
    nutrition: { calories: number; protein: string; carbs: string; fat: string; fiber?: string };
}

async function main() {
    // Dọn dữ liệu seed cũ (slug xấu, tài khoản demo cũ) — quan hệ con tự cascade
    await prisma.recipe.deleteMany({ where: { id: { in: ['ph-b-h-ni', 'bn-ch-h-ni', 'cm-tm-sn-b-ch'] } } });
    await prisma.user.deleteMany({ where: { email: 'demo@cookbook.vn' } });
    await prisma.category.deleteMany({ where: { slug: 'viet-nam' } });

    const passwordHash = await bcrypt.hash(MAT_KHAU_DEMO, 12);

    // BR-AUTH: 3 tài khoản mẫu — demo là tài khoản test chính
    const taiKhoans = [
        { email: 'demo@gmail.com', displayName: 'Minh Anh', role: 'USER' as const },
        { email: 'thanh.tran@gmail.com', displayName: 'Trần Thanh', role: 'USER' as const },
        { email: 'huong.pham@gmail.com', displayName: 'Phạm Hương', role: 'USER' as const },
    ];
    const users: Record<string, { id: string }> = {};
    for (const tk of taiKhoans) {
        users[tk.email] = await prisma.user.upsert({
            where: { email: tk.email },
            update: {},
            create: {
                email: tk.email,
                passwordHash,
                displayName: tk.displayName,
                role: tk.role,
                status: 'ACTIVE',
            },
        });
    }
    const demoId = users['demo@gmail.com'].id;

    const nhoms = [
        { slug: 'mon-man', name: 'Món mặn' },
        { slug: 'canh-lau', name: 'Canh & Lẩu' },
        { slug: 'bun-mi', name: 'Bún & Mì' },
        { slug: 'mon-chay', name: 'Món chay' },
    ];
    const nhomIds: Record<string, string> = {};
    for (const n of nhoms) {
        nhomIds[n.slug] = (
            await prisma.category.upsert({ where: { slug: n.slug }, update: {}, create: n })
        ).id;
    }

    const mons: MonSeed[] = [
        {
            id: 'pho-bo-ha-noi',
            title: 'Phở bò Hà Nội',
            description:
                'Nước dùng ninh từ xương bò và gừng nướng thơm lừng, bánh phở mềm dai, thịt bò tái chín vừa tới. Ăn kèm quẩy giòn, chanh ớt và rau thơm đúng vị phố cổ.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
            cookTimeMinutes: 180,
            prepTimeMinutes: 30,
            servings: 4,
            tacGia: 'thanh.tran@gmail.com',
            nhom: 'bun-mi',
            ingredients: [
                { text: 'Xương ống bò', qty: '1.5', unit: 'kg' },
                { text: 'Thịt bò thăn (tái)', qty: '400', unit: 'g' },
                { text: 'Thịt nạm bò', qty: '300', unit: 'g' },
                { text: 'Bánh phở tươi', qty: '1', unit: 'kg' },
                { text: 'Hành tây', qty: '2', unit: 'củ' },
                { text: 'Gừng tươi', qty: '80', unit: 'g' },
                { text: 'Quế khô', qty: '2', unit: 'thanh' },
                { text: 'Hoa hồi', qty: '4', unit: 'cánh' },
                { text: 'Thảo quả', qty: '2', unit: 'quả' },
                { text: 'Hành lá, rau mùi', qty: '100', unit: 'g' },
                { text: 'Nước mắm ngon', qty: '60', unit: 'ml' },
                { text: 'Đường phèn', qty: '40', unit: 'g' },
            ],
            steps: [
                'Rửa xương bò với muối và giấm, chần sơ 5 phút rồi rửa lại cho nước trong.',
                'Nướng hành tây và gừng trên bếp đến xém vỏ, cạo sạch cho vào nồi.',
                'Ninh xương lửa nhỏ 3 giờ, vớt bọt thường xuyên để nước dùng trong veo.',
                'Rang thơm quế, hồi, thảo quả rồi thả vào nồi 30 phút cuối, nêm nước mắm và đường phèn.',
                'Trụng bánh phở, xếp thịt tái và nạm, chan nước dùng sôi, rắc hành rau. Dọn kèm chanh ớt.',
            ],
            nutrition: { calories: 480, protein: '38', carbs: '62', fat: '9', fiber: '2' },
        },
        {
            id: 'bun-cha-ha-noi',
            title: 'Bún chả Hà Nội',
            description:
                'Chả viên và chả miếng nướng than hoa xém cạnh, chấm nước mắm chua ngọt pha đu đủ xanh. Ăn cùng bún rối và rổ rau sống tươi giòn.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
            cookTimeMinutes: 45,
            prepTimeMinutes: 25,
            servings: 3,
            tacGia: 'huong.pham@gmail.com',
            nhom: 'bun-mi',
            ingredients: [
                { text: 'Thịt ba chỉ', qty: '500', unit: 'g' },
                { text: 'Thịt nạc vai xay', qty: '300', unit: 'g' },
                { text: 'Bún rối tươi', qty: '1', unit: 'kg' },
                { text: 'Đu đủ xanh', qty: '200', unit: 'g' },
                { text: 'Nước mắm', qty: '120', unit: 'ml' },
                { text: 'Đường', qty: '70', unit: 'g' },
                { text: 'Giấm gạo', qty: '50', unit: 'ml' },
                { text: 'Tỏi băm', qty: '3', unit: 'tép' },
                { text: 'Ớt tươi', qty: '2', unit: 'quả' },
                { text: 'Rau sống các loại', qty: '300', unit: 'g' },
            ],
            steps: [
                'Ướp thịt xay với nước mắm, đường, tỏi 30 phút rồi viên tròn dẹt.',
                'Thái ba chỉ bản mỏng, ướp tương tự để thấm gia vị.',
                'Nướng chả trên than hoa đến khi xém vàng hai mặt, mỡ chảy thơm.',
                'Pha nước chấm: nước mắm, đường, giấm, nước ấm theo tỉ lệ vừa miệng, thả đu đủ thái mỏng.',
                'Dọn bún, chả, rau sống. Chan nước chấm ngập chả khi ăn.',
            ],
            nutrition: { calories: 520, protein: '30', carbs: '68', fat: '15' },
        },
        {
            id: 'com-tam-suon-bi-cha',
            title: 'Cơm tấm sườn bì chả',
            description:
                'Sườn cốt lết ướp sữa đặc nướng mềm thơm, bì thính bùi béo, chả trứng mịn màng. Rưới mỡ hành và nước mắm kẹo lên hạt cơm tấm dẻo tơi.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
            cookTimeMinutes: 60,
            prepTimeMinutes: 20,
            servings: 2,
            tacGia: 'demo@gmail.com',
            nhom: 'mon-man',
            ingredients: [
                { text: 'Cơm tấm', qty: '500', unit: 'g' },
                { text: 'Sườn cốt lết', qty: '400', unit: 'g' },
                { text: 'Bì heo', qty: '150', unit: 'g' },
                { text: 'Trứng gà', qty: '3', unit: 'quả' },
                { text: 'Sữa đặc', qty: '2', unit: 'muỗng' },
                { text: 'Nước mắm', qty: '80', unit: 'ml' },
                { text: 'Mỡ hành', qty: '50', unit: 'g' },
                { text: 'Dưa leo, cà chua', qty: '2', unit: 'trái' },
            ],
            steps: [
                'Ướp sườn với sữa đặc, nước mắm, tỏi, sả ít nhất 1 giờ cho mềm thịt.',
                'Nướng sườn lửa vừa đến khi vàng đều, phết mật ong phút cuối cho bóng.',
                'Luộc bì chín tới, thái sợi, trộn thính gạo và tỏi phi.',
                'Đánh trứng với thịt băm, hấp cách thủy làm chả trứng.',
                'Xới cơm tấm ra đĩa, xếp sườn, bì, chả, rưới mỡ hành và nước mắm kẹo.',
            ],
            nutrition: { calories: 680, protein: '42', carbs: '78', fat: '22' },
        },
        {
            id: 'canh-chua-ca-loc',
            title: 'Canh chua cá lóc miền Tây',
            description:
                'Vị chua thanh của me và thơm, cá lóc đồng chắc thịt, rau nhút giòn mát. Món canh giải nhiệt không thể thiếu trong mâm cơm Nam Bộ ngày hè.',
            thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Canhchua2.jpg',
            cookTimeMinutes: 30,
            prepTimeMinutes: 15,
            servings: 4,
            tacGia: 'huong.pham@gmail.com',
            nhom: 'canh-lau',
            ingredients: [
                { text: 'Cá lóc đồng', qty: '700', unit: 'g' },
                { text: 'Me chua', qty: '50', unit: 'g' },
                { text: 'Thơm (dứa)', qty: '200', unit: 'g' },
                { text: 'Cà chua', qty: '2', unit: 'trái' },
                { text: 'Đậu bắp', qty: '100', unit: 'g' },
                { text: 'Rau nhút', qty: '100', unit: 'g' },
                { text: 'Rau om, ngò gai', qty: '30', unit: 'g' },
                { text: 'Nước mắm', qty: '40', unit: 'ml' },
                { text: 'Đường', qty: '30', unit: 'g' },
            ],
            steps: [
                'Làm sạch cá lóc, cắt khoanh, ướp muối và nước mắm 15 phút.',
                'Dằm me với nước ấm, lọc lấy nước cốt chua.',
                'Đun sôi nước, cho cá vào nấu 8 phút rồi vớt bọt.',
                'Thêm thơm, cà chua, đậu bắp; nêm nước mắm, đường cho vừa chua ngọt.',
                'Thả rau nhút, rau om, ngò gai rồi tắt bếp ngay để rau giữ màu xanh.',
            ],
            nutrition: { calories: 220, protein: '28', carbs: '18', fat: '5', fiber: '3' },
        },
        {
            id: 'thit-kho-tau',
            title: 'Thịt kho tàu trứng vịt',
            description:
                'Ba chỉ kho nước dừa xiêm đến khi mỡ trong veo, trứng vịt thấm đều màu cánh gián. Món kho đậm đà ăn với cơm trắng và dưa giá ngày Tết lẫn ngày thường.',
            thumbnailUrl:
                'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Th%E1%BB%8Bt_kho_h%E1%BB%99t_v%E1%BB%8Bt.jpg/960px-Th%E1%BB%8Bt_kho_h%E1%BB%99t_v%E1%BB%8Bt.jpg',
            cookTimeMinutes: 90,
            prepTimeMinutes: 15,
            servings: 4,
            tacGia: 'thanh.tran@gmail.com',
            nhom: 'mon-man',
            ingredients: [
                { text: 'Thịt ba chỉ', qty: '800', unit: 'g' },
                { text: 'Trứng vịt', qty: '6', unit: 'quả' },
                { text: 'Nước dừa xiêm', qty: '600', unit: 'ml' },
                { text: 'Nước mắm', qty: '70', unit: 'ml' },
                { text: 'Đường thốt nốt', qty: '60', unit: 'g' },
                { text: 'Tỏi, hành tím', qty: '40', unit: 'g' },
                { text: 'Ớt hiểm', qty: '2', unit: 'quả' },
            ],
            steps: [
                'Cắt ba chỉ miếng vuông 4cm, ướp nước mắm, đường, tỏi 30 phút.',
                'Thắng đường thốt nốt màu cánh gián rồi cho thịt vào săn đều.',
                'Đổ nước dừa ngập thịt, kho lửa nhỏ 1 giờ cho mỡ trong.',
                'Luộc trứng vịt, bóc vỏ, cho vào kho cùng 20 phút cho thấm.',
                'Nêm lại vừa miệng, thả ớt hiểm. Ăn kèm dưa giá và cơm nóng.',
            ],
            nutrition: { calories: 590, protein: '26', carbs: '14', fat: '48' },
        },
        {
            id: 'bun-bo-hue',
            title: 'Bún bò Huế',
            description:
                'Nước lèo đỏ au màu ớt sa tế, thơm nồng mắm ruốc Huế. Bắp bò, giò heo và chả cua đầy đặn trong tô bún sợi to, ăn kèm rau chuối bào và giá.',
            thumbnailUrl:
                'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/B%C3%BAn_b%C3%B2_Hu%E1%BA%BF-Feb_2025.jpg/960px-B%C3%BAn_b%C3%B2_Hu%E1%BA%BF-Feb_2025.jpg',
            cookTimeMinutes: 150,
            prepTimeMinutes: 30,
            servings: 5,
            tacGia: 'demo@gmail.com',
            nhom: 'bun-mi',
            ingredients: [
                { text: 'Bắp bò', qty: '500', unit: 'g' },
                { text: 'Giò heo', qty: '700', unit: 'g' },
                { text: 'Chả cua', qty: '300', unit: 'g' },
                { text: 'Bún sợi to', qty: '1.2', unit: 'kg' },
                { text: 'Mắm ruốc Huế', qty: '50', unit: 'g' },
                { text: 'Sả cây', qty: '5', unit: 'cây' },
                { text: 'Ớt sa tế', qty: '40', unit: 'g' },
                { text: 'Hành tây, rau thơm', qty: '200', unit: 'g' },
            ],
            steps: [
                'Hầm giò heo và bắp bò với sả đập dập 2 giờ đến mềm.',
                'Hòa mắm ruốc với nước ấm, lắng cặn, chắt nước trong cho vào nồi.',
                'Phi sả ớt sa tế thơm rồi trút vào tạo màu đỏ đặc trưng.',
                'Nêm mắm, đường, bột ngọt cho đậm đà chuẩn vị Huế.',
                'Trụng bún, xếp thịt, chả cua, chan nước lèo ngập mặt. Dọn kèm rau sống.',
            ],
            nutrition: { calories: 540, protein: '36', carbs: '64', fat: '16' },
        },
        {
            id: 'rau-muong-xao-toi',
            title: 'Rau muống xào tỏi',
            description:
                'Rau muống xanh giòn xào lửa lớn với tỏi phi vàng ruộm. Món rau quốc dân 10 phút là xong, giữ trọn vị ngọt tự nhiên.',
            thumbnailUrl:
                'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi.jpg/960px-Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi.jpg',
            cookTimeMinutes: 10,
            prepTimeMinutes: 10,
            servings: 2,
            tacGia: 'demo@gmail.com',
            nhom: 'mon-chay',
            ingredients: [
                { text: 'Rau muống', qty: '400', unit: 'g' },
                { text: 'Tỏi', qty: '1', unit: 'củ' },
                { text: 'Dầu ăn', qty: '2', unit: 'muỗng' },
                { text: 'Nước mắm chay', qty: '1', unit: 'muỗng' },
                { text: 'Hạt nêm chay', qty: '1', unit: 'muỗng' },
            ],
            steps: [
                'Nhặt rau muống, rửa sạch, để ráo nước hoàn toàn.',
                'Phi thơm một nửa tỏi băm với dầu ăn lửa lớn.',
                'Cho rau vào đảo nhanh tay 3 phút, nêm nước mắm và hạt nêm.',
                'Rắc nốt tỏi phi vàng, đảo đều rồi dọn ra đĩa ngay khi rau còn xanh giòn.',
            ],
            nutrition: { calories: 120, protein: '4', carbs: '10', fat: '8', fiber: '4' },
        },
        {
            id: 'banh-xeo-mien-trung',
            title: 'Bánh xèo miền Trung',
            description:
                'Vỏ bánh vàng giòn rụm từ bột gạo pha nghệ, nhân tôm thịt giá đỗ đầy ụ. Cuốn bánh tráng với rau sống, chấm mắm nêm đậm đà.',
            thumbnailUrl:
                'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/B%C3%A1nh_x%C3%A8o_1.jpg/960px-B%C3%A1nh_x%C3%A8o_1.jpg',
            cookTimeMinutes: 50,
            prepTimeMinutes: 30,
            servings: 4,
            tacGia: 'huong.pham@gmail.com',
            nhom: 'mon-man',
            ingredients: [
                { text: 'Bột gạo', qty: '400', unit: 'g' },
                { text: 'Bột nghệ', qty: '1', unit: 'muỗng' },
                { text: 'Tôm đất', qty: '300', unit: 'g' },
                { text: 'Thịt ba chỉ', qty: '200', unit: 'g' },
                { text: 'Giá đỗ', qty: '300', unit: 'g' },
                { text: 'Bánh tráng cuốn', qty: '1', unit: 'xấp' },
                { text: 'Rau sống, xà lách', qty: '400', unit: 'g' },
                { text: 'Mắm nêm', qty: '100', unit: 'ml' },
            ],
            steps: [
                'Pha bột gạo với nước, bột nghệ và ít muối, để nghỉ 30 phút.',
                'Xào sơ tôm thịt nêm vừa miệng để làm nhân.',
                'Tráng bột mỏng trên chảo nóng, xếp nhân và giá, đậy nắp 2 phút cho giòn.',
                'Gập đôi bánh, chiên thêm mặt đến khi vàng rụm thì gắp ra.',
                'Cuốn bánh xèo với rau sống trong bánh tráng, chấm mắm nêm pha thơm.',
            ],
            nutrition: { calories: 470, protein: '24', carbs: '58', fat: '17' },
        },
    ];

    for (const data of mons) {
        const recipe = await prisma.recipe.upsert({
            where: { id: data.id },
            update: {
                title: data.title,
                description: data.description,
                thumbnailUrl: data.thumbnailUrl,
                cookTimeMinutes: data.cookTimeMinutes,
                prepTimeMinutes: data.prepTimeMinutes,
                servings: data.servings,
                categoryId: nhomIds[data.nhom],
            },
            create: {
                id: data.id,
                title: data.title,
                description: data.description,
                thumbnailUrl: data.thumbnailUrl,
                cookTimeMinutes: data.cookTimeMinutes,
                prepTimeMinutes: data.prepTimeMinutes,
                servings: data.servings,
                authorId: users[data.tacGia].id,
                status: RecipeStatus.APPROVED,
                source: RecipeSource.LOCAL,
                categoryId: nhomIds[data.nhom],
            },
        });

        await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
        for (let i = 0; i < data.ingredients.length; i++) {
            const ing = data.ingredients[i];
            await prisma.recipeIngredient.create({
                data: {
                    recipeId: recipe.id,
                    originalText: ing.text,
                    quantity: ing.qty,
                    unit: ing.unit,
                    sortOrder: i + 1,
                },
            });
        }

        await prisma.recipeStep.deleteMany({ where: { recipeId: recipe.id } });
        for (let i = 0; i < data.steps.length; i++) {
            await prisma.recipeStep.create({
                data: { recipeId: recipe.id, stepOrder: i + 1, content: data.steps[i] },
            });
        }

        await prisma.nutritionInfo.upsert({
            where: { recipeId: recipe.id },
            update: {},
            create: {
                recipeId: recipe.id,
                calories: data.nutrition.calories,
                protein: data.nutrition.protein,
                carbs: data.nutrition.carbs,
                fat: data.nutrition.fat,
                fiber: data.nutrition.fiber,
            },
        });
    }

    // BR-SOC: Tương tác mẫu giống thật — demo lưu/chấm/bình luận như người dùng thật
    const tuongTacs = [
        { recipeId: 'pho-bo-ha-noi', email: 'demo@gmail.com', diem: 5, luu: true },
        { recipeId: 'bun-cha-ha-noi', email: 'demo@gmail.com', diem: 5, luu: true },
        { recipeId: 'com-tam-suon-bi-cha', email: 'demo@gmail.com', diem: 4, luu: true },
        { recipeId: 'canh-chua-ca-loc', email: 'demo@gmail.com', diem: 5, luu: false },
        { recipeId: 'pho-bo-ha-noi', email: 'thanh.tran@gmail.com', diem: 5, luu: true },
        { recipeId: 'thit-kho-tau', email: 'thanh.tran@gmail.com', diem: 4, luu: true },
        { recipeId: 'bun-bo-hue', email: 'huong.pham@gmail.com', diem: 5, luu: true },
        { recipeId: 'banh-xeo-mien-trung', email: 'huong.pham@gmail.com', diem: 5, luu: false },
    ];
    for (const t of tuongTacs) {
        const userId = users[t.email].id;
        await prisma.rating.upsert({
            where: { userId_recipeId: { userId, recipeId: t.recipeId } },
            update: {},
            create: { userId, recipeId: t.recipeId, score: t.diem },
        });
        if (t.luu) {
            await prisma.favorite.upsert({
                where: { userId_recipeId: { userId, recipeId: t.recipeId } },
                update: {},
                create: { userId, recipeId: t.recipeId },
            });
        }
    }

    const binhLuans = [
        {
            recipeId: 'pho-bo-ha-noi',
            email: 'demo@gmail.com',
            content: 'Ninh đúng 3 giờ như hướng dẫn, nước trong và ngọt thanh lắm. Nhà mình ai cũng khen!',
        },
        {
            recipeId: 'bun-cha-ha-noi',
            email: 'thanh.tran@gmail.com',
            content: 'Chả nướng than hoa thơm hơn hẳn chảo. Mình thêm ít sả băm vào ướp, mọi người thử xem.',
        },
        {
            recipeId: 'com-tam-suon-bi-cha',
            email: 'huong.pham@gmail.com',
            content: 'Ướp sữa đặc đúng là bí kíp, sườn mềm mà không bị khô. Cảm ơn bạn chia sẻ!',
        },
        {
            recipeId: 'canh-chua-ca-loc',
            email: 'demo@gmail.com',
            content: 'Cho rau nhút vào sau cùng như bài viết thì rau giòn thật. Món này hao cơm lắm.',
        },
    ];
    await prisma.comment.deleteMany({});
    for (const bl of binhLuans) {
        await prisma.comment.create({
            data: { userId: users[bl.email].id, recipeId: bl.recipeId, content: bl.content },
        });
    }

    // BR-MEAL + BR-SHOP: Kế hoạch tuần và danh sách đi chợ mẫu của demo
    const tuanNay = new Date();
    tuanNay.setHours(0, 0, 0, 0);
    const hetTuan = new Date(tuanNay);
    hetTuan.setDate(hetTuan.getDate() + 6);
    await prisma.mealPlan.deleteMany({ where: { userId: demoId } });
    const keHoach = await prisma.mealPlan.create({
        data: {
            userId: demoId,
            name: 'Thực đơn tuần này',
            startDate: tuanNay,
            endDate: hetTuan,
            isActive: true,
            items: {
                create: [
                    { recipeId: 'thit-kho-tau', date: tuanNay, mealType: MealType.LUNCH, servings: 4, sortOrder: 1 },
                    { recipeId: 'canh-chua-ca-loc', date: tuanNay, mealType: MealType.DINNER, servings: 4, sortOrder: 1 },
                    { recipeId: 'rau-muong-xao-toi', date: tuanNay, mealType: MealType.DINNER, servings: 2, sortOrder: 2 },
                ],
            },
        },
    });

    await prisma.shoppingList.deleteMany({ where: { userId: demoId } });
    await prisma.shoppingList.create({
        data: {
            userId: demoId,
            name: 'Đi chợ cuối tuần',
            sourceType: 'MEAL_PLAN',
            sourceId: keHoach.id,
            status: 'ACTIVE',
            items: {
                create: [
                    { originalText: 'Thịt ba chỉ', quantity: '800', unit: 'g', isChecked: true, sortOrder: 1 },
                    { originalText: 'Trứng vịt', quantity: '6', unit: 'quả', isChecked: true, sortOrder: 2 },
                    { originalText: 'Cá lóc đồng', quantity: '700', unit: 'g', isChecked: false, sortOrder: 3 },
                    { originalText: 'Rau muống', quantity: '400', unit: 'g', isChecked: false, sortOrder: 4 },
                    { originalText: 'Nước dừa xiêm', quantity: '600', unit: 'ml', isChecked: false, sortOrder: 5 },
                ],
            },
        },
    });

    console.log(`Seed hoan tat: ${mons.length} recipes, 3 users (demo@gmail.com / ${MAT_KHAU_DEMO})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
