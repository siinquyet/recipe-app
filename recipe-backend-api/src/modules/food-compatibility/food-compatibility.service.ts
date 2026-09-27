// Business rules tương tác thực phẩm (FOOD-XX)
//
// FO - 01: So khớp nguyên liệu -> rule: chuẩn hóa NFD (bỏ dấu tiếng Việt, đ->d) cho cả đầu vào lẫn keyword.
// FO - 02: Keyword dài (>= 3 ký tự) khớp theo "chứa" (termNorm.includes(keyword)) — vd "thịt bò xào" -> "thit bo".
//          Keyword ngắn (1-2 ký tự, vd "ca", "ga", "tom") chỉ khớp CHÍNH XÁC để tránh nhầm:
//          không để "cà chua" (cà) khớp nhầm với "cá" (ca), hay "gao" khớp nhầm với "gà" (ga).
// FO - 03: Bằng tay cấu hình alias cho keyword ngắn sang các cách gọi phổ biến (xem TERM_ALIASES).
// FO - 04: Trả về cặp theo mức CONFLICT / HARMONIOUS / NEUTRAL. Nếu có cả 2 mức cho 1 cặp,
//          CONFLICT ưu tiên (an toàn hơn khi cảnh báo).
import { Injectable } from '@nestjs/common';
import { FOOD_INTERACTION_RULES, FoodInteractionRule } from './food-interaction.data';

// Dấu hoa hậu cho keyword ngắn (ngắn <= 2 ký tự) — mở rộng cách viết thường gặp
// VD: "ca" -> cá thu, cá basa, cá quả; "ga" -> gà ta (được normal như nhau); "tom" -> tôm sú
const TERM_ALIASES: Record<string, string[]> = {
  ca: ['ca thu', 'ca basa', 'ca qua', 'ca chep', 'ca hoi'],
  tom: ['tom su', 'tom the', 'tom rao', 'tom hum'],
  cua: ['cua bien', 'cua dong', 'ghe'],
  ga: ['ga ta', 'ga choi'],
  sua: ['sua tuoi', 'sua dac', 'sua bo'],
  bo: ['thit bo', 'bo'],
};

export interface FoodCheckItem {
  name: string; // tên nguyên liệu / món người dùng nhập (hiển thị nguyên bản)
  normalizedName: string;
}

export interface FoodCheckPair {
  a: string;
  b: string;
  level: 'CONFLICT' | 'HARMONIOUS' | 'NEUTRAL';
  note: string | null;
  source: string | null;
}

export interface FoodCheckResult {
  items: string[];
  pairs: FoodCheckPair[];
  summary: { conflicts: number; harmonious: number; neutrals: number };
}

@Injectable()
export class FoodCompatibilityService {
  // FO-01: chuẩn hóa NFD + bỏ dấu, đ -> d
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // FO-02/03: một term có khớp keyword rule hay không
  private matchesTerm(term: string, keyword: string): boolean {
    if (term === keyword) return true;

    // keyword dài -> khớp chứa
    if (keyword.length >= 3 && term.includes(keyword)) return true;
    // keyword ngắn -> chỉ chính xác + alias được cấu hình
    const aliases = TERM_ALIASES[keyword];
    if (aliases && aliases.some((alias) => term === alias)) return true;
    return false;
  }

  check(rawItems: string[]): FoodCheckResult {
    const seen = new Set<string>();
    const items: FoodCheckItem[] = [];

    // Loại bỏ trùng & rỗng
    for (const raw of rawItems) {
      const normalized = this.normalize(raw);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      items.push({ name: raw.trim(), normalizedName: normalized });
    }

    const pairs: FoodCheckPair[] = [];

    // Duyệt mọi cặp (i < j) để không lặp
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        pairs.push(this.evaluatePair(items[i], items[j]));
      }
    }

    return {
      items: items.map((it) => it.name),
      pairs,
      summary: {
        conflicts: pairs.filter((p) => p.level === 'CONFLICT').length,
        harmonious: pairs.filter((p) => p.level === 'HARMONIOUS').length,
        neutrals: pairs.filter((p) => p.level === 'NEUTRAL').length,
      },
    };
  }

  private evaluatePair(a: FoodCheckItem, b: FoodCheckItem): FoodCheckPair {
    // FO-04: nếu có nhiều rule cùng khớp, ưu tiên CONFLICT (an toàn)
    const matched: FoodInteractionRule[] = [];
    for (const rule of FOOD_INTERACTION_RULES) {
      const ab = this.matchesTerm(a.normalizedName, rule.a) && this.matchesTerm(b.normalizedName, rule.b);
      const ba = this.matchesTerm(a.normalizedName, rule.b) && this.matchesTerm(b.normalizedName, rule.a);
      if (ab || ba) matched.push(rule);
    }

    const conflict = matched.find((r) => r.level === 'CONFLICT');
    const harmonic = matched.find((r) => r.level === 'HARMONIOUS');
    const winner = conflict ?? harmonic;

    return {
      a: a.name,
      b: b.name,
      level: winner?.level ?? 'NEUTRAL',
      note: winner?.note ?? null,
      source: winner?.source ?? null,
    };
  }
}