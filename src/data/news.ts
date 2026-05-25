import type { NewsItem } from '../types';

// 厳選した代表的セキュリティインシデント 18件
// year 降順で並べる (新しい順)
// URL は読み物として価値ある外部リンク (Wikipedia / IPA / JPCERT 等)
// 万一 404 になった場合はリンクのみ差し替えれば OK
export const news: NewsItem[] = [
  {
    id: 'n2023-ntt',
    title: 'NTT 西日本 元派遣社員による928万件不正持ち出し',
    year: 2023,
    category: '内部不正',
    summary:
      'コールセンター業務委託先で特権アカウントを悪用し顧客情報928万件を10年以上にわたり持ち出していた事案。特権ID管理と委託先監査の欠落が浮き彫りに。',
    terms: ['内部不正', '特権ID管理', '委託先管理', '個人情報漏洩'],
    source: 'IPA',
    url: 'https://www.ipa.go.jp/security/10threats/10threats2024.html',
  },
  {
    id: 'n2023-moveit',
    title: 'MOVEit Transfer ゼロデイ大量悪用',
    year: 2023,
    category: 'ゼロデイ攻撃',
    summary:
      'ファイル転送ソフト MOVEit のゼロデイ SQLi をランサム集団 Cl0p が悪用。BBC、英国航空、米国エネルギー省など2,000組織以上が被害。',
    terms: ['ゼロデイ攻撃', 'SQLインジェクション', 'サプライチェーン攻撃'],
    source: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/2023_MOVEit_data_breach',
  },
  {
    id: 'n2022-toyota',
    title: 'トヨタ 部品サプライヤー被害で国内全工場停止',
    year: 2022,
    category: 'サプライチェーン攻撃',
    summary:
      '部品メーカー小島プレス工業がランサムウェア感染。サプライチェーンが寸断され、トヨタは1日で国内14工場28ラインを停止。',
    terms: ['サプライチェーン攻撃', 'ランサムウェア', 'BCP (事業継続計画)'],
    source: 'IPA',
    url: 'https://www.ipa.go.jp/security/10threats/10threats2023.html',
  },
  {
    id: 'n2021-linepay',
    title: 'LINE 個人データへの中国アクセス問題',
    year: 2021,
    category: '委託先管理',
    summary:
      '業務委託先の中国法人が日本ユーザーの個人情報にアクセス可能だった問題。データの越境管理と委託先監督が問われ、政府も実態調査に動いた。',
    terms: ['委託先管理', 'データ保護', 'GDPR'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/LINE_(%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3)',
  },
  {
    id: 'n2021-log4shell',
    title: 'Log4Shell (Log4j) 脆弱性',
    year: 2021,
    category: 'ゼロデイ攻撃',
    summary:
      'Java の汎用ログライブラリ Log4j の任意コード実行脆弱性 (CVE-2021-44228)。世界中の数千万システムが影響を受けたとされ、SBOM 重要性の契機に。',
    terms: ['ゼロデイ攻撃', 'SBOM (ソフトウェア部品表)', 'サプライチェーン攻撃'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/Log4Shell',
  },
  {
    id: 'n2021-colonial',
    title: 'Colonial Pipeline ランサム被害で米東海岸燃料逼迫',
    year: 2021,
    category: 'ランサムウェア',
    summary:
      '米最大級の燃料パイプラインがランサムウェア DarkSide に感染し操業停止。約440万ドルの身代金を支払い、米東海岸でガソリン不足が発生。',
    terms: ['ランサムウェア', 'インシデント対応', 'BCP (事業継続計画)'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/Colonial_Pipeline%E3%82%B5%E3%82%A4%E3%83%90%E3%83%BC%E6%94%BB%E6%92%83',
  },
  {
    id: 'n2021-kaseya',
    title: 'Kaseya VSA サプライチェーン型ランサム',
    year: 2021,
    category: 'サプライチェーン攻撃',
    summary:
      'IT 管理ソフト Kaseya VSA のゼロデイを悪用し、MSP 経由で1,500社以上に REvil ランサムウェアが拡散。',
    terms: ['サプライチェーン攻撃', 'ランサムウェア', 'ゼロデイ攻撃'],
    source: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Kaseya_VSA_ransomware_attack',
  },
  {
    id: 'n2020-twitter',
    title: 'Twitter 著名アカウント乗っ取り (Bitcoin 詐欺)',
    year: 2020,
    category: 'ソーシャルエンジニアリング',
    summary:
      'Twitter 社員が電話で標的型ソーシャルエンジニアリングを受け、内部管理ツールへアクセス。Obama・Musk 等130アカウントが乗っ取られ Bitcoin 詐欺ツイートが拡散。',
    terms: ['ソーシャルエンジニアリング', '内部不正', '特権ID管理'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/2020%E5%B9%B4%E3%81%AETwitter%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E4%B9%97%E3%81%A3%E5%8F%96%E3%82%8A',
  },
  {
    id: 'n2020-solarwinds',
    title: 'SolarWinds Orion サプライチェーン攻撃',
    year: 2020,
    category: 'サプライチェーン攻撃',
    summary:
      'IT 管理ソフト SolarWinds のアップデートに悪意あるコードが混入。米国財務省・国土安全保障省・大手企業など18,000組織が侵害された大規模 APT。',
    terms: ['サプライチェーン攻撃', 'APT (高度持続的脅威)', 'デジタル署名'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/SolarWinds',
  },
  {
    id: 'n2020-mitsubishi',
    title: '三菱電機 標的型サイバー攻撃',
    year: 2020,
    category: '標的型攻撃',
    summary:
      'ウイルス対策ソフトのゼロデイを起点に侵入。社員と取引先約8,000人分の個人情報、防衛関連情報の漏洩疑いが報じられた。',
    terms: ['標的型攻撃', 'APT (高度持続的脅威)', 'ゼロデイ攻撃'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/%E4%B8%89%E8%8F%B1%E9%9B%BB%E6%A9%9F',
  },
  {
    id: 'n2019-capitalone',
    title: 'Capital One クラウド誤設定で1億件漏洩',
    year: 2019,
    category: 'クラウド',
    summary:
      'AWS WAF の設定不備と SSRF を悪用し、S3 内クレジットカード申込情報1億600万件が流出。クラウド責任共有モデルの代表例。',
    terms: ['SSRF (サーバサイドリクエストフォージェリ)', 'クラウド', 'IAM (Identity and Access Management)'],
    source: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/2019_Capital_One_data_breach',
  },
  {
    id: 'n2019-7pay',
    title: '7pay 不正利用事件 (3ヶ月でサービス終了)',
    year: 2019,
    category: '認証設計',
    summary:
      'セブン&アイの決済サービスが多要素認証なし・パスワード再設定の設計欠陥で多発する不正利用。被害約3,800万円、リリース2ヶ月で終了発表。',
    terms: ['多要素認証 (MFA)', '認証 (Authentication)', 'リスト型攻撃'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/7pay',
  },
  {
    id: 'n2018-coincheck',
    title: 'Coincheck NEM 約580億円流出',
    year: 2018,
    category: '暗号資産',
    summary:
      'ホットウォレットでの管理とマルチシグ未実装が原因で、攻撃者にNEM約580億円相当を持ち出された。当時史上最大級の暗号資産流出。',
    terms: ['鍵管理', '多要素認証 (MFA)', 'インシデント対応'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/%E3%82%B3%E3%82%A4%E3%83%B3%E3%83%81%E3%82%A7%E3%83%83%E3%82%AF',
  },
  {
    id: 'n2018-marriott',
    title: 'Marriott (Starwood) 4億件超の顧客情報漏洩',
    year: 2018,
    category: 'データ漏洩',
    summary:
      '買収した Starwood の予約システムに4年間侵入されていた。氏名・パスポート番号・カード情報など最大5億件影響。GDPR 制裁金約1.8億ポンドが課された。',
    terms: ['APT (高度持続的脅威)', 'GDPR', '個人情報漏洩'],
    source: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/2018_Marriott_International_data_breach',
  },
  {
    id: 'n2017-equifax',
    title: 'Equifax 1.47億件漏洩 (Apache Struts 脆弱性)',
    year: 2017,
    category: '脆弱性管理',
    summary:
      '米信用情報大手 Equifax で Apache Struts 2 既知脆弱性のパッチ未適用が原因。氏名・生年月日・社会保障番号・住所など1.47億件が流出。',
    terms: ['脆弱性管理', 'パッチ管理', '個人情報漏洩'],
    source: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/2017_Equifax_data_breach',
  },
  {
    id: 'n2017-wannacry',
    title: 'WannaCry 世界規模ランサム感染',
    year: 2017,
    category: 'ランサムウェア',
    summary:
      'Windows SMB 脆弱性 (EternalBlue) を悪用し、150カ国・30万台以上を暗号化。英 NHS は救急受入停止、日本企業も多数影響。',
    terms: ['ランサムウェア', 'ゼロデイ攻撃', 'パッチ管理'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/WannaCry',
  },
  {
    id: 'n2016-jtb',
    title: 'JTB 標的型メール攻撃で793万人分流出',
    year: 2016,
    category: '標的型攻撃',
    summary:
      '取引先を装ったメール添付ファイル開封を起点に侵入され、パスポート番号含む顧客情報793万人分が流出。日本における標的型攻撃の代表事例。',
    terms: ['標的型攻撃', 'フィッシング', 'BEC (ビジネスメール詐欺)'],
    source: 'IPA',
    url: 'https://www.ipa.go.jp/security/anshin/measures/jirei.html',
  },
  {
    id: 'n2014-benesse',
    title: 'ベネッセ 顧客情報3,504万件漏洩',
    year: 2014,
    category: '内部不正',
    summary:
      '業務委託先の派遣SEが顧客DBから持ち出し、名簿業者に売却。日本国内の内部不正・委託先管理を抜本的に見直す契機となり、個人情報保護法改正にも影響。',
    terms: ['内部不正', '委託先管理', 'DLP (Data Loss Prevention)', '個人情報保護法'],
    source: 'Wikipedia',
    url: 'https://ja.wikipedia.org/wiki/%E3%83%99%E3%83%8D%E3%83%83%E3%82%BB%E9%A1%A7%E5%AE%A2%E6%83%85%E5%A0%B1%E6%B5%81%E5%87%BA%E4%BA%8B%E4%BB%B6',
  },
];
