# Sass Variable Specification

プロジェクト全体で共有する設計変数とユーティリティ用 mixin/関数は `src/scss/variable/` に集約しています。`main.scss` では `@use "variable" as *;` を実行しているため、任意の Sass ファイルから `@use "../variable" as v;` のように参照してください。

## ディレクトリ構成
- `_index.scss` … 下記の各モジュールを `@forward` し、単一のエントリとして公開
- `_color.scss` … プロジェクト固有の色設定（Yasuda Web と同じ）
- `_font.scss` … ベースのフォントファミリ、ルートフォントサイズ、基本行間
- `_spacing.scss` … 余白サイズ（`clamp()` でレスポンシブに設定）
- `_elevation.scss` … 角丸・影など立体的な要素共通値
- `_media.scss` … Yasuda Web のブレークポイントとメディアクエリ mixin
- `_mixin.scss` … 既存コードで利用する `mq()` が `_media.scss` をラップ
- `_function.scss` … ユーティリティクラスと同じ式を再利用する `fz()` 関数

各ファイルの変数は `!default` 指定なので、必要に応じて別プロジェクトから上書きできます。

## カテゴリ別詳細

### Color (`_color.scss`)
Yasuda Web の CSS カスタムプロパティを Sass 変数に移植しています。

| 変数 | 役割 | 初期値 |
| --- | --- | --- |
| `$color-base` | メインカラー | `#1485C8` |
| `$color-sub` | サブカラー | `#cd4e96` |
| `$color-text` | 全体のテキスト色 | `#3A4952` |
| `$color-bg` | 背景色 | `#FCFEFF` |
| `$color-border` | ボーダー色 | `#D6DCE8` |
| `$color-black` | 黒 | `#000` |
| `$color-white` | 白 | `#fff` |
| `$color-gray-light` | 薄いグレー | `#C0C0C0` |
| `$color-gray` | グレー | `#949494` |
| `$color-blue` | ブルー | `#1485C8` |
| `$color-blue-soft` | ブルー（淡い） | `#B2D2E9` |
| `$color-blue-deep` | ブルー（濃い） | `#004D9C` |
| `$color-red` | 赤 | `#B70000` |
| `$color-gley` | グレー系、`$color-text` と同値 | `#3A4952` |
| `$color-purple` | パープル | `#cd4e96` |

### Media (`_media.scss`)
Yasuda Web と同一の `$bps` マップと `@mixin mp()` を定義しています。既存コードとの後方互換性のため、`_mixin.scss` で `mq()` という別名 mixin を提供しています。

```
$bps: (
  's': 'screen and (max-width: 767px)',
  't': 'screen and (min-width: 768px) and (max-width: 1100px)',
  'p': 'screen and (min-width: 1101px) and (max-width: 1440px)',
  'l': 'screen and (min-width: 1441px)',
  'lp': 'screen and (min-width: 1101px)',
  'pts': 'screen and (min-width: 768px) and (max-width: 1100px)',
  'pt': 'screen and (min-width: 768px) and (max-width: 1440px)',
  'ts': 'screen and (max-width: 1100px)',
  'lpt': 'screen and (min-width: 768px)'
);
```

```scss
@include v.mq('pt') { ... } // => Yasuda Web と同じクエリ
@include v.mp('pt') { ... } // _media.scss の mixin を直接利用したい場合
```

### その他
Font/Spacing/Elevation/mixin/function セクションは以前と同様ですが、`mq()` は `_media.scss` の `$bps` を参照する形に書き換えています。

## 利用ガイドライン
1. Sass ファイルでは `@use "../variable" as v;` のように読み込み、名前空間付きで参照する。
2. 変数や関数を追加する場合は可能な限り `!default` を付け、別プロジェクトでのオーバーライドを許容する。
3. 一貫性を保つため、直接値を書くのではなく既存変数・マップ・mixin・関数を経由してスタイルを書く。
4. 共通化できる設定は新しい部分ファイルを追加し `@forward` で公開する。
5. ブレークポイントごとの制御は Yasuda Web と同じ `$bps` キーを使い、`v.mq()` もしくは `v.mp()` を通じて記述する。

## サンプル
```scss
@use "../variable" as v;

.card {
  background: v.$color-white;
  color: v.$color-text;
  border-radius: v.$radius-md;
  box-shadow: v.$shadow-lg;
  padding: v.$space-lg;
  font-size: v.fz(18);

  @include v.mq('lp') {
    display: grid;
  }
}
```

`object/utility/_type-scale.scss` ではこの仕様を用いて `.u-fz-*` などのユーティリティを生成しています。追加のユーティリティを作る際も同様の方針で設計してください。
