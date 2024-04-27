export const currencies = [
  { value: "USD", label: "$ Dollar", locale: "en-US" },
  { value: "EUR", label: "€ Euro", locale: "en-GB" },
  { value: "GBP", label: "£ Pound", locale: "en-GB" },
  { value: "JPY", label: "¥ Yen", locale: "ja-JP" },
  { value: "AUD", label: "$ Australian Dollar", locale: "en-AU" },
  { value: "KES", label: "ksh Kenyan Shilling", locale: "en-KE" },
];

export type Currency = (typeof currencies)[0];
