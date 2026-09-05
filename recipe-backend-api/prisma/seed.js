"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash('Password123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'demo@cookbook.vn' },
        update: {},
        create: {
            email: 'demo@cookbook.vn',
            passwordHash,
            displayName: 'Chef Demo',
            role: 'USER',
            status: 'ACTIVE',
        },
    });
    const category = await prisma.category.upsert({
        where: { slug: 'viet-nam' },
        update: {},
        create: { name: 'Việt Nam', slug: 'viet-nam' },
    });
    const recipesData = [
        {
            title: 'Phở bò Hà Nội',
            description: 'Phở bò truyền thống với nước dùng ngọt thanh',
            thumbnailUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
            cookTimeMinutes: 180,
            prepTimeMinutes: 30,
            servings: 4,
            ingredients: [
                { text: 'Xương bò', qty: '1.5', unit: 'kg' },
                { text: 'Thịt bò tái', qty: '500', unit: 'g' },
                { text: 'Bánh phở', qty: '1', unit: 'kg' },
                { text: 'Hành tây', qty: '2', unit: 'củ' },
                { text: 'Gừng', qty: '50', unit: 'g' },
                { text: 'Quế', qty: '2', unit: 'thanh' },
                { text: 'Hồi', qty: '3', unit: 'cánh' },
            ],
            steps: [
                'Rửa sạch xương bò, chần qua nước sôi',
                'Ninh xương với hành gừng nướng trong 3 giờ',
                'Thêm quế, hồi, thảo quả vào nước dùng',
                'Trụng bánh phở, xếp thịt bò tái lên trên',
                'Chan nước dùng nóng, rắc hành lá và rau thơm',
            ],
            nutrition: { calories: 450, protein: '35', carbs: '60', fat: '8', fiber: '2' },
        },
        {
            title: 'Bún chả Hà Nội',
            description: 'Bún chả với chả nướng thơm lừng và nước mắm chua ngọt',
            thumbnailUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
            cookTimeMinutes: 45,
            prepTimeMinutes: 20,
            servings: 3,
            ingredients: [
                { text: 'Thịt ba chỉ', qty: '500', unit: 'g' },
                { text: 'Thịt nạc dăm', qty: '300', unit: 'g' },
                { text: 'Bún tươi', qty: '1', unit: 'kg' },
                { text: 'Nước mắm', qty: '100', unit: 'ml' },
                { text: 'Đường', qty: '50', unit: 'g' },
                { text: 'Tỏi', qty: '4', unit: 'tép' },
                { text: 'Ớt', qty: '2', unit: 'quả' },
            ],
            steps: [
                'Băm nhuyễn thịt nạc, trộn với nước mắm và tỏi',
                'Thái ba chỉ miếng vừa, ướp gia vị',
                'Nặn chả vào que tre, nướng trên than hồng',
                'Pha nước mắm chua ngọt',
                'Dọn bún, chả, rau sống và nước mắm',
            ],
            nutrition: { calories: 520, protein: '30', carbs: '70', fat: '15' },
        },
        {
            title: 'Cơm tấm sườn bì chả',
            description: 'Cơm tấm Sài Gòn với sườn nướng, bì, chả trứng',
            thumbnailUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
            cookTimeMinutes: 60,
            prepTimeMinutes: 15,
            servings: 2,
            ingredients: [
                { text: 'Cơm tấm', qty: '500', unit: 'g' },
                { text: 'Sườn heo', qty: '300', unit: 'g' },
                { text: 'Bì heo', qty: '100', unit: 'g' },
                { text: 'Chả trứng', qty: '2', unit: 'miếng' },
                { text: 'Dưa leo', qty: '1', unit: 'trái' },
                { text: 'Cà chua', qty: '1', unit: 'trái' },
            ],
            steps: [
                'Ướp sườn với sả, tỏi, nước mắm, đường',
                'Nướng sườn trên than hoặc chảo',
                'Luộc bì, thái sợi nhỏ',
                'Chiên chả trứng',
                'Dọn cơm tấm với sườn, bì, chả và rau',
            ],
            nutrition: { calories: 650, protein: '40', carbs: '80', fat: '20' },
        },
    ];
    for (const data of recipesData) {
        const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const recipe = await prisma.recipe.upsert({
            where: { id: slug },
            update: {},
            create: {
                id: slug,
                title: data.title,
                description: data.description,
                thumbnailUrl: data.thumbnailUrl,
                cookTimeMinutes: data.cookTimeMinutes,
                prepTimeMinutes: data.prepTimeMinutes,
                servings: data.servings,
                authorId: user.id,
                status: client_1.RecipeStatus.APPROVED,
                source: client_1.RecipeSource.LOCAL,
                categoryId: category.id,
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
                data: {
                    recipeId: recipe.id,
                    stepOrder: i + 1,
                    content: data.steps[i],
                },
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
    console.log(`Seed hoan tat: ${recipesData.length} recipes, 1 user (demo@cookbook.vn / Password123)`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map