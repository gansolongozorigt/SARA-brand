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
import type { Localized, TranslationKey } from '../i18n'

export type Category = 'skin' | 'perfume' | 'mask' | 'men' | 'set'
export type FilterKey = 'all' | Category

export interface Product {
  id: string
  name: Localized
  tag: Localized
  short: Localized
  price: number
  old?: number
  category: Category
  image: string
}

/**
 * Full product catalog — name/tag/short ported EXACTLY from the design reference's
 * PRODUCTS array (mn/en/cn) with ru added. Static until WooCommerce wiring.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'noire',
    name: { mn: "SARA NOIRE Тансаг үнэртэн", en: "SARA NOIRE Eau de Parfum", cn: "SARA NOIRE 香水", ru: "SARA NOIRE Парфюмерная вода" },
    tag: { mn: "Үнэртэн", en: "Perfume", cn: "香水", ru: "Парфюм" },
    short: { mn: "Гүн, дулаан, мартагдашгүй", en: "Deep, warm, unforgettable", cn: "深邃温暖，难以忘怀", ru: "Глубокий, тёплый, незабываемый" },
    price: 159000,
    category: 'perfume',
    image: noire,
  },
  {
    id: 'sun',
    name: { mn: "Нарны хамгаалалт SPF50+", en: "Sun Protection SPF50+ Dual Essence", cn: "SPF50+ 双重防晒精华", ru: "Солнцезащита SPF50+ двойная эссенция" },
    tag: { mn: "Хамгаалалт", en: "Protection", cn: "防护", ru: "Защита" },
    short: { mn: "Чийгшил + хамгаалалт нэг дор", en: "Hydration + protection in one", cn: "保湿与防护合一", ru: "Увлажнение и защита в одном" },
    price: 65000,
    category: 'skin',
    image: sun,
  },
  {
    id: 'giftset',
    name: { mn: "Гэрэлтүүлэгч арьс арчилгааны багц", en: "Brightening Skin Set Box", cn: "焕亮肌肤套装礼盒", ru: "Набор для сияния кожи" },
    tag: { mn: "Багц", en: "Set", cn: "套装", ru: "Набор" },
    short: { mn: "Бүрэн арчилгаа · 5 алхам", en: "Complete ritual · 5 steps", cn: "完整护理·5 步骤", ru: "Полный ритуал · 5 шагов" },
    price: 249000,
    category: 'set',
    image: giftset,
  },
  {
    id: 'camel',
    name: { mn: "Тэмээний сүү & Кактус тос", en: "Camel Milk Cactus Cream", cn: "驼奶仙人掌保湿霜", ru: "Крем с верблюжьим молоком и кактусом" },
    tag: { mn: "Тос", en: "Cream", cn: "面霜", ru: "Крем" },
    short: { mn: "Гүн чийгшил, торгомсог арьс", en: "Deep moisture, silky skin", cn: "深层保湿，丝滑肌肤", ru: "Глубокое увлажнение, шелковистая кожа" },
    price: 89000,
    category: 'skin',
    image: camel,
  },
  {
    id: 'etree',
    name: { mn: "SARA ÉTRÉE Сэрүүн үнэртэн", en: "SARA ÉTRÉE Eau de Parfum", cn: "SARA ÉTRÉE 香水", ru: "SARA ÉTRÉE Парфюмерная вода" },
    tag: { mn: "Үнэртэн", en: "Perfume", cn: "香水", ru: "Парфюм" },
    short: { mn: "Сэрүүн, шинэлэг ногоон аяс", en: "Cool, fresh green notes", cn: "清爽新绿调", ru: "Прохладные, свежие зелёные ноты" },
    price: 129000,
    category: 'perfume',
    image: etree,
  },
  {
    id: 'ampoule',
    name: { mn: "Үрчлээний эсрэг Ампуль шидэт маск", en: "Anti-Aging Ampoule Mask", cn: "抗皱安瓶精华面膜", ru: "Антивозрастная ампульная маска" },
    tag: { mn: "Маск · Хямдрал", en: "Mask · Sale", cn: "面膜·特惠", ru: "Маска · Скидка" },
    short: { mn: "4 төрлийн патентан шидэт найрлага · 20ш", en: "4 patented essences · 20 sticks", cn: "4 种专利精华·20 支", ru: "4 запатентованные эссенции · 20 шт" },
    price: 69000, old: 99000,
    category: 'mask',
    image: ampoule,
  },
  {
    id: 'centella',
    name: { mn: "Центелла цэвэрлэгээний тос", en: "Centella Soothing Cleansing Cream", cn: "积雪草舒缓洁面霜", ru: "Успокаивающий очищающий крем с центеллой" },
    tag: { mn: "Цэвэрлэгээ", en: "Cleansing", cn: "洁面", ru: "Очищение" },
    short: { mn: "Зөөлөн цэвэрлэгээ, тайвшрал", en: "Gentle cleanse, soothing", cn: "温和清洁，舒缓", ru: "Мягкое очищение, успокоение" },
    price: 49000,
    category: 'skin',
    image: centella,
  },
  {
    id: 'whitetea',
    name: { mn: "Цагаан цайны цэвэрлэгээний тос", en: "White Tea Cleansing Oil", cn: "白茶净颜卸妆油", ru: "Очищающее масло с белым чаем" },
    tag: { mn: "Цэвэрлэгээ", en: "Cleansing", cn: "洁面", ru: "Очищение" },
    short: { mn: "Гялалзсан тунгалаг арьс", en: "Shining, crystal-clear skin", cn: "莹润透亮肌肤", ru: "Сияющая, кристально чистая кожа" },
    price: 55000,
    category: 'skin',
    image: whitetea,
  },
  {
    id: 'mask',
    name: { mn: "Гэрэлтүүлэгч нөхөн сэргээх маск", en: "Brightening Relief Sheet Mask", cn: "焕亮修护面膜", ru: "Тканевая маска для сияния и восстановления" },
    tag: { mn: "Маск", en: "Mask", cn: "面膜", ru: "Маска" },
    short: { mn: "Гэрэлтүүлэх · нөхөн сэргээх", en: "Brighten · repair", cn: "焕亮·修护", ru: "Сияние · восстановление" },
    price: 59000,
    category: 'mask',
    image: mask,
  },
  {
    id: 'hand',
    name: { mn: "Анхилуун Гарын тос", en: "Perfume Hand Cream", cn: "香氛护手霜", ru: "Парфюмированный крем для рук" },
    tag: { mn: "Тос · Хямдрал", en: "Cream · Sale", cn: "护手·特惠", ru: "Крем · Скидка" },
    short: { mn: "Чийгшүүлэх, анхилуун үнэртэй", en: "Moisturizing, lovely scent", cn: "滋润，淡雅香氛", ru: "Увлажнение, нежный аромат" },
    price: 7900, old: 9900,
    category: 'skin',
    image: hand,
  },
  {
    id: 'men',
    name: { mn: "SARA MEN Эрэгтэй арчилгааны багц", en: "SARA Specialty Men Set", cn: "SARA 男士护理套装", ru: "SARA набор для мужчин" },
    tag: { mn: "Эрэгтэй", en: "For Men", cn: "男士", ru: "Для мужчин" },
    short: { mn: "Тосжилт хянах · сэргээх", en: "Oil-control · refreshing", cn: "控油·清爽", ru: "Контроль жирности · свежесть" },
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

/** Price formatter — matches the demo's fmt(): "159,000₮". */
export const formatPrice = (n: number): string => n.toLocaleString('en-US') + '₮'
