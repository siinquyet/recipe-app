import { PrismaClient, RecipeStatus, RecipeSource, MealType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// BR-SEED: Mật khẩu dùng chung cho toàn bộ tài khoản mẫu để test đăng nhập
const MAT_KHAU_MAU = 'Matkhau123';

interface NguyenLieuSeed {
    text: string;
    qty: string;
    unit: string;
}

interface BuocSeed {
    noiDung: string;
    anh?: string;
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
    trangThai: RecipeStatus;
    ingredients: NguyenLieuSeed[];
    steps: BuocSeed[];
    nutrition: { calories: number; protein: string; carbs: string; fat: string; fiber?: string };
}

const U = (id: string) => `https://images.unsplash.com/${id}?w=800`;
const ANH = {
    pho: U('photo-1582878826629-29b7ad1cdc43'),
    bunCha: U('photo-1559314809-0d155014e29e'),
    comTam: U('photo-1604908176997-125f25cc6f3d'),
    canhChua: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Canhchua2.jpg',
    thitKho:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Th%E1%BB%8Bt_kho_h%E1%BB%99t_v%E1%BB%8Bt.jpg/960px-Th%E1%BB%8Bt_kho_h%E1%BB%99t_v%E1%BB%8Bt.jpg',
    bunBoHue:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/B%C3%BAn_b%C3%B2_Hu%E1%BA%BF-Feb_2025.jpg/960px-B%C3%BAn_b%C3%B2_Hu%E1%BA%BF-Feb_2025.jpg',
    rauMuong:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi.jpg/960px-Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi.jpg',
    banhXeo:
        'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/B%C3%A1nh_x%C3%A8o_1.jpg/960px-B%C3%A1nh_x%C3%A8o_1.jpg',
    caRiGa: U('photo-1565557623262-b51c2513a641'),
    comChien: U('photo-1603133872878-684f208fb84b'),
    gaNuongMatOng: U('photo-1598103442097-8b74394b95c6'),
    miXao: U('photo-1585032226651-759b368d7246'),
    // Ảnh bước nấu (đã xem nội dung thật)
    buocThotNguyenLieu: U('photo-1617093727343-374698b1b08d'),
    buocChaoDao: U('photo-1512058564366-18510be2db19'),
    buocChanNuoc: U('photo-1626074353765-517a681e40be'),
    buocBanhMiCham: U('photo-1606491956689-2ea866880c84'),
};

function chuanHoa(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .trim();
}

async function main() {
    const passwordHash = await bcrypt.hash(MAT_KHAU_MAU, 12);
    const avatar = (ten: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ten)}`;

    // BR-SEED: Tài khoản như người dùng thật — email gmail, tên Việt, avatar chữ cái
    const taiKhoans = [
        { email: 'minh.anh92@gmail.com', displayName: 'Minh Anh', role: 'USER' as const },
        { email: 'tran.thanh.cook@gmail.com', displayName: 'Trần Thanh', role: 'USER' as const },
        { email: 'huong.pham.89@gmail.com', displayName: 'Phạm Hương', role: 'USER' as const },
        { email: 'duc.daubep@gmail.com', displayName: 'Đức Đầu Bếp', role: 'USER' as const },
        { email: 'admin@bepnha.vn', displayName: 'Quản Trị Bếp', role: 'ADMIN' as const },
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
                avatarUrl: avatar(tk.displayName),
                role: tk.role,
                status: 'ACTIVE',
            },
        });
    }
    const demoId = users['minh.anh92@gmail.com'].id;

    const nhoms = [
        { slug: 'mon-man', name: 'Món mặn' },
        { slug: 'canh-lau', name: 'Canh & Lẩu' },
        { slug: 'bun-mi', name: 'Bún & Mì' },
        { slug: 'mon-chay', name: 'Món chay' },
        { slug: 'do-nuong', name: 'Đồ nướng' },
        { slug: 'trang-mieng', name: 'Tráng miệng' },
    ];
    const nhomIds: Record<string, string> = {};
    for (const n of nhoms) {
        nhomIds[n.slug] = (await prisma.category.upsert({ where: { slug: n.slug }, update: {}, create: n })).id;
    }

    const nhans = [
        { slug: 'bua-sang', name: 'Bữa sáng' },
        { slug: 'bua-trua', name: 'Bữa trưa' },
        { slug: 'bua-toi', name: 'Bữa tối' },
        { slug: 'cuoi-tuan', name: 'Cuối tuần' },
        { slug: 'mon-nuoc', name: 'Món nước' },
        { slug: 'healthy', name: 'Healthy' },
    ];
    const nhanIds: Record<string, string> = {};
    for (const t of nhans) {
        nhanIds[t.slug] = (await prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t })).id;
    }

    // BR-SEED: Nguyên liệu chuẩn để đi chợ gộp đúng (500g + 1kg thịt ba chỉ thành 1 dòng)
    const nguyenLieuChuan = [
        { ten: 'Thịt ba chỉ', donVi: 'g', loai: 'meat' },
        { ten: 'Thịt bò', donVi: 'g', loai: 'meat' },
        { ten: 'Thịt gà', donVi: 'g', loai: 'meat' },
        { ten: 'Cá lóc', donVi: 'g', loai: 'meat' },
        { ten: 'Tôm', donVi: 'g', loai: 'meat' },
        { ten: 'Trứng gà', donVi: 'quả', loai: 'dairy' },
        { ten: 'Đậu phụ', donVi: 'g', loai: 'grain' },
        { ten: 'Gạo', donVi: 'g', loai: 'grain' },
        { ten: 'Bún', donVi: 'g', loai: 'grain' },
        { ten: 'Rau muống', donVi: 'g', loai: 'vegetable' },
        { ten: 'Cà chua', donVi: 'quả', loai: 'vegetable' },
        { ten: 'Hành tây', donVi: 'củ', loai: 'vegetable' },
        { ten: 'Tỏi', donVi: 'củ', loai: 'spice' },
        { ten: 'Ớt', donVi: 'quả', loai: 'spice' },
        { ten: 'Sả', donVi: 'củ', loai: 'spice' },
        { ten: 'Đường', donVi: 'g', loai: 'spice' },
        { ten: 'Nước mắm', donVi: 'ml', loai: 'spice' },
        { ten: 'Dầu ăn', donVi: 'ml', loai: 'spice' },
    ];
    const internalIds: Array<{ khoa: string; id: string }> = [];
    for (const nl of nguyenLieuChuan) {
        const banGhi = await prisma.internalIngredient.create({
            data: {
                canonicalName: nl.ten,
                normalizedName: chuanHoa(nl.ten),
                category: nl.loai,
                defaultUnit: nl.donVi,
            },
        });
        internalIds.push({ khoa: chuanHoa(nl.ten), id: banGhi.id });
    }
    internalIds.sort((a, b) => b.khoa.length - a.khoa.length);
    const timInternalId = (tenGoc: string): string | undefined => {
        const chuan = chuanHoa(tenGoc);
        return internalIds.find((x) => chuan.includes(x.khoa))?.id;
    };

    const mons: MonSeed[] = [
        {
            id: 'pho-bo-ha-noi',
            title: 'Phở bò Hà Nội',
            description:
                'Nước dùng ninh từ xương bò và gừng nướng thơm lừng, bánh phở mềm dai, thịt bò tái chín vừa tới. Ăn kèm quẩy giòn, chanh ớt và rau thơm đúng vị phố cổ.',
            thumbnailUrl: ANH.pho,
            cookTimeMinutes: 180,
            prepTimeMinutes: 30,
            servings: 4,
            tacGia: 'tran.thanh.cook@gmail.com',
            nhom: 'bun-mi',
            trangThai: RecipeStatus.APPROVED,
            ingredients: [
                { text: 'Xương ống bò', qty: '1.5', unit: 'kg' },
                { text: 'Thịt bò thăn (tái)', qty: '400', unit: 'g' },
                { text: 'Thịt nạm bò', qty: '300', unit: 'g' },
                { text: 'Bánh phở tươi', qty: '1', unit: 'kg' },
                { text: 'Hành tây', qty: '2', unit: 'củ' },
                { text: 'Gừng tươi', qty: '80', unit: 'g' },
                { text: 'Quế khô', qty: '2', unit: 'thanh' },
                { text: 'Hoa hồi', qty: '4', unit: 'cánh' },
                { text: 'Hành lá, rau mùi', qty: '100', unit: 'g' },
                { text: 'Nước mắm ngon', qty: '60', unit: 'ml' },
                { text: 'Đường phèn', qty: '40', unit: 'g' },
            ],
            steps: [
                { noiDung: 'Rửa xương bò với muối và giấm, chần sơ 5 phút rồi rửa lại cho nước trong.', anh: ANH.buocThotNguyenLieu },
                { noiDung: 'Nướng hành tây và gừng trên bếp đến xém vỏ, cạo sạch cho vào nồi.' },
                { noiDung: 'Ninh xương lửa nhỏ 3 giờ, vớt bọt thường xuyên để nước dùng trong veo.' },
                { noiDung: 'Rang thơm quế, hồi rồi thả vào nồi 30 phút cuối, nêm nước mắm và đường phèn.' },
                { noiDung: 'Trụng bánh phở, xếp thịt tái và nạm, chan nước dùng sôi, rắc hành rau. Dọn kèm chanh ớt.', anh: ANH.buocChanNuoc },
            ],
            nutrition: { calories: 480, protein: '38', carbs: '62', fat: '9', fiber: '2' },
        },
        {
            id: 'bun-cha-ha-noi',
            title: 'Bún chả Hà Nội',
            description:
                'Chả viên và chả miếng nướng than hoa xém cạnh, chấm nước mắm chua ngọt pha đu đủ xanh. Ăn cùng bún rối và rổ rau sống tươi giòn.',
            thumbnailUrl: ANH.bunCha,
            cookTimeMinutes: 45,
            prepTimeMinutes: 25,
            servings: 3,
            tacGia: 'huong.pham.89@gmail.com',
            nhom: 'bun-mi',
            trangThai: RecipeStatus.APPROVED,
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
                { noiDung: 'Ướp thịt xay với nước mắm, đường, tỏi 30 phút rồi viên tròn dẹt.' },
                { noiDung: 'Thái ba chỉ bản mỏng, ướp tương tự để thấm gia vị.' },
                { noiDung: 'Nướng chả trên than hoa đến khi xém vàng hai mặt, mỡ chảy thơm.' },
                { noiDung: 'Pha nước chấm: nước mắm, đường, giấm, nước ấm theo tỉ lệ vừa miệng, thả đu đủ thái mỏng.' },
                { noiDung: 'Dọn bún, chả, rau sống. Chan nước chấm ngập chả khi ăn.' },
            ],
            nutrition: { calories: 520, protein: '30', carbs: '68', fat: '15' },
        },
        {
            id: 'com-tam-suon-bi-cha',
            title: 'Cơm tấm sườn bì chả',
            description:
                'Sườn cốt lết ướp sữa đặc nướng mềm thơm, bì thính bùi béo, chả trứng mịn màng. Rưới mỡ hành và nước mắm kẹo lên hạt cơm tấm dẻo tơi.',
            thumbnailUrl: ANH.comTam,
            cookTimeMinutes: 60,
            prepTimeMinutes: 20,
            servings: 2,
            tacGia: 'minh.anh92@gmail.com',
            nhom: 'mon-man',
            trangThai: RecipeStatus.APPROVED,
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
                { noiDung: 'Ướp sườn với sữa đặc, nước mắm, tỏi, sả ít nhất 1 giờ cho mềm thịt.' },
                { noiDung: 'Nướng sườn lửa vừa đến khi vàng đều, phết mật ong phút cuối cho bóng.' },
                { noiDung: 'Luộc bì chín tới, thái sợi, trộn thính gạo và tỏi phi.' },
                { noiDung: 'Đánh trứng với thịt băm, hấp cách thủy làm chả trứng.' },
                { noiDung: 'Xới cơm tấm ra đĩa, xếp sườn, bì, chả, rưới mỡ hành và nước mắm kẹo.' },
            ],
            nutrition: { calories: 680, protein: '42', carbs: '78', fat: '22' },
        },
        {
            id: 'canh-chua-ca-loc',
            title: 'Canh chua cá lóc miền Tây',
            description:
                'Vị chua thanh của me và thơm, cá lóc đồng chắc thịt, rau nhút giòn mát. Món canh giải nhiệt không thể thiếu trong mâm cơm Nam Bộ ngày hè.',
            thumbnailUrl: ANH.canhChua,
            cookTimeMinutes: 30,
            prepTimeMinutes: 15,
            servings: 4,
            tacGia: 'huong.pham.89@gmail.com',
            nhom: 'canh-lau',
            trangThai: RecipeStatus.APPROVED,
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
                { noiDung: 'Làm sạch cá lóc, cắt khoanh, ướp muối và nước mắm 15 phút.', anh: ANH.buocThotNguyenLieu },
                { noiDung: 'Dằm me với nước ấm, lọc lấy nước cốt chua.' },
                { noiDung: 'Đun sôi nước, cho cá vào nấu 8 phút rồi vớt bọt.' },
                { noiDung: 'Thêm thơm, cà chua, đậu bắp; nêm nước mắm, đường cho vừa chua ngọt.' },
                { noiDung: 'Thả rau nhút, rau om, ngò gai rồi tắt bếp ngay để rau giữ màu xanh.' },
            ],
            nutrition: { calories: 220, protein: '28', carbs: '18', fat: '5', fiber: '3' },
        },
        {
            id: 'thit-kho-tau',
            title: 'Thịt kho tàu trứng vịt',
            description:
                'Ba chỉ kho nước dừa xiêm đến khi mỡ trong veo, trứng vịt thấm đều màu cánh gián. Món kho đậm đà ăn với cơm trắng và dưa giá ngày Tết lẫn ngày thường.',
            thumbnailUrl: ANH.thitKho,
            cookTimeMinutes: 90,
            prepTimeMinutes: 15,
            servings: 4,
            tacGia: 'tran.thanh.cook@gmail.com',
            nhom: 'mon-man',
            trangThai: RecipeStatus.APPROVED,
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
                { noiDung: 'Cắt ba chỉ miếng vuông 4cm, ướp nước mắm, đường, tỏi 30 phút.' },
                { noiDung: 'Thắng đường thốt nốt màu cánh gián rồi cho thịt vào săn đều.', anh: ANH.buocChaoDao },
                { noiDung: 'Đổ nước dừa ngập thịt, kho lửa nhỏ 1 giờ cho mỡ trong.' },
                { noiDung: 'Luộc trứng vịt, bóc vỏ, cho vào kho cùng 20 phút cho thấm.' },
                { noiDung: 'Nêm lại vừa miệng, thả ớt hiểm. Ăn kèm dưa giá và cơm nóng.' },
            ],
            nutrition: { calories: 590, protein: '26', carbs: '14', fat: '48' },
        },
        {
            id: 'bun-bo-hue',
            title: 'Bún bò Huế',
            description:
                'Nước lèo đỏ au màu ớt sa tế, thơm nồng mắm ruốc Huế. Bắp bò, giò heo và chả cua đầy đặn trong tô bún sợi to, ăn kèm rau chuối bào và giá.',
            thumbnailUrl: ANH.bunBoHue,
            cookTimeMinutes: 150,
            prepTimeMinutes: 30,
            servings: 5,
            tacGia: 'minh.anh92@gmail.com',
            nhom: 'bun-mi',
            trangThai: RecipeStatus.APPROVED,
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
                { noiDung: 'Hầm giò heo và bắp bò với sả đập dập 2 giờ đến mềm.' },
                { noiDung: 'Hòa mắm ruốc với nước ấm, lắng cặn, chắt nước trong cho vào nồi.' },
                { noiDung: 'Phi sả ớt sa tế thơm rồi trút vào tạo màu đỏ đặc trưng.' },
                { noiDung: 'Nêm mắm, đường, bột ngọt cho đậm đà chuẩn vị Huế.' },
                { noiDung: 'Trụng bún, xếp thịt, chả cua, chan nước lèo ngập mặt. Dọn kèm rau sống.', anh: ANH.buocChanNuoc },
            ],
            nutrition: { calories: 540, protein: '36', carbs: '64', fat: '16' },
        },
        {
            id: 'rau-muong-xao-toi',
            title: 'Rau muống xào tỏi',
            description:
                'Rau muống xanh giòn xào lửa lớn với tỏi phi vàng ruộm. Món rau quốc dân 10 phút là xong, giữ trọn vị ngọt tự nhiên.',
            thumbnailUrl: ANH.rauMuong,
            cookTimeMinutes: 10,
            prepTimeMinutes: 10,
            servings: 2,
            tacGia: 'minh.anh92@gmail.com',
            nhom: 'mon-chay',
            trangThai: RecipeStatus.APPROVED,
            ingredients: [
                { text: 'Rau muống', qty: '400', unit: 'g' },
                { text: 'Tỏi', qty: '1', unit: 'củ' },
                { text: 'Dầu ăn', qty: '2', unit: 'muỗng' },
                { text: 'Nước mắm chay', qty: '1', unit: 'muỗng' },
                { text: 'Hạt nêm chay', qty: '1', unit: 'muỗng' },
            ],
            steps: [
                { noiDung: 'Nhặt rau muống, rửa sạch, để ráo nước hoàn toàn.' },
                { noiDung: 'Phi thơm một nửa tỏi băm với dầu ăn lửa lớn.', anh: ANH.buocChaoDao },
                { noiDung: 'Cho rau vào đảo nhanh tay 3 phút, nêm nước mắm và hạt nêm.' },
                { noiDung: 'Rắc nốt tỏi phi vàng, đảo đều rồi dọn ra đĩa ngay khi rau còn xanh giòn.' },
            ],
            nutrition: { calories: 120, protein: '4', carbs: '10', fat: '8', fiber: '4' },
        },
        {
            id: 'banh-xeo-mien-trung',
            title: 'Bánh xèo miền Trung',
            description:
                'Vỏ bánh vàng giòn rụm từ bột gạo pha nghệ, nhân tôm thịt giá đỗ đầy ụ. Cuốn bánh tráng với rau sống, chấm mắm nêm đậm đà.',
            thumbnailUrl: ANH.banhXeo,
            cookTimeMinutes: 50,
            prepTimeMinutes: 30,
            servings: 4,
            tacGia: 'huong.pham.89@gmail.com',
            nhom: 'mon-man',
            trangThai: RecipeStatus.APPROVED,
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
                { noiDung: 'Pha bột gạo với nước, bột nghệ và ít muối, để nghỉ 30 phút.' },
                { noiDung: 'Xào sơ tôm thịt nêm vừa miệng để làm nhân.' },
                { noiDung: 'Tráng bột mỏng trên chảo nóng, xếp nhân và giá, đậy nắp 2 phút cho giòn.' },
                { noiDung: 'Gập đôi bánh, chiên thêm mặt đến khi vàng rụm thì gắp ra.' },
                { noiDung: 'Cuốn bánh xèo với rau sống trong bánh tráng, chấm mắm nêm pha thơm.' },
            ],
            nutrition: { calories: 470, protein: '24', carbs: '58', fat: '17' },
        },
        {
            id: 'ca-ri-ga',
            title: 'Cà ri gà chấm bánh mì',
            description:
                'Gà ta dai ngọt om cùng khoai môn bùi dẻo trong nước cốt dừa béo ngậy, thơm nồng sả và lá cà ri. Chấm bánh mì nóng giòn là hết sảy ngày mưa.',
            thumbnailUrl: ANH.caRiGa,
            cookTimeMinutes: 45,
            prepTimeMinutes: 20,
            servings: 4,
            tacGia: 'duc.daubep@gmail.com',
            nhom: 'mon-man',
            trangThai: RecipeStatus.APPROVED,
            ingredients: [
                { text: 'Gà ta', qty: '1', unit: 'kg' },
                { text: 'Khoai môn', qty: '400', unit: 'g' },
                { text: 'Nước cốt dừa', qty: '400', unit: 'ml' },
                { text: 'Sả cây', qty: '3', unit: 'cây' },
                { text: 'Bột cà ri', qty: '2', unit: 'muỗng' },
                { text: 'Hành tây', qty: '1', unit: 'củ' },
                { text: 'Bánh mì', qty: '4', unit: 'ổ' },
            ],
            steps: [
                { noiDung: 'Chặt gà miếng vừa ăn, ướp bột cà ri, muối, đường 30 phút.', anh: ANH.buocThotNguyenLieu },
                { noiDung: 'Chiên sơ khoai môn cho vàng mặt ngoài để không nát khi om.' },
                { noiDung: 'Phi sả hành thơm, cho gà vào săn rồi đổ nước cốt dừa ngập mặt.' },
                { noiDung: 'Om lửa nhỏ 25 phút, cho khoai vào om thêm 10 phút. Nêm vừa miệng.' },
                { noiDung: 'Dọn nóng với bánh mì giòn và rau thơm.', anh: ANH.buocBanhMiCham },
            ],
            nutrition: { calories: 610, protein: '34', carbs: '42', fat: '35' },
        },
        {
            id: 'com-chien-duong-chau',
            title: 'Cơm chiên Dương Châu',
            description:
                'Hạt cơm săn tơi rời, tôm lạp xưởng thơm lừng, trứng chiên vàng óng áo đều từng hạt. Món cơm chiên thập cẩm gọn lẹ cho bữa tối bận rộn.',
            thumbnailUrl: ANH.comChien,
            cookTimeMinutes: 20,
            prepTimeMinutes: 15,
            servings: 3,
            tacGia: 'tran.thanh.cook@gmail.com',
            nhom: 'mon-man',
            trangThai: RecipeStatus.APPROVED,
            ingredients: [
                { text: 'Cơm nguội', qty: '600', unit: 'g' },
                { text: 'Tôm tươi', qty: '200', unit: 'g' },
                { text: 'Lạp xưởng', qty: '100', unit: 'g' },
                { text: 'Trứng gà', qty: '3', unit: 'quả' },
                { text: 'Cà rốt', qty: '100', unit: 'g' },
                { text: 'Đậu Hà Lan', qty: '100', unit: 'g' },
                { text: 'Hành lá', qty: '30', unit: 'g' },
            ],
            steps: [
                { noiDung: 'Đánh tan trứng với ít nước mắm, chiên mỏng rồi thái sợi.' },
                { noiDung: 'Xào tôm và lạp xưởng thái hạt lựu cho săn lại.' },
                { noiDung: 'Cho cơm nguội vào chảo dầu nóng, đảo đều tay cho hạt cơm tơi.', anh: ANH.buocChaoDao },
                { noiDung: 'Thêm cà rốt, đậu Hà Lan, nêm vừa miệng rồi cho trứng sợi vào trộn đều.' },
                { noiDung: 'Rắc hành lá, dọn nóng với nước tương và ớt cắt lát.' },
            ],
            nutrition: { calories: 560, protein: '26', carbs: '72', fat: '18' },
        },
        {
            id: 'ga-nuong-mat-ong',
            title: 'Gà nướng mật ong',
            description:
                'Da gà căng bóng màu hổ phách, thịt bên trong mọng nước thấm vị mật ong và ngũ vị hương. Nướng bằng nồi chiên không dầu cũng giòn rụm.',
            thumbnailUrl: ANH.gaNuongMatOng,
            cookTimeMinutes: 50,
            prepTimeMinutes: 15,
            servings: 4,
            tacGia: 'duc.daubep@gmail.com',
            nhom: 'do-nuong',
            trangThai: RecipeStatus.APPROVED,
            ingredients: [
                { text: 'Đùi gà góc tư', qty: '1', unit: 'kg' },
                { text: 'Mật ong', qty: '3', unit: 'muỗng' },
                { text: 'Ngũ vị hương', qty: '1', unit: 'muỗng' },
                { text: 'Nước mắm', qty: '2', unit: 'muỗng' },
                { text: 'Tỏi băm', qty: '1', unit: 'muỗng' },
                { text: 'Dầu hào', qty: '2', unit: 'muỗng' },
            ],
            steps: [
                { noiDung: 'Khứa vài đường trên đùi gà cho thấm gia vị.' },
                { noiDung: 'Ướp mật ong, ngũ vị hương, nước mắm, tỏi, dầu hào ít nhất 2 giờ.' },
                { noiDung: 'Nướng 200 độ 20 phút, phết thêm mật ong rồi nướng tiếp 10 phút cho da bóng.' },
                { noiDung: 'Để gà nghỉ 5 phút rồi chặt miếng, dọn kèm dưa leo và muối tiêu chanh.' },
            ],
            nutrition: { calories: 430, protein: '32', carbs: '18', fat: '24' },
        },
        {
            id: 'mi-xao-gion',
            title: 'Mì xào giòn hải sản',
            description:
                'Vắt mì chiên vàng giòn rụm, chan sốt hải sản sánh đặc với tôm mực rau củ đầy màu sắc. Giòn mềm hòa quyện trong từng đũa.',
            thumbnailUrl: ANH.miXao,
            cookTimeMinutes: 30,
            prepTimeMinutes: 15,
            servings: 2,
            tacGia: 'huong.pham.89@gmail.com',
            nhom: 'bun-mi',
            trangThai: RecipeStatus.APPROVED,
            ingredients: [
                { text: 'Mì trứng (vắt)', qty: '2', unit: 'vắt' },
                { text: 'Tôm tươi', qty: '200', unit: 'g' },
                { text: 'Mực ống', qty: '200', unit: 'g' },
                { text: 'Cải thìa', qty: '200', unit: 'g' },
                { text: 'Cà rốt', qty: '1', unit: 'củ' },
                { text: 'Nấm rơm', qty: '100', unit: 'g' },
                { text: 'Bột năng', qty: '2', unit: 'muỗng' },
            ],
            steps: [
                { noiDung: 'Chiên vắt mì trong dầu nóng đến vàng giòn, vớt ráo dầu.' },
                { noiDung: 'Xào tôm mực lửa lớn cho vừa chín tới rồi trút ra.' },
                { noiDung: 'Xào rau củ, nêm vừa miệng, hòa bột năng tạo độ sánh rồi cho hải sản vào.' },
                { noiDung: 'Chan sốt nóng lên đĩa mì giòn, dọn ngay khi còn kêu xèo xèo.' },
            ],
            nutrition: { calories: 510, protein: '30', carbs: '66', fat: '14' },
        },
        {
            id: 'che-san-mat-ong-cho-duyet',
            title: 'Chè sắn mật ong',
            description:
                'Món chè lạ miệng kết hợp bột sắn dây và mật ong nguyên chất. Đang chờ kiểm duyệt công thức.',
            thumbnailUrl: null,
            cookTimeMinutes: 20,
            prepTimeMinutes: 10,
            servings: 2,
            tacGia: 'duc.daubep@gmail.com',
            nhom: 'trang-mieng',
            trangThai: RecipeStatus.PENDING,
            ingredients: [
                { text: 'Bột sắn sống', qty: '200', unit: 'g' },
                { text: 'Mật ong', qty: '50', unit: 'ml' },
                { text: 'Đường', qty: '30', unit: 'g' },
            ],
            steps: [
                { noiDung: 'Hòa bột sắn với nước lạnh cho tan đều.' },
                { noiDung: 'Đun sôi nhẹ rồi cho mật ong vào khuấy đều.' },
            ],
            nutrition: { calories: 300, protein: '1', carbs: '78', fat: '0' },
        },
        {
            id: 'spam-kem-link-cho-duyet',
            title: 'Xem link kiếm tiền nhanh',
            description: 'ok',
            thumbnailUrl: null,
            cookTimeMinutes: 5,
            prepTimeMinutes: 5,
            servings: 1,
            tacGia: 'duc.daubep@gmail.com',
            nhom: 'mon-man',
            trangThai: RecipeStatus.PENDING,
            ingredients: [{ text: 'http://xem-them-qua', qty: '1', unit: 'gói' }],
            steps: [{ noiDung: 'Bấm link nhận quà http://xem-them-qua' }],
            nutrition: { calories: 0, protein: '0', carbs: '0', fat: '0' },
        },
    ];

    for (const data of mons) {
        const recipe = await prisma.recipe.upsert({
            where: { id: data.id },
            update: {},
            create: {
                id: data.id,
                title: data.title,
                description: data.description,
                thumbnailUrl: data.thumbnailUrl,
                cookTimeMinutes: data.cookTimeMinutes,
                prepTimeMinutes: data.prepTimeMinutes,
                servings: data.servings,
                authorId: users[data.tacGia].id,
                status: data.trangThai,
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
                    internalIngredientId: timInternalId(ing.text),
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
                data: { recipeId: recipe.id, stepOrder: i + 1, content: data.steps[i].noiDung, imageUrl: data.steps[i].anh },
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

    // BR-SEED: Tương tác mẫu giống thật — lưu/chấm/bình luận như người dùng thật
    const tuongTacs = [
        { recipeId: 'pho-bo-ha-noi', email: 'minh.anh92@gmail.com', diem: 5, luu: true },
        { recipeId: 'bun-cha-ha-noi', email: 'minh.anh92@gmail.com', diem: 5, luu: true },
        { recipeId: 'com-tam-suon-bi-cha', email: 'minh.anh92@gmail.com', diem: 4, luu: true },
        { recipeId: 'canh-chua-ca-loc', email: 'minh.anh92@gmail.com', diem: 5, luu: false },
        { recipeId: 'ca-ri-ga', email: 'minh.anh92@gmail.com', diem: 5, luu: true },
        { recipeId: 'ga-nuong-mat-ong', email: 'minh.anh92@gmail.com', diem: 4, luu: true },
        { recipeId: 'pho-bo-ha-noi', email: 'tran.thanh.cook@gmail.com', diem: 5, luu: true },
        { recipeId: 'thit-kho-tau', email: 'tran.thanh.cook@gmail.com', diem: 4, luu: true },
        { recipeId: 'com-chien-duong-chau', email: 'tran.thanh.cook@gmail.com', diem: 5, luu: true },
        { recipeId: 'bun-bo-hue', email: 'huong.pham.89@gmail.com', diem: 5, luu: true },
        { recipeId: 'banh-xeo-mien-trung', email: 'huong.pham.89@gmail.com', diem: 5, luu: false },
        { recipeId: 'mi-xao-gion', email: 'huong.pham.89@gmail.com', diem: 4, luu: true },
        { recipeId: 'thit-kho-tau', email: 'duc.daubep@gmail.com', diem: 5, luu: true },
        { recipeId: 'ca-ri-ga', email: 'duc.daubep@gmail.com', diem: 5, luu: false },
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
            email: 'minh.anh92@gmail.com',
            content: 'Ninh đúng 3 giờ như hướng dẫn, nước trong và ngọt thanh lắm. Nhà mình ai cũng khen!',
        },
        {
            recipeId: 'pho-bo-ha-noi',
            email: 'duc.daubep@gmail.com',
            content: 'Thêm ít sá sùng khô vào ninh thì nước còn ngọt sâu hơn nữa. Mọi người thử xem.',
        },
        {
            recipeId: 'bun-cha-ha-noi',
            email: 'tran.thanh.cook@gmail.com',
            content: 'Chả nướng than hoa thơm hơn hẳn chảo. Mình thêm ít sả băm vào ướp, mọi người thử xem.',
        },
        {
            recipeId: 'com-tam-suon-bi-cha',
            email: 'huong.pham.89@gmail.com',
            content: 'Ướp sữa đặc đúng là bí kíp, sườn mềm mà không bị khô. Cảm ơn bạn chia sẻ!',
        },
        {
            recipeId: 'canh-chua-ca-loc',
            email: 'minh.anh92@gmail.com',
            content: 'Cho rau nhút vào sau cùng như bài viết thì rau giòn thật. Món này hao cơm lắm.',
        },
        {
            recipeId: 'ca-ri-ga',
            email: 'tran.thanh.cook@gmail.com',
            content: 'Chiên sơ khoai môn trước đúng là không bị nát. Nước cốt dừa béo vừa phải, ngon!',
        },
        {
            recipeId: 'ga-nuong-mat-ong',
            email: 'minh.anh92@gmail.com',
            content: 'Phết mật ong 2 lần thì da bóng đẹp hơn. Nhà mình dùng nồi chiên không dầu vẫn giòn.',
        },
    ];
    for (const bl of binhLuans) {
        await prisma.comment.create({
            data: { userId: users[bl.email].id, recipeId: bl.recipeId, content: bl.content },
        });
    }

    // BR-SEED: Kế hoạch tuần và danh sách đi chợ mẫu của Minh Anh
    const tuanNay = new Date();
    tuanNay.setHours(0, 0, 0, 0);
    const hetTuan = new Date(tuanNay);
    hetTuan.setDate(hetTuan.getDate() + 6);
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

    console.log(`Seed hoan tat: ${mons.length} mon, 5 tai khoan (mat khau: ${MAT_KHAU_MAU})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
