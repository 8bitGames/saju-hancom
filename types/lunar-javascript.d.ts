/**
 * Type declarations for lunar-javascript
 * @see https://github.com/6tail/lunar-javascript
 */

declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;
    static fromDate(date: Date): Solar;

    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;

    getLunar(): Lunar;
    getJulianDay(): number;

    toYmd(): string;
    toYmdHms(): string;
    toFullString(): string;
    toString(): string;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Lunar;
    static fromDate(date: Date): Lunar;

    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;

    getSolar(): Solar;

    // 간지 관련
    getYearInGanZhi(): string;
    getYearGan(): string;
    getYearZhi(): string;

    getMonthInGanZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;

    getDayInGanZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;

    getTimeInGanZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;

    // 절기
    getJieQi(): string | null;
    getCurrentJieQi(): { name: string } | null;
    getNextJieQi(): { name: string; solar: Solar } | null;
    getPrevJieQi(): { name: string; solar: Solar } | null;

    // 띠
    getYearShengXiao(): string;

    // 기타
    toYmd(): string;
    toYmdHms(): string;
    toFullString(): string;
    toString(): string;

    // 대운
    getEightChar(): EightChar;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;

    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;

    // 대운
    getYun(gender: number, sect?: number): Yun;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    getStartSolar(): Solar;

    getDaYun(): DaYun[];
  }

  export class DaYun {
    getIndex(): number;
    getStartAge(): number;
    getEndAge(): number;
    getStartYear(): number;
    getEndYear(): number;
    getGanZhi(): string;

    getLiuNian(): LiuNian[];
    getXiaoYun(): XiaoYun[];
  }

  export class LiuNian {
    getIndex(): number;
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
  }

  export class XiaoYun {
    getIndex(): number;
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
  }
}
