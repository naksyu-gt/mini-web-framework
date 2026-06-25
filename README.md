# mini-web-framework

Node.js / TypeScript で、学習用のミニHTTPサーバー / Webフレームワークを自作するリポジトリです。

Express や NestJS のような Web フレームワークの内部で何が起きているのかを理解するために、Node.js 標準の `node:http` を使って、最小限の Web フレームワークを段階的に実装していきます。

## 目的

このプロジェクトの目的は、本番利用できる Web フレームワークを作ることではありません。

以下の仕組みを、自分で実装しながら理解することが目的です。

* HTTP request / response
* HTTP method
* URL path
* query parameter
* path parameter
* routing
* status code
* response header
* JSON response
* request body
* middleware
* error handling
* 404 handling

## 最終的に作りたいもの

最終的には、以下のようなコードを書けることを目指します。

```ts
import { MiniApp } from "./app.js"

const app = new MiniApp()

app.use(async (req, _res, next) => {
  const start = Date.now()

  await next()

  const duration = Date.now() - start
  console.log(`${req.method} ${req.path} - ${duration}ms`)
})

app.get("/", (_req, res) => {
  res.send("Hello from mini framework")
})

app.get("/users/:id", (req, res) => {
  res.json({
    id: req.params.id,
    query: req.query
  })
})

app.post("/users", (req, res) => {
  res.status(201).json({
    message: "created",
    body: req.body
  })
})

app.listen(3000)
```

## セットアップ

```bash
mkdir mini-web-framework
cd mini-web-framework
npm init -y
```

TypeScript 開発用の依存を追加します。

```bash
npm install -D typescript tsx @types/node
```

## package.json

```json
{
  "name": "mini-web-framework",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/example.ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

## 実行方法

```bash
npm run dev
```

別ターミナルから確認します。

```bash
curl http://localhost:3000
```

## 実装予定のファイル構成

```txt
src/
  app.ts
  body.ts
  example.ts
  request.ts
  response.ts
  router.ts
  types.ts
```

## 各ファイルの役割

### src/example.ts

動作確認用のアプリケーションコードです。

自作した `MiniApp` を使って、実際にルートを登録します。

### src/app.ts

フレームワーク本体です。

主に以下を担当します。

* HTTP サーバーの起動
* route の登録
* request の受け取り
* route matching
* middleware の実行
* handler の実行
* 404 response
* error handling

### src/request.ts

Node.js 標準の `IncomingMessage` をラップします。

以下のような情報を使いやすくします。

* `req.method`
* `req.path`
* `req.query`
* `req.params`
* `req.body`
* `req.header()`

### src/response.ts

Node.js 標準の `ServerResponse` をラップします。

以下のようなメソッドを作ります。

* `res.status()`
* `res.set()`
* `res.send()`
* `res.json()`

### src/router.ts

URL path と route 定義を照合します。

例えば、以下のような route に対応します。

```txt
/users/:id
```

実際に以下の URL が来た場合、

```txt
/users/123
```

次のように取り出せるようにします。

```ts
req.params.id === "123"
```

### src/body.ts

request body を読み取ります。

特に `Content-Type: application/json` の場合に、JSON として parse して `req.body` に入れます。

### src/types.ts

プロジェクト全体で使う型を定義します。

例:

```ts
export type Handler = (
  req: MiniRequest,
  res: MiniResponse
) => void | Promise<void>
```

## 実装ステップ

### v0: Node.js 標準のHTTPサーバーを作る

まずは `node:http` だけを使って、最小のHTTPサーバーを作ります。

学ぶこと:

* `createServer`
* `req`
* `res`
* `res.statusCode`
* `res.setHeader`
* `res.end`

### v1: MiniApp クラスを作る

Express のように、以下の形で書けるようにします。

```ts
const app = new MiniApp()

app.get("/", (_req, res) => {
  res.end("Hello")
})

app.listen(3000)
```

学ぶこと:

* route 登録
* HTTP method
* URL path
* handler 実行
* 404 response

### v2: Response ラッパーを作る

毎回 `res.statusCode` や `res.setHeader` を直接書くのは面倒なので、`MiniResponse` を作ります。

```ts
res.status(200).send("Hello")
res.json({ message: "Hello" })
```

学ぶこと:

* status code
* response header
* Content-Type
* JSON.stringify
* response body

### v3: Request ラッパーを作る

Node.js の `IncomingMessage` をそのまま使うのではなく、使いやすい `MiniRequest` を作ります。

```ts
req.method
req.path
req.query
req.header("content-type")
```

学ぶこと:

* URL parse
* query parameter
* request header

### v4: path parameter に対応する

以下のようなルートを使えるようにします。

```ts
app.get("/users/:id", (req, res) => {
  res.json({
    id: req.params.id
  })
})
```

学ぶこと:

* route pattern
* path matching
* path parameter
* `decodeURIComponent`

### v5: JSON body parser を作る

POST request の body を読めるようにします。

```ts
app.post("/users", (req, res) => {
  res.json(req.body)
})
```

学ぶこと:

* request stream
* Buffer
* JSON.parse
* Content-Type
* body size limit

### v6: middleware を作る

Express の `app.use()` のような仕組みを作ります。

```ts
app.use(async (req, _res, next) => {
  console.log(req.method, req.path)
  await next()
})
```

学ぶこと:

* middleware pipeline
* `next()`
* middleware の実行順
* logging
* authentication の基礎

### v7: error handling を作る

handler や middleware で例外が起きたときに、500 response を返せるようにします。

```ts
app.onError((error, _req, res) => {
  console.error(error)

  res.status(500).json({
    error: "Internal Server Error"
  })
})
```

学ぶこと:

* try / catch
* 500 response
* error handler
* フレームワーク側で例外を受け止める仕組み

## Git のコミット単位

以下のような単位で commit していく予定です。

```bash
git commit -m "chore: initialize mini web framework project"
git commit -m "feat: create raw node http server"
git commit -m "feat: add minimal app router"
git commit -m "feat: add response helper"
git commit -m "feat: add request helper"
git commit -m "feat: support path parameters"
git commit -m "feat: parse json request body"
git commit -m "feat: add middleware pipeline"
git commit -m "feat: add error handler"
```

## このプロジェクトで理解したいこと

Web フレームワークは魔法ではありません。

やっていることは、ざっくり以下です。

```txt
HTTP request を受け取る
  ↓
method と path を見る
  ↓
対応する route を探す
  ↓
request body や params を整形する
  ↓
middleware を順番に実行する
  ↓
handler を実行する
  ↓
response を返す
```

Express や NestJS は、この処理をより高機能・安全・便利にしたものです。

## 今後の発展課題

余裕があれば、以下も実装します。

* Cookie parser
* CORS middleware
* static file server
* validation
* router 分割
* session
* authentication middleware
* CSRF 対策
* logging middleware
* request id
* graceful shutdown

## 注意事項

このプロジェクトは学習用です。

本番利用を想定したものではありません。

以下のような機能はまだありません。

* セキュリティ対策
* 高度な routing
* ファイルアップロード
* streaming response
* HTTPS
* HTTP/2
* 本格的な error middleware
* schema validation
* production ready なログ設計
