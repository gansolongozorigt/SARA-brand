import noire from '../assets/products/noire.jpg'
import sun from '../assets/products/sun.jpg'
import giftset from '../assets/products/giftset.jpg'
import camel from '../assets/products/camel.jpg'
import etree from '../assets/products/etree.jpg'
import ampoule from '../assets/products/ampoule.jpg'
import centella from '../assets/products/centella.jpg'
import whitetea from '../assets/products/whitetea.jpg'
import mask from '../assets/products/mask.jpg'
import hand from '../assets/products/hand.jpg'
import men from '../assets/products/men.jpg'
import type { Lang, Localized, LocalizedList, TranslationKey } from '../i18n'

export type Category = 'skin' | 'perfume' | 'mask' | 'men' | 'set'
export type FilterKey = 'all' | Category

export interface Product {
  id: string
  name: Localized
  tag: Localized
  short: Localized
  desc: Localized
  specs: LocalizedList
  price: number
  old?: number
  category: Category
  image: string
}

/**
 * Full product catalog — name/tag/short/desc/specs ported EXACTLY from the design
 * reference's PRODUCTS (mn/en/cn) with ru added. Static until WooCommerce wiring.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'noire',
    name: { mn: "SARA NOIRE Тансаг үнэртэн", en: "SARA NOIRE Eau de Parfum", cn: "SARA NOIRE 香水", ru: "SARA NOIRE Парфюмерная вода" },
    tag: { mn: "Үнэртэн", en: "Perfume", cn: "香水", ru: "Парфюм" },
    short: { mn: "Гүн, дулаан, мартагдашгүй", en: "Deep, warm, unforgettable", cn: "深邃温暖，难以忘怀", ru: "Глубокий, тёплый, незабываемый" },
    desc: { mn: "Алтан савласан тансаг үнэртэн. Дулаан амбер, цэцгийн анхилуун аяс хосолсон, удаан тогтох эмэгтэйлэг үнэр.", en: "A luxurious gold-bottled fragrance. Warm amber and delicate florals combine for a long-lasting, feminine scent.", cn: "金瓶奢华香水。温暖琥珀与精致花香交融，留香持久，尽显女性魅力。", ru: "Роскошный аромат в золотом флаконе. Тёплый янтарь и нежные цветочные ноты создают стойкий женственный шлейф." },
    specs: { mn: ["Багтаамж: 50мл","Аяс: Амбер · Цэцэг","Удаан тогтоц 8+ цаг"], en: ["Volume: 50ml","Notes: Amber · Floral","Long-lasting 8+ hours"], cn: ["容量：50ml","调性：琥珀·花香","持久 8 小时以上"], ru: ["Объём: 50 мл","Ноты: янтарь · цветы","Стойкость 8+ часов"] },
    price: 159000,
    category: 'perfume',
    image: noire,
  },
  {
    id: 'sun',
    name: { mn: "Нарны хамгаалалт SPF50+", en: "Sun Protection SPF50+ Dual Essence", cn: "SPF50+ 双重防晒精华", ru: "Солнцезащита SPF50+ двойная эссенция" },
    tag: { mn: "Хамгаалалт", en: "Protection", cn: "防护", ru: "Защита" },
    short: { mn: "Чийгшил + хамгаалалт нэг дор", en: "Hydration + protection in one", cn: "保湿与防护合一", ru: "Увлажнение и защита в одном" },
    desc: { mn: "UVA/UVB-аас хамгаалах SPF50+ PA+++ давхар эссенц. Арьсыг хөнгөн чийгшүүлж, наранд бүтэн өдөр найдвартай хамгаална.", en: "SPF50+ PA+++ dual essence protecting against UVA/UVB. Lightweight hydration with all-day reliable sun defence.", cn: "SPF50+ PA+++ 双重精华，抵御 UVA/UVB。轻盈保湿，全天可靠防晒。", ru: "Двойная эссенция SPF50+ PA+++ для защиты от UVA/UVB. Лёгкое увлажнение и надёжная защита от солнца на весь день." },
    specs: { mn: ["SPF50+ PA+++","UVA/UVB хамгаалалт","Хөнгөн, наалдамтгай биш"], en: ["SPF50+ PA+++","UVA/UVB defence","Light, non-sticky"], cn: ["SPF50+ PA+++","UVA/UVB 防护","轻盈不黏腻"], ru: ["SPF50+ PA+++","Защита от UVA/UVB","Лёгкая, не липкая"] },
    price: 65000,
    category: 'skin',
    image: sun,
  },
  {
    id: 'giftset',
    name: { mn: "Гэрэлтүүлэгч арьс арчилгааны багц", en: "Brightening Skin Set Box", cn: "焕亮肌肤套装礼盒", ru: "Набор для сияния кожи" },
    tag: { mn: "Багц", en: "Set", cn: "套装", ru: "Набор" },
    short: { mn: "Бүрэн арчилгаа · 5 алхам", en: "Complete ritual · 5 steps", cn: "完整护理·5 步骤", ru: "Полный ритуал · 5 шагов" },
    desc: { mn: "Ургамлын ханд ба полипептид агуулсан бүрэн арчилгааны бэлгийн багц. Цэвэрлэгч, тоник, эссенц, тос болон сэргээгчийг нэг тансаг хайрцагт.", en: "A complete gift set with plant extracts and polypeptides — cleanser, toner, essence, cream and repair in one luxurious box.", cn: "植物萃取与多肽完整护理礼盒——洁面、爽肤水、精华、面霜与修护，尽在奢华礼盒中。", ru: "Полный подарочный набор с растительными экстрактами и полипептидами — очищение, тоник, эссенция, крем и восстановление в одной роскошной коробке." },
    specs: { mn: ["5 бүтээгдэхүүн","Ургамлын ханд + Полипептид","Бэлэгт тохиромжтой"], en: ["5 products","Plant extract + Polypeptide","Perfect as a gift"], cn: ["5 件产品","植物萃取 + 多肽","适合馈赠"], ru: ["5 продуктов","Растительный экстракт + полипептид","Идеально в подарок"] },
    price: 249000,
    category: 'set',
    image: giftset,
  },
  {
    id: 'camel',
    name: { mn: "Тэмээний сүү & Кактус тос", en: "Camel Milk Cactus Cream", cn: "驼奶仙人掌保湿霜", ru: "Крем с верблюжьим молоком и кактусом" },
    tag: { mn: "Тос", en: "Cream", cn: "面霜", ru: "Крем" },
    short: { mn: "Гүн чийгшил, торгомсог арьс", en: "Deep moisture, silky skin", cn: "深层保湿，丝滑肌肤", ru: "Глубокое увлажнение, шелковистая кожа" },
    desc: { mn: "Тэмээний сүү ба кактусын ханд агуулсан премиум чийгшүүлэгч тос. Арьсыг гүнзгий тэжээж, зөөлөн уян болгоно. 120г.", en: "A premium moisturizer with camel milk and cactus extract that deeply nourishes and softens the skin. 120g.", cn: "含驼奶与仙人掌萃取的高级保湿面霜，深层滋养，柔嫩肌肤。120g。", ru: "Премиальный увлажняющий крем с верблюжьим молоком и экстрактом кактуса, глубоко питает и смягчает кожу. 120 г." },
    specs: { mn: ["Багтаамж: 120г","Тэмээний сүү · Кактус","Бүх төрлийн арьсанд"], en: ["Volume: 120g","Camel milk · Cactus","For all skin types"], cn: ["容量：120g","驼奶·仙人掌","适合所有肤质"], ru: ["Объём: 120 г","Верблюжье молоко · кактус","Для всех типов кожи"] },
    price: 89000,
    category: 'skin',
    image: camel,
  },
  {
    id: 'etree',
    name: { mn: "SARA ÉTRÉE Сэрүүн үнэртэн", en: "SARA ÉTRÉE Eau de Parfum", cn: "SARA ÉTRÉE 香水", ru: "SARA ÉTRÉE Парфюмерная вода" },
    tag: { mn: "Үнэртэн", en: "Perfume", cn: "香水", ru: "Парфюм" },
    short: { mn: "Сэрүүн, шинэлэг ногоон аяс", en: "Cool, fresh green notes", cn: "清爽新绿调", ru: "Прохладные, свежие зелёные ноты" },
    desc: { mn: "Шинэлэг ногоон болон усан аястай сэрүүн үнэртэн. Өдөр тутмын хэрэглээнд төгс, цэвэр, тансаг мэдрэмж.", en: "A refreshing fragrance with green and aquatic notes — clean, light and perfect for everyday luxury.", cn: "清新绿意与水生调香水——洁净轻盈，日常奢华之选。", ru: "Освежающий аромат с зелёными и водными нотами — чистый, лёгкий, идеальный для повседневной роскоши." },
    specs: { mn: ["Багтаамж: 50мл","Аяс: Ногоон · Усан","Өдрийн хэрэглээнд"], en: ["Volume: 50ml","Notes: Green · Aquatic","For daily wear"], cn: ["容量：50ml","调性：绿意·水生","日常佩戴"], ru: ["Объём: 50 мл","Ноты: зелёные · водные","Для ежедневного использования"] },
    price: 129000,
    category: 'perfume',
    image: etree,
  },
  {
    id: 'ampoule',
    name: { mn: "Үрчлээний эсрэг Ампуль шидэт маск", en: "Anti-Aging Ampoule Mask", cn: "抗皱安瓶精华面膜", ru: "Антивозрастная ампульная маска" },
    tag: { mn: "Маск · Хямдрал", en: "Mask · Sale", cn: "面膜·特惠", ru: "Маска · Скидка" },
    short: { mn: "4 төрлийн патентан шидэт найрлага · 20ш", en: "4 patented essences · 20 sticks", cn: "4 种专利精华·20 支", ru: "4 запатентованные эссенции · 20 шт" },
    desc: { mn: "Арьсны цангааг тайлж, хөгшрөлтийн процессыг удаашруулдаг 4 төрлийн патентан эрхтэй шидэт маск. Найрлага: Arginine, Panthenol, Niacinamide, Optimelth 10W, Glycerin.", en: "A patented 4-type ampoule mask that quenches the skin and slows the ageing process. Ingredients: Arginine, Panthenol, Niacinamide, Optimelth 10W, Glycerin.", cn: "拥有 4 种专利的安瓶精华面膜，为肌肤补水并延缓衰老。成分：精氨酸、泛醇、烟酰胺、Optimelth 10W、甘油。", ru: "Запатентованная ампульная маска 4 видов, которая насыщает кожу влагой и замедляет старение. Состав: аргинин, пантенол, ниацинамид, Optimelth 10W, глицерин." },
    specs: { mn: ["20 ширхэг шидэт","Arginine · Panthenol · Niacinamide","Үрчлээ · хөгшрөлтийн эсрэг"], en: ["20 sticks","Arginine · Panthenol · Niacinamide","Anti-wrinkle · anti-aging"], cn: ["20 支装","精氨酸·泛醇·烟酰胺","抗皱·抗衰"], ru: ["20 ампул","Аргинин · пантенол · ниацинамид","Против морщин · антивозрастная"] },
    price: 69000,
    old: 99000,
    category: 'mask',
    image: ampoule,
  },
  {
    id: 'centella',
    name: { mn: "Центелла цэвэрлэгээний тос", en: "Centella Soothing Cleansing Cream", cn: "积雪草舒缓洁面霜", ru: "Успокаивающий очищающий крем с центеллой" },
    tag: { mn: "Цэвэрлэгээ", en: "Cleansing", cn: "洁面", ru: "Очищение" },
    short: { mn: "Зөөлөн цэвэрлэгээ, тайвшрал", en: "Gentle cleanse, soothing", cn: "温和清洁，舒缓", ru: "Мягкое очищение, успокоение" },
    desc: { mn: "Центелла ханд агуулсан тайвшруулагч цэвэрлэгээний тос. Арьсны бохирдлыг зөөлөн арилгаж, чийгшил, тайван байдлыг хадгална.", en: "A soothing cleansing cream with centella extract that gently removes impurities while keeping skin calm and hydrated.", cn: "含积雪草萃取的舒缓洁面霜，温和清除污垢，同时保持肌肤平静与水润。", ru: "Успокаивающий очищающий крем с экстрактом центеллы, мягко удаляет загрязнения, сохраняя кожу спокойной и увлажнённой." },
    specs: { mn: ["Центелла ханд","Зөөлөн, тайвшруулагч","Мэдрэг арьсанд тохиромжтой"], en: ["Centella extract","Gentle, soothing","Suitable for sensitive skin"], cn: ["积雪草萃取","温和舒缓","适合敏感肌"], ru: ["Экстракт центеллы","Мягкий, успокаивающий","Подходит для чувствительной кожи"] },
    price: 49000,
    category: 'skin',
    image: centella,
  },
  {
    id: 'whitetea',
    name: { mn: "Цагаан цайны цэвэрлэгээний тос", en: "White Tea Cleansing Oil", cn: "白茶净颜卸妆油", ru: "Очищающее масло с белым чаем" },
    tag: { mn: "Цэвэрлэгээ", en: "Cleansing", cn: "洁面", ru: "Очищение" },
    short: { mn: "Гялалзсан тунгалаг арьс", en: "Shining, crystal-clear skin", cn: "莹润透亮肌肤", ru: "Сияющая, кристально чистая кожа" },
    desc: { mn: "Цагаан цайны ханд ба уусдаг бичил мөхлөг агуулсан цэвэрлэгээний тос. Нүүр будаг, бохирдлыг гүн арилгаж, арьсыг гялалзуулна.", en: "A cleansing oil with white tea extract and soluble particles that deeply removes makeup and impurities, leaving skin radiant.", cn: "含白茶萃取与可溶颗粒的卸妆油，深层卸除彩妆与污垢，令肌肤焕亮。", ru: "Очищающее масло с экстрактом белого чая и растворимыми частицами, глубоко удаляет макияж и загрязнения, придавая коже сияние." },
    specs: { mn: ["Цагаан цайны ханд","Уусдаг бичил мөхлөг","Гүн цэвэрлэгээ"], en: ["White tea extract","Soluble particles","Deep cleansing"], cn: ["白茶萃取","可溶颗粒","深层清洁"], ru: ["Экстракт белого чая","Растворимые частицы","Глубокое очищение"] },
    price: 55000,
    category: 'skin',
    image: whitetea,
  },
  {
    id: 'mask',
    name: { mn: "Гэрэлтүүлэгч нөхөн сэргээх маск", en: "Brightening Relief Sheet Mask", cn: "焕亮修护面膜", ru: "Тканевая маска для сияния и восстановления" },
    tag: { mn: "Маск", en: "Mask", cn: "面膜", ru: "Маска" },
    short: { mn: "Гэрэлтүүлэх · нөхөн сэргээх", en: "Brighten · repair", cn: "焕亮·修护", ru: "Сияние · восстановление" },
    desc: { mn: "Milo Wood ба амилах ургамлын ханд, полипептид агуулсан маск. Арьсны чийг барих чадварыг сайжруулж, нарийн үрчлээг намжаана.", en: "A sheet mask with Milo Wood, resurrection plant extract and polypeptides that improves moisture retention and softens fine lines.", cn: "含 Milo Wood、复活草萃取与多肽的面膜，提升肌肤锁水力，柔化细纹。", ru: "Тканевая маска с Milo Wood, экстрактом воскрешающего растения и полипептидами, улучшает удержание влаги и смягчает мелкие морщинки." },
    specs: { mn: ["Milo Wood · Полипептид","Чийг барих чадвар ↑","Нарийн үрчлээ намжаах"], en: ["Milo Wood · Polypeptide","Better moisture retention","Softens fine lines"], cn: ["Milo Wood·多肽","提升锁水","柔化细纹"], ru: ["Milo Wood · полипептид","Лучшее удержание влаги","Смягчает мелкие морщинки"] },
    price: 59000,
    category: 'mask',
    image: mask,
  },
  {
    id: 'hand',
    name: { mn: "Анхилуун Гарын тос", en: "Perfume Hand Cream", cn: "香氛护手霜", ru: "Парфюмированный крем для рук" },
    tag: { mn: "Тос · Хямдрал", en: "Cream · Sale", cn: "护手·特惠", ru: "Крем · Скидка" },
    short: { mn: "Чийгшүүлэх, анхилуун үнэртэй", en: "Moisturizing, lovely scent", cn: "滋润，淡雅香氛", ru: "Увлажнение, нежный аромат" },
    desc: { mn: "Чийгшүүлэх, хөгшрөлтийн эсрэг, анхилам үнэртэй устай гарын тос. Гарын арьсыг зөөлөн, торгомсог болгоно.", en: "A moisturizing, anti-aging perfumed hand cream that leaves hands soft and silky.", cn: "滋润抗衰的香氛护手霜，令双手柔软丝滑。", ru: "Увлажняющий антивозрастной парфюмированный крем для рук, делает руки мягкими и шелковистыми." },
    specs: { mn: ["Чийгшүүлэх · тэжээх","Анхилуун үнэртэй","Өдөр тутмын хэрэглээнд"], en: ["Moisturizing · nourishing","Lovely fragrance","For daily use"], cn: ["滋润·滋养","淡雅香氛","日常使用"], ru: ["Увлажнение · питание","Нежный аромат","Для ежедневного использования"] },
    price: 7900,
    old: 9900,
    category: 'skin',
    image: hand,
  },
  {
    id: 'men',
    name: { mn: "SARA MEN Эрэгтэй арчилгааны багц", en: "SARA Specialty Men Set", cn: "SARA 男士护理套装", ru: "SARA набор для мужчин" },
    tag: { mn: "Эрэгтэй", en: "For Men", cn: "男士", ru: "Для мужчин" },
    short: { mn: "Тосжилт хянах · сэргээх", en: "Oil-control · refreshing", cn: "控油·清爽", ru: "Контроль жирности · свежесть" },
    desc: { mn: "Эрэгтэй арьсанд зориулсан тосжилт хянадаг хөөсөн цэвэрлэгч ба сэрүүцүүлэх чийгшүүлэгч хослол. Шинэлэг, цэвэрхэн мэдрэмж.", en: "An oil-control cleansing mousse and refreshing hydrating dew designed for men's skin — a fresh, clean feel.", cn: "专为男士肌肤设计的控油洁面慕斯与清爽保湿露——清新洁净。", ru: "Очищающий мусс с контролем жирности и освежающий увлажняющий флюид для мужской кожи — ощущение свежести и чистоты." },
    specs: { mn: ["Хөөсөн цэвэрлэгч + Чийгшүүлэгч","Тосжилт хянах","Сэрүүн, шинэлэг"], en: ["Cleansing mousse + Dew","Oil control","Cool & fresh"], cn: ["洁面慕斯 + 保湿露","控油","清爽清新"], ru: ["Очищающий мусс + флюид","Контроль жирности","Прохлада и свежесть"] },
    price: 119000,
    category: 'men',
    image: men,
  },
]

/** Filter pills — keys mirror the demo's FILTERS; labels are localized via i18n. */
export const FILTERS: { key: FilterKey; labelKey: TranslationKey }[] = [
  { key: 'all',     labelKey: 'prodAll' },
  { key: 'skin',    labelKey: 'catSkin' },
  { key: 'perfume', labelKey: 'catPerfume' },
  { key: 'mask',    labelKey: 'catMask' },
  { key: 'men',     labelKey: 'catMen' },
  { key: 'set',     labelKey: 'catSet' },
]

/**
 * Language-aware price formatter: Mongolian shows the ₮ symbol ("249,000₮");
 * EN/CN/RU show "249,000 MNT" so non-Mongolian visitors understand the currency.
 */
export const formatPrice = (n: number, lang: Lang): string =>
  n.toLocaleString('en-US') + (lang === 'mn' ? '₮' : ' MNT')
