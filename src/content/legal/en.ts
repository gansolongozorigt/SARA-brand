// English — faithful translation of the approved Mongolian source. Meaning is
// translated precisely; nothing is paraphrased, softened or added. Numbers,
// timeframes, amounts and account details are identical to the source. Passages
// quoted from Mongolian law carry the Mongolian original alongside (`original`).
import type { LegalContent } from './types'

const EFFECTIVE = '2026.08.01'
const UPDATED = '2026.08.01'

const NOTICE =
  'Translations of these terms into other languages are provided to aid ' +
  'understanding only. In the event of any discrepancy between languages, the ' +
  'Mongolian original shall prevail.'

const LAW_NAME = 'Law on the Protection of Consumer Rights'
const LAW_META = '(2003.12.26, last amended 2024.01.12)'

export const en: LegalContent = {
  delivery: {
    title: 'Delivery Terms',
    effectiveDate: EFFECTIVE,
    updatedDate: UPDATED,
    sections: [
      {
        heading: 'General',
        items: [
          '1.1. These terms apply to all purchases made through the sarabrand.mn online store.',
          '1.2. By confirming an order, the buyer is deemed to have accepted these terms.',
        ],
      },
      {
        heading: 'Delivery coverage',
        items: [
          '2.1. Ulaanbaatar — SARA delivers to your address itself or through a partner delivery service.',
          '2.2. Countryside — SARA hands the goods to an intercity carrier (transport company) in Ulaanbaatar. The recipient then collects the goods from that company.',
        ],
      },
      {
        heading: 'Delivery fee',
        items: [
          '3.1. Delivery is free for orders of 100,000₮ or more.',
          '3.2. For orders under 100,000₮, the delivery fee is 7,000₮.',
          '3.3. The above applies equally in both Ulaanbaatar and the countryside.',
          '3.4. Additional for the countryside: the carrier’s transport charge is paid directly by the recipient upon collecting the goods, according to that company’s tariff. This charge is not part of SARA’s delivery fee and is not set by SARA.',
        ],
      },
      {
        heading: 'Delivery time',
        items: [
          '4.1. Ulaanbaatar — delivered within 24–48 hours after payment is received and confirmed.',
          '4.2. Countryside — the goods are handed to the intercity carrier within 24–48 hours after payment is confirmed.',
          '4.3. The time for the goods to reach the countryside via the carrier averages 2–5 days, depending on distance, route and the company’s schedule. As this time depends on the transport company’s operations, SARA cannot guarantee it.',
          '4.4. Timeframes may be extended due to non-working days, public holidays or exceptional weather conditions. In such cases we will notify the buyer in advance.',
        ],
      },
      {
        heading: 'Receiving',
        items: [
          '5.1. The delivery staff will contact you on the phone number provided. If the buyer cannot be reached, delivery is moved to the next working day.',
          '5.2. On receipt, the buyer should check that the packaging is fully intact. If any damage occurred during transport, notify us within 48 hours.',
          '5.3. If delivery is delayed or redelivery becomes necessary because of an incorrect or incomplete address given in the order, the buyer bears the additional cost.',
        ],
      },
      {
        heading: 'Working hours',
        items: ['6.1. Monday–Saturday, 10:00–19:00.'],
      },
      {
        heading: 'Contact',
        items: ['order@sarabrand.mn · info@sarabrand.mn · +976 8998 3612'],
      },
    ],
    legalBasis: {
      lawName: LAW_NAME,
      lawMeta: LAW_META,
      points: [
        'Article 7 — The consumer has the right to receive accurate information about goods and services. Article 7.1 of the law:',
        {
          type: 'quote',
          text: 'The consumer has the right to be provided with factual information that helps them make an accurate choice about goods.',
          original: 'Хэрэглэгч барааны талаар үнэн зөв сонголт хийхэд туслах бодит мэдээллээр хангагдах эрхтэй.',
        },
        'Article 6 — Performing an obligation within the period specified in the contract. Article 6.2 of the law, where a defect has been found,',
        {
          type: 'quote',
          text: 'within the period specified in the contract or, if no period is specified, immediately',
          original: 'гэрээнд заасан хугацаанд буюу хугацаа заагаагүй бол нэн даруй',
        },
        'grants the consumer the right to make a claim.',
      ],
    },
    languageNotice: NOTICE,
  },

  payment: {
    title: 'Payment Terms',
    effectiveDate: EFFECTIVE,
    updatedDate: UPDATED,
    sections: [
      {
        heading: 'General',
        items: ['1.1. These terms apply to all purchases made through sarabrand.mn.'],
      },
      {
        heading: 'Payment method',
        items: [
          '2.1. Payment is currently accepted by bank transfer.',
          '2.2. Account details:',
          {
            type: 'quote',
            text: 'Bank: Khan Bank\nAccount: 020005005720871790\nRecipient: Г.Урантуяа',
          },
          '2.3. Please be sure to write your order number in the transaction description. If it is missing, matching your payment to the order may be delayed.',
          '2.4. If other payment channels are added, this page will be updated accordingly.',
        ],
      },
      {
        heading: 'Payment period',
        items: [
          '3.1. Please transfer payment within 24 hours of placing the order.',
          '3.2. If payment is not received within the stated period, the order is automatically cancelled. The buyer may place a new order.',
          '3.3. Goods from an order cancelled for lateness return to stock and may be sold to another buyer.',
        ],
      },
      {
        heading: 'Order confirmation',
        items: [
          '4.1. As soon as an order is submitted, it enters the “Pending” status.',
          '4.2. After payment is confirmed as received in the account, the order moves to the “Processing” status and delivery preparation begins.',
          '4.3. We will notify you of the order’s progress by phone or e-mail.',
        ],
      },
      {
        heading: 'Price',
        items: [
          '5.1. All prices shown on the site are expressed in Mongolian tögrög (₮) and are the final retail price.',
          '5.2. Any delivery fee is shown separately on the order page.',
          '5.3. For contract resellers with special terms, the order page shows two lines: “Goods total” and “Amount payable”.',
        ],
      },
      {
        heading: 'Documents',
        items: [
          '6.1. Order details are sent by e-mail.',
          '6.2. Information about official tax receipts will be added to this page once determined.',
        ],
      },
      {
        heading: 'Contact',
        items: ['order@sarabrand.mn · +976 8998 3612'],
      },
    ],
    legalBasis: {
      lawName: LAW_NAME,
      lawMeta: LAW_META,
      points: [
        'Article 7 — the duty to provide accurate information about the type and price of goods.',
        'Article 11 — Article 11.1 of the law:',
        {
          type: 'quote',
          text: 'A consumer, producer or provider may conclude a contract for the sale, purchase or supply of goods, or the performance of work or services, orally, in writing, or in electronic form.',
          original: 'Хэрэглэгч, үйлдвэрлэгч, гүйцэтгэгч бараа худалдах, худалдан авах, нийлүүлэх, ажил гүйцэтгэх, үйлчилгээ үзүүлэх тухай гэрээг амаар, эсхүл бичгээр, эсхүл цахим хэлбэрээр хийж болно.',
        },
        'An order placed electronically constitutes a valid contract.',
      ],
    },
    languageNotice: NOTICE,
  },

  returns: {
    title: 'Return Terms',
    effectiveDate: EFFECTIVE,
    updatedDate: UPDATED,
    sections: [
      {
        heading: 'General',
        items: [
          '1.1. These terms apply to purchases made through sarabrand.mn.',
          '1.2. Return and exchange requests are accepted at order@sarabrand.mn or +976 8998 3612.',
          '1.3. When making a request, please clearly state the order number, product name and reason.',
        ],
      },
      {
        heading: 'Case A — The buyer changed their mind',
        items: [
          '2.1. If the goods are free of defects and in normal condition but the buyer wishes to return or exchange them, the following conditions apply:',
          'Timeframe: submit the request within 7 days of receiving the goods',
          'Condition: the box and packaging must be unopened and undamaged, and the labels fully intact',
          'Cost: the buyer bears the return shipping and other related costs. These are deducted from the refund amount',
          '2.2. For reasons of hygiene, opened or used cosmetic products cannot be returned on this basis.',
          '2.3. Note: the conditions set out in this Article 2 are not an obligation imposed on the seller by the laws of Mongolia, but an option SARA offers its buyers on a voluntary basis.',
        ],
      },
      {
        heading: 'Case B — Defective, damaged or wrong goods',
        items: [
          '3.1. If a defect in the quality, quantity, size or shelf life of the goods is found, or goods other than those ordered arrive, the buyer notifies us within 48 hours of receiving the goods.',
          '3.2. In this case, whether or not the packaging has been opened is not an obstacle.',
          '3.3. In accordance with Article 6 of the Law on the Protection of Consumer Rights, the buyer has the right to choose one of the following:',
          'have the defect remedied free of charge',
          'have the price reduced in proportion to the defect',
          'have the goods exchanged for defect-free goods',
          'cancel the contract and receive a full refund of the amount paid',
          '3.4. Cost: in this case SARA bears all costs of returning and redelivering the goods. No additional charge is taken from the buyer.',
        ],
      },
      {
        heading: 'Resolution and refund',
        items: [
          '4.1. Return and exchange requests are resolved within 48–72 hours of receipt.',
          '4.2. If a refund is decided, the payment is transferred to the account it was paid from within 3–5 working days.',
          '4.3. The costs specified in 2.1 (if applicable) are deducted from the refund amount.',
        ],
      },
      {
        heading: 'When a return is not possible',
        items: [
          '5.1. Products whose packaging has been opened or which have been used (except in the case of defects).',
          '5.2. Requests past the stated period.',
          '5.3. Goods damaged through the buyer’s own fault.',
        ],
      },
      {
        heading: 'Contact',
        items: ['order@sarabrand.mn · +976 8998 3612'],
      },
    ],
    legalBasis: {
      lawName: LAW_NAME,
      lawMeta: LAW_META,
      points: [
        'Article 6 — the rights of the consumer where a physical defect in the goods (quantity, size, quality, shelf life) is found. Article 6.2 of the law:',
        {
          type: 'quote',
          text: 'Where a physical defect in the goods /quantity, size, quality, shelf life/ or an infringement of rights is found, the consumer, within the period specified in the contract or, if no period is specified, immediately...',
          original: 'Бараанд биет байдлын доголдол /тоо, хэмжээ, чанар, хугацаа/ болон эрхийн зөрчил илэрвэл хэрэглэгч гэрээнд заасан хугацаанд буюу хугацаа заагаагүй бол нэн даруй...',
        },
        'Article 7 — the duty to provide the consumer with accurate information.',
        'The rights set out in Article 3 of these terms are granted by law and are not limited in any way.',
      ],
    },
    languageNotice: NOTICE,
  },

  privacy: {
    title: 'Privacy Policy',
    effectiveDate: EFFECTIVE,
    updatedDate: UPDATED,
    sections: [
      {
        heading: 'Data controller',
        items: [
          '1.1. SARA BRAND (sarabrand.mn)',
          '1.2. Contact: info@sarabrand.mn · +976 8998 3612',
          '1.3. Official legal-entity registration details will be added to this page once determined.',
        ],
      },
      {
        heading: 'What information we collect',
        items: [
          '2.1. When placing an order: full name, phone number, city/province, delivery address, e-mail address (optional), order notes (optional).',
          '2.2. When sending a contact request: name, e-mail address, message content.',
          '2.3. When a contract reseller signs in: e-mail address and name from the Google account. We do not receive or store the password.',
          '2.4. Technical information: information stored on your device, such as the chosen language and products added to the cart (see Article 8 below).',
          '2.5. We do not collect your payment card information. As payment is made by bank transfer, the transaction takes place between your bank and our bank.',
        ],
      },
      {
        heading: 'The purposes for which we use it',
        items: [
          '3.1. To create, confirm and deliver orders.',
          '3.2. To contact you about your order.',
          '3.3. To resolve returns, exchanges and complaints.',
          '3.4. To identify contract resellers and show the price specified in their contract.',
          '3.5. To fulfil obligations set out in law.',
          '3.6. We do not use your information for advertising without your consent.',
        ],
      },
      {
        heading: 'Consent',
        items: [
          '4.1. By placing an order or sending a contact request, you are deemed to consent to the processing of your information for the purposes set out in this policy.',
          '4.2. You have the right to withdraw your consent at any time. However, it may not be possible to delete information needed to complete an active order.',
        ],
      },
      {
        heading: 'Disclosure to third parties',
        items: [
          '5.1. We disclose your information, only to the extent necessary, in the following cases:',
          'Delivery service partner — full name, phone number, delivery address. For the purpose of carrying out the delivery.',
          'Law-enforcement, courts and competent authorities — upon an official request on the grounds specified in law.',
          '5.2. We do not sell, rent or trade your information.',
          '5.3. Technical service providers used to run the site (servers, databases) process the information solely for the purpose of storage.',
        ],
      },
      {
        heading: 'Retention period',
        items: [
          '6.1. Order information is kept for the period required by accounting and legal requirements.',
          '6.2. Contact-request information is kept for a reasonable period after resolution and then deleted.',
          '6.3. Contract reseller information is kept for the term of the contract and for the required period after it ends.',
        ],
      },
      {
        heading: 'Security',
        items: [
          '7.1. The site uses an HTTPS-encrypted connection.',
          '7.2. Sign-in information is stored in signed, server-only (httpOnly) form.',
          '7.3. Only authorised staff have access to order information.',
        ],
      },
      {
        heading: 'Cookies and information stored on your device',
        items: [
          '8.1. Cart information and chosen language — stored in your browser’s memory (localStorage). Not sent to the server.',
          '8.2. Sign-in cookie — created only when a contract reseller signs in with Google. Used to identify you.',
          '8.3. We do not use advertising or third-party tracking cookies.',
          '8.4. You can delete this information from your browser settings.',
        ],
      },
      {
        heading: 'Your rights',
        items: [
          '9.1. You have the right to:',
          'access the information we hold about you',
          'have incorrect or incomplete information corrected',
          'have your information deleted (where there is no retention obligation specified in law)',
          'object to the processing of your information',
          '9.2. Please send your request to info@sarabrand.mn. We will respond within the shortest possible time.',
        ],
      },
      {
        heading: 'Children’s data',
        items: ['10.1. The site is not intended for persons under 18, and we do not intentionally collect information from them.'],
      },
      {
        heading: 'Changes',
        items: ['11.1. If this policy changes, the updated date will be shown at the top of the page.'],
      },
    ],
    legalBasis: {
      lawName: 'Law on the Protection of Personal Data',
      lawMeta: '(adopted 2021.12.17, in force from 2022.05.01)',
      points: ['Law on the Protection of Consumer Rights (2003.12.26, last amended 2024.01.12)'],
    },
    languageNotice: NOTICE,
  },
}
