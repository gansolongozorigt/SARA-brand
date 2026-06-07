import type { Localized } from '../i18n'

export interface Review {
  initial: string
  rating: number
  name: Localized
  role: Localized
  text: Localized
}

/** Customer reviews — name/role/text ported EXACTLY from the demo's REVIEWS (mn/en/cn) with ru added. */
export const REVIEWS: Review[] = [
  {
    initial: "Б",
    rating: 5,
    name: { mn: "Болормаа Г.", en: "Bolormaa G.", cn: "宝乐尔玛", ru: "Болормаа Г." },
    role: { mn: "Тогтмол хэрэглэгч", en: "Loyal customer", cn: "忠实顾客", ru: "Постоянный клиент" },
    text: { mn: "Тэмээний сүүтэй тос арьсыг минь үнэхээр зөөллөө. Үнэр нь ч гайхалтай.", en: "The camel milk cream truly softened my skin. The scent is lovely too.", cn: "驼奶面霜让我的肌肤格外柔软，香味也很好闻。", ru: "Крем с верблюжьим молоком действительно смягчил мою кожу. И аромат прекрасный." },
  },
  {
    initial: "С",
    rating: 5,
    name: { mn: "Сараа Д.", en: "Saraa D.", cn: "萨拉", ru: "Сараа Д." },
    role: { mn: "Шинэ хэрэглэгч", en: "New customer", cn: "新顾客", ru: "Новый клиент" },
    text: { mn: "Ампуль маск 2 долоо хоногт арьсыг минь гэрэлтүүлсэн. Маш их санал болгож байна!", en: "The ampoule mask brightened my skin in two weeks. Highly recommend!", cn: "安瓶面膜两周内让我的肌肤焕亮，强烈推荐！", ru: "Ампульная маска осветлила мою кожу за две недели. Очень рекомендую!" },
  },
  {
    initial: "Э",
    rating: 5,
    name: { mn: "Энхжин Б.", en: "Enkhjin B.", cn: "恩赫晋", ru: "Энхжин Б." },
    role: { mn: "Гоо сайхны блогер", en: "Beauty blogger", cn: "美妆博主", ru: "Бьюти-блогер" },
    text: { mn: "Савлагаа, чанар бүгд тансаг. Монгол брэнд ийм байгаад бахархаж байна.", en: "The packaging and quality are luxurious. Proud of a Mongolian brand like this.", cn: "包装与品质都很奢华。为这样的蒙古品牌感到骄傲。", ru: "Упаковка и качество роскошные. Горжусь таким монгольским брендом." },
  },
]
