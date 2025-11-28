# Retro Lumen
ブラウザだけで画面/ウィンドウのキャプチャ映像にレトロ風シェーダをリアルタイム合成する実験用ビューアです。WebGL2 と `getDisplayMedia` を組み合わせ、インストール不要で動作します（静的ホスティングでそのまま公開可能）。

## これは何？
- 画面共有した映像をキャンバスに流し込み、複数パスのフラグメントシェーダで加工してプレビューするツール
- ES Modules のみで構成されビルド不要。依存はモダンブラウザの WebGL2 と `getDisplayMedia`
- レトロな CRT 風やグローなど、軽いビジュアル実験を行うための最小 UI

## 主な特徴
- 画面/ウィンドウキャプチャをリアルタイムに WebGL2 パイプラインへ流し込む
- プリセット同梱：パススルー、CRT Scanline、Analog Glow（`src/shaderList.js`）
- マルチパス対応。`uniforms` によるパラメータ注入とオフスクリーン描画をサポート
- キャンバス上に白縁の丸カーソルを重ねるカーソルエミュレータ
- 追加のビルド工程なし。`index.html` を静的サーバで配信するだけで動作

## 動作フロー
- `index.html`: 画面キャプチャ開始/停止ボタンとキャンバスだけを持つ最小 UI
- `src/bootstrap.js`: DOM 準備後に `ShaderGlassApp` を起動し、要素参照を渡す
- `ShaderGlassApp` (`src/shaderGlassApp.js`): キャプチャ管理・シェーダ適用・カーソル表示を統括し、デフォルトプリセットを適用
- `CaptureManager` (`src/captureManager.js`): `getDisplayMedia` や `getUserMedia` でストリーム取得 → `CaptureSession` が隠し `<video>` を再生し、`requestVideoFrameCallback` などでフレームを配送
- `ShaderGlass` (`src/shaderGlass.js`): テクスチャ化したフレームを `ShaderPass` 連鎖で描画。新規フレームが届いたときだけ `requestAnimationFrame` でレンダリング
- `CursorEmulator` (`src/cursorEmulator.js`): キャンバス上に丸いカーソルを描画し、ポインタ位置を追従

## 主要コンポーネントとファイル
- `index.html`: UI とスタイルの土台。`src/bootstrap.js` を読み込む
- `src/bootstrap.js`: アプリ起動のエントリポイント
- `src/shaderGlassApp.js`: アプリ中枢。キャプチャ・シェーダ・UI イベントをまとめる
- `src/captureManager.js` / `src/captureSession.js` / `src/deviceCapture.js`: キャプチャ開始/停止、デバイス列挙、フレーム配信
- `src/shaderGlass.js` / `src/shaderPass.js` / `src/shader.js` / `src/texture.js`: WebGL2 パイプライン、シェーダ管理、テクスチャ管理
- `src/cursorEmulator.js`: キャンバス上のカーソル描画
- `src/shaderCompiler/*`: GLSL 正規化、簡易 HLSL→GLSL 変換、ハッシュキャッシュなどのユーティリティ
- `src/shaderGen/shaderGen.js`: JSON/簡易 INI 風テキストからプリセットをインポート
- 未結線の追加 UI クラス: `src/browserWindow.js`（プリセット一覧/検索）、`src/paramsWindow.js`（パラメータスライダー）、`src/hotkeyDialog.js`（ホットキー設定）、`src/compileWindow.js`（カスタムシェーダ入力）

## 同梱プリセット
- `passthrough`: 映像をそのまま表示
- `crt-scanline`: 曲率とスキャンラインを付与
- `analog-glow`: 近傍サンプリングで簡易グロー

## ローカルで動かす
1) プロジェクトルートで簡易サーバを起動
   ```sh
   npx http-server .
   # または
   python -m http.server 8000
   ```
2) ブラウザで `http://localhost:8080`（使用ポートに合わせて読み替え）へアクセス  
3) 「画面キャプチャ」を押して共有対象を選ぶと、プリセットが適用されたプレビューが始まります  
4) 「停止」でキャプチャを終了します  
※ `getDisplayMedia` は安全なコンテキストが必要です。`https://` または `http://localhost` で開いてください。

## プリセット/カスタムシェーダの追加
- `src/shaderList.js` にプリセットを追記します。`passes` でフラグメント/頂点シェーダ、`uniforms` 初期値、`offscreen` の有無を指定
- `params` に uniform 名とメタ情報を入れると、起動時に `setParam` されます（UI から調整したい場合は `ParamsWindow` などを接続）
- 簡易 HLSL→GLSL 変換や GLSL 正規化は `src/shaderCompiler/` のユーティリティを利用可能
- 外部テキストからプリセットを取り込む場合は `src/shaderGen/shaderGen.js` のインポータを利用

例: 簡単なプリセット
```js
{
  id: "warm-glow",
  name: "Warm Glow",
  passes: [
    {
      fragmentSource: `#version 300 es
precision highp float;
in vec2 vTexCoord;
uniform sampler2D uInput;
uniform float uIntensity;
out vec4 fragColor;
void main() {
    vec3 color = texture(uInput, vTexCoord).rgb;
    fragColor = vec4(mix(color, color * vec3(1.1, 1.0, 0.9), uIntensity), 1.0);
}`,
      uniforms: { uIntensity: 0.35 },
      offscreen: false
    }
  ],
  params: [{ name: "uIntensity", label: "強度", min: 0, max: 1, default: 0.35, step: 0.01 }]
}
```

## 拡張 UI（未結線）
- `BrowserWindow`: プリセット一覧と検索の UI。`events.emit("preset:select", presetId)` で選択通知
- `ParamsWindow`: `params` 定義に基づきスライダーを生成し、`events.emit("params:change", { name, value })`
- `HotkeyDialog`: ホットキー表示と変更。`hotkey:startCapture` などをイベントで通知
- `CompileWindow`: 任意 GLSL を入力してプリセット化し、`events.emit("preset:compiled", preset)` を出す
- これらを使うには、`index.html` にコンテナ要素を追加し、`ShaderGlassApp` からイベントを配線してください

## 制約と注意
- WebGL2 非対応ブラウザでは起動できません
- 音声キャプチャはサポートしていません（映像のみ）
- プリセット選択 UI・ホットキー UI・パラメータ UI はデフォルト画面にまだ組み込まれていません
- ブラウザ/OS により画面選択ダイアログが表示されない場合は、HTTPS または localhost でのアクセスを試してください
