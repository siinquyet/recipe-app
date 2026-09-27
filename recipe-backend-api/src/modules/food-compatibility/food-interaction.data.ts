// Bảng tương tác thực phẩm (food pairing/conflict) — rule-based theo kinh nghiệm ẩm thực + tài liệu dinh dưỡng phổ biến.
// Không phải AI sinh ra: mỗi rule đều ghi rõ lý do + nguồn tham khảo để dễ giải thích & kiểm chứng.
//
// Level:
//   CONFLICT   -> Kỵ nhau / nguy cơ ảnh hưởng sức khỏe (tránh ăn chung)
//   HARMONIOUS -> Kết hợp tốt, hỗ trợ hấp thu / hợp vị
//   NEUTRAL    -> Không có tương tác đặc biệt (mặc định)

export type FoodLevel = 'CONFLICT' | 'HARMONIOUS' | 'NEUTRAL';

export interface FoodInteractionRule {
  a: string; // từ khóa chuẩn hóa (normalizedName) nguyên liệu A
  b: string; // từ khóa chuẩn hóa nguyên liệu B
  level: FoodLevel;
  note: string; // lý do, tiếng Việt
  source: string; // nguồn tham khảo
}

// Các từ khóa được normalize bằng NFD (bỏ dấu tiếng Việt) trước khi so khớp,
// vd "thịt bò" -> "thit bo", "hành tây" -> "hanh tay"
export const FOOD_INTERACTION_RULES: FoodInteractionRule[] = [
  // ===== KỴ / ĐỘC (CONFLICT) =====
  { a: 'tom', b: 'vitamin c', level: 'CONFLICT', note: 'Có tranh cãi, nhưng tránh ăn chung lượng lớn để không rối loạn tiêu hóa.', source: 'Lưu ý an toàn thực phẩm phổ biến (VN)' },
  { a: 'tom', b: 'nuoc cam', level: 'CONFLICT', note: 'Axit trong nước cam dễ gây phản ứng không tốt với hợp chất trong tôm.', source: 'Lưu ý phổ biến trong ẩm thực Việt' },
  { a: 'cua', b: 'hong', level: 'CONFLICT', note: 'Acid tannic trong quả hồng kết hợp với protein cua dễ gây kết tủa khó tiêu.', source: 'Tài liệu tương kỵ thực phẩm phổ biến' },
  { a: 'hai san', b: 'bia', level: 'CONFLICT', note: 'Purin trong hải sản cộng cồn làm tăng acid uric, nguy cơ gút.', source: 'Khuyến cáo dinh dưỡng phổ biến' },
  { a: 'sua', b: 'so co la', level: 'CONFLICT', note: 'Canxi và oxalat cản trở hấp thu lẫn nhau.', source: 'Tài liệu dinh dưỡng phổ biến' },
  { a: 'sua', b: 'nuoc cam', level: 'CONFLICT', note: 'Protein sữa + axit nước cam dễ gây đầy bụng khó tiêu.', source: 'Lưu ý phổ biến trong ẩm thực Việt' },
  { a: 'sua', b: 'thit bo', level: 'CONFLICT', note: 'Canxi và sắt heme cạnh tranh hấp thu, giảm giá trị dinh dưỡng.', source: 'Tài liệu dinh dưỡng phổ biến' },
  { a: 'gan lon', b: 'ca rot', level: 'CONFLICT', note: 'Vitamin A liều cao từ gan cộng beta-caroten cà rốt, tránh ăn cùng lúc.', source: 'Lưu ý dinh dưỡng phổ biến' },
  { a: 'gan lon', b: 'vitamin c', level: 'CONFLICT', note: 'Đồng trong gan có thể oxy hóa nhanh vitamin C.', source: 'Lưu ý dinh dưỡng phổ biến' },
  { a: 'tra dac', b: 'gan', level: 'CONFLICT', note: 'Tannin trong trà cản trở hấp thu sắt từ gan.', source: 'Khuyến cáo về hấp thu sắt phổ biến' },
  { a: 'tra dac', b: 'thit bo', level: 'CONFLICT', note: 'Tannin trong trà cản trở hấp thu sắt từ thịt đỏ.', source: 'Khuyến cáo về hấp thu sắt phổ biến' },
  { a: 'thit bo', b: 'hai san', level: 'CONFLICT', note: 'Hai loại đạm khó tiêu hóa khi ăn chung số lượng lớn.', source: 'Lưu ý phổ biến trong ẩm thực Việt' },
  { a: 'trung', b: 'duong', level: 'CONFLICT', note: 'Kết hợp nhiều có thể giảm hấp thu acid amin từ trứng.', source: 'Lưu ý dinh dưỡng phổ biến' },
  { a: 'ruou bia', b: 'cafe', level: 'CONFLICT', note: 'Cồn + caffein gây áp lực lên tim mạch, tránh dùng chung.', source: 'Khuyến cáo sức khỏe phổ biến' },
  { a: 'dua hau', b: 'hai san', level: 'CONFLICT', note: 'Ăn chung dễ đầy bụng, khó tiêu.', source: 'Lưu ý phổ biến trong ẩm thực Việt' },
  { a: 'su hao', b: 'sua', level: 'CONFLICT', note: 'Chất trong su hào có thể cản trở enzyme tiêu hóa protein sữa.', source: 'Lưu ý tương kỵ phổ biến' },

  // ===== KẾT HỢP TỐT (HARMONIOUS) =====
  { a: 'thit bo', b: 'hanh tay', level: 'HARMONIOUS', note: 'Hợp hương vị, hỗ trợ tiêu hóa, giàu đạm.', source: 'Món thịt bò xào hành tây phổ biến' },
  { a: 'thit bo', b: 'khoai tay', level: 'HARMONIOUS', note: 'Bò hầm khoai tây kinh điển, đủ tinh bột + đạm.', source: 'Món bò hầm khoai tây phổ biến' },
  { a: 'thit bo', b: 'mướp dang', level: 'HARMONIOUS', note: 'Mướp đắng giảm ngấy cho thịt bò, giàu vitamin.', source: 'Món bò xào mướp đắng phổ biến' },
  { a: 'ca', b: 'nhe', level: 'HARMONIOUS', note: 'Nghệ khử tanh, hỗ trợ tiêu hóa và giải độc gan.', source: 'Món cá kho nghệ phổ biến' },
  { a: 'ca', b: 'chanh', level: 'HARMONIOUS', note: 'Chanh khử tanh, bổ sung vitamin C.', source: 'Mẹo ẩm thực phổ biến' },
  { a: 'ga', b: 'gung', level: 'HARMONIOUS', note: 'Gừng làm ấm bụng, hỗ trợ tiêu hóa món gà.', source: 'Món gà nấu gừng phổ biến' },
  { a: 'ga', b: 'nam', level: 'HARMONIOUS', note: 'Gà + nấm hợp vị, giàu đạm và chất xơ.', source: 'Món gà hầm nấm phổ biến' },
  { a: 'trung', b: 'ca chua', level: 'HARMONIOUS', note: 'Chất béo trứng hỗ trợ hấp thu lycopene cà chua.', source: 'Món trứng sốt cà chua phổ biến' },
  { a: 'dau phu', b: 'hanh la', level: 'HARMONIOUS', note: 'Đậu phụ nấu hành lá hợp vị thanh đạm.', source: 'Món đậu phụ hành lá phổ biến' },
  { a: 'tom', b: 'toi', level: 'HARMONIOUS', note: 'Tỏi khử mùi tanh, hợp với hải sản.', source: 'Món tôm rang tỏi phổ biến' },
  { a: 'rau xanh', b: 'dau o liu', level: 'HARMONIOUS', note: 'Chất béo tốt giúp hấp thu vitamin tan trong dầu từ rau.', source: 'Khuyến cáo dinh dưỡng phổ biến' },
  { a: 'ca rot', b: 'thit bo', level: 'HARMONIOUS', note: 'Bò kho cà rốt giàu vitamin A và sắt.', source: 'Món bò kho cà rốt phổ biến' },
  { a: 'thit lon', b: 'dua muoi', level: 'HARMONIOUS', note: 'Dưa muối cắt vị ngấy, hỗ trợ tiêu hóa.', source: 'Món ăn phổ biến Việt Nam' },
];